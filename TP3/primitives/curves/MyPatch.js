class MyPatch extends CGFobject {
	constructor(scene, npointsU, npointsV, npartsU, npartsV, controlPoints) {
		super(scene)
		this.npointsU = npointsU
		this.npointsV = npointsV
		this.npartsU = npartsU
		this.npartsV = npartsV
		this.controlPoints = controlPoints

		this.initSurface()
	}

	initSurface() {
		let uArray = []

		let pos = 0
		for (let i = 0; i < this.npointsU; i++) {
			let vArray = []
			for (let j = 0; j < this.npointsV; j++) {
				vArray.push(this.controlPoints[pos])
				pos++
			}
			uArray.push(vArray)
		}

		const surface = new CGFnurbsSurface(this.npointsU - 1, this.npointsV - 1, uArray)

		this.surface = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, surface)
	}

	display() {
		this.surface.display()
	}
}
