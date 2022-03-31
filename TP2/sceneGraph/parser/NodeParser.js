var MATERIAL_INDEX = 0
var TEXTURE_INDEX = 1
var DESCENDANTS_INDEX = 2
var TRANSFORMATIONS_INDEX = 3

/**
 * Reads and parses the nodes from the lsf file.
 */
class NodeParser {
	/**
	 * Constructs the parser.
	 * @param {MySceneGraph} parser		- the main parser.
	 */
	constructor(parser) {
		this.parser = parser
	}

	/**
	 * Parses the <nodes> block.
	 * @param {nodes block element} nodesNode	- the <nodes> XML node.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseNodes(nodesNode) {
		var children = nodesNode.children

		var grandChildren = []
		// var grandgrandChildren = [];
		var nodeNames = []

		// Any number of nodes.
		for (var i = 0; i < children.length; i++) {
			if (children[i].nodeName != 'node') {
				this.parser.onXMLMinorError('unknown tag <' + children[i].nodeName + '>')
				continue
			}

			// Get id of the current node.
			var nodeID = this.parser.reader.getString(children[i], 'id')
			if (nodeID == null) return this.parser.onXMLError('no ID defined for nodeID')

			grandChildren = children[i].children

			nodeNames = []
			for (var j = 0; j < grandChildren.length; j++) {
				let nodeName = grandChildren[j].nodeName
				nodeNames.push(nodeName)
				if (!['material', 'texture', 'descendants', 'transformations', 'animationref'].includes(nodeName)) {
					this.parser.onXMLMinorError(nodeName + ' is not a component of a node on node ' + nodeID)
				}
			}

			let materialWrapper = this.parseNodeMaterial(nodeNames, grandChildren, nodeID)
			if (typeof materialWrapper === 'string') return materialWrapper

			let textureWrapper = this.parseNodeTexture(nodeNames, grandChildren, nodeID)
			if (typeof textureWrapper === 'string') return textureWrapper

			let { descendants, leafs } = this.parseNodeDescendants(nodeNames, grandChildren, textureWrapper, nodeID)
			if (typeof descendants === 'string') return descendants
			if (!descendants) return 'error'

			let transformation = this.parseNodeTransformations(nodeNames, grandChildren, nodeID)
			if (typeof transformation === 'string') return transformation

			let animation = this.parseNodeAnimation(nodeNames, grandChildren, nodeID)
			if (typeof animation === 'string') return animation

			let node = new Node(
				this.parser.scene,
				materialWrapper,
				textureWrapper,
				animation,
				descendants,
				leafs,
				transformation,
				true
			)
			if (this.parser.database.nodes[nodeID]) {
				// replaces the non parsed node
				let oldNode = this.parser.database.nodes[nodeID]

				if (oldNode.parsed) {
					this.parser.onXMLMinorError('node ' + nodeID + ' defined multiple times, accepting first')
					continue
				}

				oldNode = Object.assign(oldNode, node)
			} else {
				// if not referenced before, just adds it to the map
				this.parser.database.nodes[nodeID] = node
			}
		}

		// verifies if root node is defined
		const root = this.parser.database.nodes[this.parser.idRoot]
		if (!root) return this.parser.onXMLError('root node ' + this.parser.idRoot + ' not defined')

		if (root.materialWrapper.hereditaryType == MySceneGraph.hereditaryType.NULL)
			return this.parser.onXMLError('root node cannot have a null material')

		if (root.textureWrapper.hereditaryType == MySceneGraph.hereditaryType.NULL)
			return this.parser.onXMLError('root node cannot have a null texture')

		// verifies if there's a node referenced but not defined
		for (let id of Object.keys(this.parser.database.nodes))
			if (!this.parser.database.nodes[id].parsed)
				return this.parser.onXMLError('node ' + id + ' referenced but not defined')
	}

	parseNodeAnimation(nodeNames, nodes, nodeID) {
		let animationIndex = nodeNames.indexOf('animationref')
		if (animationIndex == -1) return null
		if (animationIndex != nodeNames.length - 1)
			this.parser.onXMLMinorError('<animationref> tag out of order on node ' + nodeID)
		let animationNode = nodes[animationIndex]
		let animationID = this.parser.reader.getString(animationNode, 'id')
		if (animationID == null) return this.parser.onXMLError('no node animation id defined')

		return this.parser.database.animations[animationID]
	}

	/**
	 * Parses the nodes' materials.
	 * @param {string[]} nodeNames	- the name of the nodes inside a <node>.
	 * @param {Object} nodes 		- the nodes inside a <node>.
	 * @returns {*} a MaterialWrapper with the parsed material in case of success, an error string in case of error.
	 */
	parseNodeMaterial(nodeNames, nodes, nodeID) {
		var materialIndex = nodeNames.indexOf('material')
		if (materialIndex == -1) return this.parser.onXMLError('no <material> tag defined on node ' + nodeID)
		if (materialIndex != MATERIAL_INDEX)
			this.parser.onXMLMinorError('<material> tag out of order on node ' + nodeID)
		var materialNode = nodes[materialIndex]
		var materialID = this.parser.reader.getString(materialNode, 'id')
		if (materialID == null) return this.parser.onXMLError('no node material id defined')

		let hereditaryType,
			material = new CGFappearance(this.parser.scene)

		if (materialID == 'clear') hereditaryType = MySceneGraph.hereditaryType.CLEAR
		else if (materialID == 'null') hereditaryType = MySceneGraph.hereditaryType.NULL
		else {
			hereditaryType = MySceneGraph.hereditaryType.OWN
			material = this.parser.database.materials[materialID]

			if (!material) {
				this.parser.onXMLMinorError(
					'material ' + materialID + " doesn't exist and is defined on node " + nodeID + '; assuming clear'
				)
				material = new CGFappearance(this.parser.scene)
				hereditaryType = MySceneGraph.hereditaryType.CLEAR
			}
		}

		return new MaterialWrapper(hereditaryType, material)
	}

