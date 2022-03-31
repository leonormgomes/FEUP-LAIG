// TODO comment
class LinearAnimation extends Animation {
	/**
	 * @param {number} duration   - the duration of the animation in milliseconds
	 */
  constructor(scene, initialPosition, finalPosition, duration) {
    super()

    this.scene = scene
    this.initialPosition = initialPosition
    this.finalPosition = finalPosition
    this.duration = duration
    
    // temporary first time
    this.firstTime = 0

    // boolean that states if the animation has ended
    this.finished = false

    // intializes the translate matrix
    this.currentTranslation = new Translation()

    // gets the intermediate translations
    this.initialTranslation = new Translation(initialPosition[0], initialPosition[1], initialPosition[2])
    this.finalTranslation = new Translation(finalPosition[0], finalPosition[1], finalPosition[2])
  }

  update(time) {
		// starts the animation in the next frame
		if (!this.firstTime) this.firstTime = time

		// gets the total time passed until the end of the animation
    const percentage = (time - this.firstTime) / this.duration
    
		// verifies if the animation has ended
		if (percentage >= 1) {
			this.scene.gameOrchestrator.clearMovingPieces()
			this.finished = true
		}

    // updates the current translation
    const value = percentage < 0.5 ? 4 * percentage * percentage * percentage : 1 - Math.pow(-2 * percentage + 2, 3) / 2
	  this.currentTranslation.update(this.initialTranslation, this.finalTranslation, value)
  }

  apply(transformation) {
    this.scene.multMatrix(transformation.multiplyWith(this.currentTranslation).matrix)
  }
}