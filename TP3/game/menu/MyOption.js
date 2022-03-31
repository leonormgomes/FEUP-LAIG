class MyOption extends CGFobject {
	constructor(scene, content, runFunction, color = [0.5, 0.5, 0.5], selected = false, scale = [1, 1, 1]) {
		super(scene)
		this.content = content
		this.selected = selected
		this.index == scene.getClickableIndex()
		this.runFunction = runFunction
		this.scale = scale

		this.color = color

		this.appearance = new CGFappearance(this.scene)
		this.appearance.setDiffuse(color[0], color[1], color[2], 1)

		this.spriteText = new MySpriteText(this.scene, this.content, this.index)
		this.cube = new MyCube(this.scene)
	}

	select() {
		this.appearance.setDiffuse(1, 0, 0, 1)
		this.selected = true
	}

	unselect() {
		this.appearance.setDiffuse(this.color[0], this.color[1], this.color[2], 1)
		this.selected = false
	}

	run() {
		this.select()
		this.runFunction(this.content)
	}

	update(time) {
		// TODO button animation
	}

	display() {
		if (!this.index) this.index = this.scene.getClickableIndex() // TODO

		this.scene.pushMatrix()

		if (this.selected) {
			this.scene.translate(0, 0, -0.05)
		}

		this.scene.registerForPick(this.index, this)
		// draws the physical button
		this.scene.pushMatrix()
		this.scene.scale(1, 0.5, 0.2)
		this.scene.scale(this.scale[0], this.scale[1], this.scale[2])

		this.appearance.apply()
		this.cube.display()
		this.scene.popMatrix()

		// draws the text
		this.scene.pushMatrix()
		this.scene.translate(0, 0, 0.11)
		this.scene.scale(0.2, 0.2, 0.2)
		this.spriteText.display()
		this.scene.popMatrix()

		this.scene.popMatrix()
	}
}
