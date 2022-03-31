/**
 * Reads and parses the nodes from the lsf file.
 */
class NodeParser {
	/**
	 * Constructs the parser.
	 * @param {MySceneGraph} parser		- the main parser.
	 */
	constructor(parser) {
		this.parser = parser;
	}

	/**
	 * Parses the <nodes> block.
	 * @param {nodes block element} nodesNode	- the <nodes> XML node.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseNodes(nodesNode) {
		var children = nodesNode.children;

		var grandChildren = [];
		// var grandgrandChildren = [];
		var nodeNames = [];

		// Any number of nodes.
		for (var i = 0; i < children.length; i++) {
			if (children[i].nodeName != "node") {
				this.parser.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
				continue;
			}

			// Get id of the current node.
			var nodeID = this.parser.reader.getString(children[i], "id");
			if (nodeID == null) return this.parser.onXMLError("no ID defined for nodeID");

			grandChildren = children[i].children;

			nodeNames = [];
			for (var j = 0; j < grandChildren.length; j++) {
				let nodeName = grandChildren[j].nodeName;
				nodeNames.push(nodeName);
				if (!["material", "texture", "descendants", "transformations"].includes(nodeName)) {
					this.parser.onXMLMinorError(nodeName + " is not a component of a node on node " + nodeID);
				}
			}

			let materialWrapper = this.parseNodeMaterial(nodeNames, grandChildren);

			let textureWrapper = this.parseNodeTexture(nodeNames, grandChildren, nodeID);

			let { descendants, leafs } = this.parseNodeDescendants(nodeNames, grandChildren, textureWrapper, nodeID);

			let transformation = this.parseNodeTransformations(nodeNames, grandChildren, nodeID);

			let node = new Node(
				this.parser.scene,
				materialWrapper,
				textureWrapper,
				descendants,
				leafs,
				transformation,
				true
			);
			if (this.parser.database.nodes[nodeID]) {
				// replaces the non parsed node
				let oldNode = this.parser.database.nodes[nodeID];

				if (oldNode.parsed) {
					this.parser.onXMLMinorError("node " + nodeID + " defined multiple times, accepting first");
					continue;
				}

				oldNode = Object.assign(oldNode, node);
			} else {
				// if not referenced before, just adds it to the map
				this.parser.database.nodes[nodeID] = node;
			}
		}

		// verifies if root node is defined
		if (!this.parser.database.nodes[this.parser.idRoot])
			return this.parser.onXMLError("root node " + this.parser.idRoot + " not defined");

		// verifies if there's a node referenced but not defined
		for (let id of Object.keys(this.parser.database.nodes))
			if (!this.parser.database.nodes[id].parsed)
				return this.parser.onXMLError("node " + id + " referenced but not defined");
	}

	/**
	 * Parses the nodes' materials.
	 * @param {string[]} nodeNames	- the name of the nodes inside a <node>.
	 * @param {Object} nodes 		- the nodes inside a <node>.
	 * @returns {*} a MaterialWrapper with the parsed material in case of success, an error string in case of error.
	 */
	parseNodeMaterial(nodeNames, nodes) {
		var materialIndex = nodeNames.indexOf("material");
		if (materialIndex == -1) return this.parser.onXMLError("no node material defined");
		var materialNode = nodes[materialIndex];
		var materialID = this.parser.reader.getString(materialNode, "id");
		if (materialID == null) return this.parser.onXMLError("no node material id defined");

		let hereditaryType,
			material = new CGFappearance(this.parser.scene);

		if (materialID == "clear") hereditaryType = MySceneGraph.hereditaryType.CLEAR;
		else if (materialID == "null") hereditaryType = MySceneGraph.hereditaryType.NULL;
		else {
			hereditaryType = MySceneGraph.hereditaryType.OWN;
			material = this.parser.database.materials[materialID];
		}

		return new MaterialWrapper(hereditaryType, material);
	}

