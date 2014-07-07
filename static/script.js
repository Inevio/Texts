/*global $:true */
/*global console:true*/
/*global requestAnimationFrame:true*/

'use strict';

// Constantes
var ALING_LEFT = 0;
var ALING_CENTER = 1;
var ALING_RIGHT = 2;
var ALING_JUSTIFY = 3;
var DEBUG = false;
var MARGIN_NORMAL = {

    top    : 94, //2.5 cm
    right  : 94, //2.5 cm
    bottom : 94, //2.5 cm
    left   : 94  //2.5 cm

};
var PAGE_A4 = {

    width  : 300,//794, // 21 cm
    height : 1122 // 29.7 cm

};

// DOM variables
var win          = $(this);
var header       = $('.wz-ui-header');
var toolsLine    = $('.tools-line');
var pages        = $('.pages');
var selections   = $('.selections');
var input        = $('.input');
var testZone     = $('.test-zone');
var canvasPages  = pages[ 0 ];
var canvasSelect = selections[ 0 ];
var ctx          = canvasPages.getContext('2d');
var ctxSel       = canvasSelect.getContext('2d');

// Node variables
var pageList = [];

// Realtime variables
var realtime      = null;
var usersActive   = {};
var usersPosition = {};
var usersEditing  = {};

// Blink variables
var blinkEnabled = false;
var blinkTime    = 0;
var blinkStatus  = 0;
var blinkCurrent = false;

// Selection variables
var selectionEnabled     = false;
var selectionStart       = null;
var selectedEnabled      = true;
var verticalKeysEnabled  = false;
var verticalKeysPosition = 0;

// Current variables
var currentPage           = null;
var currentPageId         = null;
var currentParagraph      = null;
var currentParagraphId    = null;
var currentLine           = null;
var currentLineId         = null;
var currentLineCharId     = null;
var currentNode           = null;
var currentNodeId         = null;
var currentNodeCharId     = null;
var currentStyle          = '12pt Helvetica';
var currentLineHeight     = null;
var positionAbsoluteX     = null;
var positionAbsoluteY     = null;
var currentRangeStart     = null;
var currentRangeEnd       = null;
var currentRangeStartHash = null;
var currentRangeEndHash   = null;

// Button actions
var buttonAction = {

    bold : function(){
        setRangeNodeStyle( 'font-weight', 'bold' );
    },

    italic : function(){
        setRangeNodeStyle( 'font-style', 'italic' );
    },

    left : function(){
        setRangeParagraphStyle( 'aling', ALING_LEFT );
    },

    center : function(){
        setRangeParagraphStyle( 'aling', ALING_CENTER );
    },

    right : function(){
        setRangeParagraphStyle( 'aling', ALING_RIGHT );
    },

    justify : function(){
        setRangeParagraphStyle( 'aling', ALING_JUSTIFY );
    }

};

var refrescos = 0;

setInterval( function(){
    //console.log( refrescos );
    refrescos = 0;
}, 1000 );

// Nodos Ready
// Nodos Char Ready
var checkCanvasPagesSize = function(){
    
    canvasPages.width  = pages.width();
    canvasPages.height = pages.height();

};

// Nodos Ready
// Nodos Char Ready
var checkCanvasSelectSize = function(){

    canvasSelect.width  = selections.width();
    canvasSelect.height = selections.height();

};

var compareNodeStyles = function( first, second ){

    var firstStyle  = $.extend( {}, first.style );
    var secondStyle = $.extend( {}, second.style );
    var firstKeys   = Object.keys( firstStyle );
    var totalKeys   = firstKeys.length;

    for( var i = 0; i < totalKeys; i++ ){

        if( firstStyle[ firstKeys[ i ] ] !== secondStyle[ firstKeys[ i ] ] ){
            return false;
        }

        delete firstStyle[ firstKeys[ i ] ];
        delete secondStyle[ firstKeys[ i ] ];

    }

    return Object.keys( secondStyle ).length === 0;

};

// Nodos Ready
var createLine = function( paragraph ){

    var line = newLine();

    // To Do -> Asignar la altura dinámicamente
    line.height = parseInt( testZone.css('line-height'), 10 );
    line.width  = paragraph.width;

    // Creamos el nodo inicial
    line.nodeList.push( createNode() );

    return line;

};

// Nodos Ready
var createNode = function(){

    var node = newNode();

    // To Do -> Asignar la altura dinámicamente
    node.height = parseInt( testZone.css('line-height'), 10 );

    return node;

};

// Nodos Ready
var createPage = function( pageInfo, marginInfo ){

    var page = newPage();

    pageList.push( page );

    // Definimos los atibutos
    page.width        = pageInfo.width;
    page.height       = pageInfo.height;
    page.marginTop    = marginInfo.top;
    page.marginRight  = marginInfo.right;
    page.marginBottom = marginInfo.bottom;
    page.marginLeft   = marginInfo.left;

    // Creamos el párrafo inicial
    page.paragraphList.push( createParagraph( page ) );

    return page;

};

// Nodos Ready
var createParagraph = function( page ){

    var paragraph = newParagraph();

    // To Do -> Alto de linea dinamico
    // To Do -> Ancho de linea dinamico
    paragraph.width = page.width - page.marginLeft - page.marginRight;

    // Creamos la línea inicial
    var line = createLine( paragraph );

    paragraph.lineList.push( line );

    paragraph.height += line.height;

    return paragraph;

};

var createWord = function(){

    return {

        string   : '',
        width    : 0,
        nodeList : [],
        offset   : []

    };

};

// Nodos Ready
// Nodos Char Ready
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

// Nodos Ready
// Nodos Char Ready
var debugTime = function( name ){

    if( DEBUG ){
        console.time( name );
    }
    
};

// Nodos Ready
// Nodos Char Ready
var debugTimeEnd = function( name ){
    
    if( DEBUG ){
        console.timeEnd( name );
    }
    
};

// Nodos Ready
var drawPages = function(){

    checkCanvasPagesSize();

    debugTime('draw');

    // To Do -> Soportar varias páginas

    // Draw the page
    var page = pageList[ 0 ];

    ctx.beginPath();
    ctx.rect( 20.5, 20.5, page.width, page.height );
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cacaca';
    ctx.stroke();

    // Draw the lines
    var paragraph = null;
    var line      = null;
    var node      = null;
    var wHeritage = 0;
    var hHeritage = 0;
    for( var i = 0; i < page.paragraphList.length; i++ ){

        paragraph = page.paragraphList[ i ];

        for( var j = 0; j < paragraph.lineList.length; j++ ){

            // To Do -> Gaps
            // To Do -> Altura de línea
            line = paragraph.lineList[ j ];
            
            if( !paragraph.aling ){
                wHeritage = 0;
            }else if( paragraph.aling === 1 ){
                wHeritage = ( line.width - getNodesWidth( line ) ) / 2;
            }else if( paragraph.aling === 2 ){
                wHeritage = line.width - getNodesWidth( line );
            }else{
                wHeritage = 0; // To Do -> Justificado
            }


            // To Do -> if( line.totalChars ){

                for( var k = 0; k < line.nodeList.length; k++ ){

                    node = line.nodeList[ k ];

                    ctx.fillStyle = '#000';

                    setStyle( node.style );

                    ctx.fillText(

                        node.string,
                        page.marginLeft + 20 + wHeritage,
                        page.marginTop + 20 + line.height + hHeritage

                    );

                    wHeritage += node.width;

                }

            //}

            hHeritage += line.height;

        }

    }

    debugTimeEnd('draw');

};

