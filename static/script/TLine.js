
var TLine = function(){

    // To Do -> console.warn('ToDo','TLine','Tabs support');

    this.id;
    this.parent;
    this.nodes = [];

    // Properties
    this.height = 0;
    this.width  = 0;

};

TLine.prototype.append = function( list ){

    if( list.constructor !== Array ){
        list = [ list ];
    }

    for( var i = 0; i < list.length; i++ ){

        if( list[ i ].parent ){
            list[ i ].parent.remove( list[ i ].id );
        }

        list[ i ].id     = this.nodes.push( list[ i ] ) - 1;
        list[ i ].parent = this;

    }

    this.updateHeight();
    this.reallocate();

    return this;

};

TLine.prototype.deleteEmptyNodes = function(){

    var isList = this.parent.listMode;

    for( var i = 0; i < this.nodes.length; i++ ){

        if(
            this.id ||
            ( !this.id && isList && i > 1 ) ||
            ( !this.id && !isList && i > 0 )
        ){
            this.nodes[ i ].deleteIfEmpty();
        }

    }

};

TLine.prototype.getIndentationLeft = function(){

    if( !this.id && this.parent.indentationSpecialType === INDENTATION_FIRSTLINE ){
        return this.parent.indentationSpecialValue;
    }

    if( this.id && this.parent.indentationSpecialType === INDENTATION_HANGING ){
        return this.parent.indentationSpecialValue;
    }

    return 0;

};

TLine.prototype.getNodesWidth = function( limit ){

    if( typeof limit === 'undefined' ){
        limit = this.nodes.length;
    }else{
        limit = parseInt( limit, 10 ) || 0;
    }

    var total = 0;

    for( var i = 0; i < limit; i++ ){
        total += this.nodes[ i ].width;
    }

    return total;

};

TLine.prototype.getTrimmedWidth = function(){

    var result = 0;

    for( var i = 0; i < this.nodes.length - 1; i++ ){
        result += this.nodes[ i ].width;
    }

    var lastNode  = this.nodes[ this.nodes.length - 1 ];
    result       += lastNode.chars[ trimRight( lastNode.string ).length - 1 ] || 0;

    return result;

};

TLine.prototype.getOffset = function(){

    if( this.parent.align === ALIGN_LEFT || this.parent.align === ALIGN_JUSTIFY ){
        return 0;
    }

    if( this.parent.align === ALIGN_CENTER ){
        return ( this.width - this.getTrimmedWidth() ) / 2;
    }

    if( this.parent.align === ALIGN_RIGHT ){
        return this.width - this.getTrimmedWidth();
    }

    return 0; // To Do -> Justificado

};

TLine.prototype.getOffsetIndentationLeft = function(){

    if( !this.id && this.parent.indentationSpecialType === INDENTATION_FIRSTLINE ){
        return this.parent.indentationLeft + this.parent.indentationSpecialValue;
    }

    if( this.id && this.parent.indentationSpecialType === INDENTATION_HANGING ){
        return this.parent.indentationLeft + this.parent.indentationSpecialValue;
    }

    return this.parent.indentationLeft;

};

TLine.prototype.getTabs = function(){

    var list       = [];
    var totalChars = 0;
    var index, startIndex;

    for( var i = 0; i < this.nodes.length; i++ ){

        startIndex = 0;

        while( ( index = this.nodes[ i ].string.indexOf( '\t', startIndex ) ) > -1 ){

            list.push({

                nodeId   : i,
                nodeChar : index,
                lineChar : totalChars + index

            });

            startIndex = index + 1;

        }

        totalChars += this.nodes[ i ].string.length;

    }

    return list;

};