	/**
	 * Parses the nodes' textures.
	 * @param {string[]} nodeNames	- the name of the nodes inside a <node>.
	 * @param {Object} nodes 		- the nodes inside a <node>.
	 * @returns {*} a TextureWrapper with the parsed material in case of success, an error string in case of error.
	 */
	parseNodeTexture(nodeNames, nodes, nodeID) {
		let textureIndex = nodeNames.indexOf("texture");
		if (textureIndex == -1) this.parser.onXMLMinorError("no node texture defined in node " + nodeID);

		let textureNode = nodes[textureIndex];
		let textureID = this.parser.reader.getString(textureNode, "id");
		if (textureID == null) return this.parser.onXMLError("no node texture id defined");

		let parsingType = this.parseNodeTextureType(textureID);

		let nodeNamesTex = [];
		for (let j = 0; j < textureNode.children.length; j++) {
			let nodeName = textureNode.children[j].nodeName;
			nodeNamesTex.push(nodeName);
			if (nodeName != "amplification") {
				this.parser.onXMLMinorError(nodeName + " is not a component of a texture on node " + nodeID);
			}
		}

		let afs, aft;
		if (parsingType != MySceneGraph.hereditaryType.CLEAR) {
			({ afs, aft } = this.parseNodeTextureAmplification(textureNode, nodeNamesTex, nodeID));
		}

		let texture;
		if (parsingType == MySceneGraph.hereditaryType.OWN) {
			texture = this.parser.database.textures[textureID];
			if (!texture) this.parser.onXMLMinorError(textureID + " texture inexistent and defined on node " + nodeID);
		}

		return new TextureWrapper(parsingType, afs, aft, texture);
	}

	/**
	 * Parses the nodes' texture type, being it NULL, CLEAR or OWN.
	 * @param {number} textureID	- the ID of the texture.
	 * @returns {string} the parsing type.
	 */
	parseNodeTextureType(textureID) {
		let parsingType;
		if (textureID == "clear") parsingType = MySceneGraph.hereditaryType.CLEAR;
		else if (textureID == "null") parsingType = MySceneGraph.hereditaryType.NULL;
		else parsingType = MySceneGraph.hereditaryType.OWN;
		return parsingType;
	}

	/**
	 * Reads the amplification for a texture in a node.
	 * If the node hasn't a child named 'amplification', will log a minor error and return undefined
	 * @param {XML Node} textureNode 	- the texture node.
	 * @param {string} nodeID			- the ID of the node to parse to.
	 * @returns {number, number} the afs and aft.
	 */
	parseNodeTextureAmplification(textureNode, nodeNames, nodeID) {
		let afs = Database.defaultAfs(),
			aft = Database.defaultAft();

		if (!textureNode.children.length) {
			this.parser.onXMLMinorError("amplification node not set on node " + nodeID);
			return { afs, aft };
		}

		let amplificationIndex = nodeNames.indexOf("amplification");
		let amplificationNode = textureNode.children[amplificationIndex];
		if (amplificationNode == null || amplificationNode.nodeName != "amplification") {
			this.parser.onXMLMinorError("amplification node not set on node " + nodeID);
			return { afs, aft };
		}

		afs = this.parser.reader.getFloat(amplificationNode, "afs");
		if (afs == null) this.parser.onXMLMinorError("no texture afs defined on node " + nodeID + "; assuming " + afs);
		aft = this.parser.reader.getFloat(amplificationNode, "aft");
		if (aft == null) this.parser.onXMLMinorError("no texture aft defined on node " + nodeID + "; assuming" + aft);
		return { afs, aft };
	}

	/**
	 * Parses node transformations.
	 * @param {string[]} nodeNames	- the name of the nodes inside a <node>.
	 * @param {Object} nodes		- the nodes inside a <node>.
	 * @param {string} nodeID		- the ID of the node to parse to.
	 * @returns {Transformation} the parsed transformation.
	 */
	parseNodeTransformations(nodeNames, nodes, nodeID) {
		let finalTransformation = new Transformation();

		let transformationIndex = nodeNames.indexOf("transformations");
		if (transformationIndex == -1) return finalTransformation;
		let transformationNodes = nodes[transformationIndex].children;

		for (let i = 0; i < transformationNodes.length; i++) {
			let transformationNode = transformationNodes[i];
			if (transformationNode.nodeName == "translation") {
				let translationCoordinates = this.parser.parseCoordinates3D(
					transformationNode,
					"transformation node " + nodeID
				);
				let t = new Translation(
					translationCoordinates[0],
					translationCoordinates[1],
					translationCoordinates[2]
				);
				finalTransformation = Transformation.multiply(finalTransformation, t);
			} else if (transformationNode.nodeName == "rotation") {
				let axis = this.parser.reader.getString(transformationNode, "axis");
				let angle = this.parser.reader.getFloat(transformationNode, "angle");

				let r = new Rotation(axis, angle);
				finalTransformation = Transformation.multiply(finalTransformation, r);
			} else if (transformationNode.nodeName == "scale") {
				let sx = this.parser.reader.getFloat(transformationNode, "sx");
				let sy = this.parser.reader.getFloat(transformationNode, "sy");
				let sz = this.parser.reader.getFloat(transformationNode, "sz");

				let s = new Scale(sx, sy, sz);
				finalTransformation = Transformation.multiply(finalTransformation, s);
			} else
				this.parser.onXMLMinorError(
					transformationNode.nodeName + " is an invalid transformation on node " + nodeID
				);
		}

		return finalTransformation;
	}

