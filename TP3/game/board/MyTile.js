// TODO
class MyTile extends CGFobject {
	constructor(scene, board, row, col, piece) {
		super(scene)
		this.scene = scene
		this.board = board
		this.row = row
		this.col = col
		this.piece = piece

		this.index = this.scene.getClickableIndex()

		this.initRectangle()
		this.initTransparentMaterial()
	}

	initRectangle() {
		const x1 = -0.5 + this.col * (1 / 9)
		const x2 = x1 + 1 / 9

		const z1 = -0.5 + this.row * (1 / 9)
		const z2 = z1 + 1 / 9

		this.rectangle = new MyRectangle(this.scene, x1, z1, x2, z2, 1, 1, 1, 1)
	}

	initTransparentMaterial() {
		this.material = new CGFappearance(this.scene)
		this.material.setAmbient(0, 0, 0, 0)
		this.material.setDiffuse(0, 0, 0, 0)
		this.material.setSpecular(0, 0, 0, 0)
		this.material.setEmission(0, 0, 0, 0)
	}

	highlight() {
		// this.material.setAmbient(0.275, 0.51, 0.706, 1)
		this.material.setDiffuse(0.275, 0.51, 0.706, 0.5)
		this.material.setSpecular(1, 1, 1, 1)
	}

	toProlog() {
		return this.row + 1 + '-' + (this.col + 1)
	}

	display() {
		this.scene.pushMatrix()

		// displays the invisible cell
		this.scene.rotate(-Math.PI / 2, 1, 0, 0, 0)

		this.scene.registerForPick(this.index, this)

		this.material.apply()
		this.rectangle.display()

		this.scene.popMatrix()
	}
}
