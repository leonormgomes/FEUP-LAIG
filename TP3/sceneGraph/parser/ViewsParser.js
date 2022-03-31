/**
 * Reads and parses the views from the lsf file.
 */
class ViewsParser {
	/**
	 * Constructs the parser.
	 * @param {MySceneGraph} parser		- the main parser.
	 */
	constructor(parser) {
		this.parser = parser;
	}

	/**
	 * Parses the <views> block.
	 * @param {view block element} viewsNode	- the <views> XML node.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseViews(viewsNode) {
		this.parser.database.currentViewID = this.parser.reader.getString(viewsNode, "default");
		if (this.parser.database.currentViewID == null) return this.parser.onXMLError("no view declared as default");

		let defaultFound = false;
		let viewsNodes = viewsNode.children;
		for (let node of viewsNodes) {
			let viewName = node.nodeName;
			let viewID = this.parser.reader.getString(node, "id");
			if (viewID == null) return this.parser.onXMLError("no defined id for view");

			if (viewID == this.parser.database.currentViewID) defaultFound = true;
			if (this.parser.database.views[viewID]) {
				this.parser.onXMLMinorError("View " + viewID + " defined multiple times, accepting first");
				continue;
			}

			if (viewName == "perspective") {
				this.parser.database.views[viewID] = this.parsePerspectiveView(node, viewID);
			} else if (viewName == "ortho") {
				this.parser.database.views[viewID] = this.parseOrthoView(node);
			} else this.parser.onXMLMinorError(viewName + " is not a valid view. Ignoring");
		}

		if (!defaultFound)
			return this.parser.onXMLError("default view " + this.parser.database.currentViewID + " doesn't exist");

		return null;
	}

	/**
	 * Parses the <perspective> block.
	 * @param {view node element} node	- the <perspective> XML node.
	 * @param {view node ID} viewID		- the ID of the perspective.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parsePerspectiveView(node, viewID) {
		let near = this.parser.reader.getFloat(node, "near");
		if (near == null) return this.parser.onXMLError("near not defined in view " + viewID);

		let far = this.parser.reader.getFloat(node, "far");
		if (far == null) return this.parser.onXMLError("far not defined in view " + viewID);

		let angle = this.parser.reader.getFloat(node, "angle");
		if (angle == null) return this.parser.onXMLError("angle not defined in view " + viewID);
		angle = angle * DEGREE_TO_RAD;

		let from;
		let to;
		let fromCount = 0;
		let toCount = 0;
		let children = node.children;
		for (let child of children) {
			if (child.nodeName == "from") {
				from = this.parser.parseCoordinates3D(child, "from element from a perspective view");
				fromCount++;
			} else if (child.nodeName == "to") {
				to = this.parser.parseCoordinates3D(child, "to element from a perspective view");
				toCount++;
			} else return this.parser.onXMLError(child.nodeName + " is not valid in view " + viewID);
		}

		if (fromCount == 0) return this.parser.onXMLError("from clause is required in view " + viewID);
		else if (fromCount > 1)
			return this.parser.onXMLError("from clause should not have duplicates in view " + viewID);

		if (toCount == 0) return this.parser.onXMLError("to clause is required in view " + viewID);
		else if (toCount > 1) return this.parser.onXMLError("to clause should not have duplicates in view " + viewID);

		return new CGFcamera(angle, near, far, from, to);
	}

	/**
	 * Parses the <ortho> block.
	 * @param {view node element} node	- the <ortho> XML node.
	 * @param {view node ID} viewID		- the ID of the perspective.
	 * @returns {*}	null on success, otherwise on error.
	 */
	parseOrthoView(node, viewID) {
		let near = this.parser.reader.getFloat(node, "near");
		if (near == null) return this.parser.onXMLError("near not defined in view " + viewID);

		let far = this.parser.reader.getFloat(node, "far");
		if (far == null) return this.parser.onXMLError("far not defined in view " + viewID);

		let left = this.parser.reader.getFloat(node, "left");
		if (left == null) return this.parser.onXMLError("left not defined in view " + viewID);

		let right = this.parser.reader.getFloat(node, "right");
		if (right == null) return this.parser.onXMLError("right not defined in view " + viewID);

		let top = this.parser.reader.getFloat(node, "top");
		if (top == null) return this.parser.onXMLError("top not defined in view " + viewID);

		let bottom = this.parser.reader.getFloat(node, "bottom");
		if (bottom == null) return this.parser.onXMLError("bottom not defined in view " + viewID);

		let from;
		let to;
		let up;
		let children = node.children;

		for (let child of children) {
			if (child.nodeName == "from") {
				if (from)
					this.parser.onXMLMinorError(
						"from clause of view " + viewID + " defined multiple times, accepting the first one"
					);
				else from = this.parser.parseCoordinates3D(child, "from element from an ortho view");
			} else if (child.nodeName == "to") {
				if (to)
					this.parser.onXMLMinorError(
						"to clause of view " + viewID + " defined multiple times, accepting the first one"
					);
				else to = this.parser.parseCoordinates3D(child, "to element from an ortho view");
			} else if (child.nodeName == "up") {
				if (up)
					this.parser.onXMLMinorError(
						"up clause of view " + viewID + " defined multiple times, accepting the first one"
					);
				else up = this.parser.parseCoordinates3D(child, "up element from an ortho view");
			} else {
				this.parser.onXMLMinorError(child.nodeName + " is not valid in view " + viewID);
			}
		}

		if (!from) return this.parser.onXMLError("from clause is required in view " + viewID);
		if (!to) return this.parser.onXMLError("to clause is required in view " + viewID);
		if (!up) up = Database.defaultUpOrthoView();

		return new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up);
	}
}
