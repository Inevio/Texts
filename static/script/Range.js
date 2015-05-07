
var Range = function(){

	this.startPage;
	this.startParagraph;
	this.startLine;
	this.startNode;
	this.startChar;

	this.endPage;
	this.endParagraph;
	this.endLine;
	this.endNode;
	this.endChar;
	
};

Range.prototype.clear = function(){

	this.startPage      = undefined;
	this.startParagraph = undefined;
	this.startLine      = undefined;
	this.startNode      = undefined;
	this.startChar      = undefined;
	this.endPage        = undefined;
	this.endParagraph   = undefined;
	this.endLine        = undefined;
	this.endNode        = undefined;
	this.endChar        = undefined;

	return this;

};

Range.prototype.setStart = function( node, position ){
	
	this.startNode      = node;
	this.startLine      = node.parent;
	this.startParagraph = this.startLine.parent;
	this.startPage      = this.startParagraph.parent;
	this.startChar      = parseInt( position, 10 ) || 0;

	return this;

};

Range.prototype.setEnd = function( node, position ){

	this.endNode      = node;
	this.endLine      = node.parent;
	this.endParagraph = this.endLine.parent;
	this.endPage      = this.endParagraph.parent;
	this.endChar      = parseInt( position, 10 ) || 0;

	return this;
	
};

Range.prototype.getLimits = function(){

	if(
		this.endNode &&
		(
			this.startPage.id > this.endPage.id ||
			this.startParagraph.id > this.endParagraph.id ||
			this.startLine.id > this.endLine.id ||
			this.startNode.id > this.endNode.id ||
			this.startChar > this.endChar
		)
	){

		return {

			startPage      : this.endPage,
			startParagraph : this.endParagraph,
			startLine      : this.endLine,
			startNode      : this.endNode,
			startChar      : this.endChar,
			endPage        : this.startPage,
			endParagraph   : this.startParagraph,
			endLine        : this.startLine,
			endNode        : this.startNode,
			endChar        : this.startChar

		};

	}

	return {

		startPage      : this.startPage,
		startParagraph : this.startParagraph,
		startLine      : this.startLine,
		startNode      : this.startNode,
		startChar      : this.startChar,
		endPage        : this.endPage,
		endParagraph   : this.endParagraph,
		endLine        : this.endLine,
		endNode        : this.endNode,
		endChar        : this.endChar

	};

};