	/**
	 * Parses the nodes' textures.
	 * @param {string[]} nodeNames	- the name of the nodes inside a <node>.
	 * @param {Object} nodes 		- the nodes inside a <node>.
	 * @returns {*} a TextureWrapper with the parsed material in case of success, an error string in case of error.
	 */
	parseNodeTexture(nodeNames, nodes, nodeID) {
		let textureIndex = nodeNames.indexOf('texture')
		if (textureIndex == -1) this.parser.onXMLMinorError('no <texture> tag defined in node ' + nodeID)
		if (textureIndex != TEXTURE_INDEX) this.parser.onXMLMinorError('<texture> tag out of order on node ' + nodeID)

		let textureNode = nodes[textureIndex]
		let textureID = this.parser.reader.getString(textureNode, 'id')
		if (textureID == null) return this.parser.onXMLError('no node texture id defined')

		let parsingType = this.parseNodeTextureType(textureID)

		let nodeNamesTex = []
		for (let j = 0; j < textureNode.children.length; j++) {
			let nodeName = textureNode.children[j].nodeName
			nodeNamesTex.push(nodeName)
			if (nodeName != 'amplification') {
				this.parser.onXMLMinorError(nodeName + ' is not a component of a texture on node ' + nodeID)
			}
		}

		let afs, aft
		if (parsingType != MySceneGraph.hereditaryType.CLEAR) {
			;({ afs, aft } = this.parseNodeTextureAmplification(textureNode, nodeNamesTex, nodeID))
		}

		let texture
		if (parsingType == MySceneGraph.hereditaryType.OWN) {
			texture = this.parser.database.textures[textureID]
			if (!texture) {
				this.parser.onXMLMinorError(
					'texture ' + textureID + " doesn't exist and is defined on node " + nodeID + '; assuming clear'
				)
				texture = null
				parsingType = MySceneGraph.hereditaryType.CLEAR
			}
		}

		return new TextureWrapper(parsingType, afs, aft, texture)
	}

