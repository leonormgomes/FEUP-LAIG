// TODO comment
class ThemeManager {
	constructor(scene) {
		this.scene = scene

		this.themes = []
	}

	addTheme(name, xmlName) {
		// loads a theme and adds it to the themes
		this.themes[name] = new MySceneGraph(xmlName, this.scene)
	}

	setTheme(name) {
		this.selectedThemeName = name
		this.selectedTheme = this.themes[name]
	}

	applyTheme() {
		this.scene.axis = new CGFaxis(this.scene, this.selectedTheme.referenceLength)

		this.scene.gl.clearColor(...this.selectedTheme.background)

		this.scene.setGlobalAmbientLight(...this.selectedTheme.ambient)

		this.initThemeLights()

		this.scene.interface.showLights()

		this.scene.setUpdatePeriod(1)

		this.applied = true
	}

	initThemeLights() {
		let i = 0
		// Lights index.

		// Reads the lights from the scene graph.
		for (const key in this.selectedTheme.database.lights) {
			if (i >= 8) break // Only eight lights allowed by WebCGF on default shaders.

			if (this.selectedTheme.database.lights.hasOwnProperty(key)) {
				const graphLight = this.selectedTheme.database.lights[key]

				this.scene.lights[i].setPosition(...graphLight[1])
				this.scene.lights[i].setAmbient(...graphLight[2])
				this.scene.lights[i].setDiffuse(...graphLight[3])
				this.scene.lights[i].setSpecular(...graphLight[4])

				this.scene.lights[i].setVisible(false)
				if (graphLight[0]) this.scene.lights[i].enable()
				else this.scene.lights[i].disable()

				this.scene.lights[i].update()

				i++
			}
		}
	}

	setActiveCamera() {
		this.scene.camera = this.selectedTheme.database.views[this.selectedTheme.database.currentViewID]
		this.scene.interface.setActiveCamera(this.scene.camera)
	}

	update(time) {
		for (let animationID in this.selectedTheme.database.animations)
			this.selectedTheme.database.animations[animationID].update(time)

		for (let spriteAnimation of this.selectedTheme.database.spriteAnimations) spriteAnimation.update(time)
	}

	displayTheme() {
		// Draw axis
		if (this.scene.axis.length) this.scene.axis.display()

		this.scene.defaultAppearance.apply()
		for (let i = 0; i < Object.keys(this.selectedTheme.database.lights).length; i++)
			if (this.scene.lights[i].enable) this.scene.lights[i].update()

		// Scale operator on gui to scale the scene
		this.scene.scale(this.scene.scaleFactor, this.scene.scaleFactor, this.scene.scaleFactor)
		this.selectedTheme.display()
	}

	displayLoading() {
		// Show some "loading" visuals
		this.scene.defaultAppearance.apply()

		this.scene.rotate(-this.scene.loadingProgress / 10.0, 0, 0, 1)

		this.scene.loadingProgressObject.display()
		this.scene.loadingProgress++
	}
}
