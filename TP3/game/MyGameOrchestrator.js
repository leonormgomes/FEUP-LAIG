// TODO documentation
class MyGameOrchestrator {
	constructor(scene) {
		this.scene = scene
		this.gameSequence = new MyGameSequence(this)
		this.gameboard = new Board(scene, null, null)
		// init menus
		this.mainMenu = new MyMainMenu(scene, this)
		this.menu = new MyMidGameMenu(scene, this)

		// the max time between plays
		this.maxTime = 30

		this.loadThemes()
		this.prolog = new MyPrologInterface()

		this.playerType = [-1, -1] // human: -1, easy: 0, hard: 1 // TODO static
		this.initPlayers()

		// animators
		this.animator = new MyAnimator(scene)
		this.camera = new MyCameraAnimator(this.scene)
		this.moveAnimator = new MyMoveAnimator(this.scene)
		this.tileAnimator = new MyTileAnimator(this.scene)
		this.filmAnimator = new MyGameFilmAnimator(this.scene, this)

		this.state = MyGameOrchestrator.getState().loading // TODO menu
	}

	loadThemes() {
		this.themeManager = new ThemeManager(this.scene)

		this.themeManager.addTheme('Home', 'home.xml')
		this.themeManager.addTheme('Park', 'park.xml')
		this.themeManager.addTheme('Beach', 'beach.xml')
		this.themeManager.setTheme('Home')
	}

	initPlayers() {
		this.currentPlayer = MyGameOrchestrator.firstPlayer()

		this.firstPlayerPieces = 8
		this.secondPlayerPieces = 8
	}

	static getState() {
		return Object.freeze({
			loading: 1,
			menu: 2,
			play: 3,
			pieceClicked: 4,
			verifyMove: 5,
			pieceMoving: 6,
			checkIfCaptures: 7,
			summonDragon: 8,
			botMove: 9,
			gameEnded: 10,
			film: 10,
		})
	}

	static firstPlayer() {
		return 0
	}

	static secondPlayer() {
		return 1
	}

	static getPlayerColor(player) {
		if (player == MyGameOrchestrator.firstPlayer()) return 'white'
		if (player == MyGameOrchestrator.secondPlayer()) return 'black'
	}

