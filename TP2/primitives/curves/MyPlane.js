class MyPlane extends CGFobject {
	constructor(scene, uDivs, vDivs) {
		super(scene)
		this.scene = scene
		this.uDivs = uDivs
		this.vDivs = vDivs

		this.initSurface()
	}

	initSurface() {
		const surface = new CGFnurbsSurface(
			1, // degree on U: 2 control vertexes U
			1, // degree on V: 2 control vertexes on V
			[
				// U = 0
				[
					// V = 0..1;
					[-0.5, 0.0, 0.5, 1],
					[-0.5, 0.0, -0.5, 1],
				],
				// U = 1
				[
					// V = 0..1
					[0.5, 0.0, 0.5, 1],
					[0.5, 0.0, -0.5, 1],
				],
			]
		)

		this.plane = new CGFnurbsObject(this.scene, this.uDivs, this.vDivs, surface)
	}

	display() {
		// console.log(this)
		this.plane.display()
	}
}
