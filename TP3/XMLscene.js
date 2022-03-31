/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
	/**
	 * @constructor
	 * @param {MyInterface} myinterface
	 */
	constructor(myinterface) {
		super()
		
		this.interface = myinterface
	}

	/**
	 * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
	 * @param {CGFApplication} application
	 */
	init(application) {
		super.init(application)

		this.gameOrchestrator = new MyGameOrchestrator(this)
		this.scaleFactor = 1

		this.initCameras()

		this.enableTextures(true)

		this.gl.clearDepth(100.0)
		this.gl.enable(this.gl.DEPTH_TEST)
		this.gl.enable(this.gl.CULL_FACE)
		this.gl.depthFunc(this.gl.LEQUAL)

		this.axis = new CGFaxis(this)
		this.setUpdatePeriod(0)
		this.firstTime = -1

		this.loadingProgressObject = new MyRectangle(this, -1, -0.1, 1, 0.1)
		this.loadingProgress = 0

		this.defaultAppearance = new CGFappearance(this)

		this.setPickEnabled(true)
	}

	/**
	 * Initializes the scene cameras.
	 */
	initCameras() {
		this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(35, 25, 35), vec3.fromValues(0, 0, 0))
	}

	getClickableIndex() {
		return this.clickableIndex++
	}

	/**
	 * Updates periodically each object in the scene (as per setUpdatePeriod() in init())
	 *
	 * @param t {number}    - the current time
	 */
	update(time) {
		if (this.firstTime < 0) this.firstTime = time

		this.gameOrchestrator.update(time)
	}

	/**
	 * Displays the scene.
	 */
	display() {
		// captures picking
		this.gameOrchestrator.managePick(this.pickMode, this.pickResults)
		this.clearPickRegistration()

		// manages the game
		this.gameOrchestrator.orchestrate()
		
		// Initialize Model-View matrix as identity (no transformation
		this.updateProjectionMatrix()
		this.loadIdentity()

		// Apply transformations corresponding to the camera position relative to the origin
		this.applyViewMatrix()
		
		this.pushMatrix()
		
		// clears image and depth buffer
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

		this.gl.enable(this.gl.BLEND) // enables blending
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

		// shows the game
		this.gameOrchestrator.display()

		this.gl.disable(this.gl.BLEND) // disables blending

		this.popMatrix()
		// ---- END Background, camera and axis setup
	}
}

XMLscene.prototype.clickableIndex = 1