var drawRange = function( start, end ){

    // Calculamos la altura de inicio
    var startHeight = 0;
    var i;

    // Gap inicial
    startHeight += 20;

    // Calculamos la posición vertical de la página de inicio
    for( i = 0; i < start.pageId; i++ ){

        // Gap
        startHeight += 20;
        startHeight += pageList[ i ].height;

    }

    // Tenemos en cuenta el margen superior
    startHeight += start.page.marginTop;

    // Calculamos la posición vertical del párrafo de inicio
    for( i = 0; i < start.paragraphId; i++ ){
        startHeight += start.page.paragraphList[ i ].height;
    }

    // Calculamos la posición vertical de la linea de inicio
    for( i = 0; i < start.lineId; i++ ){
        startHeight += start.paragraph.lineList[ i ].height;
    }

    // Calculamos el ancho de inicio
    var startWidth = 0;

    // Gap inicial
    startWidth += 20;

    // Margen izquierdo
    startWidth += start.page.marginLeft;

    // Posición del caracter
    for( i = 0; i < start.nodeId; i++ ){
        startWidth += start.line.nodeList[ i ].width;
    }

    startWidth += start.node.charList[ start.nodeChar - 1 ] || 0;

    // Procedimiento de coloreado
    var width = 0;

    // Si principio y fin están en la misma linea
    if(
        start.pageId === end.pageId &&
        start.paragraphId === end.paragraphId &&
        start.lineId === end.lineId
    ){

        checkCanvasSelectSize();

        ctxSel.globalAlpha = 0.3;
        ctxSel.fillStyle = '#7EBE30';

        // Si el nodo inicial es el mismo que el final
        if( start.nodeId === end.nodeId ){
            width = end.node.charList[ end.nodeChar - 1 ] - ( start.node.charList[ start.nodeChar - 1 ] || 0 );
        }else{

            width += start.node.width - ( start.node.charList[ start.nodeChar - 1 ] || 0 );
            
            for( i = start.nodeId + 1; i < end.nodeId; i++ ){
                width += start.line.nodeList[ i ].width;
            }

            width += end.node.charList[ end.nodeChar - 1 ] || 0;
            
        }

        ctxSel.rect(

            startWidth,
            startHeight,
            width,
            start.line.height

        );

        ctxSel.fill();

        ctxSel.globalAlpha = 1;

    }else{

        checkCanvasSelectSize();

        ctxSel.globalAlpha = 0.3;
        ctxSel.fillStyle = '#7EBE30';

        // Coloreamos la linea del principio de forma parcial
        width = start.node.width - ( start.node.charList[ start.nodeChar - 1 ] || 0 );
            
        for( i = start.nodeId + 1; i < end.nodeId; i++ ){
            width += start.line.nodeList[ i ].width;
        }

        ctxSel.beginPath();
        ctxSel.rect(

            startWidth,
            startHeight,
            width,
            start.line.height

        );

        ctxSel.fill();

        startHeight += start.line.height;

        // Coloreamos las lineas intermedias de forma completa
        mapRangeLines( false, start, end, function( pageId, page, paragraphId, paragraph, lineId, line ){

            width = 0;

            // Obtenemos el tamaño de rectangulo a colorear
            for( var n = 0; n < line.nodeList.length; n++ ){
                width += line.nodeList[ n ].width;
            }

            // Coloreamos la línea
            ctxSel.beginPath();
            ctxSel.rect(

                20 + end.page.marginLeft,
                startHeight,
                width,
                end.line.height

            );

            ctxSel.fill();
            
            startHeight += line.height;

        });

        // Coloreamos la línea del final de forma parcial
        width = 0;

        for( i = 0 + 1; i < end.nodeId; i++ ){
            width += end.line.nodeList[ i ].width;
        }

        // To Do -> Que debe pasar si es se coge el fallback 0?
        width += end.node.charList[ end.nodeChar - 1 ] || 0;

        ctxSel.beginPath();
        ctxSel.rect(

            20 + end.page.marginLeft,
            startHeight,
            width,
            end.line.height

        );

        ctxSel.fill();

        ctxSel.globalAlpha = 1;

    }

};

var getCommonStyles = function( start, end ){

    // Comprobamos si es el mismo nodo, es una optimización
    if(

        start.pageId === end.pageId &&
        start.paragraphId === end.paragraphId &&
        start.lineId === end.lineId &&
        start.nodeId === end.nodeId
    ){
        return start.node.style;
    }

    var style         = $.extend( {}, start.node.style );
    var styleCounter = Object.keys( style ).length;

    // Recorremos todos los elementos seleccionados
    var page, paragraph, line, node;

    // Las páginas
    for( var pageId = start.pageId; pageId <= end.pageId; pageId++ ){

        page = pageList[ pageId ];

        // Los párrafos
        for( var paragraphId = start.paragraphId; paragraphId <= end.paragraphId; paragraphId++ ){

            paragraph = page.paragraphList[ paragraphId ];

            // Las líneas
            for( var lineId = start.lineId; lineId <= end.lineId; lineId++ ){

                line = paragraph.lineList[ lineId ];

                // Los nodos
                for( var nodeId = start.nodeId; nodeId <= end.nodeId; nodeId++ ){

                    node = line.nodeList[ nodeId ];

                    for( var i in style ){

                        if( style[ i ] !== node.style[ i ] ){

                            delete style[ i ];
                            styleCounter--;

                            if( !styleCounter ){
                                return {};
                            }

                        }

                    }

                }

            }

        }

    }

    return style;

};

// Nodos Ready
var getNodesWidth = function( line, offset ){

    if( typeof offset === 'undefined' ){
        offset = line.nodeList.length;
    }

    var list  = line.nodeList.slice( 0, offset );
    var total = 0;

    for( var i = 0; i < list.length; i++ ){
        total += list[ i ].width;
    }

    return total;

};

var getNodeInPosition = function( line, lineChar ){

    var result   = { nodeId : 0, nodeChar : 0 };
    var nodeChar = lineChar;

    for( var i = 0; i < line.nodeList.length; i++ ){

        if( line.nodeList[ i ].string.length >= nodeChar ){
            break;
        }

        nodeChar -= line.nodeList[ i ].string.length;

    }

    result.nodeId   = i;
    result.nodeChar = nodeChar;

    return result;

};

var getWordsMetrics = function( line ){

    var nodeList = line.nodeList;
    var result   = [];
    var words, breakedWord, currentWord, offset, position, i, j;

    for( i = 0; i < nodeList.length; i++ ){

        offset = 0;
        words  = nodeList[ i ].string.match(/(\s*\S+\s*)/g);

        for( j = 0; j < words.length; j++ ){

            if( breakedWord ){

                currentWord.string += words[ j ];
                currentWord.width  += ( nodeList[ i ].charList[ offset + words[ j ].length - 1 ] || 0 ) - ( nodeList[ i ].charList[ offset - 1 ] || 0 );

                currentWord.offset.push( [ offset, offset + currentWord.string.length - 1 ] );
                currentWord.nodeList.push( i );

                offset += currentWord.string.length;

                if( words[ j ].indexOf(' ') > -1 || i === nodeList.length - 1 ){
                    result.push( currentWord );
                }else{
                    breakedWord = false;
                }
                
                continue;

            }

            currentWord          = createWord();
            currentWord.string   = words[ j ];
            currentWord.width    = ( nodeList[ i ].charList[ offset + words[ j ].length - 1 ] || 0 ) - ( nodeList[ i ].charList[ offset - 1 ] || 0 );
            currentWord.nodeList = [ i ];

            currentWord.offset.push( [ offset, offset + currentWord.string.length - 1 ] );

            offset += currentWord.string.length;

            if( words[ j ].indexOf(' ') > -1 || i === nodeList.length - 1 ){
                result.push( currentWord );
            }else{
                breakedWord = true;
            }

        }

    }

    return result;

};

// Nodos Ready
// Nodos Char Ready
var handleArrowDown = function(){

    var pageId, paragraphId, lineId, lineChar, nodeId, nodeChar, nodeList, charList;

    // Comprobamos si es la última línea del párrafo
    if( currentLineId === currentParagraph.lineList.length - 1 ){

        // Comprobamos si es el último párrafo de la página
        if( currentParagraphId === currentPage.paragraphList.length - 1 ){

            // Comprobamos si es la última página del documento
            if( currentPageId === pageList.length - 1 ){
                return;
            }else{

                pageId      = currentPageId + 1;
                paragraphId = 0;
                lineId      = 0;

            }

        }else{

            pageId      = currentPageId;
            paragraphId = currentParagraphId + 1;
            lineId      = 0;

        }

    }else{

        pageId      = currentPageId;
        paragraphId = currentParagraphId;
        lineId      = currentLineId + 1;

    }

    // Si no estaba activado el modo de teclas verticales lo activamos
    if( !verticalKeysEnabled ){
        
        verticalKeysEnabled  = true;
        verticalKeysPosition = currentNode.charList[ currentNodeCharId ];

        for( var k = 0; k < currentNodeId; k++ ){
            verticalKeysPosition += currentLine.nodeList[ k ].width;
        }

    }

    // Buscamos el nuevo caracter
    nodeList = pageList[ pageId ].paragraphList[ paragraphId ].lineList[ lineId ].nodeList;
    lineChar = 0;

    for( var i = 0; i < nodeList.length; i++ ){

        if( nodeList[ i ].width < verticalKeysPosition ){
            lineChar += nodeList[ i ].string.length;
            continue;
        }

        nodeId   = i;
        charList = nodeList[ i ].charList;

        for( var j = 0; j < charList.length; j++ ){

            if( charList[ j ] > verticalKeysPosition ){
                nodeChar = j - 1;
                break;
            }else if( j === charList.length - 1 ){
                nodeChar = j + 1;
                break;
            }

        }

        lineChar += nodeChar;

        break;

    }

    setCursor( pageId, paragraphId, lineId, lineChar, nodeId, nodeChar );
    resetBlink();

};

