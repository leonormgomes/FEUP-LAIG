class MyCameraAnimator extends MyAnimator {
	constructor(scene) {
		super(scene)

		this.animated = false
		this.orbitAnimated = false
		this.animationBegin = 0
	}

	setNewTarget(x, y, z) {
		this.scene.camera.setTarget(vec3.fromValues(x, y, z))
	}

	setPlayerCamera(player) {
		if (player == MyGameOrchestrator.firstPlayer()) {
			if (Math.abs(this.scene.camera.position[2] - 0.75) < 0.01) this.orbit('y', 180, 2000)
			else {
				this.goToPosition(
					2000,
					[0.001, 2, -0.75],
					[
						this.scene.gameOrchestrator.gameboard.position[0],
						this.scene.gameOrchestrator.gameboard.position[1],
						this.scene.gameOrchestrator.gameboard.position[2],
					]
				)
			}
		} else {
			if (Math.abs(this.scene.camera.position[2] + 0.75) < 0.01) this.orbit('y', 180, 2000)
			else {
				this.goToPosition(
					2000,
					[0.001, 2, 0.75],
					[
						this.scene.gameOrchestrator.gameboard.position[0],
						this.scene.gameOrchestrator.gameboard.position[1],
						this.scene.gameOrchestrator.gameboard.position[2],
					]
				)
			}
		}
	}

	goToMenu() {
		this.goToPosition(2000, [-4.75, 2.5, 0], [-5, 2.5, 0])
	}

	setOverBoardCamera() {
		this.goToPosition(2000, [
			this.scene.gameOrchestrator.gameboard.position[0] + 0.001,
			this.scene.gameOrchestrator.gameboard.position[1] + 1,
			this.scene.gameOrchestrator.gameboard.position[2],
		], [
			this.scene.gameOrchestrator.gameboard.position[0],
			this.scene.gameOrchestrator.gameboard.position[1],
			this.scene.gameOrchestrator.gameboard.position[2],
		])
	}

	setMidMenuCamera() {
		this.goToPosition(2000, [
			this.scene.gameOrchestrator.gameboard.position[0] - 0.2,
			this.scene.gameOrchestrator.gameboard.position[1] + 0.2,
			this.scene.gameOrchestrator.gameboard.position[2],
		], [-0.36, 1, 0])
	}

	goToPosition(duration, position, target = this.scene.camera.target) {
		this.cameraPosition = JSON.parse(JSON.stringify(this.scene.camera.position)) // clones it
		this.cameraTarget = JSON.parse(JSON.stringify(this.scene.camera.target))

		this.duration = duration
		this.finalPosition = position
		this.finalTarget = target
		this.orbitAnimated = false
		this.animated = true
		this.animationBegin = 0
	}

	// axis being a string
	orbit(axis, angle, duration) {
		this.animated = false
		this.orbitAnimated = true

		let cameraAxis
		if (axis == 'x') cameraAxis = CGFcameraAxis.X
		else if (axis == 'y') cameraAxis = CGFcameraAxis.Y
		else if (axis == 'z') cameraAxis = CGFcameraAxis.Z
		else {
			console.log('orbiting with invalid axis')
			return
		}

		this.cameraAxis = cameraAxis
		this.orbitAngle = (angle * Math.PI) / 180

		this.animationBegin = 0
		this.duration = duration
		this.lastPercentage = 0
	}

	update(time) {
		if (this.animated) this.updateLinear(time)
		else if (this.orbitAnimated) this.updateOrbit(time)
	}

	updateOrbit(time) {
		// sets the first time of the animation
		if (!this.animationBegin) this.animationBegin = time

		let percentage = (time - this.animationBegin) / this.duration

		if (percentage >= 1) {
			this.animationBegin = 0
			this.orbitAnimated = false
			percentage = 1
		}

		percentage = 1 - Math.pow(1 - percentage, 3)

		const percentageDiff = percentage - this.lastPercentage

		this.scene.camera.orbit(this.cameraAxis, this.orbitAngle * percentageDiff)
		this.lastPercentage = percentage
	}

	updateLinear(time) {
		// sets the first time of the animation
		if (!this.animationBegin) this.animationBegin = time

		// calculates the percentage
		let percentage = (time - this.animationBegin) / this.duration

		if (percentage > 1) {
			this.animationBegin = 0
			this.animated = false
			percentage = 1
		}

		percentage = 1 - Math.pow(1 - percentage, 3)

		// updates the camera position
		const currentTranslationX =
			percentage * (this.finalPosition[0] - this.cameraPosition[0]) + this.cameraPosition[0]
		const currentTranslationY =
			percentage * (this.finalPosition[1] - this.cameraPosition[1]) + this.cameraPosition[1]
		const currentTranslationZ =
			percentage * (this.finalPosition[2] - this.cameraPosition[2]) + this.cameraPosition[2]
		this.scene.camera.setPosition(vec3.fromValues(currentTranslationX, currentTranslationY, currentTranslationZ))

		// updates the camera target
		const currentTargetX = percentage * (this.finalTarget[0] - this.cameraTarget[0]) + this.cameraTarget[0]
		const currentTargetY = percentage * (this.finalTarget[1] - this.cameraTarget[1]) + this.cameraTarget[1]
		const currentTargetZ = percentage * (this.finalTarget[2] - this.cameraTarget[2]) + this.cameraTarget[2]
		this.setNewTarget(currentTargetX, currentTargetY, currentTargetZ)
	}

	display() {}
}
