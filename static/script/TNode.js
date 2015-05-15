
var TNode = function(){

    this.id     = undefined;
    this.parent = undefined;
    this.chars  = [];
    this.uniqId = TNode.uniqId++;
    //this.justifyCharList = [];

    // Properties
    this.blocked = false;
    this.height  = 0;
    this.string  = '';
    this.style   = {};
    this.width   = 0;

};

TNode.uniqId = 0;

TNode.prototype.clone = function(){

    var newNode = new TNode();

    newNode.chars   = this.chars;
    newNode.blocked = this.blocked;

    newNode.height  = this.height;
    newNode.string  = this.string;
    newNode.style   = cloneObject( this.style );
    newNode.width   = this.width;

    return newNode;

};

TNode.prototype.getHash = function(){

    return [

        this.parent.parent.parent.id, // Page
        this.parent.parent.id,        // Paragraph
        this.parent.id,               // Line
        this.id                       // Node

    ];

};

TNode.prototype.getPositionX = function( nodeChar ){

    nodeChar = parseInt( nodeChar, 10 ) || 0;

    // Calculamos la posición horizontal
    var i = 0;
    var x = 0;

    // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
    x = 0;

    // Márgen lateral de la página
    x += this.parent.parent.parent.marginLeft;

    // Margen lateral del párrafo
    x += this.parent.getOffsetIndentationLeft();

    // Alineación de la línea
    x += this.parent.getOffset();

    // Posicion dentro de la linea
    for( i = 0; i < this.id; i++ ){
        x += this.parent.nodes[ i ].justifyWidth || this.parent.nodes[ i ].width;
    }

    if( nodeChar > 0 ){

        if( this.justifyCharList ){
            x += this.justifyCharList[ nodeChar - 1 ];
        }else{
            x += this.chars[ nodeChar - 1 ];
        }

    }

    return x;

};

TNode.prototype.getPositionY = function(){

    // Calculamos la posición vertical
    var i           = 0;
    var y           = 0;
    var lineId      = this.parent.id;
    var paragraph   = this.parent.parent;
    var paragraphId = paragraph.id;
    var page        = paragraph.parent;
    var pageId      = page.id;

    // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios

    // Tamaño de cada página
    for( i = 0; i < pageId; i++ ){
        y += currentDocument.pages[ i ].height + GAP;
    }

    // Márgen superior
    y += page.marginTop;

    // Tamaño de cada párrafo
    for( i = 0; i < paragraphId; i++ ){
        y += page.paragraphs[ i ].height;
    }

    // Tamaño de cada línea
    for( i = 0; i < lineId; i++ ){
        y += paragraph.lines[ i ].height * paragraph.spacing;
    }

    return y;

};

TNode.prototype.insert = function( position, content ){

    this.string = this.string.slice( 0, position ) + content + this.string.slice( position );

    this.updateWidth( position );

    return this;

};

TNode.prototype.next = function(){

    var node = this.parent.nodes[ this.id + 1 ];

    if( node ){
        return node;
    }

    var line = this.parent.next();

    while( line ){

        if( line.nodes.length ){
            return line.nodes[ 0 ];
        }

        line = this.parent.next();

    }

};

TNode.prototype.prev = function(){

    var node = this.parent.nodes[ this.id - 1 ];

    if( node ){
        return node;
    }

    var line = this.parent.prev();

    while( line ){

        if( line.nodes.length ){
            return line.nodes[ line.nodes.length - 1 ];
        }

        line = this.parent.prev();

    }

};

TNode.prototype.remove = function( position ){

    this.string = this.string.slice( 0, position ) + this.string.slice( position + 1 );

    this.updateWidth( position );

};

TNode.prototype.setBlocked = function( value ){

    this.blocked = value;

    return this;

};

TNode.prototype.setStyle = function( key, value ){

    if( typeof key === 'string' ){

        var tmp = {};

        tmp[ key ] = value;
        key        = tmp;
        tmp        = null;

    }

    var update = false;

    for( var i in key ){

        if( i === 'color' ){
            this.style['color'] = key[ i ];
        }else if(
            i === 'font-family' ||
            i === 'font-size' ||
            i === 'font-weight' ||
            i === 'font-style' ||
            i === 'text-decoration-underline'
        ){

            this.style[ i ] = key[ i ];
            update          = true;

        }else{
            console.warn('unrecognised style', i, key[ i ] );
        }

    }

    if( update ){

        this.updateHeight();
        this.updateWidth();

    }

    return this;

};

