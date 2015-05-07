
var TNode = function(){

    this.id;
    this.parent;
    this.chars = [];

    // Properties
    this.blocked = false;
    this.height  = 0;
    this.string  = '';
    this.style   = {};
    this.width   = 0;

};

TNode.prototype.insert = function( position, content ){

    this.string             = this.string.slice( 0, position ) + content + this.string.slice( position );
    this.parent.totalChars += content.length;

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

TNode.prototype.setColor = function( color ){


    this.style['color'] = color;

    return this;

};

TNode.prototype.setFont = function( font ){
    
    this.style['font-family'] = font;

    this.updateHeight();
    this.updateWidth();

    return this;

};

TNode.prototype.setSize = function( size ){

    this.style['font-size'] = size;
    
    this.updateHeight();
    this.updateWidth();

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
        var identation = getLineIndentationLeftOffset( lineId, paragraph );

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

    this.parent.realocate();

    return this;

};
