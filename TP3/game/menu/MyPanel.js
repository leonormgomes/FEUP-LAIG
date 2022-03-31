// TODO document
class MyPanel extends CGFobject {
	constructor(scene, scale = [2, 1, 0.1]) {
		super(scene)

		this.scale = scale
		this.initPrimitives()
		this.initButtons()
	}

	initPrimitives() {
		this.frontPanel = new MyCube(this.scene)

		this.panelAppearance = new CGFappearance(this.scene)
		this.panelAppearance.setDiffuse(1, 1, 1, 1)
	}

	initButtons() {
		// TODO polymorphism
		this.buttons = []
		this.positions = []
		this.colors = []
		this.text = []
		this.textPositions = []
		this.funTexts = []
		this.funPositions = []
	}

	setClock(clock) {
		this.clock = clock
	}

	/**
	 *
	 * @param {MyOption} option
	 * @param {[number, number]} position meaning [x, y]
	 */
	addButton(option, position) {
		this.buttons.push(option)
		this.positions.push(position)
	}

	addText(text, position) {
		this.text.push(new MySpriteText(this.scene, text))
		this.textPositions.push(position)
	}

	addFunctionText(fun, position) {
		this.funTexts.push(fun)
		this.funPositions.push(position)
	}

	update(time) {
		for (const button of this.buttons) button.update(time)
	}

	display() {
		this.scene.pushMatrix()
		this.panelAppearance.apply()

		this.scene.scale(0.1, 0.1, 0.1)
		this.scene.translate(0, 0.5, 0)

		// draws the physical panel
		this.scene.pushMatrix()
		this.scene.translate(0, 0, -0.051)
		this.scene.scale(this.scale[0], this.scale[1], this.scale[2])
		this.frontPanel.display()
		this.scene.popMatrix()

		// draws the clock
		if (this.clock) {
			this.scene.pushMatrix()
			this.scene.scale(0.5, 0.5, 0.5)
			this.scene.translate(0, 0.5, 0)

			const spriteText = new MySpriteText(this.scene, this.clock.getSeconds())
			spriteText.display()

			this.scene.popMatrix()
		}

		// draws the buttons
		for (let i = 0; i < this.buttons.length; ++i) {
			this.scene.pushMatrix()
			this.scene.translate(this.positions[i][0], this.positions[i][1], 0)
			this.scene.scale(0.5, 0.5, 0.5)
			this.buttons[i].display()
			this.scene.popMatrix()
		}

		// draws the text
		for (let i = 0; i < this.text.length; ++i) {
			this.scene.pushMatrix()
			this.scene.translate(this.textPositions[i][0], this.textPositions[i][1], 0)
			this.scene.scale(this.textPositions[i][2], this.textPositions[i][2], this.textPositions[i][2])
			this.scene.scale(0.1, 0.1, 0.1)
			this.text[i].display()
			this.scene.popMatrix()
		}

		// draws the funtexts
		for (let i = 0; i < this.funTexts.length; ++i) {
			this.scene.pushMatrix()
			this.scene.translate(this.funPositions[i][0], this.funPositions[i][1], 0)
			this.scene.scale(this.funPositions[i][2], this.funPositions[i][2], this.funPositions[i][2])
			this.scene.scale(0.1, 0.1, 0.1)
			const text = this.funTexts[i]()
			const spriteText = new MySpriteText(this.scene, text)
			spriteText.display()
			this.scene.popMatrix()
		}

		this.scene.popMatrix()
	}
}