	orchestrate() {
		const response = this.prolog.getResponse()
		switch (this.state) {
			case MyGameOrchestrator.getState().loading:
				this.scene.setPickEnabled(false)
				break

			case MyGameOrchestrator.getState().menu:
				// this.state = MyGameOrchestrator.getState().play // TODO
				break

			case MyGameOrchestrator.getState().play:
				if (response != null) {
					// updates the game sequence
					const gameState = new GameState(
						this.gameboard,
						this.currentPlayer,
						this.firstPlayerPieces,
						this.secondPlayerPieces
					)
					this.gameSequence.addGamestate(gameState)
					this.gameSequence.addGameFilmState(gameState)
					if (this.move) this.gameSequence.addMove(this.move)


					// verifies if the game has ended
					if (response == MyPrologInterface.prototype.OK) {
						this.state = MyGameOrchestrator.getState().gameEnded
						this.camera.setMidMenuCamera()
						this.currentPlayer == MyGameOrchestrator.firstPlayer()
							? (this.winner = MyGameOrchestrator.secondPlayer())
							: (this.winner = MyGameOrchestrator.firstPlayer())
						this.endMenu = new MyEndMenu(this.scene, this)
					}

					// if it is the bot asks the bot about the move
					else if (this.playerType[this.currentPlayer] != -1) {
						// TODO verify if bot another way
						this.prolog.chooseMoveRequest(
							gameState,
							this.currentPlayer,
							this.playerType[this.currentPlayer]
						)
						this.state = MyGameOrchestrator.getState().botMove
					}
					this.menu.clock.start(this.maxTime)
				}
				if (this.menu.clock.state == MyClock.state().finished) {
					console.log('Needs to change player in state play')
					this.changeCurrentPlayer()
				}
				break
			case MyGameOrchestrator.getState().pieceClicked:
				if (response != null) {
					const tiles = []
					// adds the destinations to the tile animator
					this.prolog.return.forEach((move) =>
						tiles.push(MyGameMove.fromProlog(this.gameboard, move).destinationTile)
					)

					this.tileAnimator.highlightList(tiles, 500)
				}
				if (this.menu.clock.state == MyClock.state().finished) {
					console.log('Needs to change player in state piece clicked')
					this.changeCurrentPlayer()
				}
				break

			case MyGameOrchestrator.getState().verifyMove:
				if (response != null) {
					if (response == MyPrologInterface.prototype.OK) {
						// if move is valid
						// moves the piece
						this.moveAnimator.movePiece(this.move)

						this.state = MyGameOrchestrator.getState().pieceMoving
					} else if (response == MyPrologInterface.prototype.NotOK) {
						this.state = MyGameOrchestrator.getState().pieceClicked
					}
				}
				break

			case MyGameOrchestrator.getState().botMove:
				if (response != null && response == 1) {
					// gets the answer from the server
					const move = this.prolog.return[0]
					// const gs = this.prolog.return[1]

					// makes the move
					const originTile = this.gameboard.getTile(move[0] - 1, move[1] - 1)
					const destinationTile = this.gameboard.getTile(move[2] - 1, move[3] - 1)
					this.move = new MyGameMove(this.gameboard, originTile.piece, originTile, destinationTile)
					this.moveAnimator.movePiece(this.move)

					// updates the state of the game
					this.state = MyGameOrchestrator.getState().pieceMoving
				}
				break

			case MyGameOrchestrator.getState().pieceMoving:
				this.tileAnimator.resetTiles()
				break

			case MyGameOrchestrator.getState().checkIfCaptures:
				if (response != null) {
					if (response == MyPrologInterface.prototype.OK) {
						// updates the film game state
						let gameState = new GameState(
							this.gameboard,
							this.currentPlayer,
							this.firstPlayerPieces,
							this.secondPlayerPieces
						)
						this.gameSequence.addGameFilmState(gameState)

						// removes the captured pieces from the board
						this.prolog.return.forEach((piece) => {
							// e.g. piece = [6, 7] to position row = 6, col = 7
							// updates the number of pieces
							if (this.currentPlayer == MyGameOrchestrator.firstPlayer()) this.secondPlayerPieces--
							else this.firstPlayerPieces--

							const pawn = this.gameboard.getTile(piece[0], piece[1]).piece
							this.gameboard.moveToSideBoard(pawn)
						})

						gameState = new GameState(
							this.gameboard,
							this.currentPlayer,
							this.firstPlayerPieces,
							this.secondPlayerPieces
						)
						this.gameSequence.addGameFilmState(gameState)

						// verifies if new dragons are born in the caves
						this.prolog.summonDragonRequest(this.gameboard, this.move.destinationTile, this.currentPlayer)

						this.state = MyGameOrchestrator.getState().summonDragon
					} else if (response == MyPrologInterface.prototype.NotOK) {
						alert('Error getting pieces to capture')
						// TODO delete
						// TODO revert move
						this.state = MyGameOrchestrator.getState().pieceClicked
					}
				}
				break

			case MyGameOrchestrator.getState().summonDragon:
				if (response != null) {
					if (response == MyPrologInterface.prototype.OK) {
						const tile = this.gameboard.getTile(this.prolog.return[0], this.prolog.return[1])
						const cave = this.gameboard.getCave(tile)

						// verifies if the returned position is indeed in a cave
						if (!cave) {
							console.log('cant get dragon for ' + this.prolog.return)
							return
						}

						// verifies if the cave can still breed dragons
						if (!cave.nDragons) return

						// subtracts the number of dragons of the cave
						cave.nDragons--

						// grabs the piece to the board
						this.gameboard.moveFromSideBoard(this.currentPlayer, tile, cave.level)

						// updates the number of pieces of the player
						if (this.currentPlayer == MyGameOrchestrator.firstPlayer()) this.firstPlayerPieces++
						else this.secondPlayerPieces++

						const gameState = new GameState(
							this.gameboard,
							this.currentPlayer,
							this.firstPlayerPieces,
							this.secondPlayerPieces
						)
						this.gameSequence.addGameFilmState(gameState)
					}

					this.changeCurrentPlayer()
				}
				break

			case MyGameOrchestrator.getState().film:
				break

			case MyGameOrchestrator.getState().filmMove:
				break

			case MyGameOrchestrator.getState().gameEnded:
				console.log(this.winner + ' won!!!!!')
				break

			default:
				console.log('we are not prepared for ' + this.state)
		}
	}

	clearMovingPieces() {
		// clears the moving pieces list
		this.moveAnimator.clearMovingPieces()

		// goes to check if captures if the move is over
		if (this.state == MyGameOrchestrator.getState().pieceMoving && !this.moveAnimator.movingPieces.length) {
			const gs = new GameState(
				this.gameboard,
				this.currentPlayer,
				this.firstPlayerPieces,
				this.secondPlayerPieces
			)
			this.prolog.capturesRequest(gs, this.move)
			this.state = MyGameOrchestrator.getState().checkIfCaptures
		}
	}

