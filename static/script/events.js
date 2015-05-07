
// Events
win
.on( 'mousedown', function(){

    /*
    if( !toolsListEnabled && !toolsColorEnabled ){
        return;
    }

    toolsListEnabled = false;
    toolsColorEnabled = false;
    */
    input.focus();
    /*
    toolsListContainer.css( 'display', 'none' );
    toolsColorContainer.css( 'display', 'none' );
    toolsList.removeClass('active-fontfamily active-fontsize active-linespacing active-moreoptions active-page-dimensions active-page-margins');
    toolsColor.removeClass('active-color active-page-color');
    */

})

.on( 'ui-view-restore ui-view-focus', function(){
    input.focus();
});

// Selections
canvasCursor.canvas
.on( 'mousedown', function(e){

    if( e.button === 2 ){
        return;
    }

    /*
    verticalKeysEnabled = false;
    */
    selectionEnabled    = true;

    /*
    cleanComposition();
    */
    e.preventDefault();
    selectionRange.clear();

    var offset       = canvasCursor.canvas.offset();
    var posX         = e.pageX - offset.left;
    var posY         = e.pageY - offset.top;
    var elements     = getElementsByPosition( posX, posY );
    var clickCounter = e.originalEvent.detail;

    // To Do -> No usar un setCursor, ya tenemos calculadas todas las posiciones
    if( clickCounter === 1 ){
        currentMultipleHash = [ start.pageId, start.paragraphId, start.lineId, start.lineChar ];
    }

    console.log( clickCounter );

    // Click que no coincide con los clicks previos
    if(
        clickCounter === 1 ||
        ( clickCounter > 1 && compareHashes( currentMultipleHash, [ start.pageId, start.paragraphId, start.lineId, start.lineChar ] ) )
    ){

        cursor.setNode( elements.node, elements.char );
        selectionRange.setStart( elements.node, elements.char );

        /*
        if( realtime ){
            
            realtime.send({

                cmd : CMD_POSITION,
                pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]
                
            });

        }
        */

    // Click que coincide con los clicks previos y corresponde a seleccionar la palabra
    }else if( clickCounter % 2 === 0 ){

        var words  = elements.line.getWords();
        var wordId = 0;
        
        offset = elements.page.marginLeft + elements.line.getOffset();

        if( posX > offset ){

            for( wordId = 0; wordId < words.length - 1; wordId++ ){

                if( offset <= posX && words[ wordId ].width + offset >= posX ){
                    break;
                }

                offset += words[ wordId ].width;

            }

        }

        var word = words[ wordId ];

        selectionRange.setStart( elements.line.nodes[ word.nodes[ 0 ] ], word.offset[ 0 ][ 0 ] );
        selectionRange.setEnd( elements.line.nodes[ word.nodes[ word.nodes.length - 1 ] ], word.offset[ word.offset.length - 1 ][ 1 ] + 1 );
        canvasCursor.resetBlink();

    // Click que coincide con los clicks previos y corresponde a seleccionar el párrafo
    }else{

        console.log('todo el parrafo');

        var lastLine = elements.paragraph.lines[ elements.paragraph.lines.length - 1 ];
        var lastNode = lastLine.nodes[ lastLine.nodes.length - 1 ];

        selectionRange.setStart( elements.paragraph.lines[ 0 ].nodes[ 0 ], 0 );
        selectionRange.setEnd( lastNode, lastNode.string.length );
        canvasCursor.resetBlink();

    }

})

