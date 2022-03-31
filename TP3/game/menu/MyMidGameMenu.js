// TODO document
class MyMidGameMenu extends MyMenu {
	constructor(scene, orchestrator) {
		super(scene)
		this.orchestrator = orchestrator

		this.undoButton = new MyOption(
			scene,
			'Undo',
			(_) => {
				this.orchestrator.gameSequence.undo()
			},
			[0.5, 0.2, 0.2]
		)
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
		this.clock = new MyClock(scene)
		this.initPanel()
	}

	initPanel() {
		super.initPanel()

		this.panel = new MyPanel(this.scene)
		this.panel.setClock(this.clock)
		this.panel.addButton(this.undoButton, [0.1, -0.3])
		this.panel.addButton(this.menuButton, [0.7, -0.3])
		this.panel.addText('Pieces:', [-0.4, -0.1, 1.5])
		this.panel.addFunctionText((_) => this.orchestrator.firstPlayerPieces, [-0.4, -0.3, 2])
		this.panel.addFunctionText((_) => this.orchestrator.secondPlayerPieces, [-0.8, -0.3, 2])
	}

	update(time) {
		super.update(time)

		this.clock.update(time)
		this.panel.update(time)
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
