
var checkCursorPosition = function( node, position ){

    if( node.id !== 0 ){

        if( position === 0 && !node.prev().blocked ){

            node     = node.prev();
            position = node.string.length;

        }

    }else if( node.blocked ){

        node     = node.next();
        position = 0;

    }

    return {

        node     : node,
        position : position

    };

};

var cloneObject = function( obj ){

    var target = {};

    for( var i in obj ){

        if( obj.hasOwnProperty( i ) ){
            target[ i ] = obj[ i ];
        }

    }

    return target;

};

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

            lineChar = line.totalChars();
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

var getGlobalParagraphId = function( paragraph ){

    var pageId = paragraph.parent.id;
    var id     = 0;

    for( var i = 0; i < pageId; i++ ){
        id += currentDocument.pages[ i ].paragraphs.length;
    }

    return id + paragraph.id;

};

var getGlobalParagraphCharId = function( node, charId ){

    var line      = node.parent;
    var paragraph = line.parent;
    var id        = 0;


    for( var i = 0; i < line.id; i++ ){
        id += paragraph.lines[ i ].totalChars();
    }


    for( var i = 0; i < node.id; i++ ){

        if( !line.nodes[ i ].blocked ){
            id += line.nodes[ i ].string.length;
        }

    }


    return id + charId;

};

var getNodeByGlobalId = function( paragraph, charId ){


    var counter = charId;
    var node    = paragraph.lines[ 0 ].nodes[ 0 ];

    while( node ){

        if( node.parent.parent.id !== paragraph.id ){
            return;
        }

        if( node.blocked ){
            node = node.next();
            continue;
        }


        if( counter - node.string.length <= 0 ){

            return {

                node : node,
                char : counter

            };

        }

        counter -= node.string.length;
        node     = node.next();

    }

};

var getParagraphByGlobalId = function( paragraphId ){

    var counter = paragraphId;

    for( var i = 0; i < currentDocument.pages.length; i++ ){

        if( counter - currentDocument.pages[ i ].paragraphs.length <= 0 ){
            return currentDocument.pages[ i ].paragraphs[ counter ];
        }

        counter -= currentDocument.pages[ i ].paragraphs.length;

    }

};

var handleArrowLeft = function(){
    cursor.move( -1 );
};

var handleArrowRight = function(){
    cursor.move( 1 );
};

