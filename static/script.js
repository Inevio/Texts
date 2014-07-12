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
var currentStyle          = '';
var positionAbsoluteX     = null;
var positionAbsoluteY     = null;
var currentRangeStart     = null;
var currentRangeEnd       = null;
var currentRangeStartHash = null;
var currentRangeEndHash   = null;

// Button actions
var buttonAction = {

    bold : function(){

        if( currentRangeStart.node.style['font-weight'] ){
            setRangeNodeStyle( 'font-weight' );
        }else{
            setRangeNodeStyle( 'font-weight', 'bold' );
        }
        
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

var checkCanvasPagesSize = function(){
    
    canvasPages.width  = pages.width();
    canvasPages.height = pages.height();

};

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

var createLine = function( paragraph ){

    var line = newLine();

    // To Do -> Asignar la altura dinámicamente
    line.height = 0;//parseInt( testZone.css('line-height'), 10 );
    line.width  = paragraph.width;

    // Creamos el nodo inicial
    line.nodeList.push( createNode() );

    return line;

};

var createNode = function(){

    var node = newNode();

    // To Do -> Asignar la altura dinámicamente
    node.width = 0;//;parseInt( testZone.css('line-height'), 10 );

    return node;

};

var createPage = function( pageInfo, marginInfo ){

    var page = newPage();

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

        string    : '',
        width     : 0,
        widthTrim : 0,
        nodeList  : [],
        offset    : []

    };

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

var debugTime = function( name ){

    if( DEBUG ){
        console.time( name );
    }
    
};

var debugTimeEnd = function( name ){
    
    if( DEBUG ){
        console.timeEnd( name );
    }
    
};

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

                    setCanvasTextStyle( node.style );

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

    var style        = $.extend( {}, start.node.style );
    var styleCounter = Object.keys( style ).length;

    mapRangeLines( true, start, end, function( pageId, page, paragraphId, paragraph, lineId, line ){

        var node;

        for( var i = 0; i < line.nodeList.length; i++ ){

            node = line.nodeList[ i ];

            for( var j in style ){

                if( style[ j ] !== node.style[ j ] ){

                    delete style[ j ];
                    styleCounter--;

                    if( !styleCounter ){
                        return {};
                    }

                }

            }

        }

    });

    return style;

};

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
    var words, breakedWord, currentWord, offset, i, j;

    for( i = 0; i < nodeList.length; i++ ){

        offset = 0;
        words  = nodeList[ i ].string.match(/(\s*\S+\s*)/g) || [];

        for( j = 0; j < words.length; j++ ){

            if( breakedWord ){

                currentWord.string    += words[ j ];
                currentWord.width     += ( nodeList[ i ].charList[ offset + words[ j ].length - 1 ] || 0 ) - ( nodeList[ i ].charList[ offset - 1 ] || 0 );
                currentWord.widthTrim += ( nodeList[ i ].charList[ offset + trimRight( words[ j ] ).length - 1 ] || 0 ) - ( nodeList[ i ].charList[ offset - 1 ] || 0 );

                currentWord.offset.push( [ offset, offset + currentWord.string.length - 1 ] );
                currentWord.nodeList.push( i );

                offset += words[ j ].length;

                if( words[ j ].indexOf(' ') > -1 || i === nodeList.length - 1 ){

                    result.push( currentWord );

                    breakedWord = false;

                }
                
                continue;

            }

            currentWord           = createWord();
            currentWord.string    = words[ j ];
            currentWord.width     = ( nodeList[ i ].charList[ offset + words[ j ].length - 1 ] || 0 ) - ( nodeList[ i ].charList[ offset - 1 ] || 0 );
            currentWord.widthTrim = ( nodeList[ i ].charList[ offset + trimRight( words[ j ] ).length - 1 ] || 0 ) - ( nodeList[ i ].charList[ offset - 1 ] || 0 );
            currentWord.nodeList  = [ i ];

            currentWord.offset.push( [ offset, offset + currentWord.string.length - 1 ] );

            offset += words[ j ].length;

            if( words[ j ].indexOf(' ') > -1 || i === nodeList.length - 1 ){
                result.push( currentWord );
            }else{
                breakedWord = true;
            }

        }

    }

    return result;

};

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

