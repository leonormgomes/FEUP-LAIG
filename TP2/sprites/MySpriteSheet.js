/**
 * Defines a sprite sheet, this is, a set of functions (related or not), defined in a single image.
 */
class MySpriteSheet {
	/**
	 * Creates the sprite sheet.
	 * @param {XMLscene} scene      - the scene.
	 * @param {CGFtexture} texture  - the texture of the sprite sheet.
	 * @param {number} sizeM        - the number of single images in the horizontal.
	 * @param {number} sizeN        - the number of single images in the vertical.
	 */
	constructor(scene, texture, sizeM, sizeN) {
		this.scene = scene
		this.texture = texture
		this.sizeM = sizeM
		this.sizeN = sizeN

		this.length = sizeM * sizeN

		this.texture.bind(0)
		this.initShader()
	}

	/**
	 * Initializes the shader that will display the texture or sprite.
	 */
	initShader() {
		this.shader = new CGFshader(this.scene.gl, 'shaders/sprite.vert', 'shaders/sprite.frag')

		this.shader.setUniformsValues({ M: this.sizeM, N: this.sizeN })
	}

	/**
	 * Actives, this is, displays a given texture or sprite in the sprite sheet, given its coordinates.
	 * @param {number} m						- the horizontal coordinate (or 's' or 'x') 
	 * @param {number} n 						- the vertical coordinate (or 't' or 'y')
	 */
	activateCellMN(m, n) {
		this.shader.setUniformsValues({ m: m })
		this.shader.setUniformsValues({ n: n })
		this.texture.bind(0)
		this.shader.setUniformsValues({ texture: 0 })
	}

	/**
	 * Activates, this is, displays a given texture in the sprite sheet, given its index.
	 * The indexes start at 0 and end at length - 1, being length the number of sprites (sizeM * sizeN)
	 * If the given index is larger than maximum, a mod (%) operation is applied
	 * @param {number} p						- the index or number of the texture or sprite to show 
	 */
	activateCellP(p) {
		if (p >= this.length)
			p %= this.length 

		const m = p % this.sizeM
		const n = Math.floor(p / this.sizeM)

		this.activateCellMN(m, n)
	}
}
