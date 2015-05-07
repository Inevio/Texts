
var handleArrowLeft = function(){
    cursor.move( -1 );
};

var handleArrowRight = function(){
    cursor.move( 1 );
};

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