	/**
	 * Parses the nodes' descendants.
	 * @param {string[]} nodeNames 				- the name of the nodes inside a <node>.
	 * @param {Object} nodes					- the nodes inside a <node>.
	 * @param {TetureWrapper} textureWrapper 	- the texture wrapper to get the amplification from.
	 * @param {string} parentNodeID 			- the ID of the node to parse to.
	 * @returns {Node[], CGFobject[]} the descendants and the leafs.
	 */
	parseNodeDescendants(nodeNames, nodes, textureWrapper, parentNodeID) {
		let descendants = [];
		let leafs = [];
		let descendantsIndex = nodeNames.indexOf("descendants");

		let descendantsNodes = nodes[descendantsIndex].children;

		for (let i = 0; i < descendantsNodes.length; ++i) {
			let nodeXML = descendantsNodes[i];
			if (nodeXML.nodeName == "noderef") {
				let nodeID = this.parser.reader.getString(nodeXML, "id");
				if (nodeID == null)
					return this.parser.onXMLError(
						"descendant node reference with no id defined in node " + parentNodeID
					);
				let node = this.parser.database.nodes[nodeID];

				if (typeof node == "undefined") node = new Node();

				if (!node.parsed) this.parser.database.nodes[nodeID] = node;

				descendants.push(this.parser.database.nodes[nodeID]);
			} else if (nodeXML.nodeName == "leaf") {
				let leaf = this.parseLeaf(nodeXML, textureWrapper, parentNodeID);
				if (leaf) leafs.push(leaf);
			}
		}

		return { descendants, leafs };
	}