var handleBackspace = function(){

    verticalKeysEnabled = false;

    // Principio del documento
    if( !currentPageId && !currentParagraphId && !currentLineId && !currentLineCharId ){
        console.log( 'principio del documento, se ignora' );
        return;
    }

    var nodePosition;

    // Principio de línea
    if( !currentLineCharId ){

        // La línea es la primera del párrafo
        if( currentLineId === 0 ){

            // To Do -> Saltos entre distintas páginas

            // Si hay contenido fusionamos los párrafos
            var mergeParagraphs  = currentLine.totalChars > 0;
            var mergePreLastLine;

            if( mergeParagraphs ){

                mergePreLastLine                                              = currentPage.paragraphList[ currentParagraphId - 1 ].lineList.length - 1;
                currentPage.paragraphList[ currentParagraphId - 1 ].lineList  = currentPage.paragraphList[ currentParagraphId - 1 ].lineList.concat( currentParagraph.lineList );
                currentPage.paragraphList[ currentParagraphId - 1 ].height   += currentParagraph.height;

            }

            currentPage.paragraphList = currentPage.paragraphList.slice( 0, currentParagraphId ).concat( currentPage.paragraphList.slice( currentParagraphId + 1 ) );
            currentParagraphId        = currentParagraphId - 1;
            currentParagraph          = currentPage.paragraphList[ currentParagraphId ];

            if( mergeParagraphs ){

                mergeParagraphs = realocateLineInverse( mergePreLastLine + 1, currentLineCharId );

                if( mergeParagraphs.realocation && mergeParagraphs.lineChar > 0 ){

                    currentLineId     = mergePreLastLine;
                    currentLine       = currentParagraph.lineList[ currentLineId ];
                    currentLineCharId = mergeParagraphs.lineChar;
                    nodePosition      = getNodeInPosition( currentLine, mergeParagraphs.lineChar );
                    currentNodeId     = nodePosition.nodeId;
                    currentNode       = currentLine.nodeList[ currentNodeId ];
                    currentNodeCharId = nodePosition.nodeChar;

                }else{

                    currentLineId     = currentParagraph.lineList.length - 1;
                    currentLine       = currentParagraph.lineList[ currentLineId ];
                    currentLineCharId = currentLine.totalChars;
                    currentNodeId     = currentLine.nodeList.length - 1;
                    currentNode       = currentLine.nodeList[ currentNodeId ];
                    currentNodeCharId = currentNode.string.length;

                }

            }else{

                currentLineId     = currentParagraph.lineList.length - 1;
                currentLine       = currentParagraph.lineList[ currentLineId ];
                currentLineCharId = currentLine.totalChars;
                currentNodeId     = currentLine.nodeList.length - 1;
                currentNode       = currentLine.nodeList[ currentNodeId ];
                currentNodeCharId = currentNode.string.length;

            }

        }else{

            var prevLine = currentParagraph.lineList[ currentLineId - 1 ];
            var prevNode = prevLine.nodeList.slice( -1 )[ 0 ];

            prevNode.string           = prevNode.string.slice( 0, -1 );
            prevNode.charList         = prevNode.charList.slice( 0, -1 );
            prevNode.width            = prevNode.charList.slice( -1 )[ 0 ];
            prevLine.totalChars      += currentLine.totalChars - 1;
            prevLine.nodeList         = prevLine.nodeList.concat( currentLine.nodeList );
            currentParagraph.lineList = currentParagraph.lineList.slice( 0, currentLineId ).concat( currentParagraph.lineList.slice( currentLineId + 1 ) );
            currentParagraph.height  -= currentLine.height;
            currentLineId             = currentLineId - 1;
            currentLine               = currentParagraph.lineList[ currentLineId ];

            // To Do -> Realocate
            console.log( realocateLine( currentLineId ) );

        }

    }else{

        var i;

        currentNode.string   = currentNode.string.slice( 0, currentNodeCharId - 1 ).concat( currentNode.string.slice( currentNodeCharId ) );
        currentNode.charList = currentNode.charList.slice( 0, currentNodeCharId - 1 );

        setCanvasTextStyle( currentNode.style );

        for( i = currentNodeCharId; i <= currentNode.string.length; i++ ){
            currentNode.charList.push( ctx.measureText( currentNode.string.slice( 0, i ) ).width );
        }

        currentNode.width = currentNode.charList.slice( -1 )[ 0 ] || 0;

        currentLineCharId--;
        currentNodeCharId--;
        currentLine.totalChars--;

        // Realocamos el contenido
        var realocation = realocateLineInverse( currentLineId, currentLineCharId );

        // Se ha producido una realocation inversa
        if( realocation.realocation && realocation.lineChar > 0 ){

            currentLineId     = currentLineId - 1;
            currentLine       = currentParagraph.lineList[ currentLineId ];
            currentLineCharId = realocation.lineChar;
            nodePosition      = getNodeInPosition( currentLine, realocation.lineChar );
            currentNodeId     = nodePosition.nodeId;
            currentNode       = currentLine.nodeList[ currentNodeId ];
            currentNodeCharId = nodePosition.nodeChar;

        // El nodo se queda vacío y hay más nodos en la línea
        }else if( !currentNode.string.length && currentLine.nodeList.length > 1 ){
            currentLine.nodeList = currentLine.nodeList.slice( 0, currentNodeId ).concat( currentLine.nodeList.slice( currentNodeId + 1 ) );

        // El nodo se queda vacío y no hay más nodos en la línea
        }else if( currentLineId && !currentNode.string.length && currentLine.nodeList.length === 1 ){

            currentParagraph.lineList = currentParagraph.lineList.slice( 0, currentLineId ).concat( currentParagraph.lineList.slice( currentLineId + 1 ) );
            currentParagraph.height   = currentParagraph.height - currentLine.height;
            currentLineId             = currentLineId - 1;
            currentLine               = currentParagraph.lineList[ currentLineId ];
            currentLineCharId         = currentLine.totalChars;
            currentNodeId             = currentLine.nodeList.length - 1;
            currentNode               = currentLine.nodeList[ currentNodeId ];
            currentNodeCharId         = currentNode.string.length;

        }

    }

    // Definimos el cursor
    setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );
    resetBlink();

};

