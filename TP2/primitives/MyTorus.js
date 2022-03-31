/**
 * Represents a torus, donut, floater, an eating-its-tail-cylinder.
 * @extends CGFobject
 */
class MyTorus extends CGFobject {
	/**
	 *
	 * @param {CGFscene} scene		- the scene to draw the torus to.
	 * @param {number} inner 		- the radius of the rounded cylinder.
	 * @param {number} outer 		- the radius of the whole roundabout, until the middle of the rounded cylinder.
	 * @param {number} slices		- the number of pizza slices from a top view.
	 * @param {number} loops 		- the number of loops throughout the rounded cylinder.
	 */
	constructor(scene, inner, outer, slices, loops) {
		super(scene);
		this.inner = inner;
		this.outer = outer;
		this.slices = slices;
		this.loops = loops;

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

		let outerAngleIncrease = (2 * Math.PI) / this.loops;
		let innerAngleIncrease = (2 * Math.PI) / this.slices;

		let outerAngle = 0;
		for (let loop = 0; loop <= this.loops; ++loop) {
			let innerAngle = 0;

			for (let slice = 0; slice <= this.slices; ++slice) {
				// vertices
				let x = Math.cos(outerAngle) * this.outer + Math.cos(outerAngle) * Math.sin(innerAngle) * this.inner;
				let y = Math.sin(outerAngle) * this.outer + Math.sin(outerAngle) * Math.sin(innerAngle) * this.inner;
				let z = Math.cos(innerAngle) * this.inner;

				this.vertices.push(x, y, z);

				let verticesLoop = this.slices + 1;

				if (loop > 0 && slice < this.slices) {
					this.indices.push(
						loop * verticesLoop + slice,
						(loop - 1) * verticesLoop + slice,
						(loop - 1) * verticesLoop + slice + 1
					);

					this.indices.push(
						(loop - 1) * verticesLoop + slice + 1,
						loop * verticesLoop + slice + 1,
						loop * verticesLoop + slice
					);
				}

				// normals
				this.normals.push(
					Math.cos(outerAngle) * Math.sin(innerAngle),
					Math.sin(outerAngle) * Math.sin(innerAngle),
					Math.cos(innerAngle)
				);

				// texture coordinates
				this.texCoords.push(slice / this.slices, loop / this.loops);

				innerAngle += innerAngleIncrease;
			}
			outerAngle += outerAngleIncrease;
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}
}
