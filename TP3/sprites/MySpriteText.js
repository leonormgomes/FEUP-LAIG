/**
 * Defines an object that displays a text using sprites.
 */
class MySpriteText {
	/**
	 * The path of the texture that holds the font.
	 */
	static textTexturePath = 'assets/hand.png'

	/**
	 * The number of letters per horizontal line.
	 */
	static sizeM = 16

	/**
	 * The number of letters per vertical line.
	 */
	static sizeN = 6

	/**
	 * The size of a letter. (squareSide x squareSide).
	 */
	static squareSide = 1

	/**
	 * The difference between the font used and ascii.
	 */
	static asciiDiff = 32

	/**
	 * Constructs the sprite text.
	 * @param {XMLscene} scene	- the scene to display the text to.
	 * @param {string} text 		- the text to display.
	 */
	constructor(scene, text) {
		this.text = String(text)
		this.scene = scene

		this.initSpriteSheet()
		this.initPlain()
		this.getTextCharPositions()
	}

	/**
	 * Verifies if there is already a sprite sheet stored and, if not, creates and adds it, otherwise, just gets it.
	 */
	initSpriteSheet() {
		if (!this.scene.fontSpriteSheet) {
			const ascii = new CGFtexture(this.scene, MySpriteText.textTexturePath)
			this.scene.fontSpriteSheet = new MySpriteSheet(
				this.scene,
				ascii,
				MySpriteText.sizeM,
				MySpriteText.sizeN
			)
		}

		this.spriteSheet = this.scene.fontSpriteSheet
	}

	/**
	 * Creates the plain where the letters are stored.
	 */
	initPlain() {
		const length = this.text.length

		let leftVertex = (-MySpriteText.squareSide / 2) * length

		this.rectangles = []
		for (let i = 0; i < length; ++i) {
			const rectangle = new MyRectangle(
				this.scene,
				leftVertex,
				-MySpriteText.squareSide / 2,
				leftVertex + MySpriteText.squareSide,
				MySpriteText.squareSide / 2,
				MySpriteText.squareSide,
				MySpriteText.squareSide,
				1,
				1
			)
			this.rectangles.push(rectangle)

			leftVertex += MySpriteText.squareSide
		}
	}

	/**
	 * Stores the positions of the characters of the text into a list
	 */
	getTextCharPositions() {
		this.characters = []
		for (let i = 0; i < this.text.length; ++i)
			this.characters.push(this.getCharacterPosition(this.text.charAt(i)))
	}

	/**
	 * Gets the position of a character in the sprite sheet.
	 * Given an invalid character, will return the first one, which is usually a space.
	 * @param {string} character	- the character to get the position to. If given a multi-character string, gets the position for the first one.
	 */
	getCharacterPosition(character) {
		const asciiCode = character.charCodeAt(0)
		let spriteChar = asciiCode - MySpriteText.asciiDiff
		if (spriteChar >= MySpriteText.sizeM * MySpriteText.sizeN) spriteChar = 0
		return spriteChar
	}

	/**
	 * Displays the text.
	 */
	display() {
		// this.scene.gl.depthMask(false)
		if (!this.spriteSheet)
			return

		this.scene.setActiveShaderSimple(this.spriteSheet.shader)
		for (let i = 0; i < this.text.length; ++i) {
			this.spriteSheet.activateCellP(this.characters[i])
			this.rectangles[i].display()
		}
		this.scene.setActiveShaderSimple(this.scene.defaultShader)
		// this.scene.gl.depthMask(true)
	}
}
