// TODO document
class MyEndMenu extends MyMenu {
	constructor(scene, orchestrator) {
		super(scene)

		this.orchestrator = orchestrator

		this.gameFilmButton = new MyOption(scene, 'Film', (_) => this.orchestrator.filmAnimator.start(), [0, 1, 0])
		this.menuButton = new MyOption(
			scene,
			'Menu',
			(_) => {
				this.scene.gameOrchestrator.state = MyGameOrchestrator.getState().menu
				this.scene.gameOrchestrator.camera.goToMenu()
				this.menuButton.unselect()
			},
			[0, 1, 0]
		)

		this.initPanel()
	}

	initPanel() {
		super.initPanel()

		this.panel = new MyPanel(this.scene)

		const winner = MyGameOrchestrator.getPlayerColor(this.orchestrator.winner)
		this.panel.addText('winner: ' + winner, [0, 0.3, 1.2])
		this.panel.addText(this.orchestrator.firstPlayerPieces, [-0.2, 0, 1])
		this.panel.addText(this.orchestrator.secondPlayerPieces, [0.2, 0, 1])
		this.panel.addText('-', [0, 0, 1.1])
		// this.panel.addText('6', [-0.1, 0, 1.1])
		// this.panel.addText('1', [0.1, 0, 1.1])

		this.panel.addButton(this.gameFilmButton, [-0.3, -0.3])
		this.panel.addButton(this.menuButton, [0.3, -0.3])
	}

	update(time) {
		super.update(time)
	}

	display() {
		super.display()

		this.scene.pushMatrix()
		this.scene.translate(-0.36, 1, 0)
		this.scene.rotate(Math.PI / 4, 0, 0, 1)
		this.scene.rotate(Math.PI / 2, 0, 1, 0)
		this.panel.display()
		this.scene.popMatrix()
	}
}
