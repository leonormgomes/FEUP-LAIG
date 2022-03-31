class MyTileAnimator extends MyAnimator {
	constructor(scene) {
		super(scene)

		this.tiles = []
		this.highlightStrength = 0
		this.duration = 0
		this.startingTime = 0
	}

	highlightList(tiles, duration) {
		if (this.tiles.length) this.resetTiles()
		this.duration = duration
		this.tiles = tiles
		this.startingTime = 0
	}

	resetTiles() {
		this.tiles.forEach((tile) => {
			tile.material.setDiffuse(0, 0, 0, 0)
			tile.material.setSpecular(0, 0, 0, 0)
		})
		this.tiles = []
	}

	update(time) {
		// updates only when tiles are to highlight
		if (!this.tiles.length) return

		// sets the starting time in the first time
		if (!this.startingTime) this.startingTime = time

		// calculates the strength linearly
		let highlightStrength = (time - this.startingTime) / this.duration
		highlightStrength = -Math.cos(highlightStrength) / 2 + 0.5

		// paints the tiles
		this.tiles.forEach((tile) => {
			tile.material.setDiffuse(0.275, 0.51, 0.706, highlightStrength / 2)
			tile.material.setSpecular(highlightStrength, highlightStrength, highlightStrength, highlightStrength)
		})
	}

	display() {}
}
