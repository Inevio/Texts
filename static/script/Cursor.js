
var Cursor = function(){
	
	this.page;
	this.paragraph;
	this.line;
	this.node;
	this.char;

	this.positionX = 0;
	this.positionY = 0;

};

Cursor.prototype.updatePositionX = function(){

    // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
    this.positionX = 0;

    // Márgen lateral de la página
    this.positionX += this.page.marginLeft;

    // Margen lateral del párrafo
    console.warn('ToDo','updatePositionX','getLineIndentationLeftOffset');
    //this.positionX += getLineIndentationLeftOffset( this.line.id, this.paragraph );

    // Alineación de la línea
    console.warn('ToDo','updatePositionX','getLineOffset');
    //this.positionX += getLineOffset( this.line, this.paragraph );

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

Cursor.prototype.setNode = function( node, position ){
	
	console.warn('ToDo','setNode');

	this.char      = parseInt( position, 10 ) || 0;
	this.node      = node;
	this.line      = this.node.parent;
	this.paragraph = this.line.parent;
	this.page      = this.paragraph.parent;
	
	this.updatePositionX();
	this.updatePositionY();

	console.log( this );

	return this;

};
