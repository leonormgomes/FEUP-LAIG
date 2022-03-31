/**
 * Holds a transformation, which is a fancy way to operate on a matrix, a transformation matrix.
 */
class Transformation {
	/**
	 * Constructs the transformation.
	 * @param {mat4=} matrix	- the transformation matrix. Identity as default.
	 */
	constructor(matrix = mat4.create()) {
		this.matrix = matrix
	}

	/**
	 * Multiplies transformations.
	 * @param {Transformation} initialTransformation	- the first transformation.
	 * @param  {...Transformation} otherTransformations - the other transformations.
	 * @returns {Transformation} the result of the multiplications.
	 */
	static multiply(initialTransformation, ...otherTransformations) {
		let result = new Transformation()
		mat4.multiply(result.getMatrix(), result.getMatrix(), initialTransformation.getMatrix())

		for (let transformation of otherTransformations)
			mat4.multiply(result.getMatrix(), result.getMatrix(), transformation.getMatrix())

		return result
	}

	static interpolate(value1, value2, percentage) {
		return value1 + percentage * (value2 - value1)
	}

	/**
	 * Multiplies this transformation with another one.
	 * @param {Transformation} otherTransformation		- the other transformation.
	 * @returns {Transformation} the result of the multiplication.
	 */
	multiplyWith(otherTransformation) {
		return Transformation.multiply(this, otherTransformation)
	}

	getMatrix() {
		return this.matrix
	}
}

/**
 * Represents a translation transformation.
 * @extends Transformation
 */
class Translation extends Transformation {
	/**
	 * Constructs the translation.
	 * @param {number} x	- the X amount to translate.
	 * @param {number} y 	- the Y amount to translate.
	 * @param {number} z 	- the Z amount to translate.
	 */
	constructor(x, y, z) {
		super()
		this.x = x
		this.y = y
		this.z = z

		this.updateMatrix()
	}

	update(translation1, translation2, percentage) {
		this.x = Transformation.interpolate(translation1.x, translation2.x, percentage)
		this.y = Transformation.interpolate(translation1.y, translation2.y, percentage)
		this.z = Transformation.interpolate(translation1.z, translation2.z, percentage)
	}

	updateMatrix() {
		mat4.identity(this.matrix)
		mat4.translate(this.matrix, this.matrix, vec3.fromValues(this.x, this.y, this.z))
	}

	getMatrix() {
		this.updateMatrix()
		return this.matrix
	}
}

/**
 * Represents a rotation transformation.
 * @extends Transformation
 */
class Rotation extends Transformation {
	/**
	 * Constructs the rotation.
	 * @param {string} axis		- the axis (x, y or z) to rotate from.
	 * @param {number} angle 	- the angle in degrees to rotate.
	 */
	constructor(axis, angle) {
		super()
		this.axis = axis
		this.angle = angle

		this.updateMatrix()
	}

	update(rotation1, rotation2, percentage) {
		this.angle = Transformation.interpolate(rotation1.angle, rotation2.angle, percentage)
	}

	updateMatrix() {
		this.matrix = mat4.create()
		if (this.axis == 'x') mat4.rotateX(this.matrix, this.matrix, this.angle * DEGREE_TO_RAD)
		else if (this.axis == 'y') mat4.rotateY(this.matrix, this.matrix, this.angle * DEGREE_TO_RAD)
		else if (this.axis == 'z') mat4.rotateZ(this.matrix, this.matrix, this.angle * DEGREE_TO_RAD)
	}

	getMatrix() {
		this.updateMatrix()
		return this.matrix
	}
}

/**
 * Represents a scale transformation.
 * @extends Transformation
 */
class Scale extends Transformation {
	/**
	 * The constructor of the scale.
	 * @param {number} sx	- the x factor.
	 * @param {number} sy 	- the y factor.
	 * @param {number} sz 	- the z factor.
	 */
	constructor(sx, sy, sz) {
		super()
		this.sx = sx
		this.sy = sy
		this.sz = sz

		this.updateMatrix()
	}

	update(scale1, scale2, percentage) {
		this.sx = Transformation.interpolate(scale1.sx, scale2.sx, percentage)
		this.sy = Transformation.interpolate(scale1.sy, scale2.sy, percentage)
		this.sz = Transformation.interpolate(scale1.sz, scale2.sz, percentage)
	}

	updateMatrix() {
		mat4.identity(this.matrix)
		mat4.scale(this.matrix, this.matrix, vec3.fromValues(this.sx, this.sy, this.sz))
	}

	getMatrix() {
		this.updateMatrix()
		return this.matrix
	}
}