// Nodos Ready
// Nodos Char Ready
var handleArrowLeft = function(){

    verticalKeysEnabled = false;

    if( currentRangeStart ){
        
        setCursor( currentRangeStart.pageId, currentRangeStart.paragraphId, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.nodeId, currentRangeStart.nodeChar );
        resetBlink();
        return;

    }

    // Principio del nodo
    if( currentNodeCharId === 0 || ( currentNodeId > 0 && currentNodeCharId === 1 ) ){

        var page, paragraph, line, lineChar, node, nodeChar;

        // Principio de linea
        if( currentLineCharId === 0 ){

            // Principio del documento, lo comprobamos antes porque es un caso especial
            if( !currentPageId && !currentParagraphId && !currentLineId ){
                return;
            }

            // Principio de párrafo
            if( currentLineId === 0 ){

                // Principio de página
                if( currentParagraphId === 0){

                    page      = currentPageId - 1;
                    paragraph = pageList[ page ].paragraphList.length - 1;
                    line      = pageList[ page ].paragraphList[ paragraph ].lineList.length - 1;
                    lineChar  = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].totalChars;
                    node      = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].nodeList.length - 1;
                    nodeChar  = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].nodeList[ node ].string.length;

                }else{

                    page      = currentPageId;
                    paragraph = currentParagraphId - 1;
                    line      = currentPage.paragraphList[ paragraph ].lineList.length - 1;
                    lineChar  = currentPage.paragraphList[ paragraph ].lineList[ line ].totalChars;
                    node      = currentPage.paragraphList[ paragraph ].lineList[ line ].nodeList.length - 1;
                    nodeChar  = currentPage.paragraphList[ paragraph ].lineList[ line ].nodeList[ node ].string.length;

                }

            }else{

                page      = currentPageId;
                paragraph = currentParagraphId;
                line      = currentLineId - 1;
                lineChar  = currentParagraph.lineList[ line ].totalChars;
                node      = currentParagraph.lineList[ line ].nodeList.length - 1;
                nodeChar  = currentParagraph.lineList[ line ].nodeList[ node ].string.length;

            }

        }else{

            // To Do -> Este caso se puede optimizar y no meter en un setCursor
            page      = currentPageId;
            paragraph = currentParagraphId;
            line      = currentLineId;
            lineChar  = currentLineCharId - 1;
            node      = currentNodeId - 1;
            nodeChar  = currentLine.nodeList[ node ].string.length;

        }

        setCursor( page, paragraph, line, lineChar, node, nodeChar );

    }else{

        var prev = currentNode.charList[ currentNodeCharId - 2 ] || 0;
        var next = currentNode.charList[ currentNodeCharId - 1 ];

        positionAbsoluteX += prev - next;
        currentLineCharId--;
        currentNodeCharId--;

    }

    resetBlink();

};

// Nodos Ready
// Nodos Char Ready
var handleArrowRight = function(){

    verticalKeysEnabled = false;

    if( currentRangeEnd ){
        
        setCursor( currentRangeEnd.pageId, currentRangeEnd.paragraphId, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.nodeId, currentRangeEnd.nodeChar );
        resetBlink();
        return;

    }

    // Final del nodo
    if( currentNodeCharId === currentNode.string.length ){

        var page, paragraph, line, lineChar, node, nodeChar;

        // Final de linea
        if( currentLineCharId === currentLine.totalChars ){

            // Final de párrafo
            if( currentLineId === currentParagraph.lineList.length - 1 ){

                // Final de página
                if( currentParagraphId === currentPage.paragraphList.length -1 ){

                    // Final de documento
                    if( currentPageId === pageList.length - 1 ){
                        return;
                    }

                    page      = currentPageId + 1;
                    paragraph = 0;
                    line      = 0;
                    lineChar  = 0;
                    node      = 0;
                    nodeChar  = 0;

                }else{

                    page      = currentPageId;
                    paragraph = currentParagraphId + 1;
                    line      = 0;
                    lineChar  = 0;
                    node      = 0;
                    nodeChar  = 0;

                }

            }else{

                page      = currentPageId;
                paragraph = currentParagraphId;
                line      = currentLineId + 1;
                lineChar  = 0;
                node      = 0;
                nodeChar  = 0;

            }

        }else{

            page      = currentPageId;
            paragraph = currentParagraphId;
            line      = currentLineId;
            lineChar  = currentLineCharId + 1;
            node      = currentNodeId + 1;
            nodeChar  = 1;

        }

        setCursor( page, paragraph, line, lineChar, node, nodeChar );

    }else{

        var prev = currentNode.charList[ currentNodeCharId - 1 ] || 0;
        var next = currentNode.charList[ currentNodeCharId ];

        positionAbsoluteX += next - prev;

        currentLineCharId++;
        currentNodeCharId++;

    }

    resetBlink();

};

// Nodos Ready
// Nodos Char Ready
var handleArrowUp = function(){

    var pageId, paragraphId, lineId, lineChar, nodeId, nodeChar, nodeList, charList;

    // Comprobamos si es la primera línea del párrafo
    if( currentLineId === 0 ){

        // Comprobamos si es el primer párrafo de la página
        if( currentParagraphId === 0 ){

            // Comprobamos si es el primer página del documento
            if( currentPageId === 0 ){
                return;
            }else{

                pageId      = currentPageId - 1;
                paragraphId = pageList[ pageId ].paragraphList.length - 1;
                lineId      = pageList[ pageId ].paragraphList[ paragraphId ].lineList.length - 1;

            }

        }else{

            pageId      = currentPageId;
            paragraphId = currentParagraphId - 1;
            lineId      = currentPage.paragraphList[ paragraphId ].lineList.length - 1;

        }

    }else{

        pageId      = currentPageId;
        paragraphId = currentParagraphId;
        lineId      = currentLineId - 1;

    }

    // Si no estaba activado el modo de teclas verticales lo activamos
    if( !verticalKeysEnabled ){
        
        verticalKeysEnabled  = true;
        verticalKeysPosition = currentNode.charList[ currentNodeCharId ];

        for( var k = 0; k < currentNodeId; k++ ){
            verticalKeysPosition += currentLine.nodeList[ k ].width;
        }

    }

    // Buscamos el nuevo caracter
    nodeList = pageList[ pageId ].paragraphList[ paragraphId ].lineList[ lineId ].nodeList;
    lineChar = 0;

    for( var i = 0; i < nodeList.length; i++ ){

        if( nodeList[ i ].width < verticalKeysPosition ){
            lineChar += nodeList[ i ].string.length;
            continue;
        }

        nodeId   = i;
        charList = nodeList[ i ].charList;

        for( var j = 0; j < charList.length; j++ ){

            if( charList[ j ] > verticalKeysPosition ){
                nodeChar = j - 1;
                break;
            }else if( j === charList.length - 1 ){
                nodeChar = j + 1;
                break;
            }

        }

        lineChar += nodeChar;

        break;

    }

    setCursor( pageId, paragraphId, lineId, lineChar, nodeId, nodeChar );
    resetBlink();

};