var handleBackspace = function( dontSend ){

    if( selectionRange.isValid() ){
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

};

var handleBackspaceSelection = function( dontSend ){
    /*

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

        currentRangeStart.node.string = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar ) + currentRangeStart.node.string.slice( currentRangeEnd.nodeChar );

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
        currentRangeStart.node.string = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );

        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );

        currentRangeStart.line.nodes = currentRangeStart.line.nodes.slice( 0, currentRangeStart.nodeId + 1 ).concat( currentRangeEnd.line.nodes.slice( currentRangeEnd.nodeId ) );

        // Nodo final
        currentRangeEnd.node.string = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );

        measureNode( currentRangeEnd.paragraph, currentRangeEnd.line, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.node, currentRangeEnd.nodeId, currentRangeEnd.nodeChar );
        updateLineHeight( currentRangeStart.line );
        updateParagraphHeight( currentRangeStart.paragraph );

    // Si están en varias líneas
    }else{

        // Línea final
        // Eliminamos los primeros nodes de la línea
        for( i = 0; i < currentRangeEnd.nodeId; i++ ){

             currentRangeEnd.lineChar -= currentRangeEnd.line.nodes[ i ].string.length;

        }

        currentRangeEnd.lineChar    -= currentRangeEnd.node.string.length;
        currentRangeEnd.node.string  = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeEnd.lineChar    += currentRangeEnd.node.string.length;

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
        currentRangeStart.lineChar    -= currentRangeStart.node.string.length;
        currentRangeStart.node.string  = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
        currentRangeStart.lineChar    += currentRangeStart.node.string.length;

        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );

        // Eliminamos los nodos siguientes de la línea
        for( i = currentRangeStart.nodeId + 1; i < currentRangeStart.line.nodes.length; i++ ){

            currentRangeStart.lineChar -= currentRangeStart.line.nodes[ i ].string.length;

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
                firstLine.nodes = firstLine.nodes.concat( currentRangeStart.paragraph.lines[ i ].nodes );
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
    temporalStyle.clear();
    updateToolsLineStatus(); // To Do -> Comprobar si se tiene que ejecutar siempre o solo algunas veces

    if( !realtime || dontSend ){
        return;
    }

    realtime.send({

        cmd  : CMD_RANGE_BACKSPACE,
        data : [ paragraphIdStart, charInParagraphStart, paragraphIdEnd, charInParagraphEnd ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });
    */

};

var handleChar = function( newChar, dontSend ){

    if( selectionRange.isValid() ){
        handleCharSelection( newChar, dontSend );
    }else{
        handleCharNormal( newChar, dontSend );
    }

};

var handleCharNormal = function( newChar, dontSend ){

    cursor.node.insert( cursor.char, newChar );
    canvasPages.requestDraw();
    cursor.move( newChar.length );

};

var handleCharSelection = function( newChar, dontSend ){

    /*
    var i;
    var paragraphIdStart     = currentRangeStart.paragraphId;
    var charInParagraphStart = currentRangeStart.lineChar;
    var paragraphIdEnd       = currentRangeEnd.paragraphId;
    var charInParagraphEnd   = currentRangeEnd.lineChar;

    for( i = 0; i < currentRangeStart.pageId; i++ ){
        paragraphIdStart += currentDocument.pages[ i ].paragraphs.length;
    }

    for( i = 0; i < currentRangeEnd.pageId; i++ ){
        paragraphIdEnd += currentDocument.pages[ i ].paragraphs.length;
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
    */

};

var handleDel = function( dontSend ){

    if( selectionRange.isValid() ){
        handleBackspaceSelection( dontSend );
    }else{
        handleDelNormal( dontSend );
    }

};

var handleDelNormal = function( dontSend ){

    cursor.node.remove( cursor.char );
    canvasPages.requestDraw();

};

var handleEnter = function( dontSend ){

    if( selectionRange.isValid() ){
        handleEnterSelection( dontSend );
    }else{
        handleEnterNormal( dontSend );
    }

};

var handleEnterNormal = function( dontSend ){

    cursor.paragraph.split( cursor.line.id, cursor.node.id, cursor.char );
    canvasPages.requestDraw();
    cursor.move( 1 );

};

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

        node.setStyle({

            'color'       : '#000000',
            'font-family' : 'Cambria',
            'font-size'   : 12

        });

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
    if( selectionRange.isValid() ){

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
    if( styleController.temporal && styleController.temporal.get('font-family') ){
        $( '.tool-fontfamily', toolsLine ).text( styleController.temporal.get('font-family') );
    }else if( nodeStyles['font-family'] ){
        $( '.tool-fontfamily', toolsLine ).text( nodeStyles['font-family'] );
    }else{
        $( '.tool-fontfamily', toolsLine ).text('');
    }

    if( styleController.temporal && styleController.temporal.get('font-size') ){
        $( '.tool-fontsize', toolsLine ).text( styleController.temporal.get('font-size') );
    }else if( nodeStyles['font-size'] ){
        $( '.tool-fontsize', toolsLine ).text( nodeStyles['font-size'] );
    }else{
        $( '.tool-fontsize', toolsLine ).text('');
    }

    if( styleController.temporal ){

        if( styleController.temporal.get( 'font-weight', true ) ){
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

    if( styleController.temporal ){

        if( styleController.temporal.get( 'font-style', true ) ){
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

    if( styleController.temporal ){

        if( styleController.temporal.get( 'text-decoration-underline', true ) ){
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