var handleChar = function( newChar ){

    verticalKeysEnabled = false;

    currentLine.totalChars++;

    currentNode.string   = currentNode.string.slice( 0, currentNodeCharId ) + newChar + currentNode.string.slice( currentNodeCharId );
    currentNode.charList = currentNode.charList.slice( 0, currentNodeCharId );

    setCanvasTextStyle( currentNode.style );

    for( var i = currentNodeCharId + 1; i <= currentNode.string.length; i++ ){
        currentNode.charList.push( ctx.measureText( currentNode.string.slice( 0, i ) ).width );
    }

    currentNode.width = currentNode.charList[ currentNode.charList.length - 1 ];
    
    currentLineCharId++;
    currentNodeCharId++;

    var realocation = realocateLine( currentLineId, currentLineCharId );

    if( realocation > 0 ){

        currentLineId++;

        var newNode;

        currentLine       = currentParagraph.lineList[ currentLineId ];
        currentLineCharId = realocation;
        newNode           = getNodeInPosition( currentLine, currentLineCharId );
        currentNodeId     = newNode.nodeId;
        currentNode       = currentLine.nodeList[ currentNodeId ];
        currentNodeCharId = newNode.nodeChar;

        positionAbsoluteY += currentLine.height;

        // Reiniciamos la posición horizontal
        positionAbsoluteX  = 20; // Gap
        positionAbsoluteX += currentPage.marginLeft;
        positionAbsoluteX += currentNode.charList[ currentNodeCharId - 1 ];

    }else{

        var prev = currentNode.charList[ currentNodeCharId - 2 ] || 0;
        var next = currentNode.charList[ currentNodeCharId - 1 ];

        positionAbsoluteX += next - prev;

    }

    resetBlink();

};