// Nodos Ready
// Nodos Char Ready
var handleBackspace = function(){

    verticalKeysEnabled = false;

    var prev, next, i, realocation;

    // Al principio del nodo
    if( currentNode.length === 1 && currentNodeCharId === 1 ){

        console.log('way 1', currentNode);

        var page, paragraph, line, lineChar, node, nodeChar;

        // Al principio de la línea
        if( /*currentLineId !== 0 &&*/ currentLineCharId === 0 ){

            // Principio del documento, lo comprobamos antes porque es un caso especial
            if( !currentPageId && !currentParagraphId && !currentLineId && !currentLineCharId ){
                return;
            }

            // Principio de párrafo
            if( currentLineId === 0 ){

                // Principio de página
                if( currentParagraphId === 0){

                    page      = currentPageId - 1;
                    paragraph = pageList[ page ].paragraphList.length - 1;
                    line      = pageList[ page ].paragraphList[ paragraph ].lineList.length - 1;
                    lineChar  = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].totalChars;
                    node      = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].nodeList.length - 1;
                    nodeChar  = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].nodeList[ node ].string.length;

                }else{

                    page      = currentPageId;
                    paragraph = currentParagraphId - 1;
                    line      = pageList[ page ].paragraphList[ paragraph ].lineList.length - 1;
                    lineChar  = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].totalChars;
                    node      = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].nodeList.length - 1;
                    nodeChar  = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].nodeList[ node ].string.length;

                }

            }else{

                page      = currentPageId;
                paragraph = currentParagraphId;
                line      = currentLineId - 1;
                lineChar  = currentParagraph.lineList[ line ].totalChars;
                node      = currentParagraph.lineList[ line ].nodeList.length - 1;
                nodeChar  = currentParagraph.lineList[ line ].nodeList[ node ].string.length;

            }

        }else{

            page      = currentPageId;
            paragraph = currentParagraphId;
            line      = currentLineId;
            lineChar  = currentLineCharId - 1;
            node      = currentNodeId - 1;
            nodeChar  = currentLine.nodeList[ node ].string.length - 1;

            currentLine.nodeList[ node ].string   = currentLine.nodeList[ node ].string.slice( 0, -1 );
            currentLine.nodeList[ node ].charList = currentLine.nodeList[ node ].charList.slice( 0, -1 );
            currentLine.nodeList[ node ].width    = currentLine.nodeList[ node ].charList.slice( -1 )[ 0 ] || 0;

            currentLine.totalChars--;

        }

        setCursor( page, paragraph, line, lineChar, node, nodeChar );

    }else{

        prev = currentNode.charList[ currentNodeCharId - 2 ] || 0;
        next = currentNode.charList[ currentNodeCharId - 1 ];

        currentNode.string = currentNode.string.slice( 0, currentNodeCharId - 1 ) + currentNode.string.slice( currentNodeCharId );
        // To Do -> realocation        = realocateLineInverse( currentLineId, currentLineCharId - 1 );

        if( realocation ){

            currentLineId--;

            currentLine   = currentParagraph.lineList[ currentLineId ];
            currentLineCharId = realocation;

            positionAbsoluteY -= currentLine.height;

            // Reiniciamos la posición horizontal
            positionAbsoluteX  = 20; // Gap
            positionAbsoluteX += currentPage.marginLeft;
            positionAbsoluteX += currentLine.charList[ currentLineCharId - 1 ];

            // To Do -> Total chars

        }else{

            positionAbsoluteX    += prev - next;
            currentNode.charList  = currentNode.charList.slice( 0, currentNodeCharId - 1 );

            setStyle( currentNode.style );

            for( i = currentNodeCharId; i <= currentNode.string.length; i++ ){
                currentNode.charList.push( ctx.measureText( currentNode.string.slice( 0, i ) ).width );
            }

            currentNode.width = currentNode.charList.slice( -1 )[ 0 ] || 0;

            currentLineCharId--;
            currentNodeCharId--;
            currentLine.totalChars--;

        }

        if( !currentNodeCharId ){

            setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );

            if( !currentLine.nodeList[ currentNodeId + 1 ] && !currentLine.nodeList[ currentNodeId + 1 ].string.length ){
                currentLine.nodeList = currentLine.nodeList.slice( 0, currentNodeId + 1 ).concat( currentLine.nodeList.slice( currentNodeId + 2 ) );
            }
            
        }

    }

    resetBlink();

};

// Nodos Ready
// Nodos Char Ready
var handleChar = function( newChar ){

    verticalKeysEnabled = false;

    /*
    // Final de linea -> Final del último nodo de la línea
    if(
        currentLine.nodeList.length - 1 === currentNodeId &&
        currentNode.string.length === currentLineCharId
    ){

        currentLine.totalChars++;

        currentNode.string += newChar;
        tmp                 = ctx.measureText( currentNode.string ).width;
        currentNode.width   = tmp;

        currentNode.charList.push( tmp );

        realocation = realocateLine( currentLineId );

        if( realocation ){

            currentLineId++;

            currentLine   = currentParagraph.lineList[ currentLineId ];
            currentNode   = currentLine.nodeList[ currentNodeId ];
            currentLineCharId = realocation;

            positionAbsoluteY += currentLine.height;

            // Reiniciamos la posición horizontal
            positionAbsoluteX  = 20; // Gap
            positionAbsoluteX += currentPage.marginLeft;
            positionAbsoluteX += currentNode.charList[ currentLineCharId - 1 ]; // To Do -> No siempre es el 0 y no se está cambiando

        }else{

            currentLineCharId++;

            prev = currentNode.charList[ currentLineCharId - 2 ] || 0;
            next = currentNode.charList[ currentLineCharId - 1 ];

            positionAbsoluteX += next - prev;

        }

    // Cualquier otra posición
    }else{
    */

        currentLine.totalChars++;

        currentNode.string   = currentNode.string.slice( 0, currentNodeCharId ) + newChar + currentNode.string.slice( currentNodeCharId );
        currentNode.charList = currentNode.charList.slice( 0, currentNodeCharId );

        setStyle( currentNode.style );

        for( var i = currentNodeCharId + 1; i <= currentNode.string.length; i++ ){
            currentNode.charList.push( ctx.measureText( currentNode.string.slice( 0, i ) ).width );
        }

        currentNode.width = currentNode.charList[ currentNode.charList.length - 1 ];
        var realocation   = realocateLine( currentLineId );

        if( realocation.lineChar ){

            currentLineId++;

            currentLine       = currentParagraph.lineList[ currentLineId ];
            currentNodeId     = 0;
            currentNode       = currentLine.nodeList[ 0 ];
            currentLineCharId = realocation.lineChar;
            currentNodeCharId = realocation.nodeChar;

            positionAbsoluteY += currentLine.height;

            // Reiniciamos la posición horizontal
            positionAbsoluteX  = 20; // Gap
            positionAbsoluteX += currentPage.marginLeft;
            positionAbsoluteX += currentNode.charList[ currentNodeCharId - 1 ];

        }else{

            currentLineCharId++;
            currentNodeCharId++;

            var prev = currentNode.charList[ currentNodeCharId - 2 ] || 0;
            var next = currentNode.charList[ currentNodeCharId - 1 ];

            positionAbsoluteX += next - prev;

        }

    /*}*/

    resetBlink();

};

var handleEnter = function(){

    verticalKeysEnabled = false;

    // To Do -> Comprobar que entra en la página

    var i;
    var newParagraph   = createParagraph( currentPage );
    var newParagraphId = currentParagraphId + 1;

    // Obtenemos las líneas a mover y el texto
    var movedLines = currentParagraph.lineList.slice( currentLineId + 1 );
    var newLine    = newParagraph.lineList[ 0 ];
    var newNode    = newLine.nodeList[ 0 ];

    // Clonamos el nodo actual
    newNode.string = currentNode.string.slice( currentNodeCharId );
    newNode.style  = $.extend( {}, currentNode.style );

    setStyle( newNode.style );

    for( i = 1; i <= newNode.string.length; i++ ){
        newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
    }

    newNode.width      = newNode.charList[ newNode.charList.length - 1 ];
    newLine.totalChars = newNode.string.length;

    // Eliminamos el contenido del nodo actual y actualizamos su tamaño
    currentNode.string     = currentNode.string.slice( 0, currentNodeCharId );
    currentNode.charList   = currentNode.charList.slice( 0, currentNodeCharId );
    currentNode.width      = currentNode.charList[ currentNode.charList.length - 1 ];
    currentLine.totalChars = currentLine.totalChars - newNode.string.length;

    // Movemos los nodos siguientes
    newLine.nodeList     = newLine.nodeList.concat( currentLine.nodeList.slice( currentNodeId + 1 ) );
    currentLine.nodeList = currentLine.nodeList.slice( 0, currentNodeId + 1 );

    // Movemos las líneas siguientes
    newParagraph.lineList     = newParagraph.lineList.concat( currentParagraph.lineList.slice( currentLineId + 1 ) );
    currentParagraph.lineList = currentParagraph.lineList.slice( 0, currentLineId + 1 );

    // Actualizamos las alturas del párrafo de origen y destino
    for( i = 0; i < movedLines.length; i++ ){

        currentParagraph.height -= movedLines[ i ].height;
        newParagraph.height     += movedLines[ i ].height;

    }

    // Insertamos el párrafo en su posición
    currentPage.paragraphList = currentPage.paragraphList.slice( 0, currentParagraphId + 1 ).concat( newParagraph ).concat( currentPage.paragraphList.slice( currentParagraphId + 1 ) );

    // Posicionamos el cursor
    setCursor( currentPageId, newParagraphId, 0, 0, 0, 0 );
    realocateLineInverse( 0, 0 );
    resetBlink();

};

