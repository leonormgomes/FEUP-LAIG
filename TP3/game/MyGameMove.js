// TODO comment
class MyGameMove {
	constructor(gameboard, piece, originTile, destinationTile) {
		this.gameBoard = gameboard
		this.piece = piece
		this.originTile = originTile
		this.destinationTile = destinationTile
	}

	static fromProlog(gameBoard, prologMove) {
		const originTile = gameBoard.getTile(prologMove[0] - 1, prologMove[1] - 1)
		const destinationTile = gameBoard.getTile(prologMove[2] - 1, prologMove[3] - 1)

		const piece = originTile.piece

		return new MyGameMove(gameBoard, piece, originTile, destinationTile)
	}

	toProlog() {
		return (
			this.originTile.row +
			1 +
			'-' +
			(this.originTile.col + 1) +
			'-' +
			(this.destinationTile.row + 1) +
			'-' +
			(this.destinationTile.col + 1)
		)
	}
}
