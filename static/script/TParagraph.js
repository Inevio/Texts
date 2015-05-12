
var TParagraph = function(){

    this.id;
    this.parent;
    this.lines = [];

    // Properties
    this.align                   = ALIGN_LEFT;
    this.height                  = 0;
    this.indentationLeft         = 0;
    this.indentationRight        = 0;
    this.indentationSpecialType  = INDENTATION_NONE;
    this.indentationSpecialValue = 0;
    this.listMode                = LIST_NONE;
    this.spacing                 = 1;
    this.width                   = 0;
    //this.split                   = 0;

};

TParagraph.prototype.append = function( line ){

    if( line.parent ){
        line.parent.remove( line.id );
    }

    line.id     = this.lines.push( line ) - 1;
    line.parent = this;

    line.updateWidth();

    return this;

};

TParagraph.prototype.clone = function(){

    var newParagraph = new TParagraph();

    // Properties
    newParagraph.align                   = this.align;
    newParagraph.indentationLeft         = this.indentationLeft;
    newParagraph.indentationRight        = this.indentationRight;
    newParagraph.indentationSpecialType  = this.indentationSpecialType;
    newParagraph.indentationSpecialValue = this.indentationSpecialValue;
    newParagraph.listMode                = this.listMode;
    newParagraph.spacing                 = this.spacing;
    //newParagraph.split                   = this.split;

    return newParagraph;

};

TParagraph.prototype.getHash = function(){

    return [

        this.parent.id, // Page
        this.id         // Paragraph

    ];

};

TParagraph.prototype.insert = function( position, line ){

    if( line.parent ){
        line.parent.remove( line.id );
    }

    this.lines  = this.lines.slice( 0, position ).concat( line ).concat( this.lines.slice( position ) );
    line.parent = this;

    for( var i = position; i < this.lines.length; i++ ){

        this.lines[ i ].id = i;

        this.lines[ i ].updateWidth();

    }

    this.updateHeight();

    // To Do -> Hacer realocate si es conveniente (a decision del programador)

    return this;

};

TParagraph.prototype.next = function(){

    var paragraph = this.parent.paragraphs[ this.id + 1 ];

    if( paragraph ){
        return paragraph;
    }

    var page = this.parent.next();

    while( page ){

        if( page.paragraphs.length ){
            return page.paragraphs[ 0 ];
        }

        page = this.parent.next();

    }

};

TParagraph.prototype.prev = function(){

    var paragraph = this.parent.paragraphs[ this.id - 1 ];

    if( paragraph ){
        return paragraph;
    }

    var page = this.parent.next();

    while( page ){

        if( page.paragraphs.length ){
            return page.paragraphs[ page.paragraphs.length - 1 ];
        }

        page = this.parent.next();

    }

};

TParagraph.prototype.remove = function( position ){

    this.lines[ position ].id     = undefined;
    this.lines[ position ].parent = undefined;

    this.lines = this.lines.slice( 0, position ).concat( this.lines.slice( position + 1 ) );

    for( var i = position; i < this.lines.length; i++ ){

        this.lines[ i ].id--;
        this.lines[ i ].updateWidth();

    }

    // To Do -> Hacer realocate si es conveniente (a decision del programador)

    return this;

};