	managePick(mode, results) {
		if (mode == false) {
			if (results != null && results.length > 0) {
				// any results?
				for (let i = 0; i < results.length; i++) {
					const obj = this.scene.pickResults[i][0] // get object from result
					if (obj) {
						// exists?
						const uniqueId = this.scene.pickResults[i][1] // get id
						this.onObjectSelected(obj, uniqueId)
					}
				}
				// clear results
				this.scene.pickResults.splice(0, this.scene.pickResults.length)
			}
		}
	}

	onObjectSelected(object, id) {
		switch (object.constructor) {
			case Pawn:
				if (
					(this.state == MyGameOrchestrator.getState().play ||
						this.state == MyGameOrchestrator.getState().pieceClicked) &&
					object.player == this.currentPlayer &&
					this.playerType[this.currentPlayer] == -1 // TODO static
				) {
					this.selectedPawn = object
					// TODO request valid destination tiles
					this.prolog.possibleMovesRequest(this.gameboard, this.currentPlayer, [
						object.tile.row,
						object.tile.col,
					])
					this.state = MyGameOrchestrator.getState().pieceClicked
				} else {
					console.log('player: ' + this.currentPlayer + ', state:' + this.state)
				}
				break

			case MyTile:
				if (this.state == MyGameOrchestrator.getState().pieceClicked) {
					this.move = new MyGameMove(this.gameboard, this.selectedPawn, this.selectedPawn.tile, object)
					this.prolog.isMoveValidRequest(this.gameboard, this.currentPlayer, this.move)
					this.state = MyGameOrchestrator.getState().verifyMove
				}
				break

			case MyOption:
				object.run()
				break

			default:
				// idk amigo this is a big error
				alert(object.constructor + ' is not clickable..')
				break
		}
	}

	startGame() {
		this.initPlayers()
		
		this.scene.gameOrchestrator.prolog.response = 0
		this.scene.gameOrchestrator.camera.setPlayerCamera(MyGameOrchestrator.firstPlayer())

		this.gameSequence.reset()

		this.scene.gameOrchestrator.state = MyGameOrchestrator.getState().play // TODO after menu
		this.scene.setPickEnabled(true)

		this.mainMenu.playButton.unselect()
	}

	changeCurrentPlayer() {
		this.currentPlayer == MyGameOrchestrator.firstPlayer()
			? (this.currentPlayer = MyGameOrchestrator.secondPlayer())
			: (this.currentPlayer = MyGameOrchestrator.firstPlayer())

		this.selectedPawn = null
		const gamestate = new GameState(
			this.gameboard,
			this.currentPlayer,
			this.firstPlayerPieces,
			this.secondPlayerPieces
		)

		// verifies if the game is over
		this.prolog.gameOverRequest(gamestate, this.currentPlayer)
		this.camera.setPlayerCamera(this.currentPlayer)
		this.state = MyGameOrchestrator.getState().play
		this.menu.clock.start(this.maxTime)
	}

	update(time) {
		// updates the animator
		this.animator.update(time)
		this.camera.update(time)
		this.tileAnimator.update(time)
		this.filmAnimator.update(time)

		// updates the pieces
		this.moveAnimator.update(time)

		// updates the theme
		this.themeManager.update(time)

		// updates the menu
		this.menu.update(time)
	}

	display() {
		this.scene.pushMatrix()

		this.moveAnimator.display()
		this.camera.display()

		switch (this.state) {
			case MyGameOrchestrator.getState().loading:
				this.themeManager.displayLoading()
				break

			case MyGameOrchestrator.getState().gameEnded:
			case MyGameOrchestrator.getState().film:
				this.endMenu.display()
				this.filmAnimator.display()
				this.themeManager.displayTheme()
				this.gameboard.display()
				this.mainMenu.display()
				break
			case MyGameOrchestrator.getState().menu:
			case MyGameOrchestrator.getState().pieceClicked:
			case MyGameOrchestrator.getState().play:
			case MyGameOrchestrator.getState().verifyMove:
			case MyGameOrchestrator.getState().checkIfCaptures:
			case MyGameOrchestrator.getState().summonDragon:
			case MyGameOrchestrator.getState().pieceMoving:
			case MyGameOrchestrator.getState().botMove:
				this.themeManager.displayTheme()
				this.mainMenu.display()
				this.gameboard.display()
				this.menu.display() // TODO
				break
			default:
				console.log('cant display state ' + this.state)
				break
		}

		this.scene.popMatrix()
		// this.animator.display() // TODO check animator
	}
}
