/**
 * Reads and parses the animations from the lsf file.
 */
class AnimationsParser {
	/**
	 * Constructs the parser.
	 * @param {MySceneGraph} parser		- the main parser.
	 */
	constructor(parser) {
		this.parser = parser
	}
	/**
	 * Parses the <animations> block.
	 * @param {animations block element} texturesNode 	-the <animations> node.
	 * @returns {*}		null on success, otherwise on error.
	 */
	parseAnimations(animationsNode) {
		let children = animationsNode.children

		for (let i = 0; i < children.length; i++) {
			let animationNode = children[i]
			if (animationNode.nodeName != 'animation') {
				this.parser.onXMLMinorError('unknown tag <' + animationNode.nodeName + '>')
				continue
			}

			let animationID = this.parser.reader.getString(animationNode, 'id')
			if (animationID == null) return this.parser.onXMLError('animation with no ID defined')

			if (this.parser.database.animations[animationID]) {
				this.parser.onXMLMinorError('animation ' + animationID + ' defined multiple times, accepting first')
				continue
			}

			let keyframes = this.parseKeyframes(animationNode, animationID)
			if (!(keyframes instanceof Array)) return keyframes

			let animation = new KeyFrameAnimation(this.parser.scene, keyframes)

			this.parser.database.animations[animationID] = animation
		}

		this.parser.log('Parsed animations')
		return null
	}

	/**
	 * Parses an animation's keyframes.
	 * @param {Object} animationNode	- the animations node.
	 * @param {string} animationID		- the ID of the animation.
	 */
	parseKeyframes(animationNode, animationID) {
		let children = animationNode.children

		let keyframes = []

		for (let i = 0; i < children.length; i++) {
			let keyframeNode = children[i]
			if (keyframeNode.nodeName != 'keyframe') {
				this.parser.onXMLMinorError('unknown tag <' + keyframeNode.nodeName + '>')
				continue
			}

			let keyframeInstant = this.parser.reader.getFloat(keyframeNode, 'instant')
			if (keyframeInstant == null)
				return this.parser.onXMLError(
					'keyframe number ' + (i + 1) + ' of animation ' + animationID + ' has no instant defined'
				)
			if (keyframeInstant < 0)
				return this.parser.onXMLError(
					'keyframe number ' + (i + 1) + ' of animation ' + animationID + ' has a negative instant'
				)

			const keyframe = this.parseKeyframeTransformations(keyframeNode, keyframeInstant)
			keyframes.push(keyframe)
		}

		let ordered = true
		let lastInstant = -1
		for (const keyframe of keyframes) {
			if (keyframe.instant <= lastInstant) {
				ordered = false
				break
			}

			lastInstant = keyframe.instant
		}

		if (!ordered) {
			this.parser.onXMLMinorError('keyframes are not ordered on animation ' + animationID)
			keyframes.sort((a, b) => a.instant - b.instant)
		}

		return keyframes
	}

	/**
	 * Parses the transformations of a keyframe.
	 * @param {Object} keyframeNode			- the node of the key frame.
	 * @param {number} keyframeInstant 	- the instant of the key frame.
	 */
	parseKeyframeTransformations(keyframeNode, keyframeInstant) {
		let children = keyframeNode.children

		//Translation values
		let t_x
		let t_y
		let t_z

		//Rotation values
		let x_angle
		let y_angle
		let z_angle

		//Scale values
		let s_x
		let s_y
		let s_z

		//Add order error
		for (let i = 0; i < children.length; i++) {
			let transformationNode = children[i]

			let transformationName = transformationNode.nodeName
			if (transformationName == 'translation') {
				t_x = this.parser.reader.getFloat(transformationNode, 'x')
				t_y = this.parser.reader.getFloat(transformationNode, 'y')
				t_z = this.parser.reader.getFloat(transformationNode, 'z')
			} else if (transformationName == 'rotation') {
				let axis = this.parser.reader.getString(transformationNode, 'axis')
				let angle = this.parser.reader.getFloat(transformationNode, 'angle')
				if (axis == 'x') x_angle = angle
				else if (axis == 'y') y_angle = angle
				else if (axis == 'z') z_angle = angle
				else return this.parser.onXMLMinorError(axis + ' is not a known axis')
			} else if (transformationName == 'scale') {
				s_x = this.parser.reader.getFloat(transformationNode, 'sx')
				s_y = this.parser.reader.getFloat(transformationNode, 'sy')
				s_z = this.parser.reader.getFloat(transformationNode, 'sz')
			} else {
				this.parser.onXMLMinorError('unknown transformation: ' + keyframeNode.nodeName)
				continue
			}
		}

		let translation = new Translation(t_x, t_y, t_z)
		let rotationX = new Rotation('x', x_angle)
		let rotationY = new Rotation('y', y_angle)
		let rotationZ = new Rotation('z', z_angle)
		let scale = new Scale(s_x, s_y, s_z)

		let keyframe = new Keyframe(keyframeInstant, translation, rotationX, rotationY, rotationZ, scale)
		return keyframe
	}
}
