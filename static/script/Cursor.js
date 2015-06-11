
var Cursor = function(){

	this.page;
	this.paragraph;
	this.line;
	this.node;
	this.char;

    this.paragraphChar    = 0;
	this.positionX        = 0;
	this.positionY        = 0;
	this.updating         = false;
	this.verticalizing    = false;
	this.verticalEnabled  = false;
	this.verticalPosition = 0;

};

Cursor.prototype.move = function( positions ){

	positions = parseInt( positions, 10 ) || 0;

    if( !positions ){
        return this;
    }
	if( !this.verticalizing ){
		this.verticalEnabled = false;
	}

	//var nodeInfo = getNodeByGlobalId( this.paragraph, this.paragraphChar );

	this.node = this.node; //nodeInfo.node;
	this.char = this.char + positions; //nodeInfo.char + positions;

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

	                this.node = next;
	                this.char = 0;

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

				this.node = prev;
	            this.char = this.node.string.length;
				break;

			}

		}

	}

	var oldPageId = ( this.page || {} ).id;

	this.line          = this.node.parent;
	this.paragraph     = this.line.parent;
	this.page          = this.paragraph.parent;
	this.paragraphChar = getGlobalParagraphCharId( this.node, this.char );

    this.updatePositionX();
	this.updatePositionY(); // To Do -> Hacer que se ejecute solo cuando haga falta
	selectionRange.clear();
    canvasCursor.resetBlink();
	styleController.temporal.clear();

	if( this.page.id !== oldPageId ){
		canvasRulerLeft.requestDraw();
	}

};

Cursor.prototype.setNode = function( node, position ){

    // To Do -> console.warn('ToDo','setNode','Prevent blocked');

	var checked   = checkCursorPosition( node, position );
	var oldPageId = ( this.page || {} ).id;

	node               = checked.node;
	position           = checked.position;
    this.char          = parseInt( position, 10 ) || 0;
    this.node          = node;
    this.line          = this.node.parent;
    this.paragraph     = this.line.parent;
    this.page          = this.paragraph.parent;
    this.paragraphChar = getGlobalParagraphCharId( this.node, this.char );

	if( !this.verticalizing ){
		this.verticalEnabled = false;
	}

	if( this.updating ){
		selectionRange.update();
	}else{
		selectionRange.clear();
	}

    this.updatePositionX();
    this.updatePositionY();
    canvasCursor.resetBlink();
	styleController.temporal.clear();

	if( this.page.id !== oldPageId ){
		canvasRulerLeft.requestDraw();
	}

    return this;

};

Cursor.prototype.updatePosition = function( discardEndOfLine ){

	if( !this.page ){
		return this;
	}

	this.updating = true;

	var nodeInfo = getNodeByGlobalId( this.paragraph, this.paragraphChar );
	var node, char;

	// Pueden darse casos en los que ya no exista el
	if( nodeInfo ){

		node = nodeInfo.node;
		char = nodeInfo.char;

	}else{

		var range = selectionRange.getLimits();

		node = range.startNode;
		char = range.startChar;

	}

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

	this.updating = false;

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
        this.positionX += this.line.nodes[ i ].visualWidth;
    }

    if( this.char > 0 ){
        this.positionX += this.node.visualChars[ this.char - 1 ];
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

	this.updateScroll();

    return this;

};

Cursor.prototype.updateScroll = function(){

	// Comprobamos si hay que hacer scroll
	// To Do -> Introducir esta optimización. Hay que tener en cuenta que si la app es más grande que la páginam se tenía 2 y se borra la segunda, al pasar a la primera debe posicionarse bien
	/*
	if(
		scrollTop <= this.positionY &&
		scrollTop + canvasCursor.canvas[ 0 ].height >= this.positionY + this.line.height
	){
		return this;
	}
	*/

	if( scrollTop > this.positionY ){
		canvasCursor.canvas.trigger( 'mousewheel', [ 0, 0, scrollTop - this.positionY + GAP ] );
	}else if(
		scrollTop + canvasPages.canvas.height() - this.line.height < this.positionY ||
		this.positionY < scrollTop
	){
		canvasCursor.canvas.trigger( 'mousewheel', [ 0, 0, scrollTop + canvasCursor.canvas[ 0 ].height - this.positionY - this.line.height - GAP ] );
	}

	return this;

};

Cursor.prototype.verticalMove = function( positions ){

	positions = parseInt( positions, 10 ) || 0;

	if( !positions ){
		return this;
	}

	var line = this.line;

	if( positions > 0 ){

		while( positions-- ){
			line = line.next();
		}

	}else{

		while( positions++ ){
			line = line.prev();
		}

	}

	if( !line ){
		return this;
	}

	if( !this.verticalEnabled ){

		this.verticalEnabled  = true;
		this.verticalPosition = this.positionX;

	}

	var node     = line.nodes[ i ];
	var nodeChar = 0;
	var heritage = line.getOffsetIndentationLeft() + line.parent.parent.marginLeft;

	for( var i = 0; i < line.nodes.length; i++ ){

		if( heritage + line.nodes[ i ].width < this.verticalPosition ){
			heritage += line.nodes[ i ].width;
			continue;
		}

		node = line.nodes[ i ];

        for( var j = 0; j < node.chars.length; j++ ){

            if( heritage + node.visualChars[ j ] > this.verticalPosition ){
                nodeChar = j;
                break;
            }else if( j === node.visualChars.length - 1 || heritage + node.visualChars[ j ] === this.verticalPosition ){
                nodeChar = j + 1;
                break;
            }

        }

		break;

	}

	if( !node ){

		node     = line.nodes[ line.nodes.length - 1 ];
        nodeChar = node.chars.length;

	}

	this.verticalizing = true;

	this.setNode( node, nodeChar );

	this.verticalizing = false;

	return this;

};
