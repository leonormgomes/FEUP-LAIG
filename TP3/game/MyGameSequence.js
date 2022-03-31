// TODO
class MyGameSequence {
	constructor(orchestrator) {
		this.orchestrator = orchestrator
		this.movesList = []
		this.gamestateList = []
		this.gameFilmList = []
	}

	addMove(move) {
		this.movesList.push(move)
	}

	addGamestate(gamestate) {
		this.gamestateList.push(gamestate)
	}

	addGameFilmState(gamestate) {
		this.gameFilmList.push(gamestate)
	}

	reset() {
		if (this.gamestateList.length)
			this.setGameState(this.gamestateList[0])
	
		this.movesList = []
		this.gamestateList = []
		this.gameFilmList = []
	}

	undo() {
		// cant undo in the first play
		const statesLength = this.gamestateList.length
		if (statesLength < 3) {
			// 3 because the game state is created in the beginning of the play
			console.log("Can't undo in the first play")
			return
		}

		// gets to 2 plays before on the film list
		let i = this.gameFilmList.length - 1
		while (this.gameFilmList[i].currentPlayer == this.orchestrator.currentPlayer)
			i--
		while (this.gameFilmList[i].currentPlayer != this.orchestrator.currentPlayer)
			i--
		this.gameFilmList = this.gameFilmList.slice(0, i)

		// removes the last 2 plays
		this.gamestateList = this.gamestateList.slice(0, statesLength - 2)
		const gameState = this.gamestateList[statesLength - 3]
		this.setGameState(gameState)

		// unselects the undo button
		this.orchestrator.menu.undoButton.unselect()
	}

	setGameState(gamestate) {
		// updates the this.orchestrator variables
		this.orchestrator.currentPlayer = gamestate.currentPlayer
		this.orchestrator.firstPlayerPieces = gamestate.firstPlayerPieces
		this.orchestrator.secondPlayerPieces = gamestate.secondPlayerPieces

		// verifies the pieces that changed position or exited the board
		gamestate.tiles.forEach((tile) => {
			if (!tile.piece)
				// has no piece
				return

			const id = tile.piece.index

			if (!id)
				// is not a pawn
				return

			// gets the current tile of the piece
			const list = this.orchestrator.gameboard.getTileByPieceIndex(id)
			if (!list) return

			const found = list[0]
			const originTile = list[1]
			if (found && originTile.row == tile.row && originTile.col == tile.col)
				// same tile, doesn't need to move
				return

			const piece = originTile.piece

			if (found) {
				// if its still on the board, just moves it
				let move = new MyGameMove(this.orchestrator.gameboard, piece, originTile, tile)
				this.orchestrator.moveAnimator.movePiece(move)
			} else {
				// if it left the board, puts it there
				this.orchestrator.gameboard.movePieceFromSideBoard(
					piece.player,
					this.orchestrator.gameboard.getTile(tile.row, tile.col),
					piece.tile.col
				)
			}
		})

		// verifies if any piece left the player1 board
		gamestate.player1Tiles.forEach((tile) => {
			this.setSideBoardTile(tile)
		})

		// verifies if any piece left the player2 board
		gamestate.player2Tiles.forEach((tile) => {
			this.setSideBoardTile(tile)
		})
	}

	setSideBoardTile(tile) {
		if (!tile.piece) return

		const id = tile.piece.index

		// gets the current tile of the piece
		const list = this.orchestrator.gameboard.getTileByPieceIndex(id)
		if (!list) return

		const found = list[0]
		const originTile = list[1]

		if (!found) {
			//same tile, doesn't need to move
			return
		}

		const piece = originTile.piece

		if (found) this.orchestrator.gameboard.moveToSideBoardTile(piece, tile)
		else this.orchestrator.gameboard.moveInsideSideBoard(piece, tile)
	}
}