var handleEnter = function(){

    verticalKeysEnabled = false;

    // To Do -> Comprobar que entra en la página

    var i, maxSize;
    var newParagraph   = createParagraph( currentPage );
    var newParagraphId = currentParagraphId + 1;

    // Obtenemos las líneas a mover y el texto
    var movedLines = currentParagraph.lineList.slice( currentLineId + 1 );
    var newLine    = newParagraph.lineList[ 0 ];
    var newNode    = newLine.nodeList[ 0 ];

    // Clonamos el nodo actual
    newNode.string = currentNode.string.slice( currentNodeCharId );
    newNode.style  = $.extend( {}, currentNode.style );
    newNode.height = currentNode.height;

    setCanvasTextStyle( newNode.style );

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

    // Actualizamos las alturas de las líneas
    maxSize = 0;

    for( i = 0; i < newLine.nodeList.length; i++ ){

        if( newLine.nodeList[ i ].style['font-size'] > maxSize ){
            maxSize = newLine.nodeList[ i ].style['font-size'];
        }

    }

    maxSize             = parseInt( testZone.css( 'font-size', maxSize + 'pt' ).css('line-height'), 10 );
    newParagraph.height = maxSize;
    newLine.height      = maxSize;

    maxSize = 0;
    
    for( i = 0; i < currentLine.nodeList.length; i++ ){

        if( currentLine.nodeList[ i ].style['font-size'] > maxSize ){
            maxSize = currentLine.nodeList[ i ].style['font-size'];
        }

    }

    maxSize                  = parseInt( testZone.css( 'font-size', maxSize + 'pt' ).css('line-height'), 10 );
    currentParagraph.height -= currentLine.height;
    currentParagraph.height += maxSize;
    currentLine.height       = maxSize;

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

    if( includeLimits ){

        fakeEndLineId = end.lineId + 1;
        nodeLoopId = start.nodeId;

    }else{

        fakeEndLineId = end.lineId;
        nodeLoopId    = start.nodeId + 1;

    }
    
    // To Do -> Ver si es necesario el include limits aqui
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

    var pageLoop, paragraphLoopId, finalPage, j, k;

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

var mergeNodes = function( first, second ){

    var i = first.string.length;

    first.string += second.string;

    setCanvasTextStyle( first.style );

    for( i = i + 1; i <= first.string.length; i++ ){
        first.charList.push( ctx.measureText( first.string.slice( 0, i ) ).width );
    }

    first.width = first.charList.slice( -1 )[ 0 ];

};

var newLine = function(){

    return {

        height     : 0,
        nodeList   : [],
        totalChars : 0,
        width      : 0

    };

};

var newNode = function(){

    return {

        charList : [],
        height   : 0,
        string   : '',
        style    : {},
        width    : 0

    };

};

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

var newParagraph = function(){

    return {

        aling     : ALING_LEFT,
        height    : 0,
        interline : 0,
        lineList  : [],
        width     : 0

    };

};

var normalizeLine = function( line ){

    if( line.nodeList.length === 1 ){
        return;
    }

    var comparation;

    for( var i = 1; i < line.nodeList.length; ){

        comparation = compareNodeStyles( line.nodeList[ i - 1 ], line.nodeList[ i ] );

        if( comparation ){
            
            mergeNodes( line.nodeList[ i - 1 ], line.nodeList[ i ] );
            
            line.nodeList = line.nodeList.slice( 0, i).concat( line.nodeList.slice( i + 1 ) );

        }else{
            i++;
        }

    }

};

var realocateLine = function( id, lineChar ){

    var line    = currentParagraph.lineList[ id ];
    var counter = 0;

    if( !line || getNodesWidth( line ) <= line.width ){
        return counter;
    }

    var words, wordsToMove, newLine, newNode, stop, i, j, k, heritage;

    // Nos hacemos con la nueva línea, si no existe la creamos
    if( !currentParagraph.lineList[ id + 1 ] ){

        newLine                   = createLine( currentParagraph );
        newLine.nodeList          = [];
        currentParagraph.height  += newLine.height;
        currentParagraph.lineList = currentParagraph.lineList.slice( 0, id + 1 ).concat( newLine ).concat( currentParagraph.lineList.slice( id + 1 ) );

    }else{
        newLine = currentParagraph.lineList[ id + 1 ];
    }

    words    = getWordsMetrics( line );
    heritage = 0;

    for( i = words.length - 1; i >= 0; i-- ){
        heritage += words[ i ].width;
    }

    // Comprobamos palabra por palabra que entra por el final (desde la última hasta la primera)
    for( i = words.length - 1; i >= 0; i-- ){

        if( heritage - ( words[ i ].width - words[ i ].widthTrim ) <= line.width ){
                        
            wordsToMove = words.slice( i + 1 );
            
            // Si no hay palabras que mover terminamos (aunque este caso no debería darse nunca )
            if( !wordsToMove.length ){
                console.info('caso no posible en realocateLine');
                break;
            }

            // Comprobamos si el último nodo de la palabra actual es distinto del de las otras
            k = words[ i ].nodeList.slice( -1 )[ 0 ];

            // Si es distinto el movimiento es más sencillo
            if( wordsToMove[ 0 ].nodeList[ 0 ] !== k ){

                // Actualizamos el número total de líneas
                for( j = wordsToMove[ 0 ].nodeList[ 0 ]; j < line.nodeList.length; j++ ){

                    line.totalChars    -= line.nodeList[ j ].string.length;
                    newLine.totalChars += line.nodeList[ j ].string.length;

                }

                newLine.nodeList.unshift( line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ] );

                line.nodeList = line.nodeList.slice( 0, wordsToMove[ 0 ].nodeList[ 0 ] );

            // La palabra actual comparte nodos con la siguiente, hay que partir
            }else{

                // Clonamos el nodo
                newNode        = createNode( line );
                newNode.style  = $.extend( {}, line.nodeList[ words[ i ].nodeList.slice( -1 )[ 0 ] ].style );
                newNode.height = line.nodeList[ words[ i ].nodeList.slice( -1 )[ 0 ] ].height;

                for( j = 0; j < wordsToMove.length; j++ ){

                    // Si la palabra empieza por el mismo nodo que la palabra límite
                    if( wordsToMove[ j ].nodeList[ 0 ] === k ){

                        newNode.string                                          += line.nodeList[ wordsToMove[ j ].nodeList[ 0 ] ].string.slice( wordsToMove[ j ].offset[ 0 ][ 0 ] );
                        line.nodeList[ wordsToMove[ j ].nodeList[ 0 ] ].string   = line.nodeList[ wordsToMove[ j ].nodeList[ 0 ] ].string.slice( 0, wordsToMove[ j ].offset[ 0 ][ 0 ] );
                        line.nodeList[ wordsToMove[ j ].nodeList[ 0 ] ].charList = line.nodeList[ wordsToMove[ j ].nodeList[ 0 ] ].charList.slice( 0, wordsToMove[ j ].offset[ 0 ][ 0 ] );
                        line.nodeList[ wordsToMove[ j ].nodeList[ 0 ] ].width    = line.nodeList[ wordsToMove[ j ].nodeList[ 0 ] ].charList.slice( -1 )[ 0 ];

                        if( wordsToMove[ j ].nodeList[ 1 ] ){

                            for( i = wordsToMove[ j ].nodeList[ 1 ]; i < line.nodeList.length; i++ ){

                                line.totalChars    -= line.nodeList[ i ].string.length;
                                newLine.totalChars += line.nodeList[ i ].string.length;

                            }

                            newLine.nodeList = newLine.nodeList.concat( line.nodeList.slice( wordsToMove[ j ].nodeList[ 1 ] ) );
                            line.nodeList    = line.nodeList.slice( 0, wordsToMove[ j ].nodeList[ 1 ] );

                            break;

                        }

                    }else{

                        console.log('to do');
                        // To Do -> line.nodeList.slice( wordsToMove[ j ].nodeList[ 0 ] );
                    }

                }

                setCanvasTextStyle( newNode.style );

                for( i = 1; i <= newNode.string.length; i++ ){
                    newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
                }

                newNode.width       = newNode.charList.slice( -1 )[ 0 ];
                line.totalChars    -= newNode.string.length;
                newLine.totalChars += newNode.string.length;

                newLine.nodeList.unshift( newNode );

            }

            break;

        }

        heritage -= words[ i ].width;

        // To Do -> Nodos por arrastre

        if( stop ){
            break;
        }

    }

    counter = lineChar - line.totalChars;

    normalizeLine( newLine );
    realocateLine( id + 1, 0 );

    return counter;

};

