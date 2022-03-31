// TODO comment
class MyPiece {
	constructor(scene, node, tile) {
		this.scene = scene
		this.node = node
		this.tile = tile
	}

	static fromProlog(scene, prologPiece) {
		if (!prologPiece) return

		// gets the type of the piece, pieces can be like 'ss' or 'x1' or 'o1' or 'MM' or 'c1' or 'A1'
		const type = prologPiece.charAt(0)
		if (!type) return

		switch (type) {
			case 's':
				return // creates no piece on empty

			case 'x':
				return new Pawn(
					scene,
					new Dice(scene, scene.gameOrchestrator.gameboard.whiteDice),
					null,
					prologPiece.charAt(1),
					MyGameOrchestrator.firstPlayer()
				)

			case 'o':
				return new Pawn(
					scene,
					new Dice(scene, scene.gameOrchestrator.gameboard.blackDice),
					null,
					prologPiece.charAt(1),
					MyGameOrchestrator.secondPlayer()
				)

			case 'M':
				return new Mountain(scene, scene.gameOrchestrator.gameboard.largeCaveNode)

			case 'c':
				return new Cave(scene, scene.gameOrchestrator.gameboard.smallCaveNode, null, 3, prologPiece.charAt(1))

			case 'A':
				return new Cave(scene, scene.gameOrchestrator.gameboard.largeCaveNode, null, 5, prologPiece.charAt(1))
		}
	}

	update(time) {
		if (this.animation && !this.animation.finished) this.animation.update(time)
	}

	display() {
		this.scene.pushMatrix()

		if (this.tile) {
			// registers for picking with the same index as its tile
			this.scene.registerForPick(this.index, this)

			// animates the piece
			if (this.animation && !this.animation.finished) {
				const positionMatrix = new Translation(0, 0, 0)
				this.animation.apply(positionMatrix)
			} else {
				const position = this.tile.board.cellToCoordinates(this.tile)
				this.scene.translate(position[0], position[1], position[2])
			}
		}

		this.scene.pushMatrix()
		this.scene.scale(1 / 15, 1 / 15, 1 / 15)
		// redirects the still pieces
		if (this.constructor.name == 'Mountain' && this.tile.row == 0)
			this.scene.rotate(Math.PI, 0, 1, 0)
		else if (this.constructor.name == 'Cave') {
			if (this.tile.col == 0)
				this.scene.rotate(Math.PI/2, 0, 1, 0)
			else if (this.tile.col == 8)
				this.scene.rotate(-Math.PI/2, 0, 1, 0)
		}

		this.node.display()
		this.scene.popMatrix()

		this.scene.clearPickRegistration()

		this.scene.popMatrix()
	}
}

class Mountain extends MyPiece {
	constructor(scene, node, tile) {
		super(scene, node, tile)
	}

	toProlog() {
		return 'MM'
	}
}

class Cave extends MyPiece {
	constructor(scene, node, tile, level, nDragons = 1) {
		super(scene, node, tile)
		this.nDragons = nDragons
		this.level = level
	}

	toProlog() {
		const letter = this.level == 5 ? 'A' : 'c'
		return letter + this.nDragons
	}
}

class Pawn extends MyPiece {
	constructor(scene, node, tile, level, player) {
		super(scene, node, tile)
		this.level = level
		this.player = player
		node.value = level

		this.index = this.scene.getClickableIndex()
	}

	toProlog() {
		const tmpPlayer = MyPrologInterface.playerToProlog(this.player)
		return tmpPlayer + this.level.toString()
	}
}