var mapRangeLines = function( includeLimits, start, end, callback ){

    var pageLoop, pageLoopId, paragraphLoop, paragraphLoopId, lineLoopId, nodeLoopId, finalPage, finalParagraph, fakeEndLineId, j, k, m;

    // To Do
    /*
    if( includeLimits ){

        fakeEndLineId = end.lineId + 1;
        nodeLoopId = start.nodeId;

    }else{

        fakeEndLineId = end.lineId;
        nodeLoopId    = start.nodeId + 1;

    }
    */

    fakeEndLineId = end.lineId;
    nodeLoopId    = start.nodeId + 1;

    if( /*!includeLimits ||*/ !start.line.nodeList[ nodeLoopId ] ){

        lineLoopId = start.lineId + 1;
        nodeLoopId = 0;

        if( !start.paragraph.lineList[ lineLoopId ] ){

            paragraphLoopId = start.paragraphId + 1;
            lineLoopId      = 0;

            if( !start.page.paragraphList[ paragraphLoopId ] ){
                pageLoopId = start.pageId + 1;
            }else{
                pageLoopId = start.pageId;
            }

        }else{

            paragraphLoopId = start.paragraphId;
            pageLoopId      = start.pageId;

        }

    }else{

        lineLoopId      = start.lineId;
        paragraphLoopId = start.paragraphId;
        pageLoopId      = start.pageId;

    }

    // Recorremos las páginas
    for( j = pageLoopId; j <= end.pageId; j++ ){

        finalPage = j === end.pageId;
        pageLoop  = pageList[ j ];

        // Recorremos los párrafos
        for( k = paragraphLoopId; ( !finalPage && k < pageLoop.paragraphList.length ) || ( finalPage && k <= end.paragraphId ); k++ ){

            finalParagraph = finalPage && k === end.paragraphId;
            paragraphLoop  = pageLoop.paragraphList[ k ];

            // Recorremos las líneas
            for( m = lineLoopId; ( !finalParagraph && m < paragraphLoop.lineList.length ) || ( finalParagraph && m < fakeEndLineId ); m++ ){
                callback( j, pageLoop, k, paragraphLoop, m, paragraphLoop.lineList[ m ] );
            }

            lineLoopId = 0;

        }

        paragraphLoopId = 0;

    }

};

var mapRangeParagraphs = function( start, end, callback ){

    var pageLoop, pageLoopId, paragraphLoop, paragraphLoopId, finalPage, finalParagraph, j, k;

    paragraphLoopId = start.paragraphId;

    // Recorremos las páginas
    for( j = start.pageId; j <= end.pageId; j++ ){

        finalPage = j === end.pageId;
        pageLoop  = pageList[ j ];

        // Recorremos los párrafos
        for( k = paragraphLoopId; ( !finalPage && k < pageLoop.paragraphList.length ) || ( finalPage && k <= end.paragraphId ); k++ ){
            callback( j, pageLoop, k, pageLoop.paragraphList[ k ] );
        }

        paragraphLoopId = 0;

    }

};

// Nodos Ready
var newLine = function(){

    return {

        height     : 0,
        nodeList   : [],
        totalChars : 0,
        width      : 0

    };

};

// Nodos Ready
var newNode = function(){

    return {

        charList : [],
        height   : 0,
        string   : '',
        style    : {},
        width    : 0

    };

};

// Nodos Ready
var newPage = function(){
    
    return {

        height        : 0,
        marginBottom  : 0,
        marginLeft    : 0,
        marginRight   : 0,
        marginTop     : 0,
        paragraphList : [],
        width         : 0

    };

};

// Nodos Ready
var newParagraph = function(){

    return {

        aling     : ALING_LEFT,
        height    : 0,
        interline : 0,
        lineList  : [],
        width     : 0

    };

};

var realocateLine = function( id, propagated ){

    var line    = currentParagraph.lineList[ id ];
    var counter = { lineChar : 0, nodeChar : 0 };
    var i;

    if( getNodesWidth( line ) <= line.width ){

        /*
        // To Do -> ¿Esto sigue siendo útil=
        if( propagated ){

            line.charList = [];

            for( i = 1; i <= line.string.length; i++ ){
                line.charList.push( ctx.measureText( line.string.slice( 0, i ) ).width );
            }

        }
        */

        return counter;

    }

    var words, newLine, newNode, stop, j, k;

    // Nos hacemos con la nueva línea, si no existe la creamos
    if( !currentParagraph.lineList[ id + 1 ] ){

        newLine                   = createLine( currentParagraph );
        currentParagraph.height  += newLine.height;
        currentParagraph.lineList = currentParagraph.lineList.slice( 0, id + 1 ).concat( newLine ).concat( currentParagraph.lineList.slice( id + 1 ) );

    }else{
        newLine = currentParagraph.lineList[ id + 1 ];
    }

    // Comprobamos nodo por nodo que entra por el final (desde el último hasta el primero)
    for( i = line.nodeList.length - 1; i >= 0; i-- ){

        setStyle( line.nodeList[ i ].style );
        
        words = line.nodeList[ i ].string.match(/(\s*\S+\s*)/g); // Separamos conservando espacios

        // Comprobamos palabra por palabra que entra por el final (desde la última hasta la primera)
        for( j = words.length - 1; j >= 0; j-- ){

            if( getNodesWidth( line, i ) + ctx.measureText( trimRight( words.slice( 0, j ).join('') ) ).width <= line.width ){
                
                // Clonamos el nodo y modificamos padre e hijo
                newNode = createNode( line );

                line.nodeList[ i ].string   = words.slice( 0, j ).join('');
                line.nodeList[ i ].charList = line.nodeList[ i ].charList.slice( 0, line.nodeList[ i ].string.length );
                line.nodeList[ i ].width    = line.nodeList[ i ].charList[ line.nodeList[ i ].charList.length - 1 ];

                newNode.string   = words.slice( j ).join('');
                newNode.charList = [];

                for( k = 1; k <= newNode.string.length; k++ ){
                    newNode.charList.push( ctx.measureText( newNode.string.slice( 0, k ) ).width );
                }

                newNode.width       = newNode.charList[ newNode.charList.length - 1 ];
                newNode.style       = $.extend( {}, line.nodeList[ i ].style );
                newLine.nodeList    = [ newNode ];
                newLine.totalChars  = newNode.string.length;
                counter.lineChar   += newNode.string.length; // To Do -> Y si se estaba escribiendo en medio de la palabra?
                counter.nodeChar   += newNode.string.length; // To Do -> Y si se estaba escribiendo en medio de la palabra?
                stop                = true;

                break;

            }

        }

        // To Do -> Nodos por arrastre

        if( stop ){
            break;
        }

    }

    for( i = line.nodeList.length - 1, j = 0; i >= 0; i-- ){
        j += line.nodeList[ i ].string.length;
    }

    line.totalChars = j;

    realocateLine( id + 1, true );

    return counter;

};