var realocateLineInverse = function( id, modifiedChar, dontPropagate ){

    var line    = currentParagraph.lineList[ id ];
    var counter = { realocation : false, lineChar : 0 };
    var i, newNode;

    // Si la línea no existe se ignora
    if( !line ){
        return counter;
    }

    var lineWords = getWordsMetrics( line );

    if( !lineWords.length ){
        return counter;
    }

    // Comprobamos si al ser la primera palabra la que ha cambiado debemos intentar hacer un realocado con la linea superior
    // To Do -> Comprobar si modified char alguna vez coge el valor 0
    if( !dontPropagate && id > 0 && lineWords[ 0 ].string.length >= modifiedChar ){

        var totalChars = currentParagraph.lineList[ id - 1 ].totalChars;

        counter          = realocateLineInverse( id - 1, 0, true );
        counter.lineChar = totalChars + currentLineCharId;

    }

    // Comprobamos si la palabra de la siguiente línea puede entrar en la línea actual
    var nextLine = currentParagraph.lineList[ id + 1 ];

    if( !nextLine ){
        return counter;
    }

    var currentWidth  = getNodesWidth( line );
    var nextLineWords = getWordsMetrics( nextLine );
    var heritage      = 0;
    var wordsToMove   = [];

    for( i = 0; i < nextLineWords.length; i++ ){

        if( currentWidth + heritage + nextLineWords[ i ].widthTrim > line.width ){
            break;
        }

        wordsToMove.push( i );
        
        heritage += nextLineWords[ i ].width;

    }

    if( !wordsToMove.length ){
        return counter;
    }

    counter.realocation = true;

    // Comprobamos si la última palabra a mover comparte nodo con la siguiente y hay que partir
    var lastWordToMove = wordsToMove.slice( -1 )[ 0 ];
    var charsToMove    = 0;

    // Mismos nodos, necesitamos partir
    if( nextLineWords[ lastWordToMove + 1 ] && nextLineWords[ lastWordToMove ].nodeList.slice( -1 )[ 0 ] === nextLineWords[ lastWordToMove + 1 ].nodeList[ 0 ] ){

        console.log('necesario partir');

        // Comprobamos si la primera palabra a mover tiene el mismo nodo que la ultima a mover
        // Partido de un solo nodo
        if( nextLineWords[ 0 ].nodeList[ 0 ] === nextLineWords[ lastWordToMove ].nodeList.slice( -1 )[ 0 ] ){

            var nextNode = nextLine.nodeList[ nextLineWords[ 0 ].nodeList[ 0 ] ]; // Estamos poniendo nextLineWords[ 0 ].nodeList[ 0 ] pero teóricamente debe ser siempre el 0, puede comprobarse empíricamente y optimizarlo en un futuro

            for( i = 0; i < wordsToMove.length; i++ ){
                charsToMove += nextLineWords[ wordsToMove[ i ] ].string.length;
            }

            newNode              = createNode( line );
            newNode.string       = nextNode.string.slice( 0, charsToMove );
            newNode.charList     = nextNode.charList.slice( 0, charsToMove );
            newNode.width        = newNode.charList.slice( -1 )[ 0 ];
            newNode.style        = $.extend( {}, nextNode.style );
            newNode.height       = nextNode.height;
            line.nodeList        = line.nodeList.concat( newNode );
            line.totalChars     += charsToMove;
            nextLine.nodeList    = nextLine.nodeList.slice( nextLineWords[ 0 ].nodeList[ 0 ] ); // Estamos poniendo nextLineWords[ 0 ].nodeList[ 0 ] pero teóricamente debe ser siempre el 0, puede comprobarse empíricamente y optimizarlo en un futuro
            nextLine.totalChars -= charsToMove;
            nextNode.string      = nextNode.string.slice( charsToMove );
            nextNode.charList    = [];

            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= nextNode.string.length; i++ ){
                nextNode.charList.push( ctx.measureText( nextNode.string.slice( 0, i ) ).width );
            }

            nextNode.width = nextNode.charList.slice( -1 )[ 0 ];

        // Movimiento de nodos y partido del último
        }else{
            // To Do
            console.log('movimiento de nodos y partido del ultimo');
        }
        
    // Distintos nodos, podemos mover los nodos completos
    }else{

        for( i = 0; i < wordsToMove.length; i++ ){
            charsToMove += nextLineWords[ wordsToMove[ i ] ].string.length;
        }

        line.nodeList        = line.nodeList.concat( nextLine.nodeList.slice( 0, nextLineWords[ lastWordToMove ].nodeList.slice( -1 )[ 0 ] + 1 ) );
        line.totalChars     += charsToMove;
        nextLine.nodeList    = nextLine.nodeList.slice( nextLineWords[ lastWordToMove ].nodeList.slice( -1 )[ 0 ] + 1 );
        nextLine.totalChars -= charsToMove;

    }

    if( !nextLine.totalChars ){

        currentParagraph.lineList  = currentParagraph.lineList.slice( 0, id + 1 ).concat( currentParagraph.lineList.slice( id + 2 ) );
        currentParagraph.height   -= nextLine.height;

    }

    if( !dontPropagate ){
        realocateLineInverse( id + 1, 0 );
    }

    normalizeLine( line );

    return counter;

};

