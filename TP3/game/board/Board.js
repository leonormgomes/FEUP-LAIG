// TODO document
class Board {
	constructor(
		scene,
		whiteDice,
		blackDice,
		position = [0, 0, 0, 1],
		boardNode = null,
		smallCaveNode = null,
		largeCaveNode = null
	) {
		this.scene = scene
		this.position = [position[0], position[1], position[2]]
		this.scale = position[3] // e.g. scale = 50 <=> 50x50
		this.boardNode = boardNode
		this.smallCaveNode = smallCaveNode
		this.largeCaveNode = largeCaveNode
		this.whiteDice = whiteDice
		this.blackDice = blackDice

		this.translation = new Translation(position[0], position[1], position[2])
		this.scaleTransformation = new Scale(this.scale, this.scale, this.scale)
		this.buildCells()
		this.initPieces()
	}

	static fromProlog(scene, prologBoard) {
		// copies a board
		// let board = JSON.parse(JSON.stringify(scene.gameOrchestrator.gameboard))
		let board = new Board(scene)
		// loads the matrix into the board
		board.initPiecesFromMatrix(prologBoard)
		return board
	}
	
	buildCells() {
		this.cells = []
		for (let row = 0; row < 9; row++)
			for (let col = 0; col < 9; col++) this.cells.push(new MyTile(this.scene, this, row, col))

		this.player1Board = new SideBoard(
			this.scene,
			[0, 0, -0.75, 1],
			null,
			MyGameOrchestrator.firstPlayer(),
			this.blackDice
		)
		this.player2Board = new SideBoard(
			this.scene,
			[0, 0, 0.75, 1],
			null,
			MyGameOrchestrator.secondPlayer(),
			this.whiteDice
		)
	}

	initPieces() {
		this.pieces = []

		// creates the white pieces
		const w1 = new Pawn(this.scene, new Dice(this.scene, this.whiteDice), null, 3, MyGameOrchestrator.firstPlayer())
		const w2 = new Pawn(this.scene, new Dice(this.scene, this.whiteDice), null, 2, MyGameOrchestrator.firstPlayer())
		const w3 = new Pawn(this.scene, new Dice(this.scene, this.whiteDice), null, 2, MyGameOrchestrator.firstPlayer())
		const w4 = new Pawn(this.scene, new Dice(this.scene, this.whiteDice), null, 2, MyGameOrchestrator.firstPlayer())
		const w5 = new Pawn(this.scene, new Dice(this.scene, this.whiteDice), null, 2, MyGameOrchestrator.firstPlayer())
		const w6 = new Pawn(this.scene, new Dice(this.scene, this.whiteDice), null, 2, MyGameOrchestrator.firstPlayer())
		const w7 = new Pawn(this.scene, new Dice(this.scene, this.whiteDice), null, 3, MyGameOrchestrator.firstPlayer())
		const w8 = new Pawn(this.scene, new Dice(this.scene, this.whiteDice), null, 4, MyGameOrchestrator.firstPlayer())

		// adds the white pieces to the board
		this.addPieceToCell(w1, 8, 1)
		this.addPieceToCell(w2, 8, 2)
		this.addPieceToCell(w3, 8, 3)
		this.addPieceToCell(w4, 8, 4)
		this.addPieceToCell(w5, 8, 5)
		this.addPieceToCell(w6, 8, 6)
		this.addPieceToCell(w7, 8, 7)
		this.addPieceToCell(w8, 7, 4)

		// stores the white pieces
		this.pieces.push(w1, w2, w3, w4, w5, w6, w7, w8)

		// creates the black pieces
		const b1 = new Pawn(
			this.scene,
			new Dice(this.scene, this.blackDice),
			null,
			3,
			MyGameOrchestrator.secondPlayer()
		)
		const b2 = new Pawn(
			this.scene,
			new Dice(this.scene, this.blackDice),
			null,
			2,
			MyGameOrchestrator.secondPlayer()
		)
		const b3 = new Pawn(
			this.scene,
			new Dice(this.scene, this.blackDice),
			null,
			2,
			MyGameOrchestrator.secondPlayer()
		)
		const b4 = new Pawn(
			this.scene,
			new Dice(this.scene, this.blackDice),
			null,
			2,
			MyGameOrchestrator.secondPlayer()
		)
		const b5 = new Pawn(
			this.scene,
			new Dice(this.scene, this.blackDice),
			null,
			2,
			MyGameOrchestrator.secondPlayer()
		)
		const b6 = new Pawn(
			this.scene,
			new Dice(this.scene, this.blackDice),
			null,
			2,
			MyGameOrchestrator.secondPlayer()
		)
		const b7 = new Pawn(
			this.scene,
			new Dice(this.scene, this.blackDice),
			null,
			3,
			MyGameOrchestrator.secondPlayer()
		)
		const b8 = new Pawn(
			this.scene,
			new Dice(this.scene, this.blackDice),
			null,
			4,
			MyGameOrchestrator.secondPlayer()
		)

		// adds the black pieces to the board
		this.addPieceToCell(b1, 0, 1)
		this.addPieceToCell(b2, 0, 2)
		this.addPieceToCell(b3, 0, 3)
		this.addPieceToCell(b4, 0, 4)
		this.addPieceToCell(b5, 0, 5)
		this.addPieceToCell(b6, 0, 6)
		this.addPieceToCell(b7, 0, 7)
		this.addPieceToCell(b8, 1, 4)

		// stores the black pieces
		this.pieces.push(b1, b2, b3, b4, b5, b6, b7, b8)
	}

