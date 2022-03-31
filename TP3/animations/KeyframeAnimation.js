/**
 * Represents an animation by keyframes.
 * @extends Animation
 */
class KeyFrameAnimation extends Animation {
	/**
	 * Constructs the keyframe animation.
	 * @param {list} keyframes  - the list of keyframes of the keyframe animation.
	 */
	constructor(scene, keyframes) {
		super()

		this.scene = scene
		this.keyframes = keyframes

		this.currentTranslation = new Translation()
		this.currentRotationX = new Rotation('x', 0)
		this.currentRotationY = new Rotation('y', 0)
		this.currentRotationZ = new Rotation('z', 0)
		this.currentScale = new Scale()

		this.currentFrameIndex = -1
		this.currentTransformation = new Transformation()
	}

	/**
	 * Updates the animation values.
	 * @param {number} time     - total time elapsed in milliseconds.
	 */
	update(time) {
		const totalElapsed = time - this.scene.firstTime
		if (totalElapsed > this.keyframes[this.keyframes.length - 1].instant * 1000)
			// * 1000 bc the instant is in seconds
			return

		this.lastKeyFrameIndex = this.currentFrameIndex
		this.updateCurrentFrame(totalElapsed)

		if (this.currentFrameIndex == -1) {
			this.currentTransformation = new Scale() // disappear
			return
		}

		if (this.currentFrameIndex + 1 == this.keyframes.length) return // freezes

		if (this.currentFrameIndex != this.lastKeyFrameIndex) {
			this.lastKeyFrame = this.keyframes[this.currentFrameIndex]
			this.lastKeyInstant = this.lastKeyFrame.instant * 1000

			this.nextKeyFrame = this.keyframes[this.currentFrameIndex + 1]
			this.nextKeyInstant = this.nextKeyFrame.instant * 1000

			this.distanceBetweenFrames = this.nextKeyInstant - this.lastKeyInstant
		}

		if (this.currentFrameIndex >= 0) {
			const percentage = (totalElapsed - this.lastKeyInstant) / this.distanceBetweenFrames

			this.currentTranslation.update(this.lastKeyFrame.translation, this.nextKeyFrame.translation, percentage)
			this.currentRotationX.update(this.lastKeyFrame.rotationX, this.nextKeyFrame.rotationX, percentage)
			this.currentRotationY.update(this.lastKeyFrame.rotationY, this.nextKeyFrame.rotationY, percentage)
			this.currentRotationZ.update(this.lastKeyFrame.rotationZ, this.nextKeyFrame.rotationZ, percentage)
			this.currentScale.update(this.lastKeyFrame.scale, this.nextKeyFrame.scale, percentage)

			this.currentTransformation = this.calculateTransformation()
		}
	}

	/**
	 * Applies the animation in a given transformation, returning the new transformation.
	 * @param {Transformation} transformation	- the transformation
	 * @returns the new transformation
	 */
	apply(transformation) {
		this.scene.multMatrix(transformation.multiplyWith(this.currentTransformation).matrix)
	}

	/**
	 * Gets the two keyframes between a timestamp.
	 * Returns undefined on the first one if the time is before the first frame and undefined on the last one if the
	 * time is after the last frame.
	 * @param {number} time             - the current time in milliseconds.
	 * @returns {Keyframe, Keyframe}    - the keyframes that surround the given time, or null in the extremes.
	 */
	getKeyFrames(time) {
		let lastKeyFrame = Object.assign(this.keyframes[this.currentFrameIndex]),
			nextKeyFrame

		for (let i = this.currentFrameIndex + 1; i < this.keyframes.length; ++i) {
			let instant = this.keyframes[i].instant * 1000

			if (instant <= time) {
				lastKeyFrame = this.keyframes[i]
				this.currentFrameIndex = i
			} else {
				nextKeyFrame = this.keyframes[i]
				break
			}
		}

		return { lastKeyFrame, nextKeyFrame }
	}

	updateCurrentFrame(time) {
		for (let i = this.currentFrameIndex + 1; i < this.keyframes.length; ++i) {
			let instant = this.keyframes[i].instant * 1000

			if (instant <= time) this.currentFrameIndex = i
			else break
		}
	}

	/**
	 * Calculates the transformation matrix of the current frame.
	 * @returns the calculated transformation matrix.
	 */
	calculateTransformation() {
		// let transformation = Transformation.multiply(this.currentScale, this.currentRotationZ, this.currentRotationY, this.currentRotationX, this.currentTranslation);
		let transformation = Transformation.multiply(
			this.currentTranslation,
			this.currentRotationX,
			this.currentRotationY,
			this.currentRotationZ,
			this.currentScale
		)
		return transformation
	}
}
