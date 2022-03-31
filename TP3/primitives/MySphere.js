/**
 * Represents a sphere.
 * @extends CGFobject
 */
class MySphere extends CGFobject {
	/**
	 * Constructs a MySphere.
	 * @param {CGFscene} scene      - the scene to draw the sphere.
	 * @param {number} radius       - the sphere's radius.
	 * @param {number} slices       - the number of pizza divisions.
	 * @param {number} stacks       - the number of the other pizza divisions.
	 */
	constructor(scene, radius, slices, stacks) {
		super(scene);
		this.radius = radius;
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

		let phiInc = (2 * Math.PI) / this.slices;
		let thetaInc = Math.PI / (2 * this.stacks);

		for (let i = 0; i <= 2 * this.stacks; i++) {
			let theta = Math.PI / 2 - thetaInc * i;

			for (let j = 0; j <= this.slices; j++) {
				let phi = phiInc * j;

				let x = Math.cos(theta) * Math.cos(phi);
				let y = Math.cos(theta) * Math.sin(phi);
				let z = Math.sin(theta);

				this.vertices.push(this.radius * x, this.radius * y, this.radius * z);
				this.normals.push(x, y, z);

				this.texCoords.push(j / this.slices, 1 - i / (2 * this.stacks));

				if (i < 2 * this.stacks && j < this.slices) {
					let idx = i * (this.slices + 1) + j;

					this.indices.push(idx + 1, idx, idx + this.slices + 1);
					this.indices.push(idx + this.slices + 2, idx + 1, idx + this.slices + 1);
				}
			}
		}
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}
