/**
 * Represents a {@link MySceneGraph}'s node.
 */
class Node {
	/**
	 * Constructs a new node.
	 * @param {XMLScene} scene					- the scene that holds the node.
	 * @param {MaterialWrapper} materialWrapper - the node's material.
	 * @param {TextureWrapper} textureWrapper 	- the node's texture.
	 * @param {Node[]=} descendants 			- the node's descendants.
	 * @param {CGFobject[]=} leafs 				- the node's leafs descendants.
	 * @param {Transformation=} transformation	- the transformation to be applied to the node.
	 * @param {boolean=} parsed					- the boolean that states if the node is already parsed or is simply a placeholder (i.e. was only referenced).
	 */
	constructor(
		scene,
		materialWrapper,
		textureWrapper,
		animation,
		descendants = [],
		leafs = [],
		transformation = new Transformation(),
		parsed = false
	) {
		this.scene = scene
		this.materialWrapper = materialWrapper
		this.textureWrapper = textureWrapper
		this.animation = animation
		this.descendants = descendants
		this.leafs = leafs
		this.transformation = transformation
		this.parsed = parsed
	}

	/**
	 * Displays the node and all its descendants.
	 * Applies the material and texture if it has any direct leaf descendants.
	 * Displays any descendants of this node, running recursively.
	 * @param {CGFappearance[]=} materialStack	- the stack of applied materials.
	 * @param {CGFtexture[]=} textureStack		- the stack of applied textures.
	 */
	display(materialStack = [], textureStack = []) {
		// matrix calculations and stack operations
		this.scene.pushMatrix()

		if (this.animation) this.animation.apply(this.transformation)
		else this.scene.multMatrix(this.transformation.matrix)

		// material calculations and stack operations
		if (this.materialWrapper.hereditaryType == MySceneGraph.hereditaryType.NULL) {
			this.materialWrapper.material = materialStack.pop()
			materialStack.push(this.materialWrapper.material)
		}
		materialStack.push(this.materialWrapper.material)

		// texture calculations and stack operations
		if (this.textureWrapper.hereditaryType == MySceneGraph.hereditaryType.NULL) {
			this.textureWrapper.texture = textureStack.pop()
			textureStack.push(this.textureWrapper.texture)
		}
		textureStack.push(this.textureWrapper.texture)

		// material application
		this.materialWrapper.material.setTexture(this.textureWrapper.texture)
		this.materialWrapper.material.apply()

		// leafs displaying
		if (this.leafs.length)
			for (let leaf of this.leafs)
				leaf.display()

		// recursive call to display all its descendants
		for (let descendant of this.descendants) descendant.display(materialStack, textureStack)

		// stack reset
		this.scene.popMatrix()
		materialStack.pop()
		textureStack.pop()
	}
}