TNode.prototype.slice = function( start, stop ){

    this.string = this.string.slice( start, stop );

    this.updateWidth();

    return this;

};

TNode.prototype.split = function( start, stop ){

    if( typeof stop === 'undefined' ){
        stop = this.string.length;
    }

    if( start === 0 ){

        var newNode = this.clone();

        this.slice( 0, stop );
        newNode.slice( stop );
        this.parent.insert( this.id + 1, newNode );

    }else if( stop === this.string.length ){

        var newNode = this.clone();

        this.slice( 0, start );
        newNode.slice( start );
        this.parent.insert( this.id + 1, newNode );

    }else{

        var firstNode  = this.clone();
        var secondNode = this.clone();

        this.slice( 0, start );
        firstNode.slice( start, stop );
        secondNode.slice( stop );
        this.parent.insert( this.id + 1, firstNode );
        this.parent.insert( this.id + 2, secondNode );

    }

    return this;

};

TNode.prototype.updateHeight = function(){

    testZone.css({

        'font-size'   : this.style['font-size'] + 'pt',
        'font-family' : this.style['font-family']

    });

    var lineHeight = parseInt( testZone[ 0 ].scrollHeight, 10 );

    this.height = lineHeight;

    if( lineHeight !== this.parent.height ){
        this.parent.updateHeight();
    }

    return this;

};

TNode.prototype.updateWidth = function( position ){

    position   = parseInt( position, 10 ) || 0;
    this.chars = this.chars.slice( 0, position );

    canvasPages.setTextStyle( this.style );

    // Si tiene tabuladores seguiremos un procedimiento especial
    if( this.string.lastIndexOf('\t') !== -1 ){

        // To Do -> Cálculo de la posición del tabulado teniendo en cuenta la herencia de nodos anteriores
        // To Do -> Cálculo de la posición del tabulado teniendo en cuenta el offset de la línea

        var current    = 0;
        var prev       = 0;
        var multiples  = 0;
        /*var heritage   = 0;*/
        var index      = 0;
        var identation = this.parent.getOffsetIndentationLeft();

        for( var i = position; i < this.string.length; i++ ){

            // Si no es un tabulador seguimos el procedimiento habitual
            if( this.string[ i ] !== '\t' ){

                index = this.string.slice( 0, i + 1 ).lastIndexOf('\t');

                if( index === -1 ){
                    this.chars.push( canvasPages.ctx.measureText( this.string.slice( 0, i + 1 ) ).width /*+ heritage*/ );
                }else{
                    this.chars.push( this.chars[ index ] + canvasPages.ctx.measureText( this.string.slice( index + 1, i + 1 ) ).width /*+ heritage*/ );
                }

            }else{

                index = this.string.slice( 0, i ).lastIndexOf('\t');

                // Posición actual
                if( index === -1 ){
                    current = canvasPages.ctx.measureText( this.string.slice( 0, i + 1 ) ).width /*+ heritage*/;
                }else{
                    current = this.chars[ index ] + canvasPages.ctx.measureText( this.string.slice( index + 1, i + 1 ) ).width /*+ heritage*/;
                }

                // Posición anterior y múltiplos anteriores
                multiples = Math.ceil( current / ( 1.26 * CENTIMETER ), 10 );

                // Si estamos justo en el límite sumamos 1
                if( parseFloat( ( current % ( 1.26 * CENTIMETER ) ).toFixed( 12 ) ) === 0 ){
                    multiples++;
                }

                // Calculamos la nueva posición
                /*heritage = ( 1.26 * CENTIMETER * multiples ) - identation - current;*/
                current = ( 1.26 * CENTIMETER * multiples ) - identation;

                this.chars.push( current );

            }

        }

    }else{

        for( var i = position; i < this.string.length; i++ ){
            this.chars.push( canvasPages.ctx.measureText( this.string.slice( 0, i + 1 ) ).width );
        }

    }

    this.width = this.chars[ this.chars.length - 1 ] || 0;

    if( this.parent ){
        this.parent.realocate();
    }

    return this;

};