var resetBlink = function(){

    blinkTime    = Date.now().
    blinkStatus  = 0;
    blinkCurrent = false;

    if( selectedEnabled ){

        selectedEnabled = false;
        updateBlink();

    }

};

var setNodeStyle = function( paragraph, line, node, key, value ){

    if( value ){
        node.style[ key ] = value;
    }else{
        delete node.style[ key ];
    }

    // Cambiamos la altura de la línea y el párrafo si es necesario
    if( key === 'font-size' ){

        var lineHeight = parseInt( testZone.css( 'font-size', value + 'pt' ).css('line-height'), 10 );

        node.height = lineHeight;

        if( line.height === lineHeight ){
            return;
        }

        var stop;

        for( var i = 0; i < line.nodeList.length; i++ ){

            if( line.nodeList[ i ].style['font-size'] > lineHeight ){
                stop = true;
                break;
            }

        }

        if( stop ){
            return;
        }

        paragraph.height -= line.height;
        paragraph.height += lineHeight;
        line.height       = lineHeight;

    }

};

var setCanvasTextStyle = function( style ){

    var font = '';

    if( style['font-style'] ){
        font += style['font-style'];
    }

    if( style['font-weight'] ){
        font += ( font.length ? ' ' : '' ) + style['font-weight'];
    }

    font += ( font.length ? ' ' : '' );
    font += style['font-size'] + 'pt';
    font += ' ';
    font += style['font-family'];

    ctx.font = font;

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
        currentLine = currentParagraph.lineList[ line ];
    }

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
        currentLineId !== line ||
        force
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
        currentLineCharId !== lineChar ||
        force
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

