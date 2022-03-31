// TODO document
class GameState {
	// board -> game board
	// currentPlayer -> 0, 1
	// firstPlayerPieces -> number of pieces of the player1
	// secondPlayerPieces -> number of pieces of the player2
	constructor(board, currentPlayer, firstPlayerPieces, secondPlayerPieces) {
		this.board = board
    this.buildTiles(board)

		this.currentPlayer = currentPlayer
		this.firstPlayerPieces = firstPlayerPieces
		this.secondPlayerPieces = secondPlayerPieces
	}

	static fromProlog(scene, prologList) {
		const board = Board.fromProlog(scene, prologList[0])
		const currentPlayer =
			prologList[1] == 'x' ? MyGameOrchestrator.firstPlayer() : MyGameOrchestrator.secondPlayer()
		const firstPlayerPieces = currentPlayer == MyGameOrchestrator.firstPlayer() ? prologList[2] : prologList[3]
		const secondPlayerPieces = currentPlayer == MyGameOrchestrator.firstPlayer() ? prologList[3] : prologList[2]

		return new GameState(board, currentPlayer, firstPlayerPieces, secondPlayerPieces)
  }
  
  buildTiles(board) {
    this.tiles = []
    board.cells.forEach(tile => {
      this.tiles.push(new MyTile(board.scene, board, tile.row, tile.col, tile.piece))
		})
		
		this.player1Tiles = []
		board.player1Board.cells.forEach(tile => this.player1Tiles.push(new MyTile(board.scene, board, tile.row, tile.col, tile.piece)))
	
		this.player2Tiles = []
		board.player2Board.cells.forEach(tile => this.player2Tiles.push(new MyTile(board.scene, board, tile.row, tile.col, tile.piece)))
	}

	toProlog() {
		let prologList = []

		// builds the board
		prologList.push(this.board.toProlog())

		// gets the player
		const player = MyPrologInterface.playerToProlog(this.currentPlayer)
		prologList.push(player)

		// gets the current player pieces
		const playerPieces =
			this.currentPlayer == MyGameOrchestrator.firstPlayer ? this.firstPlayerPieces : this.secondPlayerPieces
		prologList.push(playerPieces)

		// gets the opponent pieces
		const opponentPieces = playerPieces == this.firstPlayerPieces ? this.secondPlayerPieces : this.firstPlayerPieces
		prologList.push(opponentPieces)

		// gets the caves
		prologList.push(this.board.getTile(4, 0).piece.toProlog())
		prologList.push(this.board.getTile(4, 4).piece.toProlog())
		prologList.push(this.board.getTile(4, 8).piece.toProlog())

		return prologList
	}
}
