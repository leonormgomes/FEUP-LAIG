const DEGREE_TO_RAD = Math.PI / 180

// Order of the groups in the XML document.
var INITIALS_INDEX = 0
var VIEWS_INDEX = 1
var ILLUMINATION_INDEX = 2
var LIGHTS_INDEX = 3
var TEXTURES_INDEX = 4
var SPRITESHEETS_INDEX = 5
var MATERIALS_INDEX = 6
var ANIMATIONS_INDEX = 7
var NODES_INDEX = 8

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
	/**
	 * Constructs MySceneGraph class.
	 * Initializes necessary variables and starts the XML file reading process.
	 * @param {string} filename		- the file that defines the 3D scene.
	 * @param {XMLScene} scene		- the scene to parse the graph to.
	 */
	constructor(filename, scene) {
		this.loadedOk = null

		// Establish bidirectional references between scene and graph.
		this.scene = scene
		scene.graph = this

		this.idRoot = null // The id of the root element.

		this.axisCoords = []
		this.axisCoords['x'] = [1, 0, 0]
		this.axisCoords['y'] = [0, 1, 0]
		this.axisCoords['z'] = [0, 0, 1]

		// File reading
		this.reader = new CGFXMLreader()

		/*
		 * Read the contents of the xml file, and refer to this class for loading and error handlers.
		 * After the file is read, the reader calls onXMLReady on this object.
		 * If any error occurs, the reader calls onXMLError on this object, with an error message
		 */
		this.reader.open('scenes/' + filename, this)
	}

	/**
	 * Represents the types of heritage between nodes.
	 * OWN		represents a characteristic of its own, not inheriting from no other node.
	 * NULL		represents full heritage.
	 * CLEAR	represents absence. If a node has a CLEAR material, then it has no material at all.
	 */
	static get hereditaryType() {
		return { OWN: 'own', NULL: 'null', CLEAR: 'clear' }
	}

	/**
	 * Callback to be executed after successful reading.
	 */
	onXMLReady() {
		this.log('XML Loading finished.')
		var rootElement = this.reader.xmlDoc.documentElement

		// Here should go the calls for different functions to parse the various blocks
		var error = this.parseXMLFile(rootElement)

		if (error) return error

		this.loadedOk = true

		// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
		this.scene.onGraphLoaded()
	}

	/**
	 * Callback to be executed on any read error, showing an error on the console.
	 * @param {string} message		- the error message to display.
	 * @returns the error message.
	 */
	onXMLError(message) {
		let error = 'XML Loading Error: ' + message
		console.error(error)
		this.loadedOk = false
		return message
	}

	/**
	 * Callback to be executed on any minor error, showing a warning on the console.
	 * @param {string} message		- the error message.
	 */
	onXMLMinorError(message) {
		console.warn('Warning: ' + message)
	}

	/**
	 * Callback to be executed on any message.
	 * @param {string} message		- the message to log.
	 */
	log(message) {
		console.log('   ' + message)
	}

	/**
	 * Parses the XML file, processing each block.
	 * @param {XML root element} rootElement	- the root element.
	 */
	parseXMLFile(rootElement) {
		if (rootElement.nodeName != 'lsf') return 'root tag <lsf> missing'

		var nodes = rootElement.children

		// Reads the names of the nodes to an auxiliary buffer.
		var nodeNames = []

		for (var i = 0; i < nodes.length; i++) {
			if (
				![
					'initials',
					'views',
					'illumination',
					'lights',
					'textures',
					'spritesheets',
					'materials',
					'animations',
					'nodes',
				].includes(nodes[i].nodeName)
			)
				this.onXMLMinorError('<' + nodes[i].nodeName + '> is not a valid tag; ignoring')
			nodeNames.push(nodes[i].nodeName)
		}

		var error

		// Processes each node, verifying errors.

		this.database = new Database()

		// <initials>
		var index
		if ((index = nodeNames.indexOf('initials')) == -1) return this.onXMLError('tag <initials> missing')
		else {
			if (index != INITIALS_INDEX) this.onXMLMinorError('tag <initials> out of order ' + index)

			//Parse initials block
			if ((error = this.parseInitials(nodes[index])) !== null) return error
		}

		// <views>
		let parser = new ViewsParser(this)
		if ((index = nodeNames.indexOf('views')) == -1) return this.onXMLError('tag <views> missing')
		else {
			if (index != VIEWS_INDEX) this.onXMLMinorError('tag <views> out of order')

			//Parse views block
			if ((error = parser.parseViews(nodes[index])) !== null) return error
		}

		// <illumination>
		if ((index = nodeNames.indexOf('illumination')) == -1) return this.onXMLError('tag <illumination> missing')
		else {
			if (index != ILLUMINATION_INDEX) this.onXMLMinorError('tag <illumination> out of order')

			//Parse illumination block
			if ((error = this.parseIllumination(nodes[index])) !== null) return error
		}

		// <lights>
		if ((index = nodeNames.indexOf('lights')) == -1) return this.onXMLError('tag <lights> missing')
		else {
			if (index != LIGHTS_INDEX) this.onXMLMinorError('tag <lights> out of order')

			//Parse lights block
			if ((error = this.parseLights(nodes[index])) !== null) return error
		}

		// <textures>
		if ((index = nodeNames.indexOf('textures')) == -1) return this.onXMLError('tag <textures> missing')
		else {
			if (index != TEXTURES_INDEX) this.onXMLMinorError('tag <textures> out of order')

			//Parse textures block
			if ((error = this.parseTextures(nodes[index])) !== null) return error
		}

		// <spritesheets>
		if ((index = nodeNames.indexOf('spritesheets')) == -1) return this.onXMLError('tag <spritesheets> missing')
		else {
			if (index != SPRITESHEETS_INDEX) this.onXMLMinorError('tag <spritesheets> out of order')

			//Parse textures block
			if ((error = this.parseSpriteSheets(nodes[index])) !== null) return error
		}

		// <materials>
		parser = new MaterialParser(this)
		if ((index = nodeNames.indexOf('materials')) == -1) return this.onXMLError('tag <materials> missing')
		else {
			if (index != MATERIALS_INDEX) this.onXMLMinorError('tag <materials> out of order')

			//Parse materials block
			if ((error = parser.parseMaterials(nodes[index])) !== null) return error
		}

		// <animations>
		parser = new AnimationsParser(this)
		let animationsParsed = false
		index = nodeNames.indexOf('animations')
		if (index >= 0) {
			if (index != ANIMATIONS_INDEX) this.onXMLMinorError('tag <animations> out of order')

			//Parse lights block
			if ((error = parser.parseAnimations(nodes[index])) !== null) return error
			animationsParsed = true
		}

		// <nodes>
		parser = new NodeParser(this)
		if ((index = nodeNames.indexOf('nodes')) == -1) return this.onXMLError('tag <nodes> missing')
		else {
			if ((animationsParsed && index != NODES_INDEX) || (!animationsParsed && index != NODES_INDEX - 1))
				this.onXMLMinorError('tag <nodes> out of order')

			//Parse nodes block
			if ((error = parser.parseNodes(nodes[index])) !== null) return error
		}
		this.log('all parsed')
		return null
	}

	/**
	 * Parses the <initials> block.
	 * @param {initials block element} initialsNode		- the <initials> node.
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseInitials(initialsNode) {
		var children = initialsNode.children
		var nodeNames = []

		for (var i = 0; i < children.length; i++) nodeNames.push(children[i].nodeName)

		var rootIndex = nodeNames.indexOf('root')
		var referenceIndex = nodeNames.indexOf('reference')

		// Get root of the scene.
		if (rootIndex == -1) return this.onXMLError('no root id defined for scene.')

		var rootNode = children[rootIndex]
		var id = this.reader.getString(rootNode, 'id')
		if (id == null) return this.onXMLError('no root id defined for scene.')

		this.idRoot = id

		// Get axis length
		if (referenceIndex == -1) this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'")

		var refNode = children[referenceIndex]
		var axis_length = this.reader.getFloat(refNode, 'length')
		if (axis_length == null) this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'")

		this.referenceLength = axis_length

		this.log('Parsed initials')

		return null
	}

	/**
	 * Parses the <illumination> node.
	 * @param {illumination block element} illuminationsNode	- the <illumination> node.
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseIllumination(illuminationsNode) {
		let children = illuminationsNode.children

		this.ambient = []
		this.background = []

		let nodeNames = []

		for (var i = 0; i < children.length; i++) nodeNames.push(children[i].nodeName)

		let ambientIndex = nodeNames.indexOf('ambient')
		let backgroundIndex = nodeNames.indexOf('background')

		if (ambientIndex == -1) return this.onXMLError('ambient light missing')
		if (backgroundIndex == -1) return this.onXMLError('background light missing')

		let color = this.parseColor(children[ambientIndex], 'ambient illumination')
		if (!Array.isArray(color)) {
			this.onXMLMinorError('ambient illumination unformatted')
			color = Database.defaultColor()
		} else this.ambient = color

		color = this.parseColor(children[backgroundIndex], 'background illumination')
		if (!Array.isArray(color)) {
			this.onXMLMinorError('background illumination unformatted')
			color = Database.defaultColor()
		} else this.background = color

		this.log('Parsed Illumination.')

		return null
	}

	/**
	 * Parses the <light> node.
	 * @param {lights block element} lightsNode  - the <lights> node.
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseLights(lightsNode) {
		let children = lightsNode.children

		let numLights = 0

		let grandChildren = []
		let nodeNames = []

		// Any number of lights.
		for (var i = 0; i < children.length; i++) {
			// Storing light information
			let global = []
			let attributeNames = []
			let attributeTypes = []

			//Check type of light
			if (children[i].nodeName != 'light') {
				this.onXMLMinorError('unknown tag <' + children[i].nodeName + '>')
				continue
			} else {
				attributeNames.push(...['enable', 'position', 'ambient', 'diffuse', 'specular'])
				attributeTypes.push(...['boolean', 'position', 'color', 'color', 'color'])
			}

			// Get id of the current light.
			let lightId = this.reader.getString(children[i], 'id')
			if (lightId == null) return this.onXMLError('no ID defined for light')

			// Checks for repeated IDs.
			if (this.database.lights[lightId] != null)
				return this.onXMLError('ID must be unique for each light (conflict: ID = ' + lightId + ')')

			grandChildren = children[i].children
			// Specifications for the current light.

			nodeNames = []
			for (let j = 0; j < grandChildren.length; j++) {
				nodeNames.push(grandChildren[j].nodeName)
			}

			for (let j = 0; j < attributeNames.length; j++) {
				let attributeIndex = nodeNames.indexOf(attributeNames[j])

				if (attributeIndex != -1) {
					let aux
					if (attributeTypes[j] == 'boolean')
						aux = this.parseBoolean(
							grandChildren[attributeIndex],
							'value',
							'enabled attribute for light of ID' + lightId
						)
					else if (attributeTypes[j] == 'position')
						aux = this.parseCoordinates4D(grandChildren[attributeIndex], 'light position for ID' + lightId)
					else
						aux = this.parseColor(
							grandChildren[attributeIndex],
							attributeNames[j] + ' illumination for ID' + lightId
						)

					if (typeof aux === 'string') return aux

					global.push(aux)
				} else return this.onXMLError('light ' + attributeNames[i] + ' undefined for ID = ' + lightId)
			}
			this.database.lights[lightId] = global
			numLights++
		}

		if (numLights == 0) return this.onXMLError('at least one light must be defined')
		else if (numLights > 8) this.onXMLMinorError('too many lights defined; WebGL imposes a limit of 8 lights')

		this.log('Parsed lights')
		return null
	}

	/**
	 * Parses the <textures> block.
	 * @param {textures block element} texturesNode 	-the <textures> node
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseTextures(texturesNode) {
		//For each texture in textures block, check ID and file URL
		let children = texturesNode.children

		// Any number of textures.
		for (let i = 0; i < children.length; i++) {
			let textureNode = children[i]
			if (textureNode.nodeName != 'texture') {
				this.onXMLMinorError('unknown tag <' + textureNode.nodeName + '>')
				continue
			}

			// Get id of the current texture.
			let textureID = this.reader.getString(textureNode, 'id')
			if (textureID == null) return this.onXMLError('texture with no ID defined')

			if (this.database.textures[textureID]) {
				this.onXMLMinorError('texture ' + textureID + ' defined multiple times, accepting first')
				continue
			}

			let path = this.reader.getString(textureNode, 'path')
			if (path == null) return this.onXMLError('no path found for texture ' + textureID)

			let texture = new CGFtexture(this.scene, path)

			this.database.textures[textureID] = texture
		}

		this.log('Parsed textures')
		return null
	}

	/**
	 * Parses the spritesheets.
	 * @param {Object} spriteSheetsNode - the node of the spritesheets.
	 */
	parseSpriteSheets(spriteSheetsNode) {
		const children = spriteSheetsNode.children

		for (let i = 0; i < children.length; i++) {
			const spriteSheetNode = children[i]
			if (spriteSheetNode.nodeName != 'spritesheet') {
				this.onXMLMinorError('unknown tag <' + spriteSheetNode.nodeName + '>')
				continue
			}

			const id = this.reader.getString(spriteSheetNode, 'id')

			if (this.database.spriteSheets[id]) {
				this.onXMLMinorError('spritesheet ' + id + ' defined multiple times, accepting first')
				continue
			}

			const path = this.reader.getString(spriteSheetNode, 'path')
			const sizeM = this.reader.getInteger(spriteSheetNode, 'sizeM')
			const sizeN = this.reader.getInteger(spriteSheetNode, 'sizeN')

			const texture = new CGFtexture(this.scene, path)

			const spriteSheet = new MySpriteSheet(this.scene, texture, sizeM, sizeN)
			this.database.spriteSheets[id] = spriteSheet
		}

		this.log('Parsed sprite sheets')
		return null
	}

	/**
	 * Reads and parses a boolean.
	 * @param {Object} node 		- the node to parse the boolean from.
	 * @param {string} name 		- the name of the boolean variable in XML.
	 * @param {string} messageError - the name of the component to display in case of error.
	 * @returns {boolean} the read boolean.
	 */
	parseBoolean(node, name, messageError) {
		let boolVal = this.reader.getBoolean(node, name)
		if (!(boolVal != null && !isNaN(boolVal) && (boolVal == true || boolVal == false))) {
			this.onXMLMinorError('unable to parse value component ' + messageError + '; assuming true')
			boolVal = true
		}
		return boolVal
	}

	/**
	 * Parse the coordinates from a node with ID = id.
	 * @param {block element} node	- the node to parse the coordinates from.
	 * @param {string} messageError	- the name of the component to display in case of error.
	 * @returns {number[]} the three coordinates in an array.
	 */
	parseCoordinates3D(node, messageError) {
		let position = []

		// x
		let x = this.reader.getFloat(node, 'x')
		if (!(x != null && !isNaN(x))) {
			x = Database.defaultX()
			this.onXMLMinorError('unable to parse x-coordinate of the ' + messageError + '; assuming ' + x)
		}

		// y
		let y = this.reader.getFloat(node, 'y')
		if (!(y != null && !isNaN(y))) {
			y = Database.defaultY()
			this.onXMLMinorError('unable to parse y-coordinate of the ' + messageError + '; assuming ' + y)
		}
		// z
		let z = this.reader.getFloat(node, 'z')
		if (!(z != null && !isNaN(z))) {
			z = Database.defaultZ()
			this.onXMLMinorError('unable to parse z-coordinate of the ' + messageError + '; assuming ' + z)
		}
		position.push(...[x, y, z])

		return position
	}

	/**
	 * Parse the coordinates from a node with ID = id.
	 * @param {block element} node	- the node to parse the coordinates from.
	 * @param {string} messageError	- the name of the component to display in case of error.
	 * @returns {number[]} the three coordinates in an array.
	 */
	parseCoordinates4D(node, messageError) {
		var position = []

		//Get x, y, z
		position = this.parseCoordinates3D(node, messageError)

		if (!Array.isArray(position)) return position

		// w
		var w = this.reader.getFloat(node, 'w')
		if (!(w != null && !isNaN(w))) return this.onXMLError('unable to parse w-coordinate of the ' + messageError)

		position.push(w)

		return position
	}

	/**
	 * Parses the color components from a node.
	 * @param {block element} node	- the node to parse the color from.
	 * @param {string} messageError	- the name of the component to display in case of error.
	 * @returns {number[]} the rgba of the color in an array.
	 */
	parseColor(node, messageError) {
		var color = []

		// R
		var r = this.reader.getFloat(node, 'r')
		if (!(r != null && !isNaN(r) && r >= 0 && r <= 1)) {
			r = Database.defaultRColor()
			this.onXMLMinorError('unable to parse R component of the ' + messageError)
		}

		// G
		var g = this.reader.getFloat(node, 'g')
		if (!(g != null && !isNaN(g) && g >= 0 && g <= 1)) {
			g = Database.defaultGColor()
			this.onXMLMinorError('unable to parse G component of the ' + messageError)
		}

		// B
		var b = this.reader.getFloat(node, 'b')
		if (!(b != null && !isNaN(b) && b >= 0 && b <= 1)) {
			b = Database.defaultBColor()
			this.onXMLMinorError('unable to parse B component of the ' + messageError)
		}

		// A
		var a = this.reader.getFloat(node, 'a')
		if (!(a != null && !isNaN(a) && a >= 0 && a <= 1)) {
			a = Database.defaultAColor()
			this.onXMLMinorError('unable to parse A component of the ' + messageError)
		}

		color.push(...[r, g, b, a])

		return color
	}

	/**
	 * Displays the scene, processing each node, starting in the root node.
	 */
	displayScene() {
		this.scene.gl.enable(this.scene.gl.BLEND) // enables blending
		this.scene.gl.blendFunc(this.scene.gl.SRC_ALPHA, this.scene.gl.ONE_MINUS_SRC_ALPHA)
		this.database.nodes[this.idRoot].display()
		this.scene.gl.disable(this.scene.gl.BLEND) // disables blending
	}
}
