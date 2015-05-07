
var TLine = function(){

    console.warn('ToDo','TLine','Tabs support');

    this.id;
    this.parent;
    this.nodes = [];

    // Properties
    this.height     = 0;
    this.totalChars = 0;
    this.width      = 0;

};

TLine.prototype.append = function( node ){

    if( node.parent ){
        node.parent.remove( node.id );
    }

    node.id     = this.nodes.push( node ) - 1;
    node.parent = this;

    this.realocate();

    return this;

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
                currentWord.nodes.push( i );

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

        paragraph = this.parent.next();
        
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

        paragraph = this.parent.prev();
        
    }

};

TLine.prototype.realocate = function(){

    var paragraph = this.parent;
    var counter   = 0;
    var i, newNode;
    var lastNode = this.nodes[ this.nodes.length - 1 ];

    // Si entra en la línea y no se está escribiendo al principio de una palabra partida
    if(

        this.getNodesWidth() <= this.width &&
        (
            paragraph.lines.length - 1 === this.id ||
            lastNode.string[ lastNode.string.length - 1 ] === ' '
        )

    ){

        // To Do -> Optimizar y hacerlo solo cuando haga falta
        // To Do -> this.tabList = this.getTabs();
        
        // To Do -> measureLineJustify( paragraph, line, this.id );
        return counter;

    }

    var lineWords = this.getWords();

    // To Do -> Linea llena de espacios

    // Si no hay palabras
    if( !lineWords.length ){

        // To Do -> Optimizar y hacerlo solo cuando haga falta
        this.tabList = this.getTabs(); // To Do -> Seguro que esto hay que calcularlo aqui?
        
        measureLineJustify( paragraph, line, this.id );
        return counter;

    // Procedimientos para 2 o más palabras y la primera palabra de la línea entra
    }else if( lineWords.length > 1 && lineWords[ 0 ].widthTrim <= this.width ){

        var nextLine    = paragraph.lines[ this.id + 1 ];
        var heritage    = 0;
        var wordsToMove = [];

        for( i = 0; i < lineWords.length; i++ ){
            heritage += lineWords[ i ].width;
        }
    
        for( i = lineWords.length - 1; i >= 0 ; i-- ){

            heritage -= lineWords[ i ].width;

            if( heritage + lineWords[ i ].widthTrim <= this.width ){
                break;
            }
    
            wordsToMove.unshift( i );
            
        }

        if( !wordsToMove.length ){

            if(
                ( paragraph.lines.length - 1 !== this.id ) &&
                lineWords[ lineWords.length - 1 ].string[ lineWords[ lineWords.length - 1 ].string.length - 1 ] !== ' '

            ){
                wordsToMove.push( lineWords.length - 1 );
            }else{

                // To Do -> Optimizar y hacerlo solo cuando haga falta
                this.tabList = this.getTabs(); // To Do -> Seguro que esto hay que calcularlo aqui?
                
                measureLineJustify( paragraph, line, this.id );
                return counter;

            }

        }

        var firstWordToMove = lineWords[ wordsToMove[ 0 ] ];
        var firstNodeToMove = firstWordToMove.nodes[ 0 ];
        var firstWordOffset = firstWordToMove.offset[ 0 ];
        var nextLine;

        if( paragraph.lines[ this.id + 1 ] ){
            nextLine = paragraph.lines[ this.id + 1 ];
        }else{

            nextLine = new TLine( this.id + 1, paragraph );

            paragraph.insert( this.id + 1, nextLine );

        }

        // Si hay que mover los nodos completos
        if( firstWordOffset[ 0 ] === 0 ){

            var totalChars = 0;

            for( i = firstNodeToMove; i < this.nodes.length; i++ ){
                totalChars += this.nodes[ i ].chars.length;
            }

            nextLine.nodes       = this.nodes.slice( firstNodeToMove ).concat( nextLine.nodes );
            nextLine.totalChars += totalChars;
            this.nodes           = this.nodes.slice( 0, firstNodeToMove );
            this.totalChars     -= totalChars;
            counter             += totalChars;
            
        // Si hay que partir un nodo
        }else{
            
            var nodeToMove = this.nodes[ firstNodeToMove ];
            var totalChars = 0;

            for( i = firstNodeToMove + 1; i < this.nodes.length; i++ ){
                totalChars += this.nodes[ i ].chars.length;
            }

            // To Do -> Esto no es especialmente limpio ni correcto con el sistema de objetos, hacerlo mejor
            nextLine.nodes       = this.nodes.slice( firstNodeToMove + 1 ).concat( nextLine.nodes );
            nextLine.totalChars += totalChars;
            this.nodes           = this.nodes.slice( 0, firstNodeToMove + 1 );
            this.totalChars     -= totalChars;
            counter             += totalChars;
            newNode              = new TNode();
            newNode.style        = $.extend( {}, nodeToMove.style );
            newNode.height       = nodeToMove.height;
            newNode.string       = nodeToMove.string.slice( firstWordOffset[ 0 ] );
            nodeToMove.string    = nodeToMove.string.slice( 0, firstWordOffset[ 0 ] );
            this.totalChars     -= newNode.string.length;
            nextLine.totalChars += newNode.string.length;
            counter             += newNode.string.length;

            nextLine.append( newNode );
            nodeToMove.updateWidth();
            newNode.updateWidth();

        }

        // Actualizamos la altura de la línea actual y la altura de la siguiente línea
        this.updateHeight();
        nextLine.updateHeight();
        
    // Si es una palabra rota
    }else if( lineWords[ 0 ].widthTrim > this.width ){

        var nextLine;

        if( paragraph.lines[ this.id + 1 ] ){
            nextLine = paragraph.lines[ this.id + 1 ];
        }else{

            nextLine        = new TLine( this.id + 1, paragraph );
            nextLine.nodes  = [];
            paragraph.lines = paragraph.lines.slice( 0, this.id + 1 ).concat( nextLine ).concat( paragraph.lines.slice( this.id + 1 ) );

        }

        var heritage = 0;

        for( i = 0; i < this.nodes.length; i++ ){

            if( heritage + this.nodes[ i ].width >= this.width ){
                break;
            }

            heritage += this.nodes[ i ].width;

        }

        var nodeId     = i;
        var nodeToMove = this.nodes[ nodeId ];
        var charId     = 0;

        for( i = 0; i < nodeToMove.chars.length; i++ ){

            if( heritage + nodeToMove.chars[ i ] > this.width ){
                charId = i;
                break;
            }
            
            if( heritage + nodeToMove.chars[ i ] === this.width ){
                charId = i + 1;
                break;
            }

        }

        // Si es al principio del nodo hacemos un movimiento simple
        if( charId === 0) {

            var totalChars = 0;

            for( i = nodeId; i < this.nodes.length; i++ ){
                totalChars += this.nodes[ i ].chars.length;
            }

            nextLine.nodes    = this.nodes.slice( nodeId ).concat( nextLine.nodes );
            nextLine.totalChars += totalChars;
            this.nodes        = this.nodes.slice( 0, nodeId );
            this.totalChars     -= totalChars;
            counter             += totalChars;

        // Si es en medio de un nodo hay que partir los nodos
        }else{

            var totalChars = 0;

            for( i = nodeId + 1; i < this.nodes.length; i++ ){
                totalChars += this.nodes[ i ].chars.length;
            }

            nextLine.nodes    = this.nodes.slice( nodeId + 1 ).concat( nextLine.nodes );
            nextLine.totalChars += totalChars;
            this.nodes        = this.nodes.slice( 0, nodeId + 1 );
            this.totalChars     -= totalChars;
            counter             += totalChars;
            newNode              = createNode( nextLine );
            newNode.style        = $.extend( {}, nodeToMove.style );
            newNode.height       = nodeToMove.height;
            newNode.string       = nodeToMove.string.slice( charId );
            nodeToMove.string    = nodeToMove.string.slice( 0, charId );
            this.totalChars     -= newNode.string.length;
            nextLine.totalChars += newNode.string.length;
            counter             += newNode.string.length;

            measureNode( paragraph, line, 0, 0, nodeToMove, 0, 0 );
            measureNode( paragraph, nextLine, 0, 0, newNode, 0, 0 );

            nextLine.nodes.unshift( newNode );

        }
        
        // Actualizamos la altura de la línea actual
        updateLineHeight( line );

        // Actualizamos la altura de la siguiente línea
        updateLineHeight( nextLine );

        // Actualizamos la altura del párrafo
        updateParagraphHeight( paragraph );
        
    }

    console.warn('ToDo','realocate');
    /*
    if( !dontPropagate ){
        this.parent.lines[ this.id + 1 ].realocate( pageId, paragraph, id + 1, 0 );
    }

    normalizeLine( paragraph, id, line );

    // To Do -> Optimizar y hacerlo solo cuando haga falta
    this.tabList = this.getTabs();
    
    measureLineJustify( paragraph, line, id );
    */

    // To Do -> Actualizar el counter bien
    console.log( counter );
    cursor.updatePosition();
    
    return counter;

};

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

TLine.prototype.updateWidth = function(){

    this.width = this.parent.width - this.getIndentationLeft() || 0;

    // To Do -> Recursivo/Realocados

    return this;

};
