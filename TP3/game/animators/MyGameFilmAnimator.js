// TODO comment
class MyGameFilmAnimator extends MyAnimator {
	constructor(scene, orchestrator) {
		super(scene)
		this.orchestrator = orchestrator
		this.gameSequence = orchestrator.gameSequence

		this.animated = false
	}

	start() {
		// gets the game states
		this.gameStateAmount = this.gameSequence.gameFilmList.length
		this.currentGameState = 0

		// updates the over the board camera
		this.orchestrator.camera.setOverBoardCamera()

    this.animated = true
    this.orchestrator.state = MyGameOrchestrator.getState().film

		// sets the initial game state
		this.gameSequence.setGameState(this.gameSequence.gameFilmList[this.currentGameState])
	}

	updateGameState() {
		if (this.currentGameState < this.gameStateAmount - 1) {
			this.currentGameState++
			this.gameSequence.setGameState(this.gameSequence.gameFilmList[this.currentGameState])
		} else {
			this.animated = false
			this.orchestrator.endMenu.gameFilmButton.unselect()
		}
	}

	update(time) {
		// verifies if the film is running
    if (!this.animated) return

		// if the animation has ended, sets a new game state
		if (!this.orchestrator.moveAnimator.movingPiecesAmount()) this.updateGameState()
	}

	display() {}
}
