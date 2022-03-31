/**
 * Represents a cylinder.
 * @extends CGFobject
 */
class MyCylinder extends CGFobject {
	/**
	  * Constructs a MyCylinder.
	  * @param {CGFScene} scene 		- the scene to draw the cylinder to.
	  * @param {number} bottomRadius	- the bottom base's radius.
	  * @param {number} topRadius 		- the top base's radius.
	  * @param {number} height 			- the height.
	  * @param {number} slices 			- the number of pizza divisions in the bases.
	  * @param {number} stacks 			- the number of divisions throughout its height.
	  */
	constructor(scene, bottomRadius, topRadius, height, slices, stacks) {
		super(scene);
		this.bottomRadius = bottomRadius;
		this.topRadius = topRadius;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;

		this.initBuffers();
	}

	/**
	 * Inits the vertices, indices, normals and texture coordinates.
	 */
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		this.minAngle = (2 * Math.PI) / this.slices;
		this.stackHeight = this.height / this.stacks; //height increment
		this.stackRadiusIncr = (this.topRadius - this.bottomRadius) / this.stacks; //difference between bottom and top radius

		this.initSideBuffers();
		this.initBasesBuffers();

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * Inits the buffers of the rounded side.
	 */
	initSideBuffers() {
		let currentAngle = 0;
		let currentRadius = this.bottomRadius;

		for (let i = 0; i <= this.stacks; i++) {
			for (let j = 0; j <= this.slices; j++) {
				// vertices
				this.vertices.push(
					Math.cos(currentAngle) * currentRadius,
					Math.sin(currentAngle) * currentRadius,
					i * this.stackHeight
				);

				// normals
				this.normals.push(Math.cos(currentAngle), Math.sin(currentAngle), 0);

				// texture coordinates
				this.texCoords.push(j / this.slices, 1 - i / this.stacks);

				// indices
				let ind = i * (this.slices + 1) + j;

				this.indices.push(ind, ind + 1, ind + this.slices + 2);
				this.indices.push(ind, ind + this.slices + 2, ind + this.slices + 1);

				currentAngle += this.minAngle;
			}

			currentAngle = 0;
			currentRadius += this.stackRadiusIncr;
		}
	}

	/**
	 * Inits the top and down faces.
	 */
	initBasesBuffers() {
		// bottom base
		const firstDown = this.vertices.length / 3;
		let currentAngle = 0;

		for (let slice = 0; slice <= this.slices; ++slice) {
			this.vertices.push(
				Math.cos(currentAngle) * this.bottomRadius,
				Math.sin(currentAngle) * this.bottomRadius,
				0
			);

			if (slice > 1) this.indices.push(firstDown + slice, firstDown + slice - 1, firstDown);

			this.normals.push(0, 0, -1);

			this.texCoords.push(1 - (Math.cos(currentAngle) + 1) / 2, 1 - (Math.sin(currentAngle) + 1) / 2);

			currentAngle += this.minAngle;
		}

		// top base
		const firstUp = this.vertices.length / 3;
		currentAngle = 0;

		for (let slice = 0; slice <= this.slices; ++slice) {
			this.vertices.push(
				Math.cos(currentAngle) * this.topRadius,
				Math.sin(currentAngle) * this.topRadius,
				this.height
			);

			if (slice > 1) this.indices.push(firstUp, firstUp + slice - 1, firstUp + slice);

			this.normals.push(0, 0, 1);

			this.texCoords.push((Math.cos(currentAngle) + 1) / 2, 1 - (Math.sin(currentAngle) + 1) / 2);

			currentAngle += this.minAngle;
		}
	}
}
