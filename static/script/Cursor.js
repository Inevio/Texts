
var Cursor = function(){

	this.page;
	this.paragraph;
	this.line;
	this.node;
	this.char;

    this.paragraphChar = 0;
	this.positionX     = 0;
	this.positionY     = 0;

};

Cursor.prototype.move = function( positions ){

	positions = parseInt( positions, 10 ) || 0;

    if( !positions ){
        return this;
    }

	var nodeInfo = getNodeByGlobalId( this.paragraph, this.paragraphChar );

	this.node = nodeInfo.node;
	this.char = nodeInfo.char + positions;

	// Movimiento a la derecha
	if( positions > 0 ){

		if( this.char > this.node.string.length ){

			var next = this.node.next();

			while( true ){

				if( !next ){

					this.char = this.node.string.length;
					break;

				}

				if( next.blocked ){

					next = next.next();
					continue;

				}

				if(
	                this.line.id !== next.parent.id ||
	                this.paragraph.id !== next.parent.parent.id ||
	                this.page.id !== next.parent.parent.parent.id
	            ){

	                this.node      = next;
	                this.line      = next.parent;
	                this.paragraph = this.line.parent;
	                this.page      = this.paragraph.parent;
	                this.char      = 0;

	                this.updatePositionY();

	            }else{

	                this.node = next;
	                this.char = 1;

	            }

				break;

			}

	    }

	// Movimiento a la izquierda
	}else{

		if(
			this.char < 0 ||
			(
				this.char === 0 &&
				this.node.id !== 0 &&
				!this.node.prev().blocked
			)
		){

			var prev = this.node.prev();

			while( true ){

				if( !prev ){

					this.char = 0;
					break;

				}

				if( prev.blocked ){

					prev = prev.prev();
					continue;

				}

				if(
	                this.line.id !== prev.parent.id ||
	                this.paragraph.id !== prev.parent.parent.id ||
	                this.page.id !== prev.parent.parent.parent.id
	            ){

	                this.node      = prev;
	                this.line      = prev.parent;
	                this.paragraph = this.line.parent;
	                this.page      = this.paragraph.parent;
	                this.char      = this.node.string.length;

	                this.updatePositionY();

	            }else{

	                this.node = prev;
	                this.char = this.node.string.length;

	            }

				break;

			}

		}

	}

	console.warn('ToDo', 'Test if paragraphChar is always correct');

	this.paragraphChar = getGlobalParagraphCharId( this.node, this.char );

    this.updatePositionX();
	selectionRange.clear();
    canvasCursor.resetBlink();

};

Cursor.prototype.setNode = function( node, position ){

    console.warn('ToDo','setNode','Prevent blocked');

	var checked = checkCursorPosition( node, position );

	node               = checked.node;
	position           = checked.position;
    this.char          = parseInt( position, 10 ) || 0;
    this.node          = node;
    this.line          = this.node.parent;
    this.paragraph     = this.line.parent;
    this.page          = this.paragraph.parent;
    this.paragraphChar = getGlobalParagraphCharId( this.node, this.char );

    this.updatePositionX();
    this.updatePositionY();
	selectionRange.clear();
    canvasCursor.resetBlink();

    return this;

};

Cursor.prototype.updatePosition = function( discardEndOfLine ){

	var nodeInfo = getNodeByGlobalId( this.paragraph, this.paragraphChar );
	var node     = nodeInfo.node;
	var char     = nodeInfo.char;

	if( discardEndOfLine ){

		if(
			node.id === node.parent.nodes.length - 1 &&            // Es el último nodo de la línea
			node.string.length === char &&                         // Es el último caracter de la línea
			node.parent.id !== node.parent.parent.lines.length - 1 // No es la última línea
		){

			node = node.next();
			char = 0;

		}

	}

	this.setNode( node, char );

	/*
    var node     = this.node.parent.nodes[ 0 ];
    var prevNode = this.node;
    var total    = this.paragraphChar;

    while( total ){

        if( !node ){

            total          = 0;
            this.node      = prevNode;
            this.line      = this.node.parent;
            this.paragraph = this.line.parent;
            this.page      = this.paragraph.parent;
            this.char          = this.node.string.length;

        }else if( node.string.length < total ){

            total -= node.string.length;
            node   = node.next();

        }else{

            this.node      = node;
            this.line      = this.node.parent;
            this.paragraph = this.line.parent;
            this.page      = this.paragraph.parent;
            this.char      = total;
            this.paragraphChar  = total;
            total          = 0;

            for( var i = 0; i < this.node.id; i++ ){
                this.paragraphChar += this.line.nodes[ i ].string.length;
            }

        }

    }
	*/

    this.updatePositionX();
    this.updatePositionY();

    return this;

};

Cursor.prototype.updatePositionX = function(){

    // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
    this.positionX = 0;

    // Márgen lateral de la página
    this.positionX += this.page.marginLeft;

    // Margen lateral del párrafo
    this.positionX += this.line.getOffsetIndentationLeft( this.line.id, this.paragraph );

    // Alineación de la línea
    this.positionX += this.line.getOffset( this.line, this.paragraph );

    // Posicion dentro de la linea
    for( var i = 0; i < this.node.id; i++ ){
        this.positionX += this.line.nodes[ i ].justifyWidth || this.line.nodes[ i ].width;
    }

    if( this.char > 0 ){

        if( this.node.justifyCharList ){
            this.positionX += this.node.justifyCharList[ this.char - 1 ];
        }else{
            this.positionX += this.node.chars[ this.char - 1 ];
        }

    }

    return this;

};

Cursor.prototype.updatePositionY = function(){

    // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
    this.positionY = 0;

    // Tamaño de cada página
    for( var i = 0; i < this.page.id; i++ ){
        this.positionY += currentDocument.pages[ i ].height + GAP;
    }

    // Márgen superior
    this.positionY += this.page.marginTop;

    // Tamaño de cada párrafo
    for( var i = 0; i < this.paragraph.id; i++ ){
        this.positionY += this.page.paragraphs[ i ].height;
    }

    // Tamaño de cada línea
    for( var i = 0; i < this.line.id; i++ ){
        this.positionY += this.paragraph.lines[ i ].height * this.paragraph.spacing;
    }

    return this;

};