TLine.prototype.getWords = function(){

    // To Do -> Revisar calidad del código

    var nodes   = this.nodes;
    var result  = [];
    var words, breakedWord, currentWord, offset, i, j, tmp;

    for( i = 0; i < nodes.length; i++ ){

        offset = 0;

        if(
            breakedWord &&
            ( nodes[ i ].string[ 0 ] === ' ' || nodes[ i ].string[ 0 ] === '\t' )
        ){

            tmp   = nodes[ i ].string.split(/( +)/g);
            words = [ tmp[ 1 ] ];

            // Sino no solo hay espacio
            if( nodes[ i ].string.length !== nodes[ i ].string.split(' ').length - 1 ){

                tmp   = nodes[ i ].string.slice( tmp[ 1 ].length );
                words = words.concat( tmp.match(/( *[\S*]+ *| *[\t*]+ *| +)/g) || [''] );

            }

        }else{
            words = nodes[ i ].string.match(/( *[\S*]+ *| *[\t*]+ *| +)/g) || [''];
        }

        for( j = 0; j < words.length; j++ ){

            if( breakedWord ){

                currentWord.string    += words[ j ];
                currentWord.width     += ( nodes[ i ].chars[ offset + words[ j ].length - 1 ] || 0 ) - ( nodes[ i ].chars[ offset - 1 ] || 0 );
                currentWord.widthTrim += ( nodes[ i ].chars[ offset + trimRight( words[ j ] ).length - 1 ] || 0 ) - ( nodes[ i ].chars[ offset - 1 ] || 0 );

                currentWord.offset.push( [ offset, offset + /*currentWord.string.length*/ words[ j ].length - 1 ] );
                currentWord.nodes.push( nodes[ i ] );

                offset += words[ j ].length;

                if( words[ j ].indexOf(' ') > -1 || i === nodes.length - 1 ){

                    result.push( currentWord );

                    breakedWord = false;

                }

                continue;

            }

            currentWord           = new Word();
            currentWord.string    = words[ j ];
            currentWord.width     = ( nodes[ i ].chars[ offset + words[ j ].length - 1 ] || 0 ) - ( nodes[ i ].chars[ offset - 1 ] || 0 );
            currentWord.widthTrim = ( nodes[ i ].chars[ offset + trimRight( words[ j ] ).length - 1 ] || 0 ) - ( nodes[ i ].chars[ offset - 1 ] || 0 );
            currentWord.nodes     = [ i ];

            currentWord.offset.push( [ offset, offset + /*currentWord.string.length*/ words[ j ].length - 1 ] );

            offset += words[ j ].length;

            if(
                words[ j ].indexOf(' ') > -1 ||
                i === nodes.length - 1
            ){
                result.push( currentWord );
            }else{
                breakedWord = true;
            }

        }

    }

    return result;

};

TLine.prototype.insert = function( position, node, dontReallocate ){

    if( node.parent ){
        node.parent.remove( node.id );
    }

    this.nodes  = this.nodes.slice( 0, position ).concat( node ).concat( this.nodes.slice( position ) );
    node.parent = this;

    for( var i = position; i < this.nodes.length; i++ ){
        this.nodes[ i ].id = i;
    }

    if( !dontReallocate ){
        this.reallocate();
    }

    this.updateHeight();

    return this;

};

TLine.prototype.next = function(){

    var line = this.parent.lines[ this.id + 1 ];

    if( line ){
        return line;
    }

    var paragraph = this.parent.next();

    while( paragraph ){

        if( paragraph.lines.length ){
            return paragraph.lines[ 0 ];
        }

        paragraph = paragraph.next();

    }

};

TLine.prototype.prev = function(){

    var line = this.parent.lines[ this.id - 1 ];

    if( line ){
        return line;
    }

    var paragraph = this.parent.prev();

    while( paragraph ){

        if( paragraph.lines.length ){
            return paragraph.lines[ paragraph.lines.length - 1 ];
        }

        paragraph = paragraph.prev();

    }

};

TLine.prototype.reallocate = function(){

    if( this.parent ){
        this.parent.reallocate();
    }
    
};

TLine.prototype.remove = function( position ){

    this.nodes[ position ].id     = undefined;
    this.nodes[ position ].parent = undefined;

    this.nodes = this.nodes.slice( 0, position ).concat( this.nodes.slice( position + 1 ) );

    for( var i = position; i < this.nodes.length; i++ ){
        this.nodes[ i ].id--;
    }

    this.reallocate();

    return this;

};

TLine.prototype.totalChars = function( includeBlocked ){

    var total = 0;

    for( var i = 0; i < this.nodes.length; i++ ){

        if( includeBlocked || !this.nodes[ i ].blocked ){
            total += this.nodes[ i ].string.length;
        }

    }

    return total;

}

TLine.prototype.updateHeight = function(){

    var lineHeight = 0;

    for( var i = 0; i < this.nodes.length; i++ ){

        if( this.nodes[ i ].height > lineHeight ){
            lineHeight = this.nodes[ i ].height;
        }

    }

    if( lineHeight !== this.height ){

        this.parent.height -= this.height * this.parent.spacing;
        this.parent.height += lineHeight * this.parent.spacing;
        this.height         = lineHeight;

    }

    return this;

};

TLine.prototype.updateJustify = function(){

    var add = 0;

    if(
        this.parent.align === ALIGN_JUSTIFY &&
        this.id !== this.parent.lines.length - 1
    ){

        var widthUsed = 0;
        var words     = this.getWords();
        var line      = '';

        for( var i = 0; i < words.length; i++ ){

            line += words[ i ].string;

            if( i !== words.length - 1 ){
                widthUsed += words[ i ].width;
            }else{
                widthUsed += words[ i ].widthTrim;
            }

        }

        var spaces = trimRight( line ).split(' ').length - 1;
        add = ( this.width - widthUsed ) / spaces;

    }

    for( var i = 0; i < this.nodes.length; i++ ){
        this.nodes[ i ].updateVisualWidth( add );
    }

    return this;

};

TLine.prototype.updateWidth = function(){

    this.width = this.parent.width - this.getIndentationLeft() || 0;

    return this;

};
