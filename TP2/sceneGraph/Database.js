/**
 * Holds information about the objects parsed to the graph scene, as well as defaults in case of errors.
 */
class Database {
	/**
	 * Constructs all the lists that hold information
	 */
	constructor() {
		// the ID of the selected view. Starts with the default view selected in the XML
		this.currentViewID

		// the stored CGFcamera's / CGFcameraOrtho's
		this.views = []

		// the store CGFtexture's
		this.textures = []

		// the store CGFappearance's
		this.materials = [] // CFGappearance

		// the stored Node's
		this.nodes = []

		// the stored light arrays
		this.lights = []

		// the stored Animation's
		this.animations = []

		// the stored MySpriteSheet's
		this.spriteSheets = []

		// the stored MySpriteAnimations
		this.spriteAnimations = []

		// the sprite sheet that stores the font
		this.fontSpriteSheet
	}

	/**
	 * Gets the default color.
	 * @returns {number[]} a rbga array.
	 */
	static defaultColor() {
		return [Database.defaultRColor(), Database.defaultGColor(), Database.defaultBColor(), Database.defaultAColor()]
	}

	/**
	 * Gets the default red color.
	 * @returns {number} the default red color.
	 */
	static defaultRColor() {
		return 0.5
	}

	/**
	 * Gets the default green color.
	 * @returns {number} the default green color.
	 */
	static defaultGColor() {
		return 0.5
	}

	/**
	 * Gets the default blue color.
	 * @returns {number} the default blue color.
	 */
	static defaultBColor() {
		return 0.5
	}

	/**
	 * Gets the default alpha color component.
	 * @returns {number} the default alpha color component.
	 */
	static defaultAColor() {
		return 0.5
	}

	/**
	 * Gets the default material shininess.
	 * @returns {number} the default shininess.
	 */
	static defaultShininess() {
		return 10.0
	}

	/**
	 * Gets the default X coordinate.
	 * @returns {number} the default X coordinate.
	 */
	static defaultX() {
		return 0
	}

	/**
	 * Gets the Y default \coordinate.
	 * @returns {number} the default Y coordinate.
	 */
	static defaultY() {
		return 0
	}

	/**
	 * Gets the Z default \coordinate.
	 * @returns {number} the default Z coordinate.
	 */
	static defaultZ() {
		return 0
	}

	/**
	 * Gets the default afs texture component.
	 * @returns {number} the default afs component.
	 */
	static defaultAfs() {
		return 1
	}

	/**
	 * Gets the default aft texture component.
	 * @returns {number} the default aft component.
	 */
	static defaultAft() {
		return 1
	}

	/**
	 * Gets the default up component for the ortho view.
	 * @returns {number} the default up component for the ortho view.
	 */
	static defaultUpOrthoView() {
		return [0, 1, 0]
	}

	/**
	 * Gets the default number of slices for any primitive.
	 * @returns {number} the default slices.
	 */
	static defaultSlices() {
		return 20
	}

	/**
	 * Gets the default number of stacks for any primitive.
	 * @returns {number} the default stacks.
	 */
	static defaultStacks() {
		return 20
	}
}