var setRange = function( start, end, force ){

    // To Do -> Podemos pasarle las coordenadas para evitar cálculos
    // To Do -> Si no se le pueden pasar las coordenadas podemos utilizar los bucles para las dos alturas

    // Arreglamos los límites
    if(
        start.node.string.length === start.nodeChar &&
        start.nodeId + 1 <= start.line.nodeList.length
    ){
        // To Do -> Cambio a otra línea si es necesario
        start.nodeId   = start.nodeId + 1;
        start.node     = start.line.nodeList[ start.nodeId ];
        start.nodeChar = 0;
    }

    if(
        end.nodeChar === 0 &&
        end.nodeId > 0
    ){
        // To Do -> Cambio a otra línea si es necesario
        end.nodeId   = end.nodeId - 1;
        end.node     = end.line.nodeList[ end.nodeId ];
        end.nodeChar = end.node.string.length;
    }

    var startHash = [ start.pageId, start.paragraphId, start.lineId, start.lineChar ];
    var endHash   = [ end.pageId, end.paragraphId, end.lineId, end.lineChar ];

    // Si son iguales no es un rango
    if( !force && compareHashes( startHash, endHash ) === 0 ){
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
        !force &&
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

    var i, j, newNode, endNode, newPositions;

    // Mismo nodo
    if(
        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId &&
        currentRangeStart.nodeId === currentRangeEnd.nodeId
    ){

        // Si es todo el nodo
        if( currentRangeStart.nodeChar === 0 && currentRangeEnd.nodeChar === currentRangeEnd.node.string.length ){

            newNode          = currentRangeStart.node;
            newNode.charList = [];

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Si comienza por el principio del nodo
        }else if( currentRangeStart.nodeChar === 0 ){

            newNode                         = createNode( currentLine );
            newNode.string                  = currentRangeStart.node.string.slice( currentRangeStart.nodeChar, currentRangeEnd.nodeChar );
            newNode.style                   = $.extend( {}, currentRangeStart.node.style );
            newNode.height                  = currentRangeStart.height;
            currentRangeStart.node.string   = currentRangeStart.node.string.slice( currentRangeEnd.nodeChar );
            currentRangeStart.node.charList = [];

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            setCanvasTextStyle( currentRangeStart.node.style );

            for( i = 1; i <= currentRangeStart.node.string.length; i++ ){
                currentRangeStart.node.charList.push( ctx.measureText( currentRangeStart.node.string.slice( 0, i ) ).width );
            }

            currentRangeStart.node.width    = currentRangeStart.node.charList[ i - 2 ] || 0;
            currentRangeStart.line.nodeList = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId ).concat( newNode ).concat( currentRangeStart.line.nodeList.slice( currentRangeStart.nodeId ) );
            currentRangeStart.node          = currentRangeStart.line.nodeList[ currentRangeEnd.nodeId ];

            newPositions = getNodeInPosition( currentRangeEnd.line, currentRangeEnd.lineChar );

            currentRangeEnd.nodeId   = newPositions.nodeId;
            currentRangeEnd.node     = currentRangeEnd.line.nodeList[ currentRangeEnd.nodeId ];
            currentRangeEnd.nodeChar = newPositions.nodeChar;

        // Si termina por el final del nodo
        }else if( currentRangeEnd.nodeChar === currentRangeEnd.node.string.length ){
            
            newNode                         = createNode( currentLine );
            newNode.string                  = currentRangeStart.node.string.slice( currentRangeStart.nodeChar );
            newNode.style                   = $.extend( {}, currentRangeStart.node.style );
            newNode.height                  = currentRangeStart.node.height;
            currentRangeStart.node.string   = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
            currentRangeStart.node.charList = currentRangeStart.node.charList.slice( 0, currentRangeStart.nodeChar );

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

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
            newNode.height                  = currentRangeStart.node.height;
            endNode.string                  = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
            endNode.style                   = $.extend( {}, currentRangeEnd.node.style );
            endNode.height                  = currentRangeEnd.node.height;
            currentRangeStart.node.string   = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
            currentRangeStart.node.charList = currentRangeStart.node.charList.slice( 0 , currentRangeStart.nodeChar );
            currentRangeStart.node.width    = currentRangeStart.node.charList[ currentRangeStart.node.charList.length - 1 ];

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            setCanvasTextStyle( endNode.style );

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

            newNode          = currentRangeStart.node;
            newNode.charList = [];

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Es parcial
        }else{
            
            newNode        = createNode( currentRangeStart.line );
            newNode.string = currentRangeStart.node.string.slice( currentRangeStart.nodeChar );
            newNode.style  = $.extend( {}, currentRangeStart.node.style );
            newNode.height = currentRangeStart.node.height;

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

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

            newNode          = currentRangeStart.line.nodeList[ i ];
            newNode.charList = [];

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( j = 1; j <= newNode.string.length; j++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, j ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        }

        // Tratamiento del último nodo
        // Comprobamos si es una selección completa del nodo
        if( currentRangeEnd.nodeChar === 0 && currentRangeEnd.nodeChar === currentRangeEnd.node.string.length ){

            newNode          = currentRangeEnd.node;
            newNode.charList = [];

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Es parcial
        }else{
            
            newNode        = createNode( currentRangeEnd.line );
            newNode.string = currentRangeEnd.node.string.slice( 0, currentRangeEnd.nodeChar );
            newNode.style  = $.extend( {}, currentRangeEnd.node.style );
            newNode.height = currentRangeEnd.node.height;

            setNodeStyle( currentParagraph, currentLine, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            currentRangeEnd.node.string   = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
            currentRangeEnd.node.charList = [];

            setCanvasTextStyle( currentRangeEnd.node.style );

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

                newNode          = line.nodeList[ i ];
                newNode.charList = [];

                setNodeStyle( currentParagraph, currentLine, newNode, key, value );
                setCanvasTextStyle( newNode.style );

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

    // To Do -> Tocaría hacer un realocateLine por aquí y tal
    if( !propagated ){

        currentNode = currentLine.nodeList[ currentNodeId ]; // To Do -> No estoy seguro de que esto esté en el mejor sitio posible, comprobar

        drawPages();
        setRange( currentRangeStart, currentRangeEnd, true );

    }

};

var setRangeParagraphStyle = function( key, value ){
    
    mapRangeParagraphs( currentRangeStart, currentRangeEnd, function( pageId, page, paragraphId, paragraph ){
        paragraph[ key ] = value;
    });

    drawPages();

};

var start = function(){

    input.focus();
    pageList.push( createPage( PAGE_A4, MARGIN_NORMAL ) );

    setNodeStyle(

        pageList[ 0 ].paragraphList[ 0 ],
        pageList[ 0 ].paragraphList[ 0 ].lineList[ 0 ],
        pageList[ 0 ].paragraphList[ 0 ].lineList[ 0 ].nodeList[ 0 ],
        'font-size',
        12

    );

    setNodeStyle(

        pageList[ 0 ].paragraphList[ 0 ],
        pageList[ 0 ].paragraphList[ 0 ].lineList[ 0 ],
        pageList[ 0 ].paragraphList[ 0 ].lineList[ 0 ].nodeList[ 0 ],
        'font-family',
        'Cambria'

    );

    setCursor( 0, 0, 0, 0, 0, 0 );
    drawPages();

};

var trimRight = function( string ){
    return string.replace(/\s+$/g,'');
};

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

        console.log( currentNode );

        checkCanvasSelectSize();
        ctxSel.rect( parseInt( positionAbsoluteX, 10 ), parseInt( positionAbsoluteY, 10 ) + currentLine.height - currentNode.height, 1, currentNode.height );
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

var updateToolsLineStatus = function(){

    var styles;

    if( currentRangeStart ){
        styles = getCommonStyles( currentRangeStart, currentRangeEnd );
    }else{
        styles = currentNode.style;
    }

    if( styles['font-weight'] ){
        $('.tool-button-bold', toolsLine ).addClass('active');
    }else{
        $('.tool-button-bold', toolsLine ).removeClass('active');
    }

    if( styles['font-style'] ){
        $('.tool-button-italic', toolsLine ).addClass('active');
    }else{
        $('.tool-button-italic', toolsLine ).removeClass('active');
    }

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

    updateToolsLineStatus();

});

toolsLine
.on( 'click', '.tool-button', function(){

    input.focus();

    buttonAction[ $(this).attr('data-tool') ]();

})

.on( 'click', '.tool-fontfamily', function(){
    setRangeNodeStyle( 'font-family', 'Courier' );
})

.on( 'click', '.tool-fontsize', function(){
    setRangeNodeStyle( 'font-size', 18 );
});

// Start
start();
