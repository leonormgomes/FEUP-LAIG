class PieceAnimation extends Animation {
  constructor(scene, initialPosition, finalPosition, duration){
    super()

    this.scene = scene
    this.initialPosition = initialPosition
    this.finalPosition = finalPosition
    this.duration = duration

    this.firstTime = 0

    this.finished = false

    this.currentTranslation = new Translation()

    this.initialTranslation = new Translation(initialPosition[0], initialPosition[1], initialPosition[2])
    this.finalTranslation = new Translation(finalPosition[0], finalPosition[1], finalPosition[2])
  }

  update(time){
    if (!this.firstTime) this.firstTime = time

    // gets the total time passed until the end of the animation
    const percentage = (time - this.firstTime) / this.duration
    
    // verifies if the animation has ended
    if (percentage >= 1) {
      this.finished = true
      this.scene.gameOrchestrator.clearMovingPieces()
    }

    this.updateFunction(percentage)
  }

  updateFunction(percentage) {
    const value = percentage < 0.5 ? 4 * percentage * percentage * percentage : 1 - Math.pow(-2 * percentage + 2, 3) / 2
    const valueY = percentage < 0.5 ? 1 - Math.pow(1-percentage*2,5) : 1-Math.pow(1-2*(1-percentage),5) 
    this.currentTranslation.x = this.initialTranslation.x + value * (this.finalTranslation.x - this.initialTranslation.x)
    this.currentTranslation.y = this.initialTranslation.y + valueY/8
    this.currentTranslation.z = this.initialTranslation.z + value * (this.finalTranslation.z - this.initialTranslation.z)
  }

  apply(transformation) {
    this.scene.multMatrix(transformation.multiplyWith(this.currentTranslation).matrix)
  }

}