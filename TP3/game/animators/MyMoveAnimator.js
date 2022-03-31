// TODO document
class MyMoveAnimator extends MyAnimator {
	constructor(scene) {
		super(scene)

		this.movingPieces = []
	}

	clearMovingPieces() {
		this.movingPieces = this.movingPieces.filter((piece) => !piece.animation.finished)
	}

	movingPiecesAmount() {
		return this.movingPieces.length
	}

	movePiece(move) {
		const originCoords = this.scene.gameOrchestrator.gameboard.cellToCoordinates(move.originTile)
		const destinationCoords = this.scene.gameOrchestrator.gameboard.cellToCoordinates(move.destinationTile)
		this.movingPieces.push(move.piece)
		move.piece.animation = new PieceAnimation(this.scene, originCoords, destinationCoords, 2000)
		this.scene.gameOrchestrator.gameboard.addPieceToCell(
			move.piece,
			move.destinationTile.row,
			move.destinationTile.col
		)

		// reposes the caves
		let cave = this.scene.gameOrchestrator.gameboard.getCave(move.originTile)
		if (cave) this.scene.gameOrchestrator.gameboard.addPieceToCell(cave, move.originTile.row, move.originTile.col)
	}

	update(time) {
		this.movingPieces.forEach((piece) => piece.update(time))
	}

	display() {}
}
