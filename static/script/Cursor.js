
var Cursor = function(){

	this.page;
	this.paragraph;
	this.line;
	this.node;

	this.char      = 0;
    this.lineChar  = 0;
	this.positionX = 0;
	this.positionY = 0;

};

Cursor.prototype.move = function( positions ){

    positions = parseInt( positions, 10 ) || 0;

    if( !positions ){
        return this;
    }

    this.char     = this.char + positions;
    this.lineChar = this.lineChar + positions;

	// Movimiento a la derecha
	if( positions > 0 ){

		if( this.char > this.node.string.length ){

			var next = this.node.next();

			while( true ){

				if( !next ){

					this.char     = this.node.string.length;
		            this.lineChar = this.line.totalChars;
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
	                this.lineChar  = 0;

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













    this.updatePositionX();
	//this.updatePositionY(); // To Do -> Esto es optimizable, no deberia tener que ejecutarse en todo momento
    canvasCursor.resetBlink();

};

Cursor.prototype.setNode = function( node, position ){

    console.warn('ToDo','setNode','Prevent blocked');

    this.char      = parseInt( position, 10 ) || 0;
    this.node      = node;
    this.line      = this.node.parent;
    this.paragraph = this.line.parent;
    this.page      = this.paragraph.parent;

    for( var i = 0; i < node.id; i++ ){
        this.lineChar += this.line.nodes[ i ].string.length;
    }

    this.updatePositionX();
    this.updatePositionY();
    canvasCursor.resetBlink();

    return this;

};

Cursor.prototype.updatePosition = function(){

    var node     = this.node.parent.nodes[ 0 ];
    var prevNode = this.node;
    var total    = this.lineChar;

    while( total ){

        if( !node ){

            total          = 0;
            this.node      = prevNode;
            this.line      = this.node.parent;
            this.paragraph = this.line.parent;
            this.page      = this.paragraph.parent;
            this.char      = this.node.string.length;
            this.lineChar  = this.line.totalChars;

        }else if( node.string.length < total ){

            total -= node.string.length;
            node   = node.next();

        }else{

            this.node      = node;
            this.line      = this.node.parent;
            this.paragraph = this.line.parent;
            this.page      = this.paragraph.parent;
            this.char      = total;
            this.lineChar  = total;
            total          = 0;

            for( var i = 0; i < this.node.id; i++ ){
                this.lineChar += this.line.nodes[ i ].string.length;
            }

        }

    }

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
