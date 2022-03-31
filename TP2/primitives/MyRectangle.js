/**
 * Represents a rectangle.
 * @extends CGFobject
 */
class MyRectangle extends CGFobject {
	/**
	 * Constructs a MyRectangle.
	 * @param {CGFscene} scene 			- the scene to draw the rectangle to.
	 * @param {number} x1 				- the first diagonal point's X coordinate.
	 * @param {number} y1 				- the first diagonal point's Y coordinate.
	 * @param {number} x2 				- the second diagonal point's X coordinate.
	 * @param {number} y2 				- the second diagonal point's Y coordinate.
	 * @param {number=} afs 			- the horizontal size of the texture in the scene. Fits perfectly if the size is the same as the difference between both Xs. Use a lower number for repetition and higher number for stretching.
	 * @param {number=} aft 			- the vertical size of the texture in the scene. Fits perfectly if the size is the same as the difference between both Ys. Use a lower number for repetition and higher number for stretching.
	 * @param {number=} horizontalDivs	- the number of horizontal divs.
	 * @param {number=} verticalDivs	- the number of vertical divs.
	 */
	constructor(scene, x1, y1, x2, y2, afs = 1, aft = 1, horizontalDivs = 10, verticalDivs = 10) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.afs = afs;
		this.aft = aft;
		this.horizontalDivs = horizontalDivs;
		this.verticalDivs = verticalDivs;

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

		let width = this.x2 - this.x1;
		let height = this.y2 - this.y1;

		let hDiv = width / this.horizontalDivs;
		let vDiv = height / this.verticalDivs;

		let hPoints = this.horizontalDivs + 1;

		let maxS = Math.abs(this.x2 - this.x1) / this.afs;
		let maxT = Math.abs(this.y2 - this.y1) / this.aft;

		for (let v = 0; v <= this.verticalDivs; ++v) {
			for (let h = 0; h <= this.horizontalDivs; ++h) {
				this.vertices.push(this.x1 + hDiv * h, this.y1 + vDiv * v, 0);

				if (h > 0 && v > 0)
					this.indices.push(
						(v - 1) * hPoints + h - 1,
						(v - 1) * hPoints + h,
						v * hPoints + h,
						v * hPoints + h,
						v * hPoints + h - 1,
						(v - 1) * hPoints + h - 1
					);

				this.normals.push(0, 0, 1);

				this.texCoords.push((h / this.horizontalDivs) * maxS, 1 - (v / this.verticalDivs) * maxT);
			}
		}

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}
}
