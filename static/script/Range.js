
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

	this.startPage              = undefined;
	this.startParagraph         = undefined;
	this.startLine              = undefined;
	this.startNode              = undefined;
	this.startChar              = undefined;
	this.startGlobalParagraphId = undefined;
	this.startGlobalCharId      = undefined;
	this.endPage                = undefined;
	this.endParagraph           = undefined;
	this.endLine                = undefined;
	this.endNode                = undefined;
	this.endChar                = undefined;
	this.endGlobalParagraphId   = undefined;
	this.endGlobalCharId        = undefined;

	return this;

};

Range.prototype.collapseLeft = function( positions ){

	var range = this.getLimits();

	cursor.setNode( range.startNode, range.startChar );
	cursor.move( positions );
	canvasCursor.resetBlink();

};

Range.prototype.collapseRight = function( positions ){

	var range = this.getLimits();

	cursor.setNode( range.endNode, range.endChar );
	cursor.move( positions );
	canvasCursor.resetBlink();

};

Range.prototype.getLimits = function(){

	if( !this.startNode ){
		return {};
	}

	if( !this.endNode ){

		return {

			startPage      : this.startPage,
			startParagraph : this.startParagraph,
			startLine      : this.startLine,
			startNode      : this.startNode,
			startChar      : this.startChar

		};

	}

	var compared = compareHashes(

		[ this.startPage.id, this.startParagraph.id, this.startLine.id, this.startNode.id, this.startChar ],
		[ this.endPage.id, this.endParagraph.id, this.endLine.id, this.endNode.id, this.endChar ]

	);

	var limits;

	if( compared === -1 ){

		limits = {

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

	}else{

		limits = {

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

	}

	if(
		limits.startNode.string.length === this.startChar &&
		limits.startLine.nodes.length - 1 !== this.startNode.id
	){

		limits.startNode = limits.startNode.next();
		limits.startChar = 0;

	}

	if(
		limits.endNode.id &&
		!limits.endNode.prev().blocked &&
		limits.endChar === 0
	){

		limits.endNode = limits.endNode.prev();
		limits.endChar = limits.endNode.string.length;

	}

	return limits;

};

Range.prototype.isValid = function(){

	if( !this.endNode ){
		return false;
	}

	var original = compareHashes(

		[ this.startPage.id, this.startParagraph.id, this.startLine.id, this.startNode.id, this.startChar ],
		[ this.endPage.id, this.endParagraph.id, this.endLine.id, this.endNode.id, this.endChar ]

	);

	if( !original ){
		return false;
	}

	var limits = this.getLimits();
	var fixed  = compareHashes(

		[ limits.startPage.id, limits.startParagraph.id, limits.startLine.id, limits.startNode.id, limits.startChar ],
		[ limits.endPage.id, limits.endParagraph.id, limits.endLine.id, limits.endNode.id, limits.endChar ]

	);

	if( !fixed ){
		return false;
	}

	if( original === -1 ){

		return !!(

			compareHashes(

				[ this.startPage.id, this.startParagraph.id, this.startLine.id, this.startNode.id, this.startChar ],
				[ limits.startPage.id, limits.startParagraph.id, limits.startLine.id, limits.startNode.id, limits.startChar ]

			) &&

			compareHashes(

				[ limits.endPage.id, limits.endParagraph.id, limits.endLine.id, limits.endNode.id, limits.endChar ],
				[ this.endPage.id, this.endParagraph.id, this.endLine.id, this.endNode.id, this.endChar ]

			)

		);

	}else{

		return !!(

			compareHashes(

				[ this.startPage.id, this.startParagraph.id, this.startLine.id, this.startNode.id, this.startChar ],
				[ limits.endPage.id, limits.endParagraph.id, limits.endLine.id, limits.endNode.id, limits.endChar ]

			) &&

			compareHashes(

				[ limits.startPage.id, limits.startParagraph.id, limits.startLine.id, limits.startNode.id, limits.startChar ],
				[ this.endPage.id, this.endParagraph.id, this.endLine.id, this.endNode.id, this.endChar ]

			)

		);

	}

};

Range.prototype.getCommonStyles = function(){

	var limits = this.getLimits();
	var res    = {

		nodes      : $.extend( {}, limits.startNode.style ),
		paragraphs : {

            align    : limits.startParagraph.align,
            spacing  : limits.startParagraph.spacing,
            listMode : limits.startParagraph.listMode

    	}

	};

	this.mapNodes( function( node ){

		for( var i in res.nodes ){

			if( res.nodes[ i ] !== node.style[ i ] ){
				delete res.nodes[ i ];
			}

		}

	});

	this.mapParagraphs( function( paragraph ){

		if( res.paragraphs.align !== paragraph.align ){
            res.paragraphs.align = -1;
        }

        if( res.paragraphs.spacing !== paragraph.spacing ){
            res.paragraphs.spacing = -1;
        }

        if( res.paragraphs.listMode !== paragraph.listMode ){
            res.paragraphs.listMode = LIST_NONE;
        }

	});

	return res;

};

Range.prototype.getRaw = function(){

	var list                 = [];
	var currentParagraphHash = [ -1, -1 ];

	this.mapNodes( function( node, start, stop ){

		if( compareHashes( node.parent.parent.getHash(), currentParagraphHash ) !== 0 ){

			list.unshift( node.parent.parent.getRaw( true ) );

			currentParagraphHash = node.parent.parent.getHash();

		}

		var rawNode = node.getRaw();

		rawNode.string = rawNode.string.slice( start, stop );

		if( rawNode.string.length ){
			list[ 0 ].nodeList.push( rawNode );
		}

	});

	list = list.reverse();

	return list;

};

Range.prototype.mapNodes = function( handler ){

	var range     = this.getLimits();
	var startHash = range.startNode.getHash();
	var endHash   = range.endNode.getHash();
	var node      = range.startNode;
	var tmpHash;

	if( compareHashes( startHash, endHash ) === 0 ){

		handler( node, range.startChar, range.endChar );

		return this;

	}

	var list = [];

	while( node ){

		tmpHash = node.getHash();

		if( compareHashes( startHash, tmpHash ) === 0 ){

			list.push({

				node  : node,
				start : range.startChar,
				end   : node.string.length

			});

		}else if( compareHashes( endHash, tmpHash ) === 0 ){

			list.push({

				node  : node,
				start : 0,
				end   : range.endChar

			});

			break;

		}else{

			list.push({

				node  : node,
				start : 0,
				end   : node.string.length

			});

		}

		node = node.next();

	}

	for( var i = 0; i < list.length; i++ ){
		handler( list[ i ].node, list[ i ].start, list[ i ].end );
	}

	return this;

};

Range.prototype.mapParagraphs = function( handler ){

	var range     = this.getLimits();
	var startHash = range.startParagraph.getHash();
	var endHash   = range.endParagraph.getHash();
	var paragraph = range.startParagraph;
	var tmpHash;

	if( compareHashes( startHash, endHash ) === 0 ){

		handler( paragraph );

		return this;

	}

	var list = [];

	while( paragraph ){

		tmpHash = paragraph.getHash();

		if( compareHashes( startHash, tmpHash ) === 0 ){
			list.push( paragraph );
		}else if( compareHashes( endHash, tmpHash ) === 0 ){

			list.push( paragraph );
			break;

		}else{
			list.push( paragraph );
		}

		paragraph = paragraph.next();

	}

	for( var i = 0; i < list.length; i++ ){
		handler( list[ i ] );
	}

	return this;

};

Range.prototype.setStart = function( node, position ){

	this.clear();

	this.startNode              = node;
	this.startLine              = node.parent;
	this.startParagraph         = this.startLine.parent;
	this.startPage              = this.startParagraph.parent;
	this.startChar              = parseInt( position, 10 ) || 0;
	this.startGlobalParagraphId = getGlobalParagraphId( this.startParagraph );
	this.startGlobalCharId      = getGlobalParagraphCharId( this.startNode, this.startChar );

	return this;

};

Range.prototype.setEnd = function( node, position ){

	this.endNode      		  = node;
	this.endLine      		  = node.parent;
	this.endParagraph 		  = this.endLine.parent;
	this.endPage      		  = this.endParagraph.parent;
	this.endChar      		  = parseInt( position, 10 ) || 0;
	this.endGlobalParagraphId = getGlobalParagraphId( this.endParagraph );
	this.endGlobalCharId      = getGlobalParagraphCharId( this.endNode, this.endChar );

	return this;

};

Range.prototype.update = function(){


	var start, end;

	if( this.startParagraph ){
		start = getNodeByGlobalId( this.startParagraph, this.startGlobalCharId );
	}

	if( this.endParagraph ){
		end = getNodeByGlobalId( this.endParagraph, this.endGlobalCharId );
	}

	if( start ){
		this.setStart( start.node, start.char );
	}

	if( end ){
		this.setEnd( end.node, end.char );
	}

	return this;

};