// Controlador de drag
.on( 'mousemove', function(e){

    if( !selectionEnabled ){
        return;
    }

    var pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar;
    var offset = canvasCursor.canvas.offset();
    var posX   = e.pageX - offset.left;
    var posY   = e.pageY - offset.top;

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
    width += getOffsetIndentationLeft( lineId, paragraph );

    // Tenemos en cuenta la alineación del párrafo
    width += getLineOffset( line, paragraph );

    // Buscamos el nodo y el nodeChar
    // Principio del primer nodo
    if( width >= posX ){
        
        nodeId   = 0;
        node     = line.nodes[ nodeId ];
        nodeChar = 0;
        lineChar = 0;

    }else{

        lineChar = 0;
        
        // Buscamos nodo a nodo
        for( nodeId = 0; nodeId < line.nodes.length; ){

            // El caracter está en el nodo
            if( width <= posX && ( line.nodes[ nodeId ].justifyWidth || line.nodes[ nodeId ].width ) + width >= posX ){

                node = line.nodes[ nodeId ];

                for( nodeChar = 0; nodeChar < node.string.length; ){
                    
                    if( node.justifyCharList ){

                        if( node.justifyCharList[ nodeChar ] - ( ( node.justifyCharList[ nodeChar ] - ( node.justifyCharList[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX ){
                            break;
                        }

                    }else{

                        if( node.chars[ nodeChar ] - ( ( node.chars[ nodeChar ] - ( node.chars[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX ){
                            break;
                        }

                    }

                    nodeChar++;
                    lineChar++;

                }

                break;

            }

            lineChar += line.nodes[ nodeId ].string.length;
            width    += line.nodes[ nodeId ].justifyWidth || line.nodes[ nodeId ].width;
            nodeId   += 1;

        }

        if( !node ){

            lineChar = line.totalChars;
            nodeId   = line.nodes.length - 1;
            node     = line.nodes[ nodeId ];
            nodeChar = node.string.length;

        }

    }

    if( nodeChar === 0 ){

        if( nodeId === 0 ){

            if( lineId === 0 ){

                if( paragraphId === 0 ){

                    if( pageId !== 0 ){

                        pageId      = pageId - 1;
                        page        = currentDocument.pages[ pageId ];
                        paragraphId = page.paragraphs.length - 1;
                        paragraph   = page.paragraphs[ paragraphId ];
                        lineId      = paragraph.lines.length - 1;
                        line        = paragraph.lines[ lineId ];
                        lineChar    = line.totalChars;
                        nodeId      = line.nodes.length - 1;
                        node        = line.nodes[ nodeId ];
                        nodeChar    = node.string.length;
                    }

                }else{

                    paragraphId = paragraphId - 1;
                    paragraph   = page.paragraphs[ paragraphId ];
                    lineId      = paragraph.lines.length - 1;
                    line        = paragraph.lines[ lineId ];
                    lineChar    = line.totalChars;
                    nodeId      = line.nodes.length - 1;
                    node        = line.nodes[ nodeId ];
                    nodeChar    = node.string.length;
       
                }

            }else{

                lineId   = lineId - 1;
                line     = paragraph.lines[ lineId ];
                lineChar = line.totalChars;
                nodeId   = line.nodes.length - 1;
                node     = line.nodes[ nodeId ];
                nodeChar = node.string.length;

            }

        }else{

            nodeId   = nodeId - 1;
            node     = line.nodes[ nodeId ];
            nodeChar = node.string.length;

        }

    }

    setRange(

        selectionStart,

        {

            pageId      : pageId,
            page        : page,
            paragraphId : paragraphId,
            paragraph   : paragraph,
            lineId      : lineId,
            line        : line,
            lineChar    : lineChar,
            nodeId      : nodeId,
            node        : node,
            nodeChar    : nodeChar

        }

    );

})

// Controlador de mouse
.on( 'mousemove', function(e){

    var offset   = canvasCursor.canvas.offset();
    var posX     = e.pageX - offset.left;
    var posY     = e.pageY - offset.top;
    var heritage = 0;

    for( var pageId = 0; pageId < currentDocument.pages.length; pageId++ ){

        if( currentDocument.pages[ pageId ].height + heritage - scrollTop >= posY ){
            break;
        }

        if( currentDocument.pages[ pageId ].height + GAP + heritage - scrollTop >= posY ){
            pageId = null;
            break;
        }

        heritage += currentDocument.pages[ pageId ].height + GAP;

    }

    var page = currentDocument.pages[ pageId ];

    if( !page || pageId === null ){

        if( currentMouse !== MOUSE_NORMAL ){

            canvasCursor.canvas
                .addClass( MOUSE_STATUS[ MOUSE_NORMAL ].add )
                .removeClass( MOUSE_STATUS[ MOUSE_NORMAL ].remove );

            currentMouse = MOUSE_NORMAL;

        }

        return;

    }

    if(
        posX <= page.marginLeft ||
        posX >  page.width - page.marginRight ||
        currentDocument.pages[ pageId ].marginTop + heritage - scrollTop >= posY ||
        currentDocument.pages[ pageId ].height - currentDocument.pages[ pageId ].marginBottom + heritage - scrollTop < posY
    ){

        if( currentMouse !== MOUSE_NORMAL ){

            canvasCursor.canvas
                .addClass( MOUSE_STATUS[ MOUSE_NORMAL ].add )
                .removeClass( MOUSE_STATUS[ MOUSE_NORMAL ].remove );

            currentMouse = MOUSE_NORMAL;

        }

        return;

    }

    if( currentMouse !== MOUSE_TEXT ){

        canvasCursor.canvas
            .addClass( MOUSE_STATUS[ MOUSE_TEXT ].add )
            .removeClass( MOUSE_STATUS[ MOUSE_TEXT ].remove );

        currentMouse = MOUSE_TEXT;

    }

})

.on( 'mouseup', function(){

    selectionEnabled = false;

    updateToolsLineStatus();

});

// Input
input
.on( 'keydown', function( e ){

    if( e.ctrlKey || e.metaKey ){
        return;
    }

    if( e.keyCode === KEY_TAB ){
        
        handleChar('\t');
        canvasPages.requestDraw();
        e.preventDefault();

    }else if( e.keyCode === KEY_ARROW_LEFT ){

        handleArrowLeft();

        keydownHandled = true;

    }else if( e.keyCode === KEY_ARROW_UP ){

        handleArrowUp();

        keydownHandled = true;

    }else if( e.keyCode === KEY_ARROW_RIGHT ){

        handleArrowRight();

        keydownHandled = true;

    }else if( e.keyCode === KEY_ARROW_DOWN ){

        handleArrowDown();

        keydownHandled = true;

    }else if( e.keyCode === KEY_BACKSPACE ){

        handleBackspace();
        canvasPages.requestDraw();

        keydownHandled = true;

    }else if( e.keyCode === KEY_DEL ){

        handleDel();
        canvasPages.requestDraw();

        keydownHandled = true;

    }

})

.on( 'keypress', function(e){

    if( e.ctrlKey || e.metaKey ){
        return;
    }

    if( compositionEnded && e.which === KEY_BACKSPACE ){

        handleBackspace();
        canvasPages.requestDraw();

    }else if( e.key && e.key.length === 1 ){

        // Este método solo funcionaba en Firefox cuando se escribió. Aunque Firefox es compatible
        // con el método del setTimeout para recuperar lo tecleado, este caso es mucho más rápido,
        // permitiendo que Firefox sea el navegador más eficiente a la hora de teclear

        handleChar( e.key );
        canvasPages.requestDraw();
        e.preventDefault();

    }else if( compositionEnded && e.keyCode === KEY_ARROW_LEFT ){
        handleArrowLeft();
    }else if( compositionEnded && e.keyCode === KEY_ARROW_UP ){
        handleArrowUp();
    }else if( compositionEnded && e.keyCode === KEY_ARROW_RIGHT ){
        handleArrowRight();
    }else if( compositionEnded && e.keyCode === KEY_ARROW_DOWN ){
        handleArrowDown();
    }else if( e.keyCode === KEY_ENTER ){

        handleEnter();
        canvasPages.requestDraw();

    }else if( compositionEnded && e.keyCode === KEY_DEL ){

        handleDel();
        canvasPages.requestDraw();

    }else if( !waitingCheckLetter && !keydownHandled ){

        waitingCheckLetter = true;

        setTimeout( function(){

            if( input[ 0 ].value ){

                for( var i = 0; i < input[ 0 ].value.length; i++ ){
                    handleChar( input[ 0 ].value[ i ] );
                }
                
                canvasPages.requestDraw();

            }

            input[ 0 ].value   = '';
            waitingCheckLetter = false;

        }, 4 );

    }

    keydownHandled = false;

})

.on( 'keyup', function( e ){

    if( compositionEnded ){
        cleanComposition();
    }

    keydownHandled = false;

})

.on( 'compositionstart', function( e ){

    compositionCounter = 0;
    compositionEnded   = false;

})

.on( 'compositionupdate', function( e ){

    if( !compositionCounter++ ){

        handleChar( e.originalEvent.data );
        canvasPages.requestDraw();

    }
    
})

.on( 'compositionend', function( e ){

    handleBackspace();
    handleChar( e.originalEvent.data );
    cleanComposition( true );
    canvasPages.requestDraw();

    compositionCounter = 0;
    compositionEnded   = true;

});

// Color Panel
toolsLine
.on( 'click', '.tool-button-color', function(){

    toolsColorEnabled = true;

    toolsColorContainer
        .css({

            top     : $(this).position().top + $(this).outerHeight(),
            left    : $(this).position().left,
            display : 'block'

        });

    toolsColor.addClass('active-color');

})

.on( 'click', '.tool-button-color .color', function( e ){

    e.stopPropagation();
    input.focus();
    buttonAction[ $(this).attr('data-tool') ]( $(this).attr('data-tool-value') );

});

toolsColor
.on( 'mousedown', function( e ){
    e.stopPropagation();
})

.on( 'mouseenter', 'td', function(){

    var pos = $(this).position();

    // To Do -> Existe un problema con las tablas entre distintos navegadores.
    //          Firefox indica la posición de la celda sin contar los bordes (solo el contenido)
    //          Chrome si tiene en cuenta los bordes
    //          Ver posibles soluciones o ver si lo han arreglado en futuras release de jQuery

    if( BROWSER_TYPE === BROWSER_FIREFOX ){

        pos.top  = pos.top - parseInt( toolsColorHover.css('border-top-width'), 10 );
        pos.left = pos.left - parseInt( toolsColorHover.css('border-left-width'), 10 );

    }

    toolsColorHover.css({

        'background-color' : normalizeColor( $(this).css('background-color') ),
        top                : pos.top,
        left               : pos.left

    });

})

toolsColorHover.on( 'click', function(){

    toolsColorEnabled = false;

    if( toolsColor.hasClass('active-color') ){

        toolsColorContainer.css( 'display', 'none' );
        toolsColor.removeClass('active-color');

        toolsColorColor
            .attr( 'data-tool-value', normalizeColor( toolsColorHover.css('background-color') ) )
            .css( 'background-color', normalizeColor( toolsColorHover.css('background-color') ) )
            .click();

    }else if( toolsColor.hasClass('active-page-color') ){

        toolsColorContainer.css( 'display', 'none' );
        toolsColor.removeClass('active-page-color');

        setPagesStyle( 'pageBackgroundColor', normalizeColor( toolsColorHover.css('background-color') ) );

    }

});
