/**
 * Wraps or encapsulates a CGFtexture with more information such has its hereditary type.
 */
class TextureWrapper {
	/**
	 * Constructs the TextureWrapper.
	 * @param {string=} hereditaryType	- the hereditary type, OWN, CLEAR or NULL.
	 * @param {number=} afs				- the afs to be applied to the texture.
	 * @param {number=} aft				- the aft to be applied to the texture.
	 * @param {CGFtexture}				- the texture to hold.
	 */
	constructor(hereditaryType = "own", afs = 1, aft = 1, texture) {
		this.hereditaryType = hereditaryType;
		this.afs = afs;
		this.aft = aft;
		this.texture = texture;
	}
}
