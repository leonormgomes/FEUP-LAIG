/**
 * MyInterface class, creating a GUI interface.
 */
class MyInterface extends CGFinterface {
	/**
	 * @constructor
	 */
	constructor() {
		super();
	}

	/**
	 * Initializes the interface.
	 * @param {CGFapplication} application
	 */
	init(application) {
		super.init(application);
		// init GUI. For more information on the methods, check:
		//  http://workshop.chromeexperiments.com/examples/gui

		this.gui = new dat.GUI();

		//Slider element in GUI
		this.gui.add(this.scene, "scaleFactor", 0.1, 5).name("Scale factor");

		// add a group of controls (and open/expand by default)
		this.initKeys();

		return true;
	}

	showLights() {
		let lightsFolder = this.gui.addFolder("Lights");
		lightsFolder.open();

		for (let i = 0; i < Object.keys(this.scene.graph.database.lights).length; i++)
			lightsFolder.add(this.scene.lights[i], "enabled").name(Object.keys(this.scene.graph.database.lights)[i]);
	}

	showCameras() {
		this.gui
			.add(this.scene.graph.database, "currentViewID", Object.keys(this.scene.graph.database.views))
			.name("Selected camera")
			.onChange(this.scene.setActiveCamera.bind(this.scene));
	}

	/**
	 * initKeys
	 */
	initKeys() {
		this.scene.gui = this;
		this.processKeyboard = function () {};
		this.activeKeys = {};
	}

	processKeyDown(event) {
		this.activeKeys[event.code] = true;
	}

	processKeyUp(event) {
		this.activeKeys[event.code] = false;
	}

	isKeyPressed(keyCode) {
		return this.activeKeys[keyCode] || false;
	}
}
