/**
 * Wraps or encapsulates a CGFappearance with more information such has its hereditary type.
 * Sets the texture wrap as "REPEAT" by default.
 */
class MaterialWrapper {
	/**
	 * Constructs the MaterialWrapper.
	 * @param {string} hereditaryType	- the hereditary type, OWN, CLEAR or NULL. 
	 * @param {CGFappearance=} material	- the appearance to hold. 
	 */
	constructor(hereditaryType = "own", material) {
		this.hereditaryType = hereditaryType;
		this.material = material;
		this.material.setTextureWrap("REPEAT", "REPEAT");
	}
}