var realocateLineInverse = function( id, modifiedChar ){

    var line    = currentParagraph.lineList[ id ];
    var counter = { lineChar : 0, nodeChar : 0 };
    var i, j, fitNodeChar, newNode, words;

    // Si la línea no existe se ignora
    if( !line ){
        return;
    }

    // Si es la primera línea de un párrafo
    if( !id ){

        realocateLineInverse( id + 1, 0 );
        return counter;

    }

    var prevLine = currentParagraph.lineList[ id - 1 ];

    // Comprobamos nodo por nodo que entra por el final
    for( i = 0; i < line.nodeList.length; i++ ){

        setStyle( line.nodeList[ i ].style );
        
        fitNodeChar = 0;
        words       = line.nodeList[ i ].string.match(/(\s*\S+\s*)/g); // Separamos conservando espacios

        // Comprobamos palabra por palabra que entra por el final (desde la última hasta la primera)
        for( j = 1; j <= words.length; j++ ){

            if( getNodesWidth( prevLine ) + ctx.measureText( trimRight( words.slice( 0, j ).join('') ) ).width <= prevLine.width ){
                fitNodeChar = words.slice( 0, j ).join('').length;
            }else{
                j--;
                break;
            }

        }

        if( !fitNodeChar ){
            break;
        }

        // Si entra el nodo entero lo movemos
        if( j === words.length ){
            // To Do -> Comprobar si este caso se da alguna vez
            console.log('to do');
        }else{

            // Clonamos el nodo y modificamos padre e hijo
            newNode = $.extend( {}, line.nodeList[ i ] );

            newNode.string      = words.slice( 0, j ).join('');
            newNode.charList    = line.nodeList[ i ].charList.slice( 0, fitNodeChar );
            newNode.width       = newNode.charList[ newNode.charList.length - 1 ];
            prevLine.totalChars = prevLine.totalChars + newNode.string.length;

            prevLine.nodeList.push( newNode );

            line.totalChars             = line.totalChars - newNode.string.length;
            line.nodeList[ i ].string   = line.nodeList[ i ].string.slice( fitNodeChar );
            line.nodeList[ i ].charList = [];

            for( j = 1; j <= line.nodeList[ i ].string.length; j++ ){
                line.nodeList[ i ].charList.push( ctx.measureText( line.nodeList[ i ].string.slice( 0, j ) ).width );
            }

            line.nodeList[ i ].width = line.nodeList[ i ].charList[ line.nodeList[ i ].charList.length - 1 ];

        }

    }

    return counter;

};

// Nodos Ready
var resetBlink = function(){

    blinkTime    = Date.now().
    blinkStatus  = 0;
    blinkCurrent = false;

    if( selectedEnabled ){

        selectedEnabled = false;
        updateBlink();

    }

};

// Nodos Ready
// Nodos Char Ready
var start = function(){

    input.focus();
    createPage( PAGE_A4, MARGIN_NORMAL );
    setCursor( 0, 0, 0, 0, 0, 0 );
    drawPages();

};

var setCursor = function( page, paragraph, line, lineChar, node, nodeChar, force ){

    currentRangeStart     = null;
    currentRangeEnd       = null;
    currentRangeStartHash = null;
    currentRangeEndHash   = null;

    // Ignoramos si el cursor se vuelve a poner en el mismo sitio
    if(
        currentPageId === page &&
        currentParagraphId === paragraph &&
        currentLineId === line &&
        currentNodeId === node &&
        currentLineCharId === lineChar &&
        !force
    ){
        return;
    }

    var i;

    // Actualizamos solo los campos que sean necesarios
    if( currentPageId !== page ){
        currentPage = pageList[ page ];
    }

    if( currentPageId !== page || currentParagraphId !== paragraph ){
        currentParagraph = currentPage.paragraphList[ paragraph ];
    }

    if( currentPageId !== page || currentParagraphId !== paragraph || currentLineId !== line ){

        currentLine       = currentParagraph.lineList[ line ];
        currentLineHeight = currentLine.height;

    }

    /*
    if( node > 0 && nodeChar === 0 ){
        nodeChar = 1;
    }
    
    // Comprobamos que si debemos movernos a otro nodo
    console.log( currentLine, node, nodeChar );
    */

    // Comprobamos que estamos en la posición del nodo correcta
    if( node > 0 && nodeChar === 0 ){
        
        node     = node - 1;
        nodeChar = currentLine.nodeList[ node ].string.length;

    }

    // Actualizamos el nodo si es necesario
    if( currentPageId !== page || currentParagraphId !== paragraph || currentLineId !== line || currentNodeId !== node ){
        currentNode = currentLine.nodeList[ node ];
    }

    // Calculamos la posición vertical si es necesario
    if(
        currentPageId !== page ||
        currentParagraphId !== paragraph ||
        currentLineId !== line
    ){

        // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
        positionAbsoluteY = 0;

        // Gap inicial
        positionAbsoluteY += 20;

        // Tamaño de cada página
        for( i = 0; i < page; i++ ){
            positionAbsoluteY += pageList[ i ].height;
            // To Do -> Gaps entre páginas
        }

        // Márgen superior
        positionAbsoluteY += currentPage.marginTop;

        // Tamaño de cada párrafo
        for( i = 0; i < paragraph; i++ ){
            positionAbsoluteY += currentPage.paragraphList[ i ].height;
            // To Do -> Gaps entre páginas
        }

        // Tamaño de cada línea
        for( i = 0; i < line; i++ ){
            positionAbsoluteY += currentParagraph.lineList[ i ].height;
            // To Do -> Gaps entre páginas
        }

    }

    // Calculamos la posición horizontal si es necesario
    if(
        currentPageId !== page ||
        currentParagraphId !== paragraph||
        currentLineId !== line ||
        currentNodeId !== node ||
        currentLineCharId !== lineChar
    ){

        // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
        positionAbsoluteX = 0;

        // Gap inicial
        positionAbsoluteX += 20;

        // Márgen superior
        positionAbsoluteX += currentPage.marginLeft;

        // Posicion dentro de la linea
        for( i = 0; i < node; i++ ){
            positionAbsoluteX += currentLine.nodeList[ i ].width;
        }

        if( nodeChar > 0 ){
            positionAbsoluteX += currentNode.charList[ nodeChar - 1 ];
        }

    }
    
    currentPageId      = page;
    currentParagraphId = paragraph;
    currentLineId      = line;
    currentLineCharId  = lineChar;
    currentNodeId      = node;
    currentNodeCharId  = nodeChar;

    resetBlink();
    
};

var setRange = function( start, end ){

    // To Do -> Podemos pasarle las coordenadas para evitar cálculos
    // To Do -> Si no se le pueden pasar las coordenadas podemos utilizar los bucles para las dos alturas

    var startHash = [ start.pageId, start.paragraphId, start.lineId, start.lineChar ];
    var endHash   = [ end.pageId, end.paragraphId, end.lineId, end.lineChar ];

    // Si son iguales no es un rango
    if( compareHashes( startHash, endHash ) === 0 ){
        resetBlink();
        return;
    }

    // Ordenamos los inputs
    if( compareHashes( startHash, endHash ) === -1 ){

        var tmp;

        tmp       = start;
        start     = end;
        end       = tmp;
        tmp       = startHash;
        startHash = endHash;
        endHash   = tmp;
        tmp       = null;

    }

    if(
        currentRangeStartHash &&
        currentRangeEndHash &&
        compareHashes( currentRangeStartHash, startHash ) === 0 &&
        compareHashes( currentRangeEndHash, endHash ) === 0
    ){
        return;
    }

    selectedEnabled       = true;
    currentRangeStart     = start;
    currentRangeEnd       = end;
    currentRangeStartHash = startHash;
    currentRangeEndHash   = endHash;

    drawRange( start, end );

};

