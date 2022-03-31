class MyClock {
	constructor(scene) {
		this.scene = scene
		this.state = MyClock.state().paused
		this.timeStart = 0
		this.lastTime = 0
	}

	static state() {
		return Object.freeze({ counting: 1, paused: 2, finished: 3 })
	}

	start(duration) {
		//duration in seconds
		if (this.state != MyClock.state().counting) {
			this.state = MyClock.state().counting
		}

		this.duration = duration
		this.currentTimeLeft = duration
	}

	getSeconds() {
		return Math.ceil(this.currentTimeLeft)
	}

	update(time) {
		const currentTime = time / 1000
		if (this.state == MyClock.state().counting) {
			if (!this.timeStart) {
				this.timeStart = currentTime
				this.lastTime = currentTime
			}

			if (this.timeStart != currentTime) {
				const diff = currentTime - this.lastTime
				this.currentTimeLeft -= diff
				if (this.currentTimeLeft <= 0) {
					this.timeStart = 0
					this.lastTime = 0
					this.state = MyClock.state().finished
				} else this.lastTime = currentTime
			}
		}
	}
}