	/**
	 * Parses the nodes' texture type, being it NULL, CLEAR or OWN.
	 * @param {number} textureID	- the ID of the texture.
	 * @returns {string} the parsing type.
	 */
	parseNodeTextureType(textureID) {
		let parsingType
		if (textureID == 'clear') parsingType = MySceneGraph.hereditaryType.CLEAR
		else if (textureID == 'null') parsingType = MySceneGraph.hereditaryType.NULL
		else parsingType = MySceneGraph.hereditaryType.OWN
		return parsingType
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
			aft = Database.defaultAft()

		if (!textureNode.children.length) {
			this.parser.onXMLMinorError('amplification node not set on node ' + nodeID)
			return { afs, aft }
		}

		let amplificationIndex = nodeNames.indexOf('amplification')
		let amplificationNode = textureNode.children[amplificationIndex]
		if (amplificationNode == null || amplificationNode.nodeName != 'amplification') {
			this.parser.onXMLMinorError('amplification node not set on node ' + nodeID)
			return { afs, aft }
		}

		afs = this.parser.reader.getFloat(amplificationNode, 'afs')
		if (afs == null) this.parser.onXMLMinorError('no texture afs defined on node ' + nodeID + '; assuming ' + afs)
		aft = this.parser.reader.getFloat(amplificationNode, 'aft')
		if (aft == null) this.parser.onXMLMinorError('no texture aft defined on node ' + nodeID + '; assuming' + aft)
		return { afs, aft }
	}

	/**
	 * Parses node transformations.
	 * @param {string[]} nodeNames	- the name of the nodes inside a <node>.
	 * @param {Object} nodes		- the nodes inside a <node>.
	 * @param {string} nodeID		- the ID of the node to parse to.
	 * @returns {Transformation} the parsed transformation.
	 */
	parseNodeTransformations(nodeNames, nodes, nodeID) {
		let finalTransformation = new Transformation()

		let transformationIndex = nodeNames.indexOf('transformations')
		if (transformationIndex == -1) return finalTransformation
		if (transformationIndex != TRANSFORMATIONS_INDEX)
			this.parser.onXMLMinorError('<transformations> tag out of order on node ' + nodeID)
		let transformationNodes = nodes[transformationIndex].children

		for (let i = 0; i < transformationNodes.length; i++) {
			let transformationNode = transformationNodes[i]
			if (transformationNode.nodeName == 'translation') {
				let translationCoordinates = this.parser.parseCoordinates3D(
					transformationNode,
					'transformation node ' + nodeID
				)
				let t = new Translation(translationCoordinates[0], translationCoordinates[1], translationCoordinates[2])
				finalTransformation = Transformation.multiply(finalTransformation, t)
			} else if (transformationNode.nodeName == 'rotation') {
				let axis = this.parser.reader.getString(transformationNode, 'axis')
				let angle = this.parser.reader.getFloat(transformationNode, 'angle')

				let r = new Rotation(axis, angle)
				finalTransformation = Transformation.multiply(finalTransformation, r)
			} else if (transformationNode.nodeName == 'scale') {
				let sx = this.parser.reader.getFloat(transformationNode, 'sx')
				let sy = this.parser.reader.getFloat(transformationNode, 'sy')
				let sz = this.parser.reader.getFloat(transformationNode, 'sz')

				let s = new Scale(sx, sy, sz)
				finalTransformation = Transformation.multiply(finalTransformation, s)
			} else
				this.parser.onXMLMinorError(
					transformationNode.nodeName + ' is an invalid transformation on node ' + nodeID
				)
		}

		return finalTransformation
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
		let descendants = []
		let leafs = []
		let descendantsIndex = nodeNames.indexOf('descendants')
		let descendantsNodes = nodes[descendantsIndex].children

		if (descendantsIndex == -1) {
			const error = this.parser.onXMLError('no <descendants> defined on node ' + parentNodeID)
			return { error, leafs }
		}
		if (descendantsIndex != DESCENDANTS_INDEX)
			this.parser.onXMLMinorError('<descendants> tag out of order on node ' + parentNodeID)

		for (let i = 0; i < descendantsNodes.length; ++i) {
			let nodeXML = descendantsNodes[i]
			if (nodeXML.nodeName == 'noderef') {
				let nodeID = this.parser.reader.getString(nodeXML, 'id')
				if (nodeID == null) {
					const error = this.parser.onXMLError(
						'descendant node reference with no id defined in node ' + parentNodeID
					)
					return { error, leafs }
				}

				let node = this.parser.database.nodes[nodeID]

				if (typeof node == 'undefined') node = new Node()

				if (!node.parsed) this.parser.database.nodes[nodeID] = node

				descendants.push(this.parser.database.nodes[nodeID])
			} else if (nodeXML.nodeName == 'leaf') {
				let leaf = this.parseLeaf(nodeXML, textureWrapper, parentNodeID)
				if (typeof leaf === 'string') return { leaf, leafs }

				leafs.push(leaf)
			}
		}

		return { descendants, leafs }
	}

