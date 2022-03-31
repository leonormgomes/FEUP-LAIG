/**
 * Represents a triangle.
 * @extends CGFobject
 */
class MyTriangle extends CGFobject {
	/**
	 * Constructs a MyTriangle.
	 * The base of the texture always follows the base of the triangle between the first and second vertex.
	 * @param {CGFscene} scene		- the scene to draw the triangle to. 
	 * @param {number} x1			- the X of the first vertex.
	 * @param {number} y1			- the Y of the first vertex. 
	 * @param {number} x2			- the X of the second vertex. 
	 * @param {number} y2			- the Y of the second vertex. 
	 * @param {number} x3			- the X of the third vertex. 
	 * @param {number} y3			- the Y of the third vertex. 
	 * @param {number=} afs			- the horizontal size of the texture in the scene. Fits perfectly if the size is the same as the difference between both Xs. Use a lower number for repetition and higher number for stretching.
	 * @param {number=} aft 		- - the vertical size of the texture in the scene. Fits perfectly if the size is the same as the difference between both Ys. Use a lower number for repetition and higher number for stretching.
	 */
	constructor(scene, x1, y1, x2, y2, x3, y3, afs = 1, aft = 1) {
		super(scene);
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.x3 = x3;
		this.y3 = y3;
		this.afs = afs;
		this.aft = aft;

		this.initBuffers();
	}

	/**
	 * Inits the vertices, indices, normals and texture coordinates.
	 */
	initBuffers() {
		this.vertices = [this.x1, this.y1, 0,
			this.x2, this.y2, 0,
			this.x3, this.y3, 0];

		this.indices = [0, 1, 2];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.initTexCoords();

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * Inits the texture coordinates.
	 */
	initTexCoords() {
		let a = Math.sqrt((this.x2-this.x1)**2+(this.y2-this.y1)**2);
		let b = Math.sqrt((this.x3-this.x2)**2+(this.y3-this.y2)**2);
		let c = Math.sqrt((this.x1-this.x3)**2+(this.y1-this.y3)**2);

		let cos_alpha = (a**2-b**2+c**2)/(2*a*c);
		let alpha = Math.acos(cos_alpha);
		let sin_alpha = Math.sin(alpha);

		this.texCoords = [
			0, 1,
			a/this.afs, 1,
			c*cos_alpha/this.afs, 1 - c*sin_alpha/this.aft
		];
	}
}