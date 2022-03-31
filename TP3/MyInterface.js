/**
 * MyInterface class, creating a GUI interface.
 */
class MyInterface extends CGFinterface {
	/**
	 * @constructor
	 */
	constructor() {
		super()
	}

	/**
	 * Initializes the interface.
	 * @param {CGFapplication} application
	 */
	init(application) {
		super.init(application)
		// init GUI. For more information on the methods, check:
		//  http://workshop.chromeexperiments.com/examples/gui

		this.gui = new dat.GUI()

		//Slider element in GUI
		this.gui.add(this.scene, 'scaleFactor', 0.1, 5).name('Scale factor')

		// add a group of controls (and open/expand by default)
		this.initKeys()

		return true
	}

	removeFolder(name) {
		var folder = this.gui.__folders[name]
		if (!folder)
			return

		folder.close()
		this.gui.__ul.removeChild(folder.domElement.parentNode)
		delete this.gui.__folders[name]
		this.gui.onResize()
	}

	showLights() {
		this.removeFolder('Lights')
		this.lightsFolder = this.gui.addFolder('Lights')
		this.lightsFolder.open()

		for (
			let i = 0;
			i < Object.keys(this.scene.gameOrchestrator.themeManager.selectedTheme.database.lights).length;
			i++
		)
			this.lightsFolder
				.add(this.scene.lights[i], 'enabled')
				.name(Object.keys(this.scene.gameOrchestrator.themeManager.selectedTheme.database.lights)[i])
	}

	/**
	 * initKeys
	 */
	initKeys() {
		this.scene.gui = this
		this.processKeyboard = function () {}
		this.activeKeys = {}
	}

	processKeyDown(event) {
		this.activeKeys[event.code] = true
	}

	processKeyUp(event) {
		this.activeKeys[event.code] = false
	}

	isKeyPressed(keyCode) {
		return this.activeKeys[keyCode] || false
	}
}