	/**
	 * Parses a single leaf node.
	 * @param {Object} node 					- the node to parse.
	 * @param {TextureWrapper} textureWrapper 	- the texture wrapper to get the amplification from.
	 * @param {string} nodeID					- the ID of the node to parse.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseLeaf(node, textureWrapper, nodeID) {
		let primitive = this.parser.reader.getString(node, 'type')

		if (primitive == 'rectangle') return this.parseRectangleLeaf(node, textureWrapper, nodeID)

		if (primitive == 'cylinder') return this.parseCylinderLeaf(node, nodeID)

		if (primitive == 'sphere') return this.parseSphereLeaf(node, nodeID)

		if (primitive == 'triangle') return this.parseTriangleLeaf(node, textureWrapper, nodeID)

		if (primitive == 'torus') return this.parseTorusLeaf(node, nodeID)

		if (primitive == 'spritetext') return this.parseSpriteTextLeaf(node, nodeID)

		if (primitive == 'spriteanim') return this.parseSpriteAnim(node, nodeID)

		if (primitive == 'plane') return this.parsePlane(node, nodeID)

		if (primitive == 'patch') return this.parsePatch(node, nodeID)

		if (primitive == 'defbarrel') return this.parseDefBarrel(node, nodeID)

		// in case it is none of the know primitives
		this.parser.onXMLMinorError(primitive + " doesn't exist in node " + nodeID + '. Ignoring')
		return null
	}

	/**
	 * Parses a rectangle leaf.
	 * @param {Object} node 					- the node to parse.
	 * @param {TextureWrapper} textureWrapper	- the texture wrapper to get the amplification from.
	 * @param {number} nodeID					- the node ID.
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseRectangleLeaf(node, textureWrapper, nodeID) {
		let x1, y1, x2, y2

		if ((x1 = this.parser.reader.getFloat(node, 'x1')) == null)
			return this.parser.onXMLError('No rectangle x1 defined in node ' + nodeID)

		if ((y1 = this.parser.reader.getFloat(node, 'y1')) == null)
			return this.parser.onXMLError('No rectangle y1 defined in node ' + nodeID)

		if ((x2 = this.parser.reader.getFloat(node, 'x2')) == null)
			return this.parser.onXMLError('No rectangle x2 defined in node ' + nodeID)

		if ((y2 = this.parser.reader.getFloat(node, 'y2')) == null)
			return this.parser.onXMLError('No rectangle y2 defined in node ' + nodeID)

		return new MyRectangle(this.parser.scene, x1, y1, x2, y2, textureWrapper.afs, textureWrapper.aft)
	}

	/**
	 * Parses a cylinder leaf.
	 * @param {Object} node 	- the node to parse.
	 * @param {number} nodeID	- the node ID.
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseCylinderLeaf(node, nodeID) {
		let height = this.parser.reader.getFloat(node, 'height')
		if (height == null || height < 0) return this.parser.onXMLError('no cylinder height defined in node ' + nodeID)

		let topRadius = this.parser.reader.getFloat(node, 'topRadius')
		if (topRadius == null) return this.parser.onXMLError('no cylinder top radius defined in node ' + nodeID)

		let bottomRadius = this.parser.reader.getFloat(node, 'bottomRadius')
		if (bottomRadius == null) return this.parser.onXMLError('no cylinder bottom radius defined in node ' + nodeID)

		let stacks = this.parser.reader.getInteger(node, 'stacks')
		if (stacks == null || stacks < 1) {
			stacks = Database.defaultStacks()
			this.parser.onXMLMinorError('no cylinder stacks defined in node ' + nodeID + '; assuming ' + stacks)
		}

		let slices = this.parser.reader.getInteger(node, 'slices')
		if (slices == null || slices < 2) {
			slices = Database.defaultSlices()
			this.parser.onXMLMinorError('no cylinder slices defined in node ' + nodeID + '; assuming ' + slices)
		}

		return new MyCylinder(this.parser.scene, bottomRadius, topRadius, height, slices, stacks)
	}

	/**
	 * Parses a sphere leaf.
	 * @param {Object} node 	- the node to parse.
	 * @param {number} nodeID	- the node ID.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseSphereLeaf(node, nodeID) {
		let radius = this.parser.reader.getFloat(node, 'radius')
		if (radius == null) return this.parser.onXMLError('no sphere radius defined in node ' + nodeID)

		let slices = this.parser.reader.getFloat(node, 'slices')
		if (slices == null || slices < 2) {
			slices = Database.defaultSlices()
			this.parser.onXMLMinorError('no sphere slices defined in node ' + nodeID + '; assuming ' + slices)
		}

		let stacks = this.parser.reader.getFloat(node, 'stacks')
		if (stacks == null) {
			stacks = Database.defaultStacks()
			this.parser.onXMLMinorError('no sphere stacks defined in node ' + nodeID + '; assuming ' + stacks)
		}

		return new MySphere(this.parser.scene, radius, slices, stacks)
	}

	/**
	 * Parses a triangle leaf.
	 * @param {Object} node 					- the node to parse.
	 * @param {TextureWrapper} textureWrapper	- the texture wrapper to get the amplification from.
	 * @param {number} nodeID 					- the node ID.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseTriangleLeaf(node, textureWrapper, nodeID) {
		let x1 = this.parser.reader.getFloat(node, 'x1')
		if (x1 == null) return this.parser.onXMLError('no triangle x1 defined in node ' + nodeID)

		let y1 = this.parser.reader.getFloat(node, 'y1')
		if (y1 == null) return this.parser.onXMLError('no triangle y1 defined in node ' + nodeID)

		let x2 = this.parser.reader.getFloat(node, 'x2')
		if (x2 == null) return this.parser.onXMLError('no triangle x2 defined in node ' + nodeID)

		let y2 = this.parser.reader.getFloat(node, 'y2')
		if (y2 == null) return this.parser.onXMLError('no triangle y2 defined in node ' + nodeID)

		let x3 = this.parser.reader.getFloat(node, 'x3')
		if (x3 == null) return this.parser.onXMLError('no triangle x3 defined in node ' + nodeID)

		let y3 = this.parser.reader.getFloat(node, 'y3')
		if (y3 == null) return this.parser.onXMLError('no triangle y3 defined in node ' + nodeID)

		return new MyTriangle(this.parser.scene, x1, y1, x2, y2, x3, y3, textureWrapper.afs, textureWrapper.aft)
	}

	/**
	 * Parses a torus leaf.
	 * @param {Object} node 	- the node to parse.
	 * @param {string} nodeID	- the node ID.
	 * @returns {*}	a torus on success, otherwise on error.
	 */
	parseTorusLeaf(node, nodeID) {
		let innerRadius = this.parser.reader.getFloat(node, 'inner')
		if (innerRadius == null) return this.parser.onXMLError('no torus inner radius defined in node ' + nodeID)

		let outerRadius = this.parser.reader.getFloat(node, 'outer')
		if (outerRadius == null) return this.parser.onXMLError('no torus outer radius defined in node ' + nodeID)

		let slices = this.parser.reader.getInteger(node, 'slices')
		if (slices == null || slices < 2) {
			slices = Database.defaultSlices()
			this.parser.onXMLMinorError('no torus slices defined in node ' + nodeID + '; assuming ' + slices)
		}

		let loops = this.parser.reader.getInteger(node, 'loops')
		if (loops == null || loops < 2) {
			loops = Database.defaultStacks()
			this.parser.onXMLMinorError('no torus loops defined in node ' + nodeID + '; assuming ' + loops)
		}

		return new MyTorus(this.parser.scene, innerRadius, outerRadius, slices, loops)
	}