var setRangeNodeStyle = function( key, value, propagated ){

    // To Do -> Varias lineas
    var i, newNode, endNode, newPositions;

    // Mismo nodo
    if(
        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId &&
        currentRangeStart.nodeId === currentRangeEnd.nodeId
    ){

        // Si es todo el nodo
        if( currentRangeStart.nodeChar === 0 && currentRangeEnd.nodeChar === currentRangeEnd.node.string.length ){

            newNode              = currentRangeStart.node;
            newNode.style[ key ] = value;
            newNode.charList     = [];

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Si comienza por el principio del nodo
        }else if( currentRangeStart.nodeChar === 0 ){

            newNode                         = createNode( currentLine );
            newNode.string                  = currentRangeStart.node.string.slice( currentRangeStart.nodeChar, currentRangeEnd.nodeChar );
            newNode.style                   = $.extend( {}, currentRangeStart.node.style );
            newNode.style[ key ]            = value;
            currentRangeStart.node.string   = currentRangeStart.node.string.slice( currentRangeEnd.nodeChar );
            currentRangeStart.node.charList = [];

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            setStyle( currentRangeStart.node.style );

            for( i = 1; i <= currentRangeStart.node.string.length; i++ ){
                currentRangeStart.node.charList.push( ctx.measureText( currentRangeStart.node.string.slice( 0, i ) ).width );
            }

            currentRangeStart.node.width    = currentRangeStart.node.charList[ i - 2 ] || 0;
            currentRangeStart.line.nodeList = [ newNode ].concat( currentRangeStart.line.nodeList.slice( currentRangeStart.nodeId ) );
            
            newPositions = getNodeInPosition( currentRangeEnd.line, currentRangeEnd.lineChar );

            currentRangeEnd.nodeId   = newPositions.nodeId;
            currentRangeEnd.node     = currentRangeEnd.line.nodeList[ currentRangeEnd.nodeId ];
            currentRangeEnd.nodeChar = newPositions.nodeChar;

        // Si termina por el final del nodo
        }else if( currentRangeEnd.nodeChar === currentRangeEnd.node.string.length ){
            
            newNode                         = createNode( currentLine );
            newNode.string                  = currentRangeStart.node.string.slice( currentRangeStart.nodeChar );
            newNode.style                   = $.extend( {}, currentRangeStart.node.style );
            newNode.style[ key ]            = value;
            currentRangeStart.node.string   = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
            currentRangeStart.node.charList = currentRangeStart.node.charList.slice( 0, currentRangeStart.nodeChar );

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            currentRangeStart.node.width    = currentRangeStart.node.charList[ currentRangeStart.node.string.length - 1 ] || 0;
            currentRangeStart.line.nodeList = currentRangeStart.line.nodeList.concat( newNode );
            currentNode                     = currentRangeStart.line.nodeList[ currentNodeId ];

            currentRangeStart.nodeId   = currentRangeStart.nodeId + 1;
            currentRangeStart.node     = currentRangeStart.line.nodeList[ currentRangeStart.nodeId ];
            currentRangeStart.nodeChar = 0;

        // El resto de casos
        }else{

            newNode                         = createNode( currentLine );
            endNode                         = createNode( currentLine );
            newNode.string                  = currentRangeStart.node.string.slice( currentRangeStart.nodeChar, currentRangeEnd.nodeChar );
            newNode.style                   = $.extend( {}, currentRangeStart.node.style );
            newNode.style[ key ]            = value;
            endNode.string                  = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
            endNode.style                   = $.extend( {}, currentRangeEnd.node.style );
            currentRangeStart.node.string   = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
            currentRangeStart.node.charList = currentRangeStart.node.charList.slice( 0 , currentRangeStart.nodeChar );
            currentRangeStart.node.width    = currentRangeStart.node.charList[ currentRangeStart.node.charList.length - 1 ];

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            setStyle( endNode.style );

            for( i = 1; i <= endNode.string.length; i++ ){
                endNode.charList.push( ctx.measureText( endNode.string.slice( 0, i ) ).width );
            }

            endNode.width                   = endNode.charList[ i - 2 ] || 0;
            currentRangeStart.line.nodeList = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId + 1 ).concat( newNode ).concat( endNode ).concat( currentRangeStart.line.nodeList.slice( currentRangeStart.nodeId + 1 ) );
            currentNode                     = currentRangeStart.line.nodeList[ currentRangeStart.nodeId ];

            var newPositionsStart = getNodeInPosition( currentRangeStart.line, currentRangeStart.lineChar );
            var newPositionsEnd   = getNodeInPosition( currentRangeEnd.line, currentRangeEnd.lineChar );

            currentRangeStart.nodeId   = newPositionsStart.nodeId;
            currentRangeStart.node     = currentRangeStart.line.nodeList[ currentRangeStart.nodeId ];
            currentRangeStart.nodeChar = newPositionsStart.nodeChar;
            currentRangeEnd.nodeId     = newPositionsEnd.nodeId;
            currentRangeEnd.node       = currentRangeEnd.line.nodeList[ currentRangeEnd.nodeId ];
            currentRangeEnd.nodeChar   = newPositionsEnd.nodeChar;

        }

    // Varios nodos, misma linea
    }else if(

        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId

    ){

        // Tratamiento del primer nodo
        // Comprobamos si es una selección completa del nodo
        if( currentRangeStart.nodeChar === 0 && currentRangeStart.nodeChar === currentRangeStart.node.string.length ){

            newNode = currentRangeStart.node;

            newNode.style[ key ] = value;
            newNode.charList     = [];

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Es parcial
        }else{
            
            newNode              = createNode( currentRangeStart.line );
            newNode.string       = currentRangeStart.node.string.slice( currentRangeStart.nodeChar );
            newNode.style        = $.extend( {}, currentRangeStart.node.style );
            newNode.style[ key ] = value;

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            currentRangeStart.node.string   = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
            currentRangeStart.node.charList = currentRangeStart.node.charList.slice( 0, currentRangeStart.nodeChar );
            currentRangeStart.node.width    = currentRangeStart.node.charList[ currentRangeStart.nodeChar - 1 ];
            currentRangeStart.line.nodeList = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId + 1 ).concat( newNode ).concat( currentRangeStart.line.nodeList.slice( currentRangeStart.nodeId + 1 ) );
            currentRangeStart.nodeId        = currentRangeStart.nodeId + 1;
            currentRangeStart.nodeChar      = 0;
            currentRangeStart.node          = currentRangeStart.line.nodeList[ currentRangeStart.nodeId ];
            currentRangeEnd.nodeId          = currentRangeEnd.nodeId + 1;

        }

        // Nodos intermedios
        for( i = currentRangeStart.nodeId + 1; i < currentRangeEnd.nodeId; i++ ){

            newNode = currentRangeStart.line.nodeList[ i ];

            newNode.style[ key ] = value;
            newNode.charList     = [];

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        }

        // Tratamiento del último nodo
        // Comprobamos si es una selección completa del nodo
        if( currentRangeEnd.nodeChar === 0 && currentRangeEnd.nodeChar === currentRangeEnd.node.string.length ){

            newNode = currentRangeEnd.node;

            newNode.style[ key ] = value;
            newNode.charList     = [];

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Es parcial
        }else{
            
            newNode              = createNode( currentRangeEnd.line );
            newNode.string       = currentRangeEnd.node.string.slice( 0, currentRangeEnd.nodeChar );
            newNode.style        = $.extend( {}, currentRangeEnd.node.style );
            newNode.style[ key ] = value;

            setStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            currentRangeEnd.node.string   = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
            currentRangeEnd.node.charList = [];

            setStyle( currentRangeEnd.node.style );

            for( i = 1; i <= currentRangeEnd.node.string.length; i++ ){
                currentRangeEnd.node.charList.push( ctx.measureText( currentRangeEnd.node.string.slice( 0, i ) ).width );
            }

            currentRangeEnd.node.width    = currentRangeEnd.node.charList[ i - 2 ] || 0;
            currentRangeEnd.line.nodeList = currentRangeEnd.line.nodeList.slice( 0, currentRangeEnd.nodeId ).concat( newNode ).concat( currentRangeEnd.line.nodeList.slice( currentRangeEnd.nodeId ) );
            currentRangeEnd.node          = newNode;

        }

    // Varias líneas
    }else{

        var originalRangeStart, originalRangeEnd;

        // Aplicamos el estilo a la línea inicial
        originalRangeStart       = currentRangeStart;
        originalRangeEnd         = currentRangeEnd;
        currentRangeEnd          = $.extend( {}, currentRangeStart );
        currentRangeEnd.lineChar = currentRangeEnd.line.totalChars;
        currentRangeEnd.nodeId   = currentRangeEnd.line.nodeList.length - 1;
        currentRangeEnd.node     = currentRangeEnd.line.nodeList[ currentRangeEnd.nodeId ];
        currentRangeEnd.nodeChar = currentRangeEnd.node.string.length;

        setRangeNodeStyle( key, value, true );

        currentRangeEnd = originalRangeEnd;

        // Aplicamos el estilo a nodos intermedios
        mapRangeLines( false, currentRangeStart, currentRangeEnd, function( pageId, page, paragraphId, paragraph, lineId, line ){

            var newNode, i, j;

            for( i = 0; i < line.nodeList.length; i++ ){

                newNode = line.nodeList[ i ];

                newNode.style[ key ] = value;
                newNode.charList     = [];

                setStyle( newNode.style );

                for( j = 1; j <= newNode.string.length; j++ ){
                    newNode.charList.push( ctx.measureText( newNode.string.slice( 0, j ) ).width );
                }

                newNode.width = newNode.charList[ j - 2 ] || 0;

            }
            
        });

        // Aplicamos el estilo a la línea final
        currentRangeStart          = $.extend( {}, currentRangeEnd );
        currentRangeStart.lineChar = 0;
        currentRangeStart.nodeId   = 0;
        currentRangeStart.node     = currentRangeStart.line.nodeList[ 0 ];
        currentRangeStart.nodeChar = 0;

        setRangeNodeStyle( key, value, true );

        currentRangeStart = originalRangeStart;

    }

    if( !propagated ){

        drawPages();
        drawRange( currentRangeStart, currentRangeEnd );

    }

};

