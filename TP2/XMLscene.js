/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
	/**
	 * @constructor
	 * @param {MyInterface} myinterface
	 */
	constructor(myinterface) {
		super();

		this.interface = myinterface;
	}

	/**
	 * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
	 * @param {CGFApplication} application
	 */
	init(application) {
		super.init(application);

		this.scaleFactor = 1;

		this.sceneInited = false;

		this.initCameras();

		this.enableTextures(true);

		this.gl.clearDepth(100.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.depthFunc(this.gl.LEQUAL);

		this.axis = new CGFaxis(this);
		this.setUpdatePeriod(0);
		this.firstTime = -1;

		this.loadingProgressObject = new MyRectangle(this, -1, -0.1, 1, 0.1);
		this.loadingProgress = 0;

		this.defaultAppearance = new CGFappearance(this);
	}

	/**
	 * Initializes the scene cameras.
	 */
	initCameras() {
		this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(35, 25, 35), vec3.fromValues(0, 0, 0));
	}

	setActiveCamera() {
		this.camera = this.graph.database.views[this.graph.database.currentViewID];
		this.interface.setActiveCamera(this.camera);
	}

	/**
	 * Initializes the scene lights with the values read from the XML file.
	 */
	initLights() {
		var i = 0;
		// Lights index.

		// Reads the lights from the scene graph.
		for (var key in this.graph.database.lights) {
			if (i >= 8) break; // Only eight lights allowed by WebCGF on default shaders.

			if (this.graph.database.lights.hasOwnProperty(key)) {
				var graphLight = this.graph.database.lights[key];

				this.lights[i].setPosition(...graphLight[1]);
				this.lights[i].setAmbient(...graphLight[2]);
				this.lights[i].setDiffuse(...graphLight[3]);
				this.lights[i].setSpecular(...graphLight[4]);

				this.lights[i].setVisible(false);
				if (graphLight[0]) this.lights[i].enable();
				else this.lights[i].disable();

				this.lights[i].update();

				i++;
			}
		}
	}

	/**
	 * Updates periodically each object in the scene (as per setUpdatePeriod() in init())
	 *
	 * @param t {number}    - the current time
	 */
	update(time) {
		if (this.firstTime < 0)
			this.firstTime = time;

		for (let animationID in this.graph.database.animations)
			this.graph.database.animations[animationID].update(time)

		for (let spriteAnimation of this.graph.database.spriteAnimations)
			spriteAnimation.update(time)
	}

	/** Handler called when the graph is finally loaded.
	 * As loading is asynchronous, this may be called already after the application has started the run loop
	 */
	onGraphLoaded() {
		this.axis = new CGFaxis(this, this.graph.referenceLength);

		this.gl.clearColor(...this.graph.background);

		this.setGlobalAmbientLight(...this.graph.ambient);

		this.initLights();

		this.setActiveCamera();

		this.interface.showCameras();

		this.interface.showLights();

		this.sceneInited = true;

		this.setUpdatePeriod(1);
	}

	/**
	 * Displays the scene.
	 */
	display() {
		// ---- BEGIN Background, camera and axis setup

		// Clear image and depth buffer everytime we update the scene
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		// Initialize Model-View matrix as identity (no transformation
		this.updateProjectionMatrix();
		this.loadIdentity();

		// Apply transformations corresponding to the camera position relative to the origin
		this.applyViewMatrix();

		this.pushMatrix();

		if (this.sceneInited) {
			// Draw axis
			if (this.axis.length) this.axis.display();

			this.defaultAppearance.apply();

			for (let i = 0; i < Object.keys(this.graph.database.lights).length; i++)
				if (this.lights[i].enable) this.lights[i].update();

			// Scale operator on gui to scale the scene
			this.scale(this.scaleFactor, this.scaleFactor, this.scaleFactor);

			// Displays the scene (MySceneGraph function).
			this.graph.displayScene();
		} else {
			// Show some "loading" visuals
			this.defaultAppearance.apply();

			this.rotate(-this.loadingProgress / 10.0, 0, 0, 1);

			this.loadingProgressObject.display();
			this.loadingProgress++;
		}

		this.popMatrix();
		// ---- END Background, camera and axis setup
	}
}
