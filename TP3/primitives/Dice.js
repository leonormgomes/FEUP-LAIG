// TODO
class Dice extends CGFobject {
	constructor(scene, path, value = 5) {
		super(scene)

		if (path) this.texture = new CGFtexture(scene, path)
		this.rotation = new Rotation()
		this.value = value

		this.initAppearance()
		this.initBuffers()
	}

	/**
	 * Initializes the appearance of the cube.
	 */
	initAppearance() {
		this.appearance = new CGFappearance(this.scene)
		this.appearance.setAmbient(0.1, 0.1, 0.1, 1)
		this.appearance.setDiffuse(1, 1, 1, 1)
		this.appearance.setTexture(this.texture)
		this.appearance.setTextureWrap('CLAMP_TO_EDGE', 'CLAMP_TO_EDGE')
	}

	/**
	 * Initializes the cube buffers.
	 */
	initBuffers() {
		this.vertices = []
		this.indices = []
		this.texCoords = []
		this.normals = []

		// related with the composition of the texture
		var sunit = 1 / 4
		var tunit = 1 / 3
		var x = 1 / 1025 / 2
		var y = 1 / 769 / 2

		// -y face
		this.vertices.push(0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5)
		this.indices.push(0, 1, 2, 2, 3, 0)
		this.texCoords.push(
			2 * sunit - x,
			3 * tunit,
			2 * sunit - x,
			2 * tunit,
			1 * sunit + x,
			2 * tunit,
			1 * sunit + x,
			3 * tunit
		)
		this.normals.push(0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0)

		// side +x face
		this.vertices.push(0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5)
		this.indices.push(6, 5, 4, 4, 7, 6)
		this.texCoords.push(
			3 * sunit,
			2 * tunit - y,
			2 * sunit,
			2 * tunit - y,
			2 * sunit,
			1 * tunit + y,
			3 * sunit,
			1 * tunit + y
		)
		this.normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0)

		// side -z face
		this.vertices.push(0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5)
		this.indices.push(10, 9, 8, 8, 11, 10)
		this.texCoords.push(2 * sunit, 2 * tunit, 1 * sunit, 2 * tunit, 1 * sunit, 1 * tunit, 2 * sunit, 1 * tunit)
		this.normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1)

		// side -x face
		this.vertices.push(-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5)
		this.indices.push(14, 13, 12, 12, 15, 14)
		this.texCoords.push(
			1 * sunit,
			2 * tunit - y,
			0 * sunit,
			2 * tunit - y,
			0 * sunit,
			1 * tunit + y,
			1 * sunit,
			1 * tunit + y
		)
		this.normals.push(-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0)

		// side +z face
		this.vertices.push(0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5)
		this.indices.push(18, 17, 16, 16, 19, 18)
		this.texCoords.push(
			3 * sunit,
			2 * tunit - y,
			3 * sunit,
			1 * tunit + y,
			4 * sunit,
			1 * tunit + y,
			4 * sunit,
			2 * tunit - y
		)
		this.normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1)

		// +y face
		this.vertices.push(0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5)
		this.indices.push(22, 21, 20, 20, 23, 22)
		this.texCoords.push(
			2 * sunit - x,
			0 * tunit + y,
			2 * sunit - x,
			1 * tunit,
			1 * sunit + x,
			1 * tunit,
			1 * sunit + x,
			0 * tunit + y
		)
		this.normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0)

		this.indices = this.indices.reverse()

		this.primitiveType = this.scene.gl.TRIANGLES
		this.initGLBuffers()
	}

	/**
	 * Re-initializes buffers.
	 */
	updateBuffers() {
		this.initBuffers()
		this.initNormalVizBuffers()
	}

	setTexture(texture) {
		this.texture = texture
		this.initAppearance()
	}

	setValue() {
		switch (this.value) {
			case 1:
				this.setOne()
				break

			case 2:
				this.setTwo()
				break

			case 3:
				this.setThree()
				break

			case 4:
				this.setFour()
				break

			case 5:
				this.setFive()
				break

			case 6:
				this.setSix()
				break
		}
	}

	setOne() {
		this.rotation = new Rotation('z', -90)
	}

	setTwo() {
		this.rotation = new Rotation('x', 90)
	}

	setThree() {
		this.rotation = new Rotation('z', 90)
	}

	setFour() {
		this.rotation = new Rotation('x', -90)
	}

	setFive() {}

	setSix() {
		this.rotation = new Rotation('x', -180)
	}

	/**
	 * Displays the cube.
	 */
	display() {
		this.appearance.apply()
		this.scene.pushMatrix()
		this.setValue()
		this.scene.translate(0, 0.5, 0)
		this.scene.multMatrix(this.rotation.matrix)
		super.display()
		this.scene.popMatrix()
	}
}