	initPiecesFromMatrix(list) {
		this.clearPieces()

		for (let row = 0; row < 9; row++) {
			for (let col = 0; col < 9; col++) {
				const piece = MyPiece.fromProlog(this.scene, list[row][col])
				if (piece) {
					this.addPieceToCell(piece, row, col)
					this.pieces.push(piece)
				}
			}
		}
	}

	clearPieces() {
		this.pieces = []

		this.cells.forEach((cell) => (cell.piece = null))
	}

	createSmallCaves(node) {
		this.smallCaveNode = node

		this.smallCave1 = new Cave(this.scene, node, null, 3)
		this.smallCave2 = new Cave(this.scene, node, null, 3)

		this.addPieceToCell(this.smallCave1, 4, 0)
		this.addPieceToCell(this.smallCave2, 4, 8)
	}

	createLargeCave(node) {
		this.largeCaveNode = node

		this.largeCave = new Cave(this.scene, node, null, 5)

		this.addPieceToCell(this.largeCave, 4, 4)
	}

	getCave(tile) {
		if (tile.row == 4) {
			if (tile.col == 0) return this.smallCave1
			else if (tile.col == 4) return this.largeCave
			else if (tile.col == 8) return this.smallCave2
		}
	}

	createMountains(node) {
		this.mountainNode = node

		this.mountain1 = new Mountain(this.scene, node)
		this.mountain2 = new Mountain(this.scene, node)
		this.mountain3 = new Mountain(this.scene, node)
		this.mountain4 = new Mountain(this.scene, node)

		this.addPieceToCell(this.mountain1, 0, 0)
		this.addPieceToCell(this.mountain2, 0, 8)
		this.addPieceToCell(this.mountain3, 8, 0)
		this.addPieceToCell(this.mountain4, 8, 8)
	}

	addPieceToCell(piece, row, col) {
		const tile = this.getTile(row, col)
		if (piece.tile) piece.tile.piece = null
		piece.tile = tile
		tile.piece = piece
	}

	getTile(row, col) {
		return this.cells[row * 9 + col]
	}

	getTileByPieceIndex(index) {
		// returns [true, tile] if it was found in the gameboard
		for (const tile of this.cells) if (tile.piece && tile.piece.index == index) return [true, tile]

		// returns [false, tile] if it was found in the sideboards
		for (const tile of this.player1Board.cells) if (tile.piece && tile.piece.index == index) return [false, tile]
		for (const tile of this.player2Board.cells) if (tile.piece && tile.piece.index == index) return [false, tile]
	}

	coordinatesToCell(position) {
		// TODO testing
		const x = position[0]
		const z = position[2]
		const scale = this.scale
		if (x > this.position[0] + scale / 2 || x < this.position[0] - scale / 2) return false
		if (z > this.position[2] + scale / 2 || z < this.position[2] - scale / 2) return false
		const x_border = this.position[0] - scale / 2
		const z_border = this.position[2] + scale / 2
		const line = Math.floor(((position[0] - x_border) * 9) / scale)
		const column = Math.floor(((z_border - position[2]) * 9) / scale)
		return [line, column]
	}

	cellToCoordinates(tile) {
		const line = tile.row
		const column = tile.col
		if (line > 8 || line < 0) return false
		if (column > 8 || column < 0) return false
		const x = column / 9 - 0.5 + 1 / 18
		const z = -line / 9 + 0.5 - 1 / 18
		return [x, 0, z]
	}

	moveToSideBoard(pawn) {
		// gets the sideboard
		const player = pawn.player
		const sideBoard = player == MyGameOrchestrator.firstPlayer() ? this.player2Board : this.player1Board

		// gets the free tile to move the piece to
		const tile = sideBoard.getFreeTile()
		if (!tile) console.log('error: sideboard full')

		this.moveToSideBoardTile(pawn, tile)
	}