	/**
	 * Parses a sprite text leaf.
	 * @param {Object} node		- the node to parse.
	 * @param {string} nodeID	- the node ID.
	 * @returns {*} a sprite text on success, otherwise on error.
	 */
	parseSpriteTextLeaf(node, nodeID) {
		const text = this.parser.reader.getString(node, 'text')
		if (text == null) return this.parser.onXMLError('no text defined in the sprite text for node ' + nodeID)

		return new MySpriteText(this.parser.scene, text)
	}

	/**
	 * Parses a sprite animation leaf.
	 * @param {Object} node		- the node to parse.
	 * @param {string} nodeID	- the node ID.
	 * @returns {*} a sprite animation on success, otherwise on error.
	 */
	parseSpriteAnim(node, nodeID) {
		let ssid = this.parser.reader.getString(node, 'ssid')
		if (ssid == null) return this.parser.onXMLError('no ssid defined in the sprite animation for node ' + nodeID)

		let spritesheet = this.parser.database.spriteSheets[ssid]
		if (!spritesheet)
			return this.parser.onXMLError('sprite sheet ' + ssid + ' used in node ' + nodeID + ' but not defined')

		let duration = this.parser.reader.getFloat(node, 'duration')
		if (duration == null)
			return this.parser.onXMLError('no duration defined in the sprite animation for node ' + nodeID)

		let startCell = this.parser.reader.getInteger(node, 'startCell')
		if (startCell == null)
			return this.parser.onXMLError('no start cell defined in the sprite animation for node ' + nodeID)

		if (startCell < 0 || startCell >= spritesheet.length) {
			this.parser.onXMLMinorError('Start cell value ' + startCell + ' is invalid')
			startCell = startCell % spritesheet.length
		}

		let endCell = this.parser.reader.getInteger(node, 'endCell')
		if (endCell == null)
			return this.parser.onXMLError('no end cell defined in the sprite animation for node ' + nodeID)

		if (endCell < 0 || endCell >= spritesheet.length || endCell < startCell) {
			this.parser.onXMLMinorError('End cell value ' + endCell + ' is invalid')
			endCell = endCell % spritesheet.length
		}

		const spriteAnimation = new MySpriteAnimation(this.parser.scene, spritesheet, duration, startCell, endCell)
		this.parser.database.spriteAnimations.push(spriteAnimation)
		return spriteAnimation
	}

