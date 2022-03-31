/**
 * Represents a single animation keyframe.
 */
class Keyframe {
    /**
     * Constructs the keyframe.
     * @param {number} instant          - the instant of the keyframe, in seconds.
     * @param {Translation} translation - the translation to apply to the initial position.
     * @param {Rotation} rotationX      - the rotation on the Xs to apply to the initial position.
     * @param {Rotation} rotationY      - the rotation on the Ys to apply to the initial position.
     * @param {Rotation} rotationZ      - the rotation on the Zs to apply to the initial position.
     * @param {Scale} scale             - the scale to apply to the initial position.
     */
	constructor(instant, translation, rotationX, rotationY, rotationZ, scale) {
		this.instant = instant;
		this.translation = translation;
		this.rotationX = rotationX;
		this.rotationY = rotationY;
		this.rotationZ = rotationZ;
        this.scale = scale;
    }

    
}