	moveToSideBoardTile(pawn, tile) {
		const sideBoard = pawn.player == MyGameOrchestrator.firstPlayer() ? this.player2Board : this.player1Board

		// gets the coords
		const originCoords = this.cellToCoordinates(pawn.tile)
		const destinationCoords = sideBoard.cellToCoordinates(tile)

		// makes the animation
		this.scene.gameOrchestrator.moveAnimator.movingPieces.push(pawn)
		pawn.animation = new PieceAnimation(this.scene, originCoords, destinationCoords, 2000)

		// updates the piece position
		const realTile = sideBoard.getTile(tile.col)
		this.getTile(pawn.tile.row, pawn.tile.col).piece = null
		pawn.tile = realTile
		realTile.piece = pawn
		sideBoard.pieces.push(pawn)
		this.pieces = this.pieces.filter((piece) => piece.index != pawn.index)
	}

	moveInsideSideBoard(pawn, destinationTile) {
		const sideBoard = pawn.player == MyGameOrchestrator.firstPlayer() ? this.player2Board : this.player1Board

		// gets the coords
		const originCoords = sideBoard.cellToCoordinates(pawn.tile)
		const destinationCoords = sideBoard.cellToCoordinates(destinationTile)

		// makes the animation
		this.scene.gameOrchestrator.moveAnimator.movingPieces.push(pawn)
		pawn.animation = new PieceAnimation(this.scene, originCoords, destinationCoords, 2000)

		// updates the piece position
		sideBoard.getTile(pawn.tile.col).piece = null
		pawn.tile = destinationTile
		destinationTile.piece = pawn
	}

	moveFromSideBoard(player, destinationTile, level) {
		// gets the sideboard
		const sideBoard = player == MyGameOrchestrator.firstPlayer() ? this.player2Board : this.player1Board

		// gets the piece from the sideboard
		const pawn = sideBoard.getPiece(level)
		if (!pawn) {
			console.log('side board does not have any piece level ' + level)
			return
		}

		// gets the coords
		const originCoords = sideBoard.cellToCoordinates(pawn.tile)
		const destinationCoords = this.cellToCoordinates(destinationTile)

		// makes the animation
		this.scene.gameOrchestrator.moveAnimator.movingPieces.push(pawn)
		pawn.animation = new PieceAnimation(this.scene, originCoords, destinationCoords, 2000)

		// updates the piece position
		sideBoard.getTile(pawn.tile.col).piece = null
		pawn.tile = destinationTile
		destinationTile.piece = pawn
		this.pieces.push(pawn)
		sideBoard.pieces = sideBoard.pieces.filter((piece) => piece.index != pawn.index)
	}

	movePieceFromSideBoard(player, destinationTile, originCol) {
		// gets the sideboard
		const sideBoard = player == MyGameOrchestrator.firstPlayer() ? this.player2Board : this.player1Board

		// gets the piece from the sideboard
		const pawn = sideBoard.getTile(originCol).piece
		if (!pawn) {
			console.log('side board does not have pieces on ' + originCol)
			return
		}

		// gets the coords
		const originCoords = sideBoard.cellToCoordinates(pawn.tile)
		const destinationCoords = this.cellToCoordinates(destinationTile)

		// makes the animation
		this.scene.gameOrchestrator.moveAnimator.movingPieces.push(pawn)
		pawn.animation = new PieceAnimation(this.scene, originCoords, destinationCoords, 2000)

		// updates the piece position
		sideBoard.getTile(pawn.tile.col).piece = null
		pawn.tile = destinationTile
		destinationTile.piece = pawn
		this.pieces.push(pawn)
		sideBoard.pieces = sideBoard.pieces.filter((piece) => piece.index != pawn.index)
	}

	toProlog() {
		let boardMatrix = []
		for (let row = 0; row < 9; row++) {
			let rowList = []

			for (let col = 0; col < 9; col++) {
				const piece = this.getTile(row, col).piece

				let pieceProlog = 'ss'
				if (piece) pieceProlog = piece.toProlog()

				rowList.push(pieceProlog)
			}

			boardMatrix.push(rowList)
		}

		return boardMatrix
	}

	display() {
		// matrix calculations and stack operations
		this.scene.pushMatrix()

		// applies the transformation
		this.scene.multMatrix(this.translation.matrix)
		this.scene.multMatrix(this.scaleTransformation.matrix)

		// displays the board elements
		const database = this.scene.gameOrchestrator.themeManager.selectedTheme.database
		database.boardNode.display()
		this.smallCave1.display()
		this.smallCave2.display()
		this.largeCave.display()
		this.mountain1.display()
		this.mountain2.display()
		this.mountain3.display()
		this.mountain4.display()

		// displays the side boards
		this.player1Board.display()
		this.player2Board.display()

		this.pieces.forEach((piece) => piece.display())
		this.scene.translate(0, 0.001, 0) // a little bit above to be "visible" to the mouse

		this.cells.forEach((cell) => cell.display())

		// stack reset
		this.scene.popMatrix()
	}
}
