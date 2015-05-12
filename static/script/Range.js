
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

Range.prototype.getLimits = function(){

	var compared = compareHashes(

		[ this.startPage.id, this.startParagraph.id, this.startLine.id, this.startNode.id, this.startChar ],
		[ this.endPage.id, this.endParagraph.id, this.endLine.id, this.endNode.id, this.endChar ]

	);

	console.log( compared );

	if( this.endNode && compared > -1 ){

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

Range.prototype.isValid = function(){

	if( !this.endNode ){
		return false;
	}

	return compareHashes(

		[ this.startPage.id, this.startParagraph.id, this.startLine.id, this.startNode.id, this.startChar ],
		[ this.endPage.id, this.endParagraph.id, this.endLine.id, this.endNode.id, this.endChar ]

	) !== 0;

};

Range.prototype.mapNodes = function( handler ){

	var startHash = this.startNode.getHash();
	var endHash   = this.endNode.getHash();
	var node      = this.startNode;
	var tmpHash;

	if( compareHashes( startHash, endHash ) === 0 ){

		handler( node, this.startChar, this.endChar );

		return this;

	}

	while( node ){

		tmpHash = node.getHash();

		if( compareHashes( startHash, tmpHash ) === 0 ){
			handler( node, this.startChar, node.string.length );
		}else if( compareHashes( endHash, tmpHash ) === 0 ){

			handler( node, 0, this.endChar );
			return this;

		}else{
			handler( node, 0, node.string.length );
		}

		node = node.next();

	}

	return this;

};

Range.prototype.mapParagraphs = function( handler ){

	var startHash = this.startParagraph.getHash();
	var endHash   = this.endParagraph.getHash();
	var paragraph = this.startParagraph;
	var tmpHash;

	if( compareHashes( startHash, endHash ) === 0 ){

		handler( paragraph );

		return this;

	}

	while( paragraph ){

		tmpHash = paragraph.getHash();

		if( compareHashes( startHash, tmpHash ) === 0 ){
			handler( paragraph );
		}else if( compareHashes( endHash, tmpHash ) === 0 ){
			handler( paragraph );
		}else{
			handler( paragraph );
		}

		paragraph = paragraph.next();

	}

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