	/**
	 * Parses a plane made of NURBs leaf.
	 * @param {Object} node		- the node to parse.
	 * @param {string} nodeID	- the node ID.
	 * @returns {*} a plane on success, otherwise on error.
	 */
	parsePlane(node, nodeID) {
		let nPartsU = this.parser.reader.getInteger(node, 'npartsU')
		if (nPartsU == null) {
			this.parser.onXMLMinorError('no npartsU defined for the plane in node ' + nodeID + '; assuming 1')
			nPartsU = 1
		} else if (nPartsU < 1) {
			this.parser.onXMLMinorError(
				nPartsU + ' is not a valid npartsU value for the plane in node ' + nodeID + '; assuming 1'
			)
			nPartsU = 1
		}

		let nPartsV = this.parser.reader.getInteger(node, 'npartsV')
		if (nPartsV == null) {
			this.parser.onXMLMinorError('no npartsV defined for the plane in node ' + nodeID + '; assuming 1')
			nPartsV = 1
		} else if (nPartsV < 1) {
			this.parser.onXMLMinorError(
				nPartsV + ' is not a valid npartsV value for the plane in node ' + nodeID + '; assuming 1'
			)
			nPartsV = 1
		}

		return new MyPlane(this.parser.scene, nPartsU, nPartsV)
	}

