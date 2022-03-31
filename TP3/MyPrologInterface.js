// TODO comment
class MyPrologInterface {
	constructor() {
		this.request = null
	}

	fromListToString(list) {
		let result = '['
		for (let i = 0; i < list.length; i++) {
			if (Array.isArray(list[i])) result += this.fromListToString(list[i])
			else {
				const value = list[i]
				if (
					typeof value !== 'number' &&
					!parseInt(value.charAt(0)) &&
					value.charAt(0) == value.charAt(0).toUpperCase()
				) {
					result += "'"
					result += value
					result += "'"
				} else {
					result += value
				}
			}
			if (i != list.length - 1) result += ','
		}
		result += ']'

		return result
	}

	static playerToProlog(player) {
		return player == MyGameOrchestrator.firstPlayer() ? 'x' : 'o'
	}

	sendRequestToProlog(list, onSuccess, onError, port) {
		let requestString = this.fromListToString(list)

		
		self = this
		
		let requestPort = port || 8081
		let request = new XMLHttpRequest()
		
		request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true)

		request.onload =
			onSuccess ||
			function (data) {
				console.log('Request successful. Reply: ' + data.target.response)
			}
		request.onerror =
			onError ||
			function () {
				console.log('Error waiting for response')
			}

		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
		request.send()
	}

	// use this function instead of getting the value directly, this clears the response for futures uses
	getResponse() {
		const response = this.response
		this.response = null
		return response
	}

	// Requests to Prolog

	possibleMovesRequest(board, player, position) {
		const prologPosition = [position[0] + 1, position[1] + 1]
		this.sendRequestToProlog([this.possibleMoves, board.toProlog(), MyPrologInterface.playerToProlog(player), prologPosition], this.possibleMovesReply)
	}

	gameOverRequest(gameState, player) {
		this.sendRequestToProlog([this.gameOver, gameState.toProlog(), MyPrologInterface.playerToProlog(player)], this.gameOverReply)
	}

	isMoveValidRequest(gameState, player, move) {
		this.sendRequestToProlog([this.isMoveValid, gameState.toProlog(), MyPrologInterface.playerToProlog(player), move.toProlog()], this.isMoveValidReply)
	}

	capturesRequest(gameState, move) {
		this.sendRequestToProlog([this.captures, gameState.toProlog(), move.toProlog()], this.capturesReply)
	}

	summonDragonRequest(board, tile, player){
		this.sendRequestToProlog([this.summonDragon, board.toProlog(), tile.toProlog(), MyPrologInterface.playerToProlog(player)], this.summonDragonReply)
	}

	chooseMoveRequest(gameState, player, level){
		this.sendRequestToProlog([this.chooseMove, gameState.toProlog(), MyPrologInterface.playerToProlog(player), level], this.chooseMoveReply)
	}

	// Replies from Prolog
	possibleMovesReply(data) {
		let reply = JSON.parse(data.target.response)
		self.response = reply[0]
		self.return = reply[1]
	}

	gameOverReply(data) {
		let reply = JSON.parse(data.target.response)
		self.response = reply[0]
	}

	isMoveValidReply(data) {
		let reply = JSON.parse(data.target.response)
		self.response = reply[0]
	}

	capturesReply(data) {
		let reply = JSON.parse(data.target.response)
		self.response = reply[0]
		const prologReturn = reply[1]
		self.return = []
		prologReturn.forEach((coords) => self.return.push([coords[0] - 1, coords[1] - 1]))
	}

	summonDragonReply(data){
		let reply = JSON.parse(data.target.response)
		self.response = reply[0]

		const prologReturn = reply[1]
		self.return = []
		if (prologReturn) prologReturn.forEach((coord) => self.return.push(coord - 1))
	}

	chooseMoveReply(data){
		let reply = JSON.parse(data.target.response)
		self.response = reply[0]
		self.return = reply[1]
	}
}

// arguments for requests
MyPrologInterface.prototype.possibleMoves = 1
MyPrologInterface.prototype.move = 2
MyPrologInterface.prototype.gameOver = 3
MyPrologInterface.prototype.isMoveValid = 4
MyPrologInterface.prototype.captures = 5
MyPrologInterface.prototype.summonDragon = 6
MyPrologInterface.prototype.chooseMove = 7
// arguments for replies
MyPrologInterface.prototype.OK = 1
MyPrologInterface.prototype.NotOK = 0
