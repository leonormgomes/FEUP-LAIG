/**
 * Reads and parses the materials from the lsf file.
 */
class MaterialParser {
	/**
	 * Constructs the parser.
	 * @param {MySceneGraph} parser		- the main parser.
	 */
	constructor(parser) {
		this.parser = parser;
	}

	/**
	 * Parses the <materials> node.
	 * @param {materials block element} materialsNode	- the <materials> XML node.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseMaterials(materialsNode) {
		let children = materialsNode.children;
		let error;
		let grandChildren = [];

		// Any number of materials.
		for (let i = 0; i < children.length; i++) {
			if (children[i].nodeName != "material") {
				this.parser.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
				continue;
			}

			// Get id of the current material.
			let materialID = this.parser.reader.getString(children[i], "id");
			if (materialID == null) return this.parser.onXMLError("material defined with no ID");

			if (this.parser.database.materials[materialID]) {
				this.parser.onXMLMinorError("material " + materialID + " defined multiple times, accepting first");
				continue;
			}

			let nodeNames = [];
			grandChildren = children[i].children;
			for (let j = 0; j < grandChildren.length; ++j) nodeNames.push(grandChildren[j].nodeName);

			let material = new CGFappearance(this.parser.scene);

			let components = ["shininess", "ambient", "diffuse", "specular", "emissive"];
			for (let name of nodeNames)
				if (!components.includes(name))
					this.parser.onXMLMinorError(name + " is not a valid material component on material " + materialID);

			if ((error = this.parseMaterialShininess(nodeNames, grandChildren, material, materialID) !== null))
				return error;

			if ((error = this.parseMaterialAmbient(nodeNames, grandChildren, material, materialID) !== null))
				return error;

			if (this.parseMaterialDiffuse(nodeNames, grandChildren, material, materialID) !== null) return error;

			if (this.parseMaterialSpecular(nodeNames, grandChildren, material, materialID) !== null) return error;

			if (this.parseMaterialEmissive(nodeNames, grandChildren, material, materialID) !== null) return error;

			this.parser.database.materials[materialID] = material;
		}

		this.parser.log("Parsed materials");
		return null;
	}

	/**
	 * Parses the <shininess> node.
	 * @param {string[]} nodeNames		- the name of the nodes inside a <material>.
	 * @param {Object[]} grandChildren	- the children XML nodes of a given material node.
	 * @param {CGFappearance} material	- the material to parse the information to.
	 * @param {string} materialID		- the ID of the material to parse the information to.
	 */
	parseMaterialShininess(nodeNames, grandChildren, material, materialID) {
		var shininessID = nodeNames.indexOf("shininess");

		// if the material shininess is not defined sets a default value
		if (shininessID == -1) {
			this.parser.onXMLMinorError("no shininess defined for the material " + materialID);
			material.setShininess(Database.defaultShininess());
			return null;
		}

		// reads the shininess
		material.setShininess(this.parser.reader.getFloat(grandChildren[shininessID], "value"));
		if (this.parser.reader.getFloat(grandChildren[shininessID], "value") == -1) {
			// if there's an error on the shininess, assigns a default value
			this.parser.onXMLMinorError("invalid value for the material " + materialID + " shininess");
			material.setShininess(Database.defaultShininess());
		}
		return null;
	}


	/**
	 * Parses the <ambient> node.
	 * @param {string[]} nodeNames		- the name of the nodes inside a <material>.
	 * @param {Object[]} grandChildren	- the children XML nodes of a given material node.
	 * @param {CGFappearance} material	- the material to parse the information to.
	 * @param {string} materialID		- the ID of the material to parse the information to.
	 */
	parseMaterialAmbient(nodeNames, grandChildren, material, materialID) {
		let ambientID = nodeNames.indexOf("ambient");
		let ambientColor;
		if (ambientID == -1) {
			ambientColor = Database.defaultColor();
			this.parser.onXMLMinorError(
				"no ambient defined for the material " + materialID + "; assuming " + ambientColor
			);
		} else {
			ambientColor = this.parser.parseColor(
				grandChildren[ambientID],
				"ambient color for the material " + materialID
			);
		}

		material.setAmbient(ambientColor[0], ambientColor[1], ambientColor[2], ambientColor[3]);

		return null;
	}

	/**
	 * Parses the <diffuse> node.
	 * @param {string[]} nodeNames		- the name of the nodes inside a <material>.
	 * @param {Object[]} grandChildren	- the children XML nodes of a given material node.
	 * @param {CGFappearance} material	- the material to parse the information to.
	 * @param {string} materialID		- the ID of the material to parse the information to.
	 */
	parseMaterialDiffuse(nodeNames, grandChildren, material, materialID) {
		let diffuseID = nodeNames.indexOf("diffuse");
		let diffuseColor;
		if (diffuseID == -1) {
			diffuseColor = Database.defaultColor();
			this.parser.onXMLMinorError(
				"no diffuse color defined for the material " + materialID + "; assuming " + diffuseColor
			);
		} else {
			diffuseColor = this.parser.parseColor(
				grandChildren[diffuseID],
				"diffuse color for the material " + materialID
			);
		}

		material.setDiffuse(diffuseColor[0], diffuseColor[1], diffuseColor[2], diffuseColor[3]);

		return null;
	}

	/**
	 * Parses the <specular> node.
	 * @param {string[]} nodeNames		- the name of the nodes inside a <material>.
	 * @param {Object[]} grandChildren	- the children XML nodes of a given material node.
	 * @param {CGFappearance} material	- the material to parse the information to.
	 * @param {string} materialID		- the ID of the material to parse the information to.
	 */
	parseMaterialSpecular(nodeNames, grandChildren, material, materialID) {
		let specularID = nodeNames.indexOf("specular");
		let specularColor;
		if (specularID == -1) {
			specularColor = Database.defaultColor();
			this.parser.onXMLMinorError(
				"no specular color defined for the material " + materialID + "; assuming " + specularColor
			);
		} else {
			specularColor = this.parser.parseColor(
				grandChildren[specularID],
				"specular color for the material " + materialID
			);
		}

		material.setSpecular(specularColor[0], specularColor[1], specularColor[2], specularColor[3]);

		return null;
	}

	/**
	 * Parses the <emissive> node.
	 * @param {string[]} nodeNames		- the name of the nodes inside a <material>.
	 * @param {Object[]} grandChildren	- the children XML nodes of a given material node.
	 * @param {CGFappearance} material	- the material to parse the information to.
	 * @param {string} materialID		- the ID of the material to parse the information to.
	 */
	parseMaterialEmissive(nodeNames, grandChildren, material, materialID) {
		let emissiveID = nodeNames.indexOf("emissive");
		let emissiveColor;
		if (emissiveID == -1) {
			emissiveColor = Database.defaultColor();
			this.parser.onXMLMinorError(
				"no emissive color defined for the material " + materialID + "; assuming" + emissiveColor
			);
		} else {
			emissiveColor = this.parser.parseColor(
				grandChildren[emissiveID],
				"emissive color for the material " + materialID
			);
		}

		material.setEmission(emissiveColor[0], emissiveColor[1], emissiveColor[2], emissiveColor[3]);

		return null;
	}
}