TParagraph.prototype.setStyle = function( key, value ){

    if( typeof key === 'string' ){

        var tmp = {};

        tmp[ key ] = value;
        key        = tmp;
        tmp        = null;

    }

    var update = false;

    for( var i in key ){

        if( i === 'align' ){

            if( value === ALIGN_JUSTIFY ){
                console.warn('ToDo','Paragraph setStyle Justify')
                return this;
            }

            // Si aplicamos la misma alineacion a un parrafo se ignora el cambio
            if( this.align !== value ){

                // Si el párrafo estaba justificado, desjustificamos su contenido
                /*
                if( paragraph[ key ] === ALIGN_JUSTIFY ){

                    var j, line, node;

                    for( i = 0; i < paragraph.lines.length; i++ ){

                        line = paragraph.lines[ i ];

                        for( j = 0; j < line.nodes.length; j++ ){

                            node = line.nodes[ j ];

                            delete node.justifyCharList;
                            delete node.justifyWidth;

                        }

                    }

                }
                */

                this.align = value;
                //update     = true;

                // Si hemos justificado el párrafo, justificamos su contenido
                /*
                if( value === ALIGN_JUSTIFY ){

                    for( i = 0; i < paragraph.lines.length; i++ ){
                        measureLineJustify( paragraph, paragraph.lines[ i ], i );
                    }

                }
                */

            }

        }else if( i === 'listBullet' || i === 'listNumber' ){

            if( this.listMode ){
                return;
            }

            value = 0.63 * CENTIMETER;

            var newNode = this.lines[ 0 ].nodes[ 0 ].clone();

            this.lines[ 0 ].insert( 0, newNode );
            newNode.slice( 0, 0 );
            this.setStyle( 'indentationLeftAdd', value );

            if( i === 'listNumber' ){

                /*
                this.listMode = LIST_NUMBER;

                var number = 1;

                if( paragraphId > 0 ){

                    if( page.paragraphs[ paragraphId - 1 ].listMode === LIST_NUMBER ){
                        number = parseInt( page.paragraphs[ paragraphId - 1 ].lines[ 0 ].nodes[ 0 ].string, 10 ) + 1;
                    }

                }else if( pageId > 0 ){

                    if( currentDocument.pages[ pageId - 1 ].paragraphs[ currentDocument.pages[ pageId - 1 ].paragraphs.length - 1 ].listMode === LIST_NUMBER ){
                        number = parseInt( currentDocument.pages[ pageId - 1 ].paragraphs[ currentDocument.pages[ pageId - 1 ].paragraphs.length - 1 ].lines[ 0 ].nodes[ 0 ].string, 10 ) + 1;
                    }

                }

                newNode.string = number + '.' + '\t';
                */

            }else{

                this.listMode  = LIST_BULLET;
                newNode.insert( 0, String.fromCharCode( 8226 ) + '\t' );
                newNode.setStyle( 'font-family', 'Webdings' ); // To Do -> No usar webdings

            }

            /*
            newNode.blocked              = true;
            newNode.style.color          = '#000000';
            this.indentationSpecialType  = INDENTATION_HANGING;
            this.indentationSpecialValue = value;
            this.lines[ 0 ].tabList     = getTabsInLine( this.lines[ 0 ] );
            this.lines[ 0 ].totalChars += newNode.string.length;

            setNodeStyle( this, this.lines[ 0 ], newNode, 'font-size', this.lines[ 0 ].nodes[ 1 ].style['font-size'] );

            measureNode( this, this.lines[ 0 ], 0, 0, newNode, 0, 0 );

            for( i = 0; i < this.lines.length; i++ ){

                if( i ){
                    this.lines[ i ].width -= value;
                }

            }

            for( i = 0; i < this.lines.length; i++ ){
                realocateLine( pageId, this, i, 0, true );
            }
            */

        }else if( i === 'listNone' ){

            if( !this.listMode ){
                return;
            }

            value                        = this.indentationLeft * -1;
            this.listMode                = LIST_NONE;
            this.indentationSpecialType  = INDENTATION_NONE;
            this.indentationSpecialValue = 0;

            // Eliminamos el bullet
            this.lines[ 0 ].remove( 0 );
            this.setStyle( 'indentationLeftAdd', value );

        }else if( i === 'indentationLeftAdd' ){

            if( this.indentationLeft + value < 0 ){
                value = -this.indentationLeft;
            }else if( this.width - value <= 0 ){
                return;
            }

            this.indentationLeft += value;
            this.width           -= value;

            for( i = 0; i < this.lines.length; i++ ){
                this.lines[ i ].width -= value;
            }

            if( value >= 0 ){

                for( i = 0; i < this.lines.length; i++ ){
                    this.lines[ i ].realocate();
                }

            }else{

                for( i = 0; i < this.lines.length; i++ ){
                    this.lines[ i ].realocateInverse();
                }

            }

        }else{
            console.warn('unrecognised style', i, key[ i ] );
        }

    }

    if( update ){

        /*
        this.updateHeight();
        this.updateWidth();
        */

    }

    return this;

};

TParagraph.prototype.split = function( lineId, nodeId, char ){

    var newParagraph = this.clone();
    var newLine      = new TLine();
    var newNode      = this.lines[ lineId ].nodes[ nodeId ].split( char ).parent.nodes[ nodeId + 1 ];

    this.parent.insert( this.id + 1, newParagraph );
    newParagraph.append( newLine );
    newLine.append( newNode );

    if( this.listMode ){
        newLine.insert( 0, this.lines[ 0 ].nodes[ 0 ].clone() );
    }

    console.log( newParagraph );

    return this;

};

TParagraph.prototype.updateHeight = function(){

    this.height = 0;

    for( var i = 0; i < this.lines.length; i++ ){
        this.height += this.lines[ i ].height;
    }

    return this;

};

TParagraph.prototype.updateWidth = function(){

    this.width = this.parent.width - this.parent.marginLeft - this.parent.marginRight;

    // To Do -> Recursivo

    return this;

};