	/**
	 * Parses a single leaf node.
	 * @param {Object} node 					- the node to parse.
	 * @param {TextureWrapper} textureWrapper 	- the texture wrapper to get the amplification from.
	 * @param {string} nodeID					- the ID of the node to parse.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseLeaf(node, textureWrapper, nodeID) {
		let primitive = this.parser.reader.getString(node, "type");

		if (primitive == "rectangle") return this.parseRectangleLeaf(node, textureWrapper, nodeID);

		if (primitive == "cylinder") return this.parseCylinderLeaf(node, nodeID);

		if (primitive == "sphere") return this.parseSphereLeaf(node, nodeID);

		if (primitive == "triangle") return this.parseTriangleLeaf(node, textureWrapper, nodeID);

		if (primitive == "torus") return this.parseTorusLeaf(node, nodeID);

		// in case it is none of the know primitives
		this.parser.onXMLMinorError(primitive + " doesn't exist in node " + nodeID + ". Ignoring");
		return null;
	}

	/**
	 * Parses a rectangle leaf.
	 * @param {Object} node 					- the node to parse.
	 * @param {TextureWrapper} textureWrapper	- the texture wrapper to get the amplification from.
	 * @param {number} nodeID					- the node ID.
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseRectangleLeaf(node, textureWrapper, nodeID) {
		let x1, y1, x2, y2;

		if ((x1 = this.parser.reader.getFloat(node, "x1")) == null)
			return this.parser.onXMLError("No rectangle x1 defined in node " + nodeID);

		if ((y1 = this.parser.reader.getFloat(node, "y1")) == null)
			return this.parser.onXMLError("No rectangle y1 defined in node " + nodeID);

		if ((x2 = this.parser.reader.getFloat(node, "x2")) == null)
			return this.parser.onXMLError("No rectangle x2 defined in node " + nodeID);

		if ((y2 = this.parser.reader.getFloat(node, "y2")) == null)
			return this.parser.onXMLError("No rectangle y2 defined in node " + nodeID);

		return new MyRectangle(this.parser.scene, x1, y1, x2, y2, textureWrapper.afs, textureWrapper.aft);
	}

	/**
	 * Parses a cylinder leaf.
	 * @param {Object} node 	- the node to parse.
	 * @param {number} nodeID	- the node ID.
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseCylinderLeaf(node, nodeID) {
		let height = this.parser.reader.getFloat(node, "height");
		if (height == null || height < 0) return this.parser.onXMLError("no cylinder height defined in node " + nodeID);

		let topRadius = this.parser.reader.getFloat(node, "topRadius");
		if (topRadius == null) return this.parser.onXMLError("no cylinder top radius defined in node " + nodeID);

		let bottomRadius = this.parser.reader.getFloat(node, "bottomRadius");
		if (bottomRadius == null) return this.parser.onXMLError("no cylinder bottom radius defined in node " + nodeID);

		let stacks = this.parser.reader.getInteger(node, "stacks");
		if (stacks == null || stacks < 1) {
			stacks = Database.defaultStacks();
			this.parser.onXMLMinorError("no cylinder stacks defined in node " + nodeID + "; assuming " + stacks);
		}

		let slices = this.parser.reader.getInteger(node, "slices");
		if (slices == null || slices < 2) {
			slices = Database.defaultSlices();
			this.parser.onXMLMinorError("no cylinder slices defined in node " + nodeID + "; assuming " + slices);
		}

		return new MyCylinder(this.parser.scene, bottomRadius, topRadius, height, slices, stacks);
	}

	/**
	 * Parses a sphere leaf.
	 * @param {Object} node 	- the node to parse.
	 * @param {number} nodeID	- the node ID.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseSphereLeaf(node, nodeID) {
		let radius = this.parser.reader.getFloat(node, "radius");
		if (radius == null) return this.parser.onXMLError("no sphere radius defined in node " + nodeID);

		let slices = this.parser.reader.getFloat(node, "slices");
		if (slices == null || slices < 2) {
			slices = Database.defaultSlices();
			this.parser.onXMLMinorError("no sphere slices defined in node " + nodeID + "; assuming " + slices);
		}

		let stacks = this.parser.reader.getFloat(node, "stacks");
		if (stacks == null) {
			stacks = Database.defaultStacks();
			this.parser.onXMLMinorError("no sphere stacks defined in node " + nodeID + "; assuming " + stacks);
		}

		return new MySphere(this.parser.scene, radius, slices, stacks);
	}

	/**
	 * Parses a triangle leaf.
	 * @param {Object} node 					- the node to parse.
	 * @param {TextureWrapper} textureWrapper	- the texture wrapper to get the amplification from.
	 * @param {number} nodeID 					- the node ID.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseTriangleLeaf(node, textureWrapper, nodeID) {
		let x1 = this.parser.reader.getFloat(node, "x1");
		if (x1 == null) return this.parser.onXMLError("no triangle x1 defined in node " + nodeID);

		let y1 = this.parser.reader.getFloat(node, "y1");
		if (y1 == null) return this.parser.onXMLError("no triangle y1 defined in node " + nodeID);

		let x2 = this.parser.reader.getFloat(node, "x2");
		if (x2 == null) return this.parser.onXMLError("no triangle x2 defined in node " + nodeID);

		let y2 = this.parser.reader.getFloat(node, "y2");
		if (y2 == null) return this.parser.onXMLError("no triangle y2 defined in node " + nodeID);

		let x3 = this.parser.reader.getFloat(node, "x3");
		if (x3 == null) return this.parser.onXMLError("no triangle x3 defined in node " + nodeID);

		let y3 = this.parser.reader.getFloat(node, "y3");
		if (y3 == null) return this.parser.onXMLError("no triangle y3 defined in node " + nodeID);

		return new MyTriangle(this.parser.scene, x1, y1, x2, y2, x3, y3, textureWrapper.afs, textureWrapper.aft);
	}

	/**
	 * Parses a torus leaf.
	 * @param {Object} node 	- the node to parse.
	 * @param {number} nodeID	- the node ID.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseTorusLeaf(node, nodeID) {
		let innerRadius = this.parser.reader.getFloat(node, "inner");
		if (innerRadius == null) return this.parser.onXMLError("no torus inner radius defined in node " + nodeID);

		let outerRadius = this.parser.reader.getFloat(node, "outer");
		if (outerRadius == null) return this.parser.onXMLError("no torus outer radius defined in node " + nodeID);

		let slices = this.parser.reader.getInteger(node, "slices");
		if (slices == null || slices < 2) {
			slices = Database.defaultSlices();
			this.parser.onXMLMinorError("no torus slices defined in node " + nodeID + "; assuming " + slices);
		}

		let loops = this.parser.reader.getInteger(node, "loops");
		if (loops == null || loops < 2) {
			loops = Database.defaultStacks();
			this.parser.onXMLMinorError("no torus loops defined in node " + nodeID + "; assuming " + loops);
		}

		return new MyTorus(this.parser.scene, innerRadius, outerRadius, slices, loops);
	}
}