	/**
	 * Parses a patch made of NURBs leaf.
	 * @param {Object} node		- the node to parse.
	 * @param {string} nodeID	- the node ID.
	 * @returns {*} a patch on success, otherwise on error.
	 */
	parsePatch(node, nodeID) {
		let nPointsU = this.parser.reader.getInteger(node, 'npointsU')
		if (nPointsU == null) {
			this.parser.onXMLMinorError('no npointsU defined for the patch in node ' + nodeID + '; assuming 1')
			nPointsU = 1
		} else if (nPointsU < 1) {
			this.parser.onXMLMinorError(
				nPointsU + ' is not a valid npointsU value for the patch in node ' + nodeID + '; assuming 1'
			)
			nPointsU = 1
		}

		let nPointsV = this.parser.reader.getInteger(node, 'npointsV')
		if (nPointsV == null) {
			this.parser.onXMLMinorError('no npointsV defined for the patch in node ' + nodeID + '; assuming 1')
			nPointsV = 1
		} else if (nPointsV < 1) {
			this.parser.onXMLMinorError(
				nPointsV + ' is not a valid npointsV value for the patch in node ' + nodeID + '; assuming 1'
			)
			nPointsV = 1
		}

		let nPartsU = this.parser.reader.getInteger(node, 'npartsU')
		if (nPartsU == null) {
			this.parser.onXMLMinorError('no npartsU defined for the patch in node ' + nodeID + '; assuming 1')
			nPartsU = 1
		} else if (nPartsU < 1) {
			this.parser.onXMLMinorError(
				nPartsU + ' is not a valid npartsU value for the patch in node ' + nodeID + '; assuming 1'
			)
			nPartsU = 1
		}

		let nPartsV = this.parser.reader.getInteger(node, 'npartsV')
		if (nPartsV == null) {
			this.parser.onXMLMinorError('no npartsV defined for the patch in node ' + nodeID + '; assuming 1')
			nPartsV = 1
		} else if (nPartsV < 1) {
			this.parser.onXMLMinorError(
				nPartsV + ' is not a valid npartsV value for the patch in node ' + nodeID + '; assuming 1'
			)
			nPartsV = 1
		}

		const children = node.children

		let controlPoints = []
		for (let i = 0; i < children.length; ++i) controlPoints.push(this.parseControlPoint(children[i], nodeID, i))

		if (controlPoints.length != nPointsU * nPointsV)
			return this.parser.onXMLError('the number of control points is incorrect in the node ' + nodeID)

		return new MyPatch(this.parser.scene, nPointsU, nPointsV, nPartsU, nPartsV, controlPoints)
	}
	
	/**
	 * Parses a patch control point.
	 * @param {Object} child	- the node to parse.
	 * @param {string} nodeID	- the node ID.
	 * @param {number} i			- the number of the control point.
	 * @returns {*} a list with the control points coordinates.
	 */
	parseControlPoint(child, nodeID, i) {
		const coords = this.parser.parseCoordinates3D(
			child,
			'control point number ' + i + ' of a patch in the node ' + nodeID
		)

		return [coords[0], coords[1], coords[2], 1]
	}

	/**
	 * Parses a barrel made of NURBs leaf.
	 * @param {Object} node		- the node to parse.
	 * @param {string} nodeID	- the node ID.
	 * @returns {*} a barrel on success, otherwise on error.
	 */
	parseDefBarrel(node, nodeID) {
		let base = this.parser.reader.getFloat(node, 'base')
		if (base == null) return this.parser.onXMLError('no def barrel base defined in node ' + nodeID)

		let middle = this.parser.reader.getFloat(node, 'middle')
		if (middle == null) return this.parser.onXMLError('no def barrel middle defined in node ' + nodeID)

		let height = this.parser.reader.getFloat(node, 'height')
		if (height == null) return this.parser.onXMLError('no def barrel height defined in node ' + nodeID)

		let slices = this.parser.reader.getInteger(node, 'slices')
		if (slices == null) return this.parser.onXMLError('no def barrel slices defined in node ' + nodeID)

		let stacks = this.parser.reader.getInteger(node, 'stacks')
		if (stacks == null) return this.parser.onXMLError('no def barrel stacks defined in node ' + nodeID)

		return new MyDefBarrel(this.parser.scene, base, middle, height, slices, stacks)
	}
}
