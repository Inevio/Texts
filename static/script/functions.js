
var compareHashes = function( first, second ){

    for( var i = 0; i < first.length; i++ ){

        if( first[ i ] > second[ i ] ){
            return -1;
        }else if( second[ i ] > first[ i ] ){
            return 1;
        }

    }

    return 0;

};

var getElementsByPosition = function( posX, posY ){

    var pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar, charList;

    // Buscamos la posición vertical
    var height = -scrollTop;

    // Buscamos la página
    for( pageId = 0; pageId < currentDocument.pages.length; pageId++ ){

        if( currentDocument.pages[ pageId ].height + GAP + height < posY ){
            height += currentDocument.pages[ pageId ].height + GAP;
        }else{
            break;
        }

    }

    if( currentDocument.pages[ pageId ] ){

        page = currentDocument.pages[ pageId ];

        // Tenemos en cuenta el margen superior
        height += page.marginTop;

        // Buscamos el párrafo
        for( paragraphId = 0; paragraphId < page.paragraphs.length; paragraphId++ ){

            if( page.paragraphs[ paragraphId ].height + height < posY ){
                height += page.paragraphs[ paragraphId ].height;
            }else{
                break;
            }

        }

        if( page.paragraphs[ paragraphId ] ){
            
            paragraph = page.paragraphs[ paragraphId ];

            // Buscamos la línea
            for( lineId = 0; lineId < paragraph.lines.length; lineId++ ){
            
                if( ( paragraph.lines[ lineId ].height * paragraph.spacing ) + height < posY ){
                    height += paragraph.lines[ lineId ].height * paragraph.spacing;
                }else{
                    break;
                }

            }

            if( paragraph.lines[ lineId ] ){
                line = paragraph.lines[ lineId ];
            }else{
                line = paragraph.lines[ --lineId ];
            }

        }else{

            paragraph = page.paragraphs[ --paragraphId ];
            lineId    = paragraph.lines.length - 1;
            line      = paragraph.lines[ lineId ];

        }

    }else{

        page        = currentDocument.pages[ --pageId ];
        paragraphId = page.paragraphs.length - 1;
        paragraph   = page.paragraphs[ paragraphId ];
        lineId      = paragraph.lines.length - 1;
        line        = paragraph.lines[ lineId ];

    }

    // Buscamos la posición horizontal
    var width = 0;

    // Tenemos en cuenta el margen izquierdo
    width += page.marginLeft;

    // Tenemos en cuenta el margen del párrafo
    width += line.getOffsetIndentationLeft();

    // Tenemos en cuenta la alineación del párrafo
    width += line.getOffset();

    // Buscamos el nodo y el nodeChar
    // Principio del primer nodo
    if( width >= posX ){
        
        nodeId   = 0;
        node     = line.nodes[ nodeId ];
        nodeChar = 0;
        lineChar = 0;

    }else{

        lineChar = 0;

        for( nodeId = 0; nodeId < line.nodes.length; nodeId++ ){

            if( width <= posX && line.nodes[ nodeId ].width + width >= posX ){

                node = line.nodes[ nodeId ];

                for( nodeChar = 0; nodeChar < node.string.length; ){

                    charList = node.justifyCharList || node.chars;

                    if( charList[ nodeChar ] - ( ( charList[ nodeChar ] - ( charList[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX ){
                        break;
                    }

                    lineChar++;
                    nodeChar++;

                }
                
                break;
                
            }

            width    += line.nodes[ nodeId ].width;
            lineChar += line.nodes[ nodeId ].string.length;
            
        }

        // Si no hay nodo es porque está al final de la línea
        if( !node ){

            lineChar = line.totalChars;
            nodeId   = line.nodes.length - 1;
            node     = line.nodes[ nodeId ];
            nodeChar = node.string.length;

        }

    }

    return {

        page      : page,
        paragraph : paragraph,
        line      : line,
        node      : node,
        char      : nodeChar

    };

};

var handleArrowLeft = function(){
    cursor.move( -1 );
};

var handleArrowRight = function(){
    cursor.move( 1 );
};

var handleBackspace = function( dontSend ){

    if( currentRangeStart ){
        handleBackspaceSelection( dontSend );
    }else{
        handleBackspaceNormal( dontSend );
    }

};

var handleBackspaceNormal = function( dontSend ){

    var node = cursor.node;
    var char = cursor.char;

    cursor.move( -1 );
    node.remove( char - 1 );
    canvasPages.requestDraw();

    return;

    /*
    verticalKeysEnabled = false;

    // Principio del documento
    if( !currentPageId && !currentParagraphId && !currentLineId && !currentLineCharId ){
        console.info( 'principio del documento, se ignora' );
        return;
    }

    var nodePosition, updateTools, i;
    var originalPageId      = currentPageId;
    var originalParagraph   = currentParagraph;
    var originalParagraphId = currentParagraphId;
    var originalLineId      = currentLineId;
    var originalLineChar    = currentLineCharId;

    // Principio de línea
    if( !currentLineCharId ){

        // La línea es la primera del párrafo
        if( currentLineId === 0 ){

            // Si hay contenido fusionamos los párrafos
            var prevParagraph;
            var mergeParagraphs  = currentLine.totalChars > 0;
            var pageId           = currentPageId;
            var mergePreLastLine = 0;
            var localParagraphId = 0;
            var localCharId      = 0;

            // El párrafo es el primero de la página
            if( currentParagraphId === 0 ){

                prevParagraph    = currentDocument.pages[ currentPageId - 1 ].paragraphs[ currentDocument.pages[ currentPageId - 1 ].paragraphs.length - 1 ];
                localParagraphId = getGlobalParagraphId( currentPageId - 1, currentDocument.pages[ currentPageId - 1 ].paragraphs.length - 1 );

            }else{

                prevParagraph    = currentPage.paragraphs[ currentParagraphId - 1 ];
                localParagraphId = getGlobalParagraphId( currentPageId, currentParagraphId - 1 );

            }

            for( var i = 0; i < prevParagraph.lines.length; i++ ){
                localCharId += prevParagraph.lines[ i ].totalChars;
            }

            if( currentParagraphId === 0 ){
                updateRuleLeft();
            }

            if( mergeParagraphs ){

                mergePreLastLine = prevParagraph.lines.length - 1;

                var lastLine = prevParagraph.lines[ mergePreLastLine ];

                for( var i = 0; i < currentParagraph.lines.length; i++ ){

                    lastLine.nodes    = lastLine.nodes.concat( currentParagraph.lines[ i ].nodes );
                    lastLine.totalChars += currentParagraph.lines[ i ].totalChars;

                    if( currentParagraph.lines[ i ].height > lastLine.height ){
                        lastLine.height = currentParagraph.lines[ i ].height;
                    }

                    updateParagraphHeight( prevParagraph );

                }

            }

            currentPage.paragraphs = currentPage.paragraphs.slice( 0, currentParagraphId ).concat( currentPage.paragraphs.slice( currentParagraphId + 1 ) );
            
            if( mergeParagraphs ){
                realocateLine( currentPageId, prevParagraph, mergePreLastLine );
            }

            var pos = getElementsByRemoteParagraph( localParagraphId, localCharId, true );

            currentPageId      = pos.pageId;
            currentPage        = pos.page;
            currentParagraphId = pos.paragraphId;
            currentParagraph   = pos.paragraph;
            currentLineId      = pos.lineId;
            currentLine        = pos.line;
            currentLineCharId  = pos.lineChar;
            currentNodeId      = pos.nodeId;
            currentNode        = pos.node;
            currentNodeCharId  = pos.nodeChar;

            realocatePageInverse( pageId );

        }else{

            var localParagraphId = getGlobalParagraphId( currentPageId, currentParagraphId );
            var localCharId      = getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId );
            var prevLineId       = currentLineId - 1;
            var prevLine         = currentParagraph.lines[ prevLineId ];
            var prevNode         = prevLine.nodes[ prevLine.nodes.length - 1 ];
            var original         = prevLine.totalChars - 1;

            prevNode.string           = prevNode.string.slice( 0, -1 );
            prevNode.chars         = prevNode.chars.slice( 0, -1 );
            prevNode.width            = prevNode.chars[ prevNode.chars.length - 1 ];
            prevLine.totalChars      += currentLine.totalChars - 1;
            prevLine.nodes         = prevLine.nodes.concat( currentLine.nodes );
            currentParagraph.lines = currentParagraph.lines.slice( 0, currentLineId ).concat( currentParagraph.lines.slice( currentLineId + 1 ) );
            currentParagraph.height  -= currentLine.height * currentParagraph.spacing;
            currentParagraph.height  -= prevLine.height * currentParagraph.spacing;

            // Actualizamos las alturas de las líneas
            var maxSize = 0;

            for( i = 0; i < prevLine.nodes.length; i++ ){

                if( prevLine.nodes[ i ].height > maxSize ){
                    maxSize = prevLine.nodes[ i ].height;
                }

            }

            prevLine.height = maxSize;

            /*
            currentParagraph.height += maxSize * currentParagraph.spacing; // To Do -> Estamos seguros de que esto es correcto?
            */
            /*

            updateParagraphHeight( currentParagraph );

            var realocate       = realocateLine( currentPageId, currentParagraph, currentLineId - 1, original );
            var updatedPosition = getElementsByRemoteParagraph( localParagraphId, localCharId, true );

            currentPageId      = updatedPosition.pageId;
            currentPage        = updatedPosition.page;
            currentParagraphId = updatedPosition.paragraphId;
            currentParagraph   = updatedPosition.paragraph;
            currentLineId      = updatedPosition.lineId;
            currentLine        = updatedPosition.line;
            currentLineCharId  = updatedPosition.lineChar;
            currentNodeId      = updatedPosition.nodeId;
            currentNode        = updatedPosition.node;
            currentNodeCharId  = updatedPosition.nodeChar;

            if( realocate && currentParagraph.lines.length - 1 > prevLineId ){
                // To Do -> No se si esto es necesario. Comprobar si se ejecuta alguna vez, y si lo hace, cuantas veces realoca
                realocateLineInverse( currentParagraph, prevLineId );
            }

        }

        updateTools = true;

    // Si está en un párrafo en modo lista al principio, justo delante del bullet y tab
    }else if(

        currentParagraph.listMode &&
        !currentLineId &&
        currentNodeId === 1 &&
        currentLine.nodes[ currentNodeId - 1 ].blocked &&
        !currentNodeCharId

    ){

        var bulletLength = currentLine.nodes[ 0 ].string.length;

        setParagraphStyle( currentPageId, currentPage, currentParagraphId, currentParagraph, 'listNone' );

        currentNodeId      = currentNodeId - 1;
        currentLineCharId -= bulletLength;

        setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );
        handleBackspaceNormal( true );

    }else{

        var localParagraphId = getGlobalParagraphId( currentPageId, currentParagraphId );
        var localCharId      = getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId );
        var endOfLine        = currentLineCharId === currentLine.totalChars;

        currentNode.string   = currentNode.string.slice( 0, currentNodeCharId - 1 ).concat( currentNode.string.slice( currentNodeCharId ) );
        currentNode.chars = currentNode.chars.slice( 0, currentNodeCharId - 1 );

        measureNode( currentParagraph, currentLine, currentLineId, currentLineCharId - 1, currentNode, currentNodeId, currentNodeCharId - 1 );

        currentLineCharId--;
        currentNodeCharId--;
        currentLine.totalChars--;

        // El nodo se queda vacío y hay más nodos en la línea
        if(
            !currentNode.string.length &&
            (
                ( currentLine.nodes.length > 1 && ( !currentParagraph.listMode || currentLineId ) ) ||
                ( currentLine.nodes.length > 2 && currentNodeId && !currentLine.nodes[ currentNodeId - 1 ].blocked )
            )
        ){
        
            currentLine.nodes = currentLine.nodes.slice( 0, currentNodeId ).concat( currentLine.nodes.slice( currentNodeId + 1 ) );
            updateTools          = true;

            updateLineHeight( currentLine );
            updateParagraphHeight( currentParagraph );

        // El nodo se queda vacío y no hay más nodos en la línea
        }else if( currentLineId && !currentNode.string.length && currentLine.nodes.length === 1 ){

            currentParagraph.lines = currentParagraph.lines.slice( 0, currentLineId ).concat( currentParagraph.lines.slice( currentLineId + 1 ) );
            currentParagraph.height   = currentParagraph.height - ( currentLine.height * currentParagraph.spacing );
            currentLineId             = currentLineId - 1;
            currentLine               = currentParagraph.lines[ currentLineId ];
            currentLineCharId         = currentLine.totalChars;
            currentNodeId             = currentLine.nodes.length - 1;
            currentNode               = currentLine.nodes[ currentNodeId ];
            currentNodeCharId         = currentNode.string.length;
            updateTools               = true;

        }

        // Realocamos el contenido
        if(
            endOfLine &&
            currentLineId !== currentParagraph.lines.length - 1
        ){

            var firstLine = currentParagraph.lines[ 0 ];

            for( i = 1; i < currentParagraph.lines.length; i++ ){

                firstLine.nodes    = firstLine.nodes.concat( currentParagraph.lines[ i ].nodes );
                firstLine.totalChars += currentParagraph.lines[ i ].totalChars;

            }

            currentParagraph.lines = [ currentParagraph.lines[ 0 ] ];

            updateLineHeight( firstLine );
            updateParagraphHeight( currentParagraph );
            realocateLine( currentPageId, currentParagraph, 0, 0 );

        }else{

            realocateLineInverse( currentParagraph, currentLineId - 1, 0, true );
            realocateLineInverse( currentParagraph, currentLineId, 0 );

        }

        // To Do -> realocateLineInverse tiene un to do dentro esperando a que se arregle el problema de los contadores. Cuando no tenga ese to do, por favor, hacer las siguientes operaciones solo si el contador es mayor que 0
        var updatedPosition = getElementsByRemoteParagraph( localParagraphId, localCharId - 1, true );

        currentPageId      = updatedPosition.pageId;
        currentParagraphId = updatedPosition.paragraphId;
        currentLineId      = updatedPosition.lineId;
        currentLineCharId  = updatedPosition.lineChar;
        currentNodeId      = updatedPosition.nodeId;
        currentNodeCharId  = updatedPosition.nodeChar;

    }

    // Definimos el cursor
    setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true ); // To Do -> Seguramente pueda optimizarse sin necesidad de recalcular toda la nueva posición
    resetBlink();
    clearTemporalStyle();

    if( updateTools ){
        updateToolsLineStatus();
    }

    if( !realtime || dontSend ){
        return;
    }

    // To Do -> Debe mandar las coordenadas en el nuevo sistema
    // To Do -> Basarse en las posiciones originales, no el las nuevas
    var paragraphId = originalParagraphId;
    var charId      = originalLineChar;

    for( i = 0; i < originalPageId; i++ ){
        paragraphId += currentDocument.pages[ i ].paragraphs.length;
    }

    for( i = 0; i < originalLineId; i++ ){
        charId += originalParagraph.lines[ i ].totalChars;
    }

    realtime.send({
        
        cmd  : CMD_BACKSPACE,
        data : [ paragraphId, charId ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });
    */

};

/*
var handleBackspaceSelection = function( dontSend ){

    var i;
    var paragraphIdStart     = getGlobalParagraphId( currentRangeStart.pageId, currentRangeStart.paragraphId );
    var charInParagraphStart = getGlobalParagraphChar( currentRangeStart.paragraph, currentRangeStart.lineId, currentRangeStart.lineChar );
    var paragraphIdEnd       = getGlobalParagraphId( currentRangeEnd.pageId, currentRangeEnd.paragraphId );
    var charInParagraphEnd   = getGlobalParagraphChar( currentRangeEnd.paragraph, currentRangeEnd.lineId, currentRangeEnd.lineChar );

    // Si está en el mismo nodo
    if(
        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId &&
        currentRangeStart.nodeId === currentRangeEnd.nodeId
    ){

        currentRangeStart.line.totalChars -= currentRangeStart.node.string.length;
        currentRangeStart.node.string      = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar ) + currentRangeStart.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeStart.line.totalChars += currentRangeStart.node.string.length;
        
        // Si todavía queda contenido dentro o es el primer nodo de la línea, no lo borramos
        if(

            currentRangeStart.node.string.length ||
            !currentRangeStart.nodeId ||
            (
                currentRangeStart.paragraph.listMode &&
                currentRangeStart.lineId === 0 &&
                currentRangeStart.nodeId === 1 &&
                currentRangeStart.line.nodes[ currentRangeStart.nodeId - 1 ].blocked
            )

        ){
            measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );
        }else{

            currentRangeStart.line.nodes = currentRangeStart.line.nodes.slice( 0, currentRangeStart.nodeId ).concat( currentRangeStart.line.nodes.slice( currentRangeStart.nodeId + 1 ) );

            updateLineHeight( currentRangeStart.line );
            updateParagraphHeight( currentRangeStart.paragraph );

        }

    // Si está en la misma línea pero en distintos nodos
    }else if(
        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId
    ){

        // Nodo inicial
        currentRangeStart.line.totalChars -= currentRangeStart.node.string.length;
        currentRangeStart.node.string      = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
        currentRangeStart.line.totalChars += currentRangeStart.node.string.length;

        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );

        // Eliminado de nodos intermedios
        for( i = currentRangeStart.nodeId + 1; i < currentRangeEnd.nodeId; i++ ){
            currentRangeStart.line.totalChars -= currentRangeStart.line.nodes[ i ].string.length;
        }

        currentRangeStart.line.nodes = currentRangeStart.line.nodes.slice( 0, currentRangeStart.nodeId + 1 ).concat( currentRangeEnd.line.nodes.slice( currentRangeEnd.nodeId ) );

        // Nodo final
        currentRangeEnd.line.totalChars -= currentRangeEnd.node.string.length;
        currentRangeEnd.node.string      = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeEnd.line.totalChars += currentRangeEnd.node.string.length;

        measureNode( currentRangeEnd.paragraph, currentRangeEnd.line, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.node, currentRangeEnd.nodeId, currentRangeEnd.nodeChar );
        updateLineHeight( currentRangeStart.line );
        updateParagraphHeight( currentRangeStart.paragraph );

    // Si están en varias líneas
    }else{

        // Línea final
        // Eliminamos los primeros nodes de la línea
        for( i = 0; i < currentRangeEnd.nodeId; i++ ){

            currentRangeEnd.line.totalChars -= currentRangeEnd.line.nodes[ i ].string.length;
            currentRangeEnd.lineChar        -= currentRangeEnd.line.nodes[ i ].string.length;

        }

        currentRangeEnd.line.totalChars -= currentRangeEnd.node.string.length;
        currentRangeEnd.lineChar        -= currentRangeEnd.node.string.length;
        currentRangeEnd.node.string      = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeEnd.line.totalChars += currentRangeEnd.node.string.length;
        currentRangeEnd.lineChar        += currentRangeEnd.node.string.length;

        // Si el nodo no se queda vacío
        if( currentRangeEnd.node.string.length ){

            measureNode( currentRangeEnd.paragraph, currentRangeEnd.line, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.node, currentRangeEnd.nodeId, 0 );

            currentRangeEnd.line.nodes = currentRangeEnd.line.nodes.slice( currentRangeEnd.nodeId );

        // Si el nodo se queda vacio
        }else{

            currentRangeEnd.line.nodes = currentRangeEnd.line.nodes.slice( currentRangeEnd.nodeId + 1 );
            currentRangeEnd.nodeId        = currentRangeEnd.nodeId + 1;
            currentRangeEnd.node          = currentRangeEnd.line.nodes[ currentRangeEnd.nodeId ];
            currentRangeEnd.nodeChar      = 0;

        }

        // Líneas intermedias
        removeRangeLines( false, currentRangeStart, currentRangeEnd );

        // Eliminar la linea final si hace falta
        if( !currentRangeEnd.line.nodes.length ){
            currentRangeEnd.paragraph.lines = currentRangeEnd.paragraph.lines.slice( currentRangeEnd.lineId + 1 );
            // To Do -> Actualizar la línea. Quizás no sea necesario realmente
        }else{
            updateLineHeight( currentRangeEnd.line );
        }

        // Línea inicial
        // Nodo inicial
        currentRangeStart.line.totalChars -= currentRangeStart.node.string.length;
        currentRangeStart.lineChar        -= currentRangeStart.node.string.length;
        currentRangeStart.node.string      = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
        currentRangeStart.line.totalChars += currentRangeStart.node.string.length;
        currentRangeStart.lineChar        += currentRangeStart.node.string.length;

        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );

        // Eliminamos los nodos siguientes de la línea
        for( i = currentRangeStart.nodeId + 1; i < currentRangeStart.line.nodes.length; i++ ){

            currentRangeStart.line.totalChars -= currentRangeStart.line.nodes[ i ].string.length;
            currentRangeStart.lineChar        -= currentRangeStart.line.nodes[ i ].string.length;

        }

        // Si el nodo no se queda vacío
        if(

            currentRangeStart.node.string.length ||
            !currentRangeStart.nodeId ||
            (
                currentRangeStart.paragraph.listMode &&
                currentRangeStart.lineId === 0 &&
                currentRangeStart.nodeId === 1 &&
                currentRangeStart.line.nodes[ currentRangeStart.nodeId - 1 ].blocked
            )

        ){
            currentRangeStart.line.nodes = currentRangeStart.line.nodes.slice( 0, currentRangeStart.nodeId + 1 );

        // Si el nodo se queda vacio
        }else{

            currentRangeStart.line.nodes = currentRangeStart.line.nodes.slice( 0, currentRangeStart.nodeId );
            currentRangeStart.nodeId        = currentRangeStart.nodeId - 1;
            currentRangeStart.node          = currentRangeStart.line.nodes[ currentRangeStart.nodeId ];
            currentRangeStart.nodeChar      = currentRangeStart.node.string.length - 1;

        }

        // Eliminar la linea inicial si hace falta
        if( !currentRangeStart.line.nodes.length ){
            currentRangeStart.paragraph.lines = currentRangeStart.paragraph.lines.slice( currentRangeStart.lineId + 1 );
            // To Do -> Actualizar la línea
        }else{
            updateLineHeight( currentRangeStart.line );
        }

        realocatePageInverse( currentRangeStart.pageId );

        // To do -> Hacer el caso si no existe la pagina
        // Si el párrafo no existe
        // if( !currentDocument.pages[ currentRangeStart.pageId ].paragraphs[ currentRangeStart.paragraphId ] ){
        //     currentRangeStart.paragraphId = currentRangeStart.paragraphId - 1;
        // }

        // Fusionamos lineas
        // Si es el mismo párrafo
        if(
            currentRangeStart.pageId === currentRangeEnd.pageId &&
            currentRangeStart.paragraphId === currentRangeEnd.paragraphId
        ){

            var firstLine = currentRangeStart.paragraph.lines[ 0 ];

            for( i = 1; i < currentRangeStart.paragraph.lines.length; i++ ){
                firstLine.nodes    = firstLine.nodes.concat( currentRangeStart.paragraph.lines[ i ].nodes );
                firstLine.totalChars += currentRangeStart.paragraph.lines[ i ].totalChars;
            }

            currentRangeStart.paragraph.lines = [ currentRangeStart.paragraph.lines[ 0 ] ];

            updateLineHeight( firstLine );
            updateParagraphHeight( currentRangeStart.paragraph );
            realocateLine( currentRangeStart.pageId, currentRangeStart.paragraph, 0, 0 );

        // Si son distintos párrafos y todavía existe el último párrafo
        }else if( currentRangeEnd.paragraph.lines.length ){
            mergeParagraphs( currentRangeStart.pageId, currentRangeStart.page, currentRangeStart.paragraphId, currentRangeStart.paragraphId + 1 );

        }

    }

    var updatedPosition = getElementsByRemoteParagraph( paragraphIdStart, charInParagraphStart, true );

    setCursor(

        updatedPosition.pageId,
        updatedPosition.paragraphId,
        updatedPosition.lineId,
        updatedPosition.lineChar,
        updatedPosition.nodeId,
        updatedPosition.nodeChar,
        true

    );
    
    resetBlink();
    clearTemporalStyle();
    updateToolsLineStatus(); // To Do -> Comprobar si se tiene que ejecutar siempre o solo algunas veces

    if( !realtime || dontSend ){
        return;
    }

    realtime.send({
        
        cmd  : CMD_RANGE_BACKSPACE,
        data : [ paragraphIdStart, charInParagraphStart, paragraphIdEnd, charInParagraphEnd ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};
*/

var handleChar = function( newChar, dontSend ){

    if( currentRangeStart ){
        handleCharSelection( newChar, dontSend );
    }else{
        handleCharNormal( newChar, dontSend );
    }

};

var handleCharNormal = function( newChar, dontSend ){

    cursor.node.insert( cursor.char, newChar );
    canvasPages.requestDraw();
    cursor.move( newChar.length );

    return;

    /*
    verticalKeysEnabled = false;

    var newNode, endNode, i;

    if( temporalStyle ){

        newNode = createNode( currentLine );

        for( i in currentNode.style ){
            setNodeStyle( currentParagraph, currentLine, newNode, i, currentNode.style[ i ] );
        }

        for( i in temporalStyle ){
            setNodeStyle( currentParagraph, currentLine, newNode, i, temporalStyle[ i ] );
        }

        // Introducimos el nodo nuevo en el lugar adecuado
        // Si el cursor está al principio del nodo
        if( currentNodeCharId === 0 ){
            currentLine.nodes = currentLine.nodes.slice( 0, currentNodeId ).concat( newNode ).concat( currentLine.nodes.slice( currentNodeId ) );
        // Si el cursor está al final del nodo
        }else if( currentNodeCharId === currentNode.string.length ){

            currentLine.nodes = currentLine.nodes.slice( 0, currentNodeId + 1 ).concat( newNode ).concat( currentLine.nodes.slice( currentNodeId + 1 ) );
            currentNodeId        = currentNodeId + 1;

        // Si el cursor está en medio del nodo
        }else{

            endNode              = createNode( currentLine );
            endNode.string       = currentNode.string.slice( currentNodeCharId );
            endNode.style        = $.extend( {}, currentNode.style );
            endNode.height       = currentNode.height;
            currentNode.string   = currentNode.string.slice( 0, currentNodeCharId );
            currentNode.chars = currentNode.chars.slice( 0, currentNodeCharId );
            currentNode.width    = currentNode.chars[ currentNode.chars.length - 1 ];
            currentLine.nodes = currentLine.nodes.slice( 0, currentNodeId + 1 ).concat( newNode ).concat( endNode ).concat( currentLine.nodes.slice( currentNodeId + 1 ) );
            currentNodeId        = currentNodeId + 1;

            measureNode( currentParagraph, currentLine, currentLineId, currentLineCharId, endNode, currentNodeId + 1, 0 );

        }

        currentNode       = currentLine.nodes[ currentNodeId ];
        currentNodeCharId = 0;

    }

    currentNode.string   = currentNode.string.slice( 0, currentNodeCharId ) + newChar + currentNode.string.slice( currentNodeCharId );
    currentNode.chars = currentNode.chars.slice( 0, currentNodeCharId );

    measureNode( currentParagraph, currentLine, currentLineId, currentLineCharId, currentNode, currentNodeId, currentNodeCharId );

    currentLine.totalChars += newChar.length;
    currentLineCharId      += newChar.length;
    currentNodeCharId      += newChar.length;

    var localParagraphId = getGlobalParagraphId( currentPageId, currentParagraphId );
    var localCharId      = getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId );
    var realocate        = false;

    if( newChar.indexOf(' ') >= 0 || newChar.indexOf('\t') >= 0 ){

        realocate = true;

        realocateLineInverse( currentParagraph, currentLineId - 1, currentLineCharId );

    }

    realocate = realocate || ( realocateLine( currentPageId, currentParagraph, currentLineId, currentLineCharId ) > 0 );

    if( realocate ){

        var updatedPosition = getElementsByRemoteParagraph( localParagraphId, localCharId, true );

        setCursor(

            updatedPosition.pageId,
            updatedPosition.paragraphId,
            updatedPosition.lineId,
            updatedPosition.lineChar,
            updatedPosition.nodeId,
            updatedPosition.nodeChar,
            true

        );

    }else if( temporalStyle ){

        setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );
        
        temporalStyle = null;

    }else{

        // Reiniciamos la posición horizontal
        // To Do -> Quizás pueda optimizarse
        positionAbsoluteX  = 0;
        positionAbsoluteX += currentPage.marginLeft;
        positionAbsoluteX += getLineIndentationLeftOffset( currentLineId, currentParagraph );
        positionAbsoluteX += getLineOffset( currentLine, currentParagraph );

        for( i = 0; i < currentNodeId; i++ ){
            positionAbsoluteX += currentLine.nodes[ i ].justifyWidth || currentLine.nodes[ i ].width;
        }

        if( currentNode.justifyCharList ){
            positionAbsoluteX += currentNode.justifyCharList[ currentNodeCharId - 1 ];
        }else{
            positionAbsoluteX += currentNode.chars[ currentNodeCharId - 1 ];
        }

    }

    resetBlink();

    if( !realtime || dontSend ){
        return;
    }

    // To Do -> Basarse en las posiciones originales, no el las nuevas
    var paragraphId = getGlobalParagraphId( currentPageId, currentParagraphId );
    var charId      = getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId );

    realtime.send({
        
        cmd  : CMD_NEWCHAR,
        data : [ paragraphId, charId - 1, newChar ],
        pos  : [ paragraphId, charId ]

    });

    */

};

/*
var handleCharSelection = function( newChar, dontSend ){

    var i;
    var paragraphIdStart     = currentRangeStart.paragraphId;
    var charInParagraphStart = currentRangeStart.lineChar;
    var paragraphIdEnd       = currentRangeEnd.paragraphId;
    var charInParagraphEnd   = currentRangeEnd.lineChar;

    for( i = 0; i < currentRangeStart.pageId; i++ ){
        paragraphIdStart += currentDocument.pages[ i ].paragraphs.length;
    }

    for( i = 0; i < currentRangeStart.lineId; i++ ){
        charInParagraphStart += currentRangeStart.paragraph.lines[ i ].totalChars;
    }

    for( i = 0; i < currentRangeEnd.pageId; i++ ){
        paragraphIdEnd += currentDocument.pages[ i ].paragraphs.length;
    }

    for( i = 0; i < currentRangeEnd.lineId; i++ ){
        charInParagraphEnd += currentRangeEnd.paragraph.lines[ i ].totalChars;
    }

    handleBackspaceSelection( true );
    handleChar( newChar, true );

    if( !realtime || dontSend ){
        return;
    }

    realtime.send({
    
        cmd  : CMD_RANGE_NEWCHAR,
        data : [ paragraphIdStart, charInParagraphStart, paragraphIdEnd, charInParagraphEnd, newChar ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};
*/

var normalizeColor = function( color ){

    if( !color ){
        return '#000000';
    }

    if( color[ 0 ] === '#' ){
        return color.slice( 0, 7 );
    }

    color = color.match(/(\d+)/g) || [ 0, 0, 0 ];
    color = color.slice( 0, 3 ); // Prevents alpha if color was a rgba

    for( var i in color ){

        color[ i ] = parseInt( color[ i ], 10 ).toString( 16 );
        color[ i ] = color[ i ].length === 1 ? '0' + color[ i ] : color[ i ];

    }

    return '#' + color.join('');

};

var setViewTitle = function( name ){

    if( !name ){
        name = lang.newDocument;
    }

    viewTitle.text( name );

};

var start = function(){

    input.focus();

    currentDocument = new TDocument();

    //if( !currentOpenFile ){

        var page      = new TPage();
        var paragraph = new TParagraph();
        var line      = new TLine();
        var node      = new TNode();

        page
        .setDimensions(

            PAGEDIMENSIONS['A4'].width * CENTIMETER,
            PAGEDIMENSIONS['A4'].height * CENTIMETER

        )
        .setMargins(

            MARGIN['Normal'].top * CENTIMETER,
            MARGIN['Normal'].right * CENTIMETER,
            MARGIN['Normal'].bottom * CENTIMETER,
            MARGIN['Normal'].left * CENTIMETER

        );

        currentDocument.append( page );
        page.append( paragraph );
        paragraph.append( line );
        line.append( node );
        
        node.setSize( 12 );
        node.setFont('Cambria');
        node.setColor('#000000');

        setViewTitle();

        console.log( currentDocument );

    //}

    cursor.setNode( node, 0 );

    /*
    updateScroll( 0 );
    */
    canvasPages.requestDraw();
    canvasRulerLeft.requestDraw();
    canvasRulerTop.requestDraw();
    canvasCursor.requestDraw();
    updateToolsLineStatus();
    /*
    activeRealTime();
    saveStatus();

    loading.css( 'display', 'none' );

    marginTopDown.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopUp.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopBox.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    */

};

var trimRight = function( string ){
    return string.replace( / +$/g, '' );
};

var updateToolsLineStatus = function(){

    var /*styles,*/ nodeStyles, paragraphStyles;

    /*
    if( currentRangeStart ){

        styles          = getCommonStyles( currentRangeStart, currentRangeEnd );
        nodeStyles      = styles.node;
        paragraphStyles = styles.paragraph;

    }else{
    */

        nodeStyles      = cursor.node.style;
        paragraphStyles = {

            align    : cursor.paragraph.align,
            spacing  : cursor.paragraph.spacing,
            listMode : cursor.paragraph.listMode

        };

    /*
    }
    */

    // Estilos de nodos
    if( temporalStyle && checkTemporalStyle('font-family') ){
        $( '.tool-fontfamily', toolsLine ).text( temporalStyle['font-family'] );
    }else if( nodeStyles['font-family'] ){
        $( '.tool-fontfamily', toolsLine ).text( nodeStyles['font-family'] );
    }else{
        $( '.tool-fontfamily', toolsLine ).text('');
    }

    if( temporalStyle && checkTemporalStyle('font-size') ){
        $( '.tool-fontsize', toolsLine ).text( temporalStyle['font-size'] );
    }else if( nodeStyles['font-size'] ){
        $( '.tool-fontsize', toolsLine ).text( nodeStyles['font-size'] );
    }else{
        $( '.tool-fontsize', toolsLine ).text('');
    }

    if( temporalStyle ){

        if( checkTemporalStyle( 'font-weight', true ) ){
            $( '.tool-button-bold', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-bold', toolsLine ).removeClass('active');
        }

    }else{

        if( nodeStyles['font-weight'] ){
            $( '.tool-button-bold', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-bold', toolsLine ).removeClass('active');
        }

    }

    if( temporalStyle ){

        if( checkTemporalStyle( 'font-style', true ) ){
            $( '.tool-button-italic', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-italic', toolsLine ).removeClass('active');
        }

    }else{

        if( nodeStyles['font-style'] ){
            $( '.tool-button-italic', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-italic', toolsLine ).removeClass('active');
        }

    }

    if( temporalStyle ){

        if( checkTemporalStyle( 'text-decoration-underline', true ) ){
            $( '.tool-button-underline', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-underline', toolsLine ).removeClass('active');
        }

    }else{

        if( nodeStyles['text-decoration-underline'] ){
            $( '.tool-button-underline', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-underline', toolsLine ).removeClass('active');
        }

    }

    // Estilos de párrafos
    if( paragraphStyles.align === ALIGN_LEFT ){

        $( '.tool-button-left', toolsLine ).addClass('active');
        $( '.tool-button-center, .tool-button-right, .tool-button-justify', toolsLine ).removeClass('active');

    }else if( paragraphStyles.align === ALIGN_CENTER ){
        
        $( '.tool-button-center', toolsLine ).addClass('active');
        $( '.tool-button-left, .tool-button-right, .tool-button-justify', toolsLine ).removeClass('active');

    }else if( paragraphStyles.align === ALIGN_RIGHT ){
        
        $( '.tool-button-right', toolsLine ).addClass('active');
        $( '.tool-button-left, .tool-button-center, .tool-button-justify', toolsLine ).removeClass('active');

    }else if( paragraphStyles.align === ALIGN_JUSTIFY ){
        
        $( '.tool-button-justify', toolsLine ).addClass('active');
        $( '.tool-button-left, .tool-button-center, .tool-button-right', toolsLine ).removeClass('active');

    }

    if( paragraphStyles.spacing > 0 ){
        $( '.tool-button-line-spacing', toolsLine ).attr( 'data-value', paragraphStyles.spacing );
    }else{
        $( '.tool-button-line-spacing', toolsLine ).removeAttr('data-value');
    }

    if( paragraphStyles.listMode === LIST_NONE ){
        $( '.tool-button-list-unsorted, .tool-button-list-sorted', toolsLine ).removeClass('active');
    }else if( paragraphStyles.listMode === LIST_BULLET ){

        $( '.tool-button-list-unsorted', toolsLine ).addClass('active');
        $( '.tool-button-list-sorted', toolsLine ).removeClass('active');

    } if( paragraphStyles.listMode === LIST_NUMBER ){

        $( '.tool-button-list-unsorted', toolsLine ).removeClass('active');
        $( '.tool-button-list-sorted', toolsLine ).addClass('active');

    }

};
