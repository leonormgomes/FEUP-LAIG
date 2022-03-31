// TODO comment
class SideBoard {
	constructor(scene, position, boardNode, player, diceTexture) {
		this.scene = scene
		this.boardNode = boardNode
		this.position = [position[0], position[1], position[2]]
		this.scale = position[3] // e.g. scale = 50 <=> 50x50
		this.player = player
		this.diceTexture = diceTexture

		this.translation = new Translation(position[0], position[1], position[2])
		this.scaleTransformation = new Scale(this.scale, this.scale, this.scale)

		this.pieces = []
		this.buildCells()
	}

	buildCells() {
		this.cells = []
		for (let i = 0; i < 10; i++) this.cells.push(new MyTile(this.scene, this, 4, i))

		const initialPiecesPlayer = this.player == MyGameOrchestrator.firstPlayer() ? MyGameOrchestrator.secondPlayer() : MyGameOrchestrator.firstPlayer()

		this.cells[0].piece = new Pawn(
			this.scene,
			new Dice(this.scene, this.diceTexture),
			this.cells[0],
			3,
			initialPiecesPlayer
		)
		this.cells[1].piece = new Pawn(
			this.scene,
			new Dice(this.scene, this.diceTexture),
			this.cells[1],
			5,
			initialPiecesPlayer
		)
		this.cells[2].piece = new Pawn(
			this.scene,
			new Dice(this.scene, this.diceTexture),
			this.cells[2],
			3,
			initialPiecesPlayer
		)

		this.pieces.push(this.cells[0].piece)
		this.pieces.push(this.cells[1].piece)
		this.pieces.push(this.cells[2].piece)
	}

	getFreeTile() {
		for (const cell of this.cells) if (!cell.piece) return cell
	}

	getTile(col) {
		return this.cells[1, col]
	}

	getPiece(level) {
		for (const piece of this.pieces) if (piece.level == level) return piece
	}

	cellToCoordinates(tile) {
		const column = tile.col

		if (column > 10 || column < 0) return false
		const x = column / 9 - 0.5 + 1 / 18
		const z = this.position[2]

		return [x, 0, z]
	}

	display() {
		// matrix calculations and stack operations
		this.pieces.forEach((piece) => piece.display())
		this.scene.pushMatrix()

		// applies the transformation
		this.scene.multMatrix(this.translation.matrix)
		this.scene.multMatrix(this.scaleTransformation.matrix)

		// displays the board elements
		if (this.boardNode) this.boardNode.display()

		this.scene.translate(0, 0.01, 0) // a little bit above to be "visible" to the mouse

		this.cells.forEach((cell) => cell.display())

		// stack reset
		this.scene.popMatrix()
	}
}