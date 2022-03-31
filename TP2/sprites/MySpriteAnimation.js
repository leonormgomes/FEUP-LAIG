/**
 * Defines an "animation" made with sprites. This is, a square where its texture changes through time.
 */
class MySpriteAnimation {
    /**
     * Constructs the sprite animation.
     * @param {XMLscene} scene              - the scene to display the sprite to. 
     * @param {MySpriteSheet} spriteSheet   - the sprite sheet to use.
     * @param {number} duration             - the time between the start and end cell. (the animation runs infinitely).
     * @param {number} startCell            - the first sprite sheet cell of the animation
     * @param {number} endCell              - the last sprite sheet cell of the animation
     */
	constructor(scene, spriteSheet, duration, startCell, endCell) {
		this.scene = scene
		this.spriteSheet = spriteSheet
		this.duration = duration
		this.startCell = startCell
		this.endCell = endCell

		this.cell = startCell
		this.cellDuration = duration / (endCell - startCell + 1)

		this.plain = new MyRectangle(this.scene, -0.5, -0.5, 0.5, 0.5, 1, 1, 1, 1)
	}

    /**
     * Updates the cell to display given the current time.
     * @param {number} time                 - the current time 
     */
	update(time) {
		const totalElapsedSeconds = (time - this.scene.firstTime) / 1000

		let newCell = Math.floor((totalElapsedSeconds % this.duration) / this.cellDuration) + this.startCell

		if (newCell != this.cell) this.cell = newCell
	}

    /**
     * Displays the sprite animation.
     */
	display() {
		// this.scene.gl.depthMask(false)

		this.scene.setActiveShaderSimple(this.spriteSheet.shader)
		this.spriteSheet.activateCellP(this.cell)
		this.plain.display()
		this.scene.setActiveShaderSimple(this.scene.defaultShader)

		// this.scene.gl.depthMask(true)
	}
}
