class MyMainMenu extends MyMenu {
	constructor(scene, orchestrator) {
		super(scene)

		this.orchestrator = orchestrator

		this.player1Menu = new MySubMenu(scene, 'Player 1', ['Human', 'Easy', 'Hard'], _ => this.updateGameValues())
		this.player2Menu = new MySubMenu(scene, 'Player 2', ['Human', 'Easy', 'Hard'], _ => this.updateGameValues())
		this.themesMenu = new MySubMenu(scene, 'Theme', ['Home', 'Park', 'Beach'], (content) => this.setTheme(content))
		this.playButton = new MyOption(
			scene,
			'PLAY',
			(_) => {
				this.scene.gameOrchestrator.startGame()
			},
			[0, 1, 0],
			false,
			[5, 1, 1]
		)

		this.initPanel()
	}

	static getPlayer() {
		return Object.freeze({
			human: -1,
			easy: 0,
			hard: 1,
		})
	}

	initPanel() {
		super.initPanel()
		this.panel = new MyPanel(this.scene, [3, 3, 0.1])

		this.panel.addText('Three Dragons', [0, 0.6, 2])
		this.player1Menu.addToPanel(this.panel, [-1, 0.2, 1])
		this.player2Menu.addToPanel(this.panel, [0, 0.2, 1])
		this.themesMenu.addToPanel(this.panel, [1, 0.2, 1])
		this.panel.addButton(this.playButton, [0, -1.1])
	}

	updateGameValues() {
		this.changePlayer(MyGameOrchestrator.firstPlayer(), this.player1Menu.getSelected())
		this.changePlayer(MyGameOrchestrator.secondPlayer(), this.player2Menu.getSelected())
		// TODO change theme (maybe when clicked)
	}

	setTheme(name) {
		this.scene.gameOrchestrator.themeManager.setTheme(name)
		this.scene.gameOrchestrator.themeManager.applyTheme()
	}

	setSelected(option) {
		for (let i = 0; i < this.player1Menu.buttons.length; i++) {
			if (option.index == this.player1Menu.buttons[i].index) {
				this.player1Menu.setSelected(option.content)
				return
			}
		}
		for (let i = 0; i < this.player2Menu.buttons.length; i++) {
			if (option.index == this.player2Menu.buttons[i].index) {
				this.player2Menu.setSelected(option.content)
				return
			}
		}
		for (let i = 0; i < this.themesMenu.buttons.length; i++) {
			if (option.index == this.themesMenu.buttons[i].index) {
				this.themesMenu.setSelected(option.content)
				return
			}
		}
	}

	changePlayer(player, optionContent) {
		let temp
		if (optionContent == 'Human') temp = MyMainMenu.getPlayer().human
		else if (optionContent == 'Easy') temp = MyMainMenu.getPlayer().easy
		else if (optionContent == 'Hard') temp = MyMainMenu.getPlayer().hard
		else return

		this.orchestrator.playerType[player] = temp
	}

	update(time) {
		super.update(time)
	}

	display() {
		super.display()

		this.scene.pushMatrix()
		this.scene.translate(-4.99, 2.5, 0)
		this.scene.rotate(Math.PI / 2, 0, 1, 0)
		this.panel.display()
		this.scene.popMatrix()
	}
}
