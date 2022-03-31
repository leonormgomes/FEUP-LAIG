class MySubMenu {
	constructor(scene, title, options, fun) {
		this.scene = scene
		this.title = title
		this.options = options
		this.fun = fun
		this.buttons = []

		this.createButtons()
	}

	createButtons() {
		for (let option of this.options) {
			const button = new MyOption(this.scene, option, (name) => {
				this.setSelected(option)
				if (this.fun) this.fun(name)
			})
			this.buttons.push(button)
		}
		if (this.buttons.length) this.buttons[0].select()
	}

	setSelected(option) {
		for (let i = 0; i < this.options.length; i++) {
			if (this.buttons[i].content == option) {
				this.selected = option
				this.buttons[i].select()
			} else {
				this.buttons[i].unselect()
			}
		}
	}

	getSelected() {
		for (const button of this.buttons) if (button.selected) return button.content
	}

	addToPanel(panel, position) {
		panel.addText(this.title, position)
		let y = 0
		for (const button of this.buttons) {
			y -= 0.3
			panel.addButton(button, [position[0], position[1] + y, position[2]])
		}
	}
}