var setRangeParagraphStyle = function( key, value ){
    
    mapRangeParagraphs( currentRangeStart, currentRangeEnd, function( pageId, page, paragraphId, paragraph ){
        paragraph[ key ] = value;
    });

    drawPages();

};

var setStyle = function( style ){

    var font = '';

    if( style['font-style'] ){
        font += style['font-style'];
    }

    if( style['font-weight'] ){
        font += ( font.length ? ' ' : '' ) + style['font-weight'];
    }

    font += ' ' + currentStyle;

    ctx.font = font;

};

// Nodos Ready
var trimRight = function( string ){
    return string.replace(/\s+$/g,'');
};

// Nodos Ready
var updateBlink = function(){

    if( selectedEnabled ){
        return;
    }

    refrescos++;

    if( !blinkEnabled ){

        blinkEnabled = true;
        blinkTime    = Date.now();
        blinkStatus  = 0;

    }else{

        blinkStatus = Date.now() - blinkTime;

        if( blinkStatus > 1200 ){

            blinkStatus = blinkStatus % 1200;
            blinkTime   = Date.now();

        }
        
    }

    var newCurrent = blinkStatus < 600;

    if( !blinkCurrent && newCurrent ){

        debugTime('cursor on');

        blinkCurrent = newCurrent;

        checkCanvasSelectSize();
        ctxSel.rect( parseInt( positionAbsoluteX, 10 ), parseInt( positionAbsoluteY, 10 ), 1, currentLineHeight );
        ctxSel.fill();

        debugTimeEnd('cursor on');

    }else if( blinkCurrent && !newCurrent ){

        debugTime('cursor off');

        blinkCurrent = newCurrent;

        checkCanvasSelectSize();

        debugTimeEnd('cursor off');

    }

    requestAnimationFrame( updateBlink );

};

// Events
input
.on( 'keydown', function(e){

    if( e.key && e.key.length === 1 ){
        handleChar( e.key );
        drawPages();
    }else if( e.which === 8 ){
        handleBackspace();
        drawPages();
    }else if( e.which === 13 ){
        handleEnter();
        drawPages();
    }else if( e.which === 37 ){
        handleArrowLeft();
    }else if( e.which === 38 ){
        handleArrowUp();
    }else if( e.which === 39 ){
        handleArrowRight();
    }else if( e.which === 40 ){
        handleArrowDown();
    }

});

selections
// Nodos Ready
// Nodos Char Ready
.on( 'mousedown', function(e){

    verticalKeysEnabled = false;

    selectionEnabled = true;
    e.preventDefault();

    var pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar;
    var offset = selections.offset();
    var posX   = e.pageX - offset.left;
    var posY   = e.pageY - offset.top;

    // Buscamos la posición vertical
    var height = 0;

    // Tenemos en cuenta el gap
    height += 20;

    // Buscamos la página
    for( pageId = 0; pageId < pageList.length; pageId++ ){

        if( pageList[ pageId ].height + height < posY ){
            height += pageList[ pageId ].height;
        }else{
            break;
        }

    }

    page = pageList[ pageId ];

    // Tenemos en cuenta el margen superior
    height += page.marginTop;

    // Buscamos el párrafo
    for( paragraphId = 0; paragraphId < page.paragraphList.length; paragraphId++ ){

        if( page.paragraphList[ paragraphId ].height + height < posY ){
            height += page.paragraphList[ paragraphId ].height;
        }else{
            break;
        }

    }

    paragraph = page.paragraphList[ paragraphId ];

    // Buscamos la línea
    for( lineId = 0; lineId < paragraph.lineList.length; lineId++ ){
        
        if( paragraph.lineList[ lineId ].height + height < posY ){
            height += paragraph.lineList[ lineId ].height;
        }else{
            break;
        }

    }

    line = paragraph.lineList[ lineId ];

    // Buscamos la posición horizontal
    var width = 0;

    // Tenemos en cuenta el gap
    width += 20;

    // Tenemos en cuenta el margen izquierdo
    width += page.marginLeft;

    // Buscamos el nodo y el nodeChar
    // Principio del primer nodo
    if( width >= posX ){
        
        nodeId   = 0;
        node     = line.nodeList[ nodeId ];
        nodeChar = 0;
        lineChar = 0;

    }else{

        lineChar = 0;

        for( nodeId = 0; nodeId < line.nodeList.length; nodeId++ ){

            if( width <= posX && line.nodeList[ nodeId ].width + width >= posX ){

                node = line.nodeList[ nodeId ];

                for( nodeChar = 0; nodeChar < node.string.length; ){

                    if( node.charList[ nodeChar ] - ( ( node.charList[ nodeChar ] - ( node.charList[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX ){
                        break;
                    }

                    lineChar++;
                    nodeChar++;

                }
                
                break;
                
            }

            width    += line.nodeList[ nodeId ].width;
            lineChar += line.nodeList[ nodeId ].string.length;
            
        }

        // Si no hay nodo es porque está al final de la línea
        if( !node ){

            lineChar = line.totalChars;
            nodeId   = line.nodeList.length - 1;
            node     = line.nodeList[ nodeId ];
            nodeChar = node.string.length;

        }

    }

    // To Do -> No usar un setCursor, ya tenemos calculadas todas las posiciones
    setCursor( pageId, paragraphId, lineId, lineChar, nodeId, nodeChar );
    resetBlink();

    selectionStart = {

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

    };

})

.on( 'mousemove', function(e){

    if( !selectionEnabled ){
        return;
    }

    var pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar;
    var offset = selections.offset();
    var posX   = e.pageX - offset.left;
    var posY   = e.pageY - offset.top;

    // Buscamos la posición vertical
    var height = 0;

    // Tenemos en cuenta el gap
    height += 20;

    // Buscamos la página
    for( pageId = 0; pageId < pageList.length; pageId++ ){

        if( pageList[ pageId ].height + height < posY ){
            height += pageList[ pageId ].height;
        }else{
            break;
        }

    }

    page = pageList[ pageId ];

    // Tenemos en cuenta el margen superior
    height += page.marginTop;

    // Buscamos el párrafo
    for( paragraphId = 0; paragraphId < page.paragraphList.length; paragraphId++ ){

        if( page.paragraphList[ paragraphId ].height + height < posY ){
            height += page.paragraphList[ paragraphId ].height;
        }else{
            break;
        }

    }

    paragraph = page.paragraphList[ paragraphId ];

    // Buscamos la línea
    for( lineId = 0; lineId < paragraph.lineList.length; lineId++ ){
        
        if( paragraph.lineList[ lineId ].height + height < posY ){
            height += paragraph.lineList[ lineId ].height;
        }else{
            break;
        }

    }

    line = paragraph.lineList[ lineId ];

    // Buscamos la posición horizontal
    var width = 0;

    // Tenemos en cuenta el gap
    width += 20;

    // Tenemos en cuenta el margen izquierdo
    width += page.marginLeft;

    // Buscamos el nodo y el nodeChar
    // Principio del primer nodo
    if( width >= posX ){
        
        nodeId   = 0;
        node     = line.nodeList[ nodeId ];
        nodeChar = 0;
        lineChar = 0;

    }else{

        lineChar = 0;
        
        // Buscamos nodo a nodo
        for( nodeId = 0; nodeId < line.nodeList.length; ){

            // El caracter está en el nodo
            if( width <= posX && line.nodeList[ nodeId ].width + width >= posX ){

                node = line.nodeList[ nodeId ];

                for( nodeChar = 0; nodeChar < node.string.length; ){
                    
                    if(
                        node.charList[ nodeChar ] - ( ( node.charList[ nodeChar ] - ( node.charList[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX
                    ){
                        break;
                    }

                    nodeChar++;
                    lineChar++;

                }

                break;

            }

            lineChar += line.nodeList[ nodeId ].string.length;
            width    += line.nodeList[ nodeId ].width;
            nodeId   += 1;

        }

        if( !node ){

            lineChar = line.totalChars;
            nodeId   = line.nodeList.length - 1;
            node     = line.nodeList[ nodeId ];
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

.on( 'mouseup', function(){
    selectionEnabled = false;
});

toolsLine
.on( 'click', '.tool-button', function(){

    input.focus();

    buttonAction[ $(this).attr('data-tool') ]();

});

// Start
start();
