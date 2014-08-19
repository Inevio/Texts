/*global $:true */
/*global wz:true*/
/*global alert:true*/
/*global params:true*/
/*global console:true*/
/*global requestAnimationFrame:true*/

'use strict';

// Constantes
var ALIGN_LEFT = 0;
var ALIGN_CENTER = 1;
var ALIGN_RIGHT = 2;
var ALIGN_JUSTIFY = 3;
var CENTIMETER = 37.795275591;
var CMD_POSITION = 0;
var CMD_NEWCHAR = 1;
var CMD_RANGE_NEWCHAR = 2;
var CMD_BACKSPACE = 3;
var CMD_RANGE_BACKSPACE = 4;
var CMD_ENTER = 5;
var CMD_NODE_STYLE = 6;
var CMD_RANGE_NODE_STYLE = 7;
var CMD_PARAGRAPH_STYLE = 8;
var CMD_RANGE_PARAGRAPH_STYLE = 9;
var DEBUG = false;
var DEFAULT_PAGE_BACKGROUNDCOLOR = '#ffffff';
var FONTFAMILY = [ 'Arial', 'Cambria', 'Comic Sans MS', 'Courier', 'Helvetica', 'Times New Roman', 'Trebuchet MS', 'Verdana' ];
var FONTSIZE = [ 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72 ];
var GAP = 20;
var INDENTATION_NONE = 0;
var INDENTATION_FIRSTLINE = 1;
var INDENTATION_HANGING = 2;
var INFO_DESCRIPTION = 'Inevio Texts File';
var INFO_GENERATOR = 'Inevio Texts';
var INFO_VERSION = 1;
var LIST_NONE = 0;
var LIST_BULLET = 1;
var LIST_NUMBER = 2;
var LINESPACING = [ '1.0', '1.15', '1.5', '2.0', '2.5', '3.0' ];
var MARGIN = {

    'Normal'              : { top : 2.54, left : 2.54, bottom : 2.54, right : 2.54 },
    'Narrow'              : { top : 1.27, left : 1.27, bottom : 1.27, right : 1.27 },
    'Moderate'            : { top : 2.54, left : 1.9,  bottom : 2.54, right : 1.9  },
    'Wide'                : { top : 2.54, left : 5.08, bottom : 2.54, right : 5.08 },
    'Mirrored'            : { top : 2.54, left : 3.17, bottom : 2.54, right : 2.54 },
    'Office 2003 Default' : { top : 2.54, left : 3.17, bottom : 2.54, right : 3.17 }

};
var PAGEDIMENSIONS = {

    'US Letter'          : { width : 21.59, height : 27.94 },
    'US Legal'           : { width : 21.59, height : 35.56 },
    'A4'                 : { width : 21,    height : 29.7  },
    'A5'                 : { width : 14.81, height : 20.99 },
    'JIS B5'             : { width : 18.2,  height : 25.71 },
    'B5'                 : { width : 17.6,  height : 25.01 },
    'Envelope #10'       : { width : 10.48, height : 24.13 },
    'Envelope DL'        : { width : 11.01, height : 22.01 },
    'Tabloid'            : { width : 27.94, height : 43.17 },
    'A3'                 : { width : 29.7,  height : 42.01 },
    'Tabloid Oversize'   : { width : 30.48, height : 45.71 },
    'ROC 16K'            : { width : 19.68, height : 27.3  },
    'Envelope Choukei 3' : { width : 11.99, height : 23.49 },
    'Super B/A3'         : { width : 33.02, height : 48.25 }

};

// DOM variables
var win                 = $(this);
var saveButton          = $('.option-save');
var toolsMenu           = $('.toolbar-menu');
var toolsLine           = $('.tools-line');
var toolsListContainer  = $('.toolbar-list-container');
var toolsList           = $('.toolbar-list');
var toolsColorContainer = $('.toolbar-color-picker-container');
var toolsColor          = $('.toolbar-color-picker');
var toolsColorColor     = $('.tool-button-color .color');
var pages               = $('.pages');
var selections          = $('.selections');
var ruleLeft            = $('.rule-left');
var ruleTop             = $('.rule-top');
var marginTopDown       = $('.ruler-arrow-down');
var marginTopUp         = $('.ruler-arrow-up');
var marginTopBox        = $('.ruler-box');
var input               = $('.input');
var testZone            = $('.test-zone');
var viewTitle           = $('.document-title');
var canvasPages         = pages[ 0 ];
var canvasSelect        = selections[ 0 ];
var canvasRuleLeft      = ruleLeft[ 0 ];
var canvasRuleTop       = ruleTop[ 0 ];
var ctx                 = canvasPages.getContext('2d');
var ctxSel              = canvasSelect.getContext('2d');
var ctxRuleLeft         = canvasRuleLeft.getContext('2d');
var ctxRuleTop          = canvasRuleTop.getContext('2d');

// Node variables
var pageList = [];

// Realtime variables
var realtime      = null;
var usersPosition = {};
var usersEditing  = {};

// Waiting variables
var waitingCheckLetter      = false;
var waitingCheckLetterInput = false;
var waitingPageUpdate       = false;
var waitingRangeUpdate      = false;
var waitingRuleLeftUpdate   = false;

// Blink variables
var blinkEnabled = false;
var blinkTime    = 0;
var blinkStatus  = 0;
var blinkCurrent = false;
var blinkGlobal  = false;

// Selection variables
var selectionEnabled     = false;
var selectionStart       = null;
var selectedEnabled      = true;
var verticalKeysEnabled  = false;
var verticalKeysPosition = 0;

// Scroll variables
var scrollTop    = 0;
var maxScrollTop = 0;

// Current variables
var currentOpenFile       = null;
var currentDocumentHeight = 0;
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
var positionAbsoluteX     = null;
var positionAbsoluteY     = null;
var currentRangeStart     = null;
var currentRangeEnd       = null;
var currentRangeStartHash = null;
var currentRangeEndHash   = null;
var currentMultipleHash   = null;
var temporalStyle         = null;
var toolsListEnabled      = false;
var toolsColorEnabled     = false;

// Button actions
var buttonAction = {

    bold : function(){

        if(
            ( currentRangeStart && currentRangeStart.node.style['font-weight'] ) ||
            currentNode.style['font-weight'] ||
            checkTemporalStyle('font-weight')
        ){
            setSelectedNodeStyle( 'font-weight' );
        }else{
            setSelectedNodeStyle( 'font-weight', 'bold' );
        }
        
    },

    italic : function(){
        
        if(
            ( currentRangeStart && currentRangeStart.node.style['font-style'] ) ||
            currentNode.style['font-style'] ||
            checkTemporalStyle('font-style')
        ){
            setSelectedNodeStyle( 'font-style' );
        }else{
            setSelectedNodeStyle( 'font-style', 'italic' );
        }

    },

    underline : function(){

        if(
            ( currentRangeStart && currentRangeStart.node.style['text-decoration-underline'] ) ||
            currentNode.style['text-decoration-underline'] ||
            checkTemporalStyle('text-decoration-underline')
        ){
            setSelectedNodeStyle( 'text-decoration-underline' );
        }else{
            setSelectedNodeStyle( 'text-decoration-underline', true );
        }

    },

    color : function( value ){
        setSelectedNodeStyle( 'color', value );
    },

    left : function(){
        setSelectedParagraphsStyle( 'align', ALIGN_LEFT );
    },

    center : function(){
        setSelectedParagraphsStyle( 'align', ALIGN_CENTER );
    },

    right : function(){
        setSelectedParagraphsStyle( 'align', ALIGN_RIGHT );
    },

    justify : function(){
        setSelectedParagraphsStyle( 'align', ALIGN_JUSTIFY );
    },

    indentDec : function(){
        setSelectedParagraphsStyle( 'indentationLeftAdd', -1.27 * CENTIMETER );
    },

    indentInc : function(){
        setSelectedParagraphsStyle( 'indentationLeftAdd', 1.27 * CENTIMETER );
    },

    listBullet : function(){

        if( $( '.tool-button-list-unsorted', toolsLine ).hasClass('active') ){
            setSelectedParagraphsStyle('listNone');
        }else{
            setSelectedParagraphsStyle('listBullet');
        }

    },

    listNumber : function(){
        
        if( $( '.tool-button-list-sorted', toolsLine ).hasClass('active') ){
            setSelectedParagraphsStyle('listNone');
        }else{
            setSelectedParagraphsStyle('listNumber');
        }

    }

};

// Preprocesed data
var fontfamilyCode     = '';
var fontsizeCode       = '';
var linespacingCode    = '';
var pageDimensionsCode = '';
var marginsCode        = '';

var fps = 0;

setInterval( function(){
    //console.log( fps + ' fps' );
    fps = 0;
}, 1000 );

var activeRealTime = function(){

    if( !currentOpenFile ){
        return [];
    }

    realtime = currentOpenFile.realtime();

    realtime.connect( realTimeConnect );
    realtime.on( 'message', realTimeMessage );
    realtime.on( 'userConnect', realTimeUserConnect );

};

var addTemporalStyle = function( key, value ){

    if( !temporalStyle ){
        temporalStyle = {};
    }

    if( value ){
        temporalStyle[ key ] = value;
    }else{
        temporalStyle[ key ] = false;
    }
    
    updateToolsLineStatus();

};

var checkCanvasPagesSize = function(){
    
    canvasPages.width  = pages.width();
    canvasPages.height = pages.height();

};

var checkCanvasSelectSize = function(){

    canvasSelect.width  = selections.width();
    canvasSelect.height = selections.height();

};

var checkCanvasRuleLeftSize = function(){

    canvasRuleLeft.width  = ruleLeft.width();
    canvasRuleLeft.height = ruleLeft.height();

};

var checkCanvasRuleTopSize = function(){

    canvasRuleTop.width  = ruleTop.width();
    canvasRuleTop.height = ruleTop.height();

};

var checkTemporalStyle = function( key, useCurrentNode ){

    if( useCurrentNode ){

        if( temporalStyle && typeof temporalStyle[ key ] !== 'undefined' ){
            return temporalStyle[ key ];
        }else{
            return currentNode.style[ key ];
        }

    }else{
        return temporalStyle && temporalStyle[ key ];
    }

};

var clearTemporalStyle = function(){
    
    temporalStyle = null;

    updateToolsLineStatus();

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

var createDocument = function(){

    var name, pageId, page, paragraphId, paragraph, currentParagraph, lineId, line, nodeId;

    var file = {

         info : {

            description : INFO_DESCRIPTION,
            generator   : INFO_GENERATOR,
            version     : INFO_VERSION

        },

        defaultPage : {

            height       : pageList[ 0 ].height / CENTIMETER,
            width        : pageList[ 0 ].width / CENTIMETER,
            orientation  : pageList[ 0 ].orientation,
            marginTop    : pageList[ 0 ].marginTop / CENTIMETER,
            marginLeft   : pageList[ 0 ].marginLeft / CENTIMETER,
            marginBottom : pageList[ 0 ].marginBottom / CENTIMETER,
            marginRight  : pageList[ 0 ].marginRight / CENTIMETER

        },

        paragraphList : []

    };

    for( pageId = 0; pageId < pageList.length; pageId++ ){

        page = pageList[ pageId ];

        for( paragraphId = 0; paragraphId < page.paragraphList.length; paragraphId++ ){

            paragraph        = page.paragraphList[ paragraphId ];
            currentParagraph = {

                align    : paragraph.align,
                nodeList : []

            };

            if( paragraph.spacing ){
                currentParagraph.spacing = paragraph.spacing;
            }

            if( paragraph.listMode ){
                currentParagraph.listMode = paragraph.listMode;
            }

            if( paragraph.indentationSpecialType ){
                currentParagraph.indentationSpecialType = paragraph.indentationSpecialType;
            }

            if( paragraph.indentationSpecialValue ){
                currentParagraph.indentationSpecialValue = paragraph.indentationSpecialValue / CENTIMETER;
            }
            
            if( paragraph.indentationLeft ){
                currentParagraph.indentationLeft = paragraph.indentationLeft / CENTIMETER;
            }

            for( lineId = 0; lineId < paragraph.lineList.length; lineId++ ){

                line = paragraph.lineList[ lineId ];

                for( nodeId = 0; nodeId < line.nodeList.length; nodeId++ ){

                    currentParagraph.nodeList.push({

                        string  : line.nodeList[ nodeId ].string,
                        blocked : line.nodeList[ nodeId ].blocked,
                        style   : {

                            color                       : line.nodeList[ nodeId ].style.color,
                            'font-family'               : line.nodeList[ nodeId ].style['font-family'],
                            'font-style'                : line.nodeList[ nodeId ].style['font-style'],
                            'font-weight'               : line.nodeList[ nodeId ].style['font-weight'],
                            'text-decoration-underline' : line.nodeList[ nodeId ].style['text-decoration-underline'],
                            'font-size'                 : line.nodeList[ nodeId ].style['font-size']

                        }

                    });

                }

            }

            normalizePlainParagraph( currentParagraph );

            file.paragraphList.push( currentParagraph );

        }

    }

    if( currentOpenFile ){
        name = currentOpenFile.name.replace( /.docx$/i, '' );
    }else{
        name = 'New Document';
    }

    var counter  = 0;
    var callback = function( error, structure ){

        if( error && error !== 'FILE NAME EXISTS ALREADY' ){
            alert( error );
            return;
        }

        if( error && error === 'FILE NAME EXISTS ALREADY' ){

            counter += 1;

            createFile( name + ' (' + counter + ')' + '.texts', file, callback );

            return;

        }

        currentOpenFile = structure;

        setViewTitle( currentOpenFile.name );

    };

    createFile( name + '.texts', file, callback );

};

var createFile = function( name, data, callback ){
    wz.fs.create( name, 'application/inevio-texts', 'root', JSON.stringify( data ), callback );
};

var createLine = function( id, paragraph ){

    var line = newLine();

    // To Do -> Asignar la altura dinámicamente
    line.height = 0;
    line.width  = paragraph.width - getLineIndentationLeft( id, paragraph );

    // Creamos el nodo inicial
    line.nodeList.push( createNode() );

    return line;

};

var createNode = function(){

    var node = newNode();

    // To Do -> Asignar la altura dinámicamente
    node.width = 0;

    return node;

};

var createPage = function( pageInfo, marginInfo, backgroundColor ){

    var page = newPage();

    // Definimos los atibutos
    page.width           = pageInfo.width;
    page.height          = pageInfo.height;
    page.marginTop       = marginInfo.top;
    page.marginRight     = marginInfo.right;
    page.marginBottom    = marginInfo.bottom;
    page.marginLeft      = marginInfo.left;
    page.backgroundColor = backgroundColor || DEFAULT_PAGE_BACKGROUNDCOLOR;

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
    var line = createLine( 0, paragraph );

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

    waitingPageUpdate = false;

    var page       = null;
    var paragraph  = null;
    var line       = null;
    var node       = null;
    var pageHeight = 0.5;
    var wHeritage  = 0;
    var hHeritage  = 0;
    var i, j, k, m, startX, startY, endX, endY, underlineHeight;

    checkCanvasPagesSize();

    debugTime('draw');

    // To Do -> El scroll podría estar más optimizado
    currentDocumentHeight  = pageHeight;
    maxScrollTop           = pageHeight;
    pageHeight            -= parseInt( scrollTop, 10 );

    // To Do -> Renderizar solo la parte que deba mostrarse
    for( m = 0; m < pageList.length; m++ ){

        // Draw the page
        page      = pageList[ m ];
        hHeritage = 0;

        ctx.beginPath();
        ctx.rect( 0.5, pageHeight, page.width, page.height );
        ctx.fillStyle = page.backgroundColor;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#cacaca';
        ctx.stroke();

        // Draw the lines
        for( i = 0; i < page.paragraphList.length; i++ ){

            paragraph = page.paragraphList[ i ];

            for( j = 0; j < paragraph.lineList.length; j++ ){

                // To Do -> Gaps
                // To Do -> Altura de línea
                line = paragraph.lineList[ j ];

                // To Do -> Optimizar, evitar que se renderice una línea vacía if( line.totalChars ){
                if( line.totalChars ){

                    wHeritage = getLineOffset( line, paragraph );

                    for( k = 0; k < line.nodeList.length; k++ ){

                        node          = line.nodeList[ k ];
                        ctx.fillStyle = node.style.color;
                        startX        = parseInt( page.marginLeft + getLineIndentationLeftOffset( j, paragraph ) + wHeritage, 10 );
                        startY        = parseInt( pageHeight + page.marginTop + line.height + hHeritage, 10 );

                        setCanvasTextStyle( node.style );
                        ctx.fillText( node.string, startX, startY );

                        wHeritage += node.width;

                        if( !node.style['text-decoration-underline'] ){
                            continue;
                        }

                        underlineHeight = parseInt( node.height, 10 ) / 15;

                        if(underlineHeight < 1){
                            underlineHeight = 1;
                        }

                        startY = startY + underlineHeight;
                        endX   = startX + node.width;
                        endY   = startY;

                        ctx.beginPath();
                        
                        ctx.strokeStyle = node.style.color;
                        ctx.lineWidth   = underlineHeight;
                        
                        ctx.moveTo( parseInt( startX, 10 ), parseInt( startY, 10 ) + 0.5 );
                        ctx.lineTo( parseInt( endX, 10 ), parseInt( endY, 10 ) + 0.5 );
                        ctx.stroke();

                    }

                //}
                }

                hHeritage += line.height * paragraph.spacing;

            }

        }

        pageHeight            += Math.round( page.height ) + GAP;
        currentDocumentHeight += Math.round( page.height ) + GAP;

        if( m + 1 < pageList.length ){
            maxScrollTop += Math.round( page.height ) + GAP;
        }else if( canvasPages.height < page.height ){
            maxScrollTop += page.height - canvasPages.height + ( GAP * 2 );
        }

    }

    debugTimeEnd('draw');

};

var drawRange = function(){

    waitingRangeUpdate = false;

    // Calculamos la altura de inicio
    var startHeight = 0;
    var i;

    // Calculamos la posición vertical de la página de inicio
    for( i = 0; i < currentRangeStart.pageId; i++ ){
        startHeight += pageList[ i ].height + GAP;
    }

    // Tenemos en cuenta el margen superior
    startHeight += currentRangeStart.page.marginTop;

    // Calculamos la posición vertical del párrafo de inicio
    for( i = 0; i < currentRangeStart.paragraphId; i++ ){
        startHeight += currentRangeStart.page.paragraphList[ i ].height;
    }

    // Calculamos la posición vertical de la linea de inicio
    for( i = 0; i < currentRangeStart.lineId; i++ ){
        startHeight += currentRangeStart.paragraph.lineList[ i ].height * currentRangeStart.paragraph.spacing;
    }

    // Calculamos el ancho de inicio
    var startWidth = 0;

    // Margen izquierdo
    startWidth += currentRangeStart.page.marginLeft;

    // Margen izquierdo del párrafo
    startWidth += getLineIndentationLeftOffset( currentRangeStart.lineId, currentRangeStart.paragraph );

    // Alineación del párrafo
    startWidth += getLineOffset( currentRangeStart.line, currentRangeStart.paragraph );

    // Calculamos la posición del caracter
    for( i = 0; i < currentRangeStart.nodeId; i++ ){
        startWidth += currentRangeStart.line.nodeList[ i ].width;
    }

    startWidth += currentRangeStart.node.charList[ currentRangeStart.nodeChar - 1 ] || 0;

    // Procedimiento de coloreado
    var width  = 0;
    var offset = 0;

    // Si principio y fin están en la misma linea
    if(
        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId
    ){

        checkCanvasSelectSize();

        ctxSel.globalAlpha = 0.3;
        ctxSel.fillStyle   = '#7EBE30';

        // Si el nodo inicial es el mismo que el final
        if( currentRangeStart.nodeId === currentRangeEnd.nodeId ){
            width = currentRangeEnd.node.charList[ currentRangeEnd.nodeChar - 1 ] - ( currentRangeStart.node.charList[ currentRangeStart.nodeChar - 1 ] || 0 );
        }else{

            width += currentRangeStart.node.width - ( currentRangeStart.node.charList[ currentRangeStart.nodeChar - 1 ] || 0 );
            
            for( i = currentRangeStart.nodeId + 1; i < currentRangeEnd.nodeId; i++ ){
                width += currentRangeStart.line.nodeList[ i ].width;
            }

            width += currentRangeEnd.node.charList[ currentRangeEnd.nodeChar - 1 ] || 0;
            
        }

        ctxSel.rect(

            startWidth,
            startHeight - scrollTop,
            width,
            currentRangeStart.line.height * currentRangeStart.paragraph.spacing

        );

        ctxSel.fill();

        ctxSel.globalAlpha = 1;

    // Principio y fin en distintas líneas
    }else{

        checkCanvasSelectSize();

        ctxSel.globalAlpha = 0.3;
        ctxSel.fillStyle   = '#7EBE30';

        // Coloreamos la linea del principio de forma parcial
        width = currentRangeStart.node.width - ( currentRangeStart.node.charList[ currentRangeStart.nodeChar - 1 ] || 0 );
            
        for( i = currentRangeStart.nodeId + 1; i < currentRangeStart.line.nodeList.length; i++ ){
            width += currentRangeStart.line.nodeList[ i ].width;
        }

        ctxSel.beginPath();
        ctxSel.rect(

            startWidth,
            parseInt( startHeight - scrollTop, 10 ),
            width,
            currentRangeStart.line.height * currentRangeStart.paragraph.spacing

        );

        ctxSel.fill();

        startHeight += currentRangeStart.line.height * currentRangeStart.paragraph.spacing;

        var currentPageId  = currentRangeStart.pageId;
        var heightHeritage = 0;

        // Coloreamos las lineas intermedias de forma completa
        mapRangeLines( true, currentRangeStart, currentRangeEnd, function( pageId, page, paragraphId, paragraph, lineId, line ){

            // To Do -> Esto es un workaround porque el false no funciona como debería
            // To Do -> Esta podría ser una solución mejor para evitar los límites en el mapRangeLines
            if(
                ( pageId === currentRangeStart.pageId && paragraphId === currentRangeStart.paragraphId && lineId === currentRangeStart.lineId ) ||
                ( pageId === currentRangeEnd.pageId && paragraphId === currentRangeEnd.paragraphId && lineId === currentRangeEnd.lineId )
            ){
                return;
            }

            if( currentPageId !== pageId ){

                heightHeritage += pageList[ currentPageId ].height + GAP;
                currentPageId   = pageId;
                startHeight     = page.marginTop;

            }

            offset = page.marginLeft + getLineIndentationLeftOffset( lineId, paragraph ) + getLineOffset( line, paragraph );
            width  = 0;

            // Obtenemos el tamaño de rectangulo a colorear
            for( var n = 0; n < line.nodeList.length; n++ ){
                width += line.nodeList[ n ].width;
            }

            // Coloreamos la línea
            ctxSel.beginPath();
            ctxSel.rect(

                offset,
                parseInt( heightHeritage + startHeight - scrollTop, 10 ),
                width,
                line.height * paragraph.spacing

            );

            ctxSel.fill();
            
            startHeight += line.height * paragraph.spacing;

        });

        if( currentPageId !== currentRangeEnd.pageId ){

            heightHeritage += pageList[ currentPageId ].height + GAP;
            currentPageId   = currentRangeEnd.lineId;
            startHeight     = currentRangeEnd.page.marginTop;

        }

        // Coloreamos la línea del final de forma parcial
        width  = 0;
        offset = currentRangeEnd.page.marginLeft + getLineIndentationLeftOffset( currentRangeEnd.lineId, currentRangeEnd.paragraph ) + getLineOffset( currentRangeEnd.line, currentRangeEnd.paragraph );

        for( i = 0; i < currentRangeEnd.nodeId; i++ ){
            width += currentRangeEnd.line.nodeList[ i ].width;
        }

        // To Do -> Que debe pasar si es se coge el fallback 0?
        width += currentRangeEnd.node.charList[ currentRangeEnd.nodeChar - 1 ] || 0;

        ctxSel.beginPath();
        ctxSel.rect(

            offset,
            parseInt( heightHeritage + startHeight - scrollTop, 10 ),
            width,
            currentRangeEnd.line.height * currentRangeEnd.paragraph.spacing

        );

        ctxSel.fill();

        ctxSel.globalAlpha = 1;

    }

};

var drawRuleLeft = function(){

    waitingRuleLeftUpdate = false;

    // To Do -> Seguramente el alto no corresponde
    // To Do -> Renderizar solo la parte que deba mostrarse

    checkCanvasRuleLeftSize();

    // Calculamos cuanto espacio hay por encima de la página actual
    var top = 0;

    for( var i = 0; i < currentPageId; i++ ){
        top = pageList[ i ].height + GAP;
    }

    // Comprobamos si deben dibujarse los márgenes de la página actual
    if( scrollTop > top + currentPage.height ){
        console.log('no hay nada que renderizar');
        return;
    }

    top -= scrollTop;

    // Dibujamos el fondo
    ctxRuleLeft.beginPath();
    ctxRuleLeft.rect( 0, top, 15, currentPage.height );
    ctxRuleLeft.fillStyle = '#ffffff';
    ctxRuleLeft.fill();
    ctxRuleLeft.lineWidth = 1;
    ctxRuleLeft.strokeStyle = '#cacaca';
    ctxRuleLeft.stroke();

    // Dibujamos el fondo del margen izquierdo
    ctxRuleLeft.beginPath();
    ctxRuleLeft.rect( 1, 1 + top, 13, currentPage.marginTop );
    ctxRuleLeft.fillStyle = '#e4e4e4';
    ctxRuleLeft.fill();

    // Dibujamos el fondo del margen derecho
    ctxRuleLeft.beginPath();
    ctxRuleLeft.rect( 1, top + currentPage.height - currentPage.marginBottom, 13, currentPage.marginBottom );
    ctxRuleLeft.fillStyle = '#e4e4e4';
    ctxRuleLeft.fill();

    // Calculamos la posición de inicio
    var limit      = ( currentPage.height - currentPage.marginTop ) / CENTIMETER;
    var pos        = -parseFloat( ( currentPage.marginTop / CENTIMETER ).toFixed( 2 ) );
    var correction = parseFloat( ( parseFloat( Math.ceil( pos * 4 ) / 4 ).toFixed( 2 ) - pos ).toFixed( 2 ) ); // Redondea al múltiplo de 0.25 más cercano
    var height     = correction * CENTIMETER;

    // Ajusta la posición al redondea al múltiplo de 0.25 más cercano
    pos += correction;

    // Dibujamos las líneas
    ctxRuleLeft.font         = '10px Effra';
    ctxRuleLeft.textAlign    = 'center';
    ctxRuleLeft.textBaseline = 'middle';

    while( pos < limit ){

        // Si es 0 no lo representamos
        if( !pos ){

            height += 0.25 * CENTIMETER;
            pos    += 0.25;
            continue;

        }

        // Si es una posición entera ponemos el número
        if( parseInt( pos, 10 ) === pos ){

            ctxRuleLeft.fillStyle = '#6e6e6e';

            ctxRuleLeft.fillText( Math.abs( pos ).toString(), 7.5, parseInt( height + top, 10 ) );

        // Si es múltiplo de 0.5, le toca linea grande
        }else if( pos % 0.5 === 0 ){ // To Do -> Quizás haya algún problema con la precisión de las divisiones de JS. Estar pendientes

            ctxRuleLeft.fillStyle = '#cacaca';

            ctxRuleLeft.beginPath();
            ctxRuleLeft.rect( 4, parseInt( height + top, 10 ), 7, 1 );
            ctxRuleLeft.fill();

        // Es un múltiplo de 0.25, le toca linea pequeña
        }else{

            ctxRuleLeft.fillStyle = '#cacaca';

            ctxRuleLeft.beginPath();
            ctxRuleLeft.rect( 6, parseInt( height + top, 10 ), 3, 1 );
            ctxRuleLeft.fill();

        }

        height += 0.25 * CENTIMETER;
        pos    += 0.25;

    }

    // Dibujamos el borde
    ctxRuleLeft.beginPath();
    ctxRuleLeft.rect( 0.5, 0.5 + top, 14, currentPage.height );
    ctxRuleLeft.lineWidth = 1;
    ctxRuleLeft.strokeStyle = '#cacaca';
    ctxRuleLeft.stroke();

};

var drawRuleTop = function(){

    // To Do -> Seguramente el ancho no corresponde

    checkCanvasRuleTopSize();

    // Dibujamos el fondo
    ctxRuleTop.beginPath();
    ctxRuleTop.rect( 0, 0, currentPage.width, 15 );
    ctxRuleTop.fillStyle = '#ffffff';
    ctxRuleTop.fill();

    // Dibujamos el fondo del margen izquierdo
    ctxRuleTop.beginPath();
    ctxRuleTop.rect( 1, 1, currentPage.marginLeft, 13 );
    ctxRuleTop.fillStyle = '#e4e4e4';
    ctxRuleTop.fill();

    // Dibujamos el fondo del margen derecho
    ctxRuleTop.beginPath();
    ctxRuleTop.rect( currentPage.width - currentPage.marginRight, 1, currentPage.marginRight, 13 );
    ctxRuleTop.fillStyle = '#e4e4e4';
    ctxRuleTop.fill();

    // Calculamos la posición de inicio
    var limit      = ( currentPage.width - currentPage.marginLeft ) / CENTIMETER ;
    var pos        = -parseFloat( ( currentPage.marginLeft / CENTIMETER ).toFixed( 2 ) );
    var correction = parseFloat( ( parseFloat( Math.ceil( pos * 4 ) / 4 ).toFixed( 2 ) - pos ).toFixed( 2 ) ); // Redondea al múltiplo de 0.25 más cercano
    var width      = correction * CENTIMETER;

    // Ajusta la posición al redondea al múltiplo de 0.25 más cercano
    pos += correction;

    // Dibujamos las líneas
    ctxRuleTop.font         = '10px Effra';
    ctxRuleTop.textAlign    = 'center';
    ctxRuleTop.textBaseline = 'middle';

    while( pos < limit ){

        // Si es 0 no lo representamos
        if( !pos ){

            width += 0.25 * CENTIMETER;
            pos   += 0.25;
            continue;

        }

        // Si es una posición entera ponemos el número
        if( parseInt( pos, 10 ) === pos ){

            ctxRuleTop.fillStyle = '#6e6e6e';

            ctxRuleTop.fillText( Math.abs( pos ).toString(), width, 8 );

        // Si es múltiplo de 0.5, le toca linea grande
        }else if( pos % 0.5 === 0 ){ // To Do -> Quizás haya algún problema con la precisión de las divisiones de JS. Estar pendientes

            ctxRuleTop.fillStyle = '#cacaca';

            ctxRuleTop.beginPath();
            ctxRuleTop.rect( parseInt( width, 10 ), 4, 1, 7 );
            ctxRuleTop.fill();

        // Es un múltiplo de 0.25, le toca linea pequeña
        }else{

            ctxRuleTop.fillStyle = '#cacaca';

            ctxRuleTop.beginPath();
            ctxRuleTop.rect( parseInt( width, 10 ), 6, 1, 3 );
            ctxRuleTop.fill();

        }

        width += 0.25 * CENTIMETER;
        pos   += 0.25;

    }

    // Dibujamos el borde¡e
    ctxRuleTop.beginPath();
    ctxRuleTop.rect( 0.5, 0.5, currentPage.width, 14 );
    ctxRuleTop.lineWidth = 1;
    ctxRuleTop.strokeStyle = '#cacaca';
    ctxRuleTop.stroke();

};

var getCommonStyles = function( start, end ){

    // Comprobamos si es el mismo nodo, es una optimización
    if(

        start.pageId === end.pageId &&
        start.paragraphId === end.paragraphId &&
        start.lineId === end.lineId &&
        start.nodeId === end.nodeId

    ){
        return {
            
            node      : start.node.style,
            paragraph : start.paragraph.align

        };

    }

    var style          = $.extend( {}, start.node.style );
    var styleCounter   = Object.keys( style ).length;
    var paragraphStyle = {

        align    : start.paragraph.align,
        spacing  : start.paragraph.spacing,
        listMode : start.paragraph.listMode

    };

    mapRangeLines( true, start, end, function( pageId, page, paragraphId, paragraph, lineId, line ){

        // To Do -> Quizás esto se pueda optimizar, es una comprobación que se está haciendo cada n líneas en vez de cada m párrafos
        if( paragraphStyle.align !== paragraph.align ){
            paragraphStyle.align = -1;
        }

        if( paragraphStyle.spacing !== paragraph.spacing ){
            paragraphStyle.spacing = -1;
        }

        if( paragraphStyle.listMode !== paragraph.listMode ){
            paragraphStyle.listMode = LIST_NONE;
        }

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

    return {

        node      : style,
        paragraph : paragraphStyle

    };

};

var getElementsByRemoteParagraph = function( remoteParagraphId, remoteParagraphChar ){

    var i, page, pageId, paragraph, paragraphId, line, lineId, lineChar, node, nodeId, nodeChar;

    i      = 0;
    pageId = 0;

    while( true ){

        if( i + pageList[ pageId ].paragraphList.length >= remoteParagraphId ){
            paragraphId = remoteParagraphId - i;
            break;
        }

        i      += pageList[ pageId ].paragraphList.length;
        pageId += 1;

    }

    page      = pageList[ pageId ];
    paragraph = page.paragraphList[ paragraphId ];
    i         = 0;
    lineId    = 0;
    lineChar  = remoteParagraphChar;

    while( true ){

        if( i + paragraph.lineList[ lineId ].totalChars >= lineChar ){
            lineChar -= i;
            break;
        }

        i      += paragraph.lineList[ lineId ].totalChars;
        lineId += 1;

    }

    line     = paragraph.lineList[ lineId ];
    i        = 0;
    nodeId   = 0;
    nodeChar = lineChar;

    while( true ){

        if( i + line.nodeList[ nodeId ].string.length >= nodeChar ){
            nodeChar -= i;
            break;
        }

        /*
        if( i + line.nodeList[ nodeId ].string.length === nodeChar ){
            
            nodeId   += 1;
            nodeChar  = 0;
            break;
        
        }
        */

        i      += line.nodeList[ nodeId ].string.length;
        nodeId += 1;

    }

    node = line.nodeList[ nodeId ];

    return {

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

};

var getLineIndentationLeft = function( id, paragraph ){

    if( !id && paragraph.indentationSpecialType === 1 ){
        return paragraph.indentationSpecialValue;
    }

    if( id && paragraph.indentationSpecialType === 2 ){
        return paragraph.indentationSpecialValue;
    }

    return 0;

};

var getLineIndentationLeftOffset = function( id, paragraph ){

    var width = paragraph.indentationLeft;

    if( !id && paragraph.indentationSpecialType === 1 ){
        width += paragraph.indentationSpecialValue;
    }else if( id && paragraph.indentationSpecialType === 2 ){
        width += paragraph.indentationSpecialValue;
    }

    return width;

};

var getLineOffset = function( line, paragraph ){
    
    if( !paragraph.align ){
        return 0;
    }else if( paragraph.align === 1 ){
        return ( line.width - getLineTextTrimmedWidth( line ) ) / 2;
    }else if( paragraph.align === 2 ){
        return line.width - getLineTextTrimmedWidth( line );
    }
    
    return 0; // To Do -> Justificado

};

var getLineTextTrimmedWidth = function( line ){

    var nodeList = line.nodeList;
    var result   = 0;

    for( var i = 0; i < nodeList.length - 1; i++ ){
        result += nodeList[ i ].width;
    }

    nodeList  = nodeList.slice( -1 )[ 0 ];
    result   += nodeList.charList[ trimRight( nodeList.string ).length - 1 ] || 0;

    return result;

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
    var words, breakedWord, currentWord, offset, i, j, tmp;

    for( i = 0; i < nodeList.length; i++ ){

        offset = 0;

        if(
            breakedWord &&
            nodeList[ i ].string[ 0 ] === ' '
        ){

            tmp   = nodeList[ i ].string.split(/(\s+)/g);
            words = [ tmp[ 1 ] ];

            // Sino no solo hay espacio
            if( nodeList[ i ].string.length !== nodeList[ i ].string.split(' ').length - 1 ){

                tmp   = nodeList[ i ].string.slice( tmp[ 1 ].length );
                words = words.concat( tmp.match(/(\s*\S+\s*|\s+)/g) || [''] );

            }

        }else{
            words = nodeList[ i ].string.match(/(\s*\S+\s*|\s+)/g) || [''];
        }

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

            if(
                words[ j ].indexOf(' ') > -1 ||
                i === nodeList.length - 1
            ){
                result.push( currentWord );
            }else{
                breakedWord = true;
            }

        }

    }

    return result;

};

var handleArrowDown = function(){

    var pageId, paragraph, paragraphId, line, lineId, lineChar, nodeId, nodeChar, nodeList, charList, i, j, wHeritage;

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
        
        verticalKeysEnabled   = true;
        verticalKeysPosition  = currentNode.charList[ currentNodeCharId - 1 ] || 0;
        verticalKeysPosition += getLineIndentationLeftOffset( currentLineId, currentParagraph );

        for( i = 0; i < currentNodeId; i++ ){
            verticalKeysPosition += currentLine.nodeList[ i ].width;
        }

    }

    // Buscamos el nuevo caracter
    paragraph = pageList[ pageId ].paragraphList[ paragraphId ];
    line      = paragraph.lineList[ lineId ];
    nodeList  = line.nodeList;
    lineChar  = 0;
    wHeritage = getLineIndentationLeftOffset( lineId, paragraph );

    for( i = 0; i < nodeList.length; i++ ){

        if( wHeritage + nodeList[ i ].width < verticalKeysPosition ){

            lineChar  += nodeList[ i ].string.length;
            wHeritage += nodeList[ i ].width;
            continue;

        }

        nodeId   = i;
        charList = nodeList[ i ].charList;
        nodeChar = 0;

        for( j = 0; j < charList.length; j++ ){

            if( wHeritage + charList[ j ] > verticalKeysPosition ){
                nodeChar = j;
                break;
            }else if( j === charList.length - 1 || wHeritage + charList[ j ] === verticalKeysPosition ){
                nodeChar = j + 1;
                break;
            }

        }

        lineChar += nodeChar;

        break;

    }

    if( typeof nodeId === 'undefined' ){

        i        = getNodeInPosition( line, lineChar );
        nodeId   = i.nodeId;
        nodeChar = i.nodeChar;

    }

    setCursor( pageId, paragraphId, lineId, lineChar, nodeId, nodeChar );
    resetBlink();
    clearTemporalStyle();

    if( !realtime ){
        return;
    }

    realtime.send({

        cmd : CMD_POSITION,
        pos : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};

var handleArrowLeft = function(){

    verticalKeysEnabled = false;

    if( currentRangeStart ){
        
        setCursor( currentRangeStart.pageId, currentRangeStart.paragraphId, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.nodeId, currentRangeStart.nodeChar, false, true );
        updateToolsLineStatus();
        resetBlink();
        return;

    }

    // Principio del nodo
    if(

        currentNodeCharId === 0 ||
        (
            currentNodeId > 0 &&
            currentNodeCharId === 1 &&
            !currentLine.nodeList[ currentNodeId - 1 ].blocked
        )

    ){

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

        setCursor( page, paragraph, line, lineChar, node, nodeChar, false, true );
        updateToolsLineStatus();

    }else{

        var prev = currentNode.charList[ currentNodeCharId - 2 ] || 0;
        var next = currentNode.charList[ currentNodeCharId - 1 ];

        positionAbsoluteX += prev - next;
        currentLineCharId--;
        currentNodeCharId--;

    }

    resetBlink();
    clearTemporalStyle();

    if( !realtime ){
        return;
    }

    realtime.send({

        cmd : CMD_POSITION,
        pos : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]
        
    });

};

var handleArrowRight = function(){

    verticalKeysEnabled = false;

    if( currentRangeEnd ){
        
        setCursor( currentRangeEnd.pageId, currentRangeEnd.paragraphId, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.nodeId, currentRangeEnd.nodeChar );
        updateToolsLineStatus();
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
        updateToolsLineStatus();

    }else{

        var prev = currentNode.charList[ currentNodeCharId - 1 ] || 0;
        var next = currentNode.charList[ currentNodeCharId ];

        positionAbsoluteX += next - prev;

        currentLineCharId++;
        currentNodeCharId++;

    }

    resetBlink();
    clearTemporalStyle();

    if( !realtime ){
        return;
    }

    realtime.send({

        cmd : CMD_POSITION,
        pos : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]
        
    });

};

var handleArrowUp = function(){

    var pageId, paragraph, paragraphId, line, lineId, lineChar, nodeId, nodeChar, nodeList, charList, i, j, wHeritage;

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
        
        verticalKeysEnabled   = true;
        verticalKeysPosition  = currentNode.charList[ currentNodeCharId - 1 ] || 0;
        verticalKeysPosition += getLineIndentationLeftOffset( currentLineId, currentParagraph );

        for( i = 0; i < currentNodeId; i++ ){
            verticalKeysPosition += currentLine.nodeList[ i ].width;
        }

    }

    // Buscamos el nuevo caracter
    paragraph = pageList[ pageId ].paragraphList[ paragraphId ];
    line      = paragraph.lineList[ lineId ];
    nodeList  = line.nodeList;
    lineChar  = 0;
    wHeritage = getLineIndentationLeftOffset( lineId, paragraph );

    for( i = 0; i < nodeList.length; i++ ){

        if( wHeritage + nodeList[ i ].width < verticalKeysPosition ){

            lineChar  += nodeList[ i ].string.length;
            wHeritage += nodeList[ i ].width;
            continue;

        }

        nodeId   = i;
        charList = nodeList[ i ].charList;
        nodeChar = 0;

        for( j = 0; j < charList.length; j++ ){

            if( wHeritage + charList[ j ] > verticalKeysPosition ){
                nodeChar = j;
                break;
            }else if( j === charList.length - 1 || wHeritage +  charList[ j ] === verticalKeysPosition ){
                nodeChar = j + 1;
                break;
            }

        }

        lineChar += nodeChar;

        break;

    }

    if( typeof nodeId === 'undefined' ){

        i        = getNodeInPosition( line, lineChar );
        nodeId   = i.nodeId;
        nodeChar = i.nodeChar;

    }

    setCursor( pageId, paragraphId, lineId, lineChar, nodeId, nodeChar );
    resetBlink();
    clearTemporalStyle();

    if( !realtime ){
        return;
    }

    realtime.send({

        cmd : CMD_POSITION,
        pos : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]
        
    });

};

var handleBackspace = function(){

    if( currentRangeStart ){
        handleBackspaceSelection();
    }else{
        handleBackspaceNormal();
    }

};

var handleBackspaceNormal = function(){

    verticalKeysEnabled = false;

    // Principio del documento
    if( !currentPageId && !currentParagraphId && !currentLineId && !currentLineCharId ){
        console.log( 'principio del documento, se ignora' );
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

            // To Do -> Saltos entre distintas páginas

            // Si hay contenido fusionamos los párrafos
            var prevParagraph   = currentPage.paragraphList[ currentParagraphId - 1 ];
            var mergeParagraphs = currentLine.totalChars > 0;
            var pageId          = currentPageId;
            var mergePreLastLine;

            if( mergeParagraphs ){

                mergePreLastLine        = prevParagraph.lineList.length - 1;
                prevParagraph.lineList  = prevParagraph.lineList.concat( currentParagraph.lineList );
                prevParagraph.height   += currentParagraph.height;

            }

            currentPage.paragraphList = currentPage.paragraphList.slice( 0, currentParagraphId ).concat( currentPage.paragraphList.slice( currentParagraphId + 1 ) );

            if( currentParagraphId - 1 >= 0 ){
                currentParagraphId = currentParagraphId - 1;
            }else{

                currentPageId      = currentPageId - 1;
                currentPage        = pageList[ currentPageId ];
                currentParagraphId = currentPage.paragraphList.length - 1;
                
            }

            currentParagraph = currentPage.paragraphList[ currentParagraphId ];

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

            realocatePageInverse( pageId );

        }else{

            var prevLine = currentParagraph.lineList[ currentLineId - 1 ];
            var prevNode = prevLine.nodeList.slice( -1 )[ 0 ];
            var original = prevLine.totalChars - 1;

            prevNode.string           = prevNode.string.slice( 0, -1 );
            prevNode.charList         = prevNode.charList.slice( 0, -1 );
            prevNode.width            = prevNode.charList.slice( -1 )[ 0 ];
            prevLine.totalChars      += currentLine.totalChars - 1;
            prevLine.nodeList         = prevLine.nodeList.concat( currentLine.nodeList );
            currentParagraph.lineList = currentParagraph.lineList.slice( 0, currentLineId ).concat( currentParagraph.lineList.slice( currentLineId + 1 ) );
            currentParagraph.height  -= currentLine.height * currentParagraph.spacing;
            currentParagraph.height  -= prevLine.height * currentParagraph.spacing;

            // Actualizamos las alturas de las líneas
            var maxSize = 0;

            for( i = 0; i < prevLine.nodeList.length; i++ ){

                if( prevLine.nodeList[ i ].height > maxSize ){
                    maxSize = prevLine.nodeList[ i ].height;
                }

            }

            prevLine.height          = maxSize;
            currentParagraph.height += maxSize * currentParagraph.spacing; // To Do -> Estamos seguros de que esto es correcto?
            currentLineId            = currentLineId - 1;
            currentLine              = currentParagraph.lineList[ currentLineId ];

            var realocate = realocateLine( currentLineId, original );
            
            if( realocate >= 0 ){

                currentLineId     = currentLineId + 1;
                currentLine       = currentParagraph.lineList[ currentLineId ];
                currentLineCharId = realocate;

                var positions = getNodeInPosition( currentLine, realocate );

                currentNodeId     = positions.nodeId;
                currentNode       = currentLine.nodeList[ currentNodeId ];
                currentNodeCharId = positions.nodeChar;

            }

        }

        updateTools = true;

    }else{

        currentNode.string   = currentNode.string.slice( 0, currentNodeCharId - 1 ).concat( currentNode.string.slice( currentNodeCharId ) );
        currentNode.charList = currentNode.charList.slice( 0, currentNodeCharId - 1 );

        measureNode( currentParagraph, currentLine, currentLineId, currentLineCharId - 1, currentNode, currentNodeId, currentNodeCharId - 1 );

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
            updateTools          = true;

        // El nodo se queda vacío y no hay más nodos en la línea
        }else if( currentLineId && !currentNode.string.length && currentLine.nodeList.length === 1 ){

            currentParagraph.lineList = currentParagraph.lineList.slice( 0, currentLineId ).concat( currentParagraph.lineList.slice( currentLineId + 1 ) );
            currentParagraph.height   = currentParagraph.height - ( currentLine.height * currentParagraph.spacing );
            currentLineId             = currentLineId - 1;
            currentLine               = currentParagraph.lineList[ currentLineId ];
            currentLineCharId         = currentLine.totalChars;
            currentNodeId             = currentLine.nodeList.length - 1;
            currentNode               = currentLine.nodeList[ currentNodeId ];
            currentNodeCharId         = currentNode.string.length;
            updateTools               = true;

        }

    }

    // Definimos el cursor
    setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );
    resetBlink();
    clearTemporalStyle();

    if( updateTools ){
        updateToolsLineStatus();
    }

    if( !realtime ){
        return;
    }

    // To Do -> Basarse en las posiciones originales, no el las nuevas
    var paragraphId = originalParagraphId;
    var charId      = originalLineChar;

    for( i = 0; i < originalPageId; i++ ){
        paragraphId += pageList[ i ].paragraphList.length;
    }

    for( i = 0; i < originalLineId; i++ ){
        charId += originalParagraph.lineList[ i ].totalChars;
    }

    realtime.send({
        
        cmd  : CMD_BACKSPACE,
        data : [ paragraphId, charId ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};

var handleBackspaceSelection = function(){

    var i;
    var paragraphIdStart     = currentRangeStart.paragraphId;
    var charInParagraphStart = currentRangeStart.lineChar;
    var paragraphIdEnd       = currentRangeEnd.paragraphId;
    var charInParagraphEnd   = currentRangeEnd.lineChar;

    for( i = 0; i < currentRangeStart.pageId; i++ ){
        paragraphIdStart += pageList[ i ].paragraphList.length;
    }

    for( i = 0; i < currentRangeStart.lineId; i++ ){
        charInParagraphStart += currentRangeStart.paragraph.lineList[ i ].totalChars;
    }

    for( i = 0; i < currentRangeEnd.pageId; i++ ){
        paragraphIdEnd += pageList[ i ].paragraphList.length;
    }

    for( i = 0; i < currentRangeEnd.lineId; i++ ){
        charInParagraphEnd += currentRangeEnd.paragraph.lineList[ i ].totalChars;
    }

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
        
        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );
        
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
            currentRangeStart.line.totalChars -= currentRangeStart.line.nodeList[ i ].string.length;
        }

        currentRangeStart.line.nodeList = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId + 1 ).concat( currentRangeEnd.line.nodeList.slice( currentRangeEnd.nodeId ) );

        // Nodo final
        currentRangeEnd.line.totalChars -= currentRangeEnd.node.string.length;
        currentRangeEnd.node.string      = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeEnd.line.totalChars += currentRangeEnd.node.string.length;

        measureNode( currentRangeEnd.paragraph, currentRangeEnd.line, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.node, currentRangeEnd.nodeId, currentRangeEnd.nodeChar );
        
    // Si están en varias líneas
    }else{

        // Línea inicial
        // Nodo inicial
        currentRangeStart.line.totalChars -= currentRangeStart.node.string.length;
        currentRangeStart.node.string      = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar );
        currentRangeStart.line.totalChars += currentRangeStart.node.string.length;

        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );

        // Eliminamos los nodos siguientes de la línea
        for( i = currentRangeStart.nodeId + 1; i < currentRangeStart.line.nodeList.length; i++ ){
            currentRangeStart.line.totalChars -= currentRangeStart.line.nodeList[ i ].string.length;
        }

        // Si el nodo no se queda vacío
        if( currentRangeStart.node.string.length ){
            currentRangeStart.line.nodeList = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId + 1 );
        }else{

            currentRangeStart.line.nodeList  = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId );
            currentRangeStart.nodeId         = currentRangeStart.nodeId - 1; // To Do -> Y si el nodoId es 0? -> Y si se selecciona el párrafo entero?
            currentRangeStart.node           = currentRangeStart.line.nodeList[ currentRangeStart.nodeId ];
            currentRangeStart.nodeChar       = currentRangeStart.node.string.length;

        }

        // Líneas intermedias
        removeRangeLines( false, currentRangeStart, currentRangeEnd );

        // Línea final
        // Eliminamos los primeros nodes de la línea
        for( i = 0; i < currentRangeEnd.nodeId; i++ ){
            currentRangeEnd.line.totalChars -= currentRangeEnd.line.nodeList[ i ].string.length;
        }

        currentRangeEnd.line.totalChars -= currentRangeEnd.node.string.length;
        currentRangeEnd.node.string      = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeEnd.line.totalChars += currentRangeEnd.node.string.length;

        // Si el nodo no se queda vacío
        if( currentRangeEnd.node.string.length ){
            currentRangeEnd.line.nodeList = currentRangeEnd.line.nodeList.slice( currentRangeEnd.nodeId );
        }else{
            currentRangeEnd.line.nodeList = currentRangeEnd.line.nodeList.slice( currentRangeEnd.nodeId + 1 ); // To Do -> Estamos seguros de que esto es correcto?
        }

        measureNode( currentRangeEnd.paragraph, currentRangeEnd.line, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.node, currentRangeEnd.nodeId, 0 );

    }

    setCursor( currentRangeStart.pageId, currentRangeStart.paragraphId, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.nodeId, currentRangeStart.nodeChar, true );
    realocateLineInverse( currentLineId, currentLineCharId );
    resetBlink();

    realtime.send({
        
        cmd  : CMD_RANGE_BACKSPACE,
        data : [ paragraphIdStart, charInParagraphStart, paragraphIdEnd, charInParagraphEnd ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};

var handleDel = function(){

    if( currentRangeStart ){
        handleBackspaceSelection();
    }else{
        handleDelNormal();
    }

};

var handleDelNormal = function(){

    verticalKeysEnabled = false;

    // Final del documento
    if(
        currentPageId === pageList.length - 1 &&
        currentParagraphId === currentPage.paragraphList.length -1 &&
        currentLineId === currentParagraph.lineList.length - 1 &&
        currentLineCharId === currentLine.totalChars
    ){
        console.log( 'final del documento, se ignora' );
        return;
    }

    // Final del nodo
    if( currentNodeCharId === currentNode.string.length ){
        console.log('to do');
    }else{

        currentNode.string      = currentNode.string.slice( 0, currentNodeCharId - 1 ) + currentNode.string.slice( currentNodeCharId );
        currentLine.totalChars -= 1;

        measureNode( currentParagraph, currentLine, currentLineId, currentLineCharId, currentNode, currentNodeId, currentNodeCharId );

    }

    setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );
    realocateLineInverse( currentLineId, currentLineCharId );
    resetBlink();

};

var handleChar = function( newChar ){

    if( currentRangeStart ){
        handleCharSelection( newChar );
    }else{
        handleCharNormal( newChar );
    }

};

var handleCharNormal = function( newChar ){

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
            currentLine.nodeList = currentLine.nodeList.slice( 0, currentNodeId ).concat( newNode ).concat( currentLine.nodeList.slice( currentNodeId ) );
        // Si el cursor está al final del nodo
        }else if( currentNodeCharId === currentNode.string.length ){

            currentLine.nodeList = currentLine.nodeList.slice( 0, currentNodeId + 1 ).concat( newNode ).concat( currentLine.nodeList.slice( currentNodeId + 1 ) );
            currentNodeId        = currentNodeId + 1;

        // Si el cursor está en medio del nodo
        }else{

            endNode              = createNode( currentLine );
            endNode.string       = currentNode.string.slice( currentNodeCharId );
            endNode.style        = $.extend( {}, currentNode.style );
            endNode.height       = currentNode.height;
            currentNode.string   = currentNode.string.slice( 0, currentNodeCharId );
            currentNode.charList = currentNode.charList.slice( 0, currentNodeCharId );
            currentNode.width    = currentNode.charList.slice( -1 )[ 0 ];

            for( i = 1; i <= endNode.string.length; i++ ){
                endNode.charList.push( ctx.measureText( endNode.string.slice( 0, i ) ).width );
            }

            endNode.width        = endNode.charList.slice( -1 )[ 0 ];
            currentLine.nodeList = currentLine.nodeList.slice( 0, currentNodeId + 1 ).concat( newNode ).concat( endNode ).concat( currentLine.nodeList.slice( currentNodeId + 1 ) );
            currentNodeId        = currentNodeId + 1;

        }

        currentNode       = currentLine.nodeList[ currentNodeId ];
        currentNodeCharId = 0;

    }

    currentNode.string   = currentNode.string.slice( 0, currentNodeCharId ) + newChar + currentNode.string.slice( currentNodeCharId );
    currentNode.charList = currentNode.charList.slice( 0, currentNodeCharId );

    measureNode( currentParagraph, currentLine, currentLineId, currentLineCharId, currentNode, currentNodeId, currentNodeCharId );

    currentLine.totalChars++;
    currentLineCharId++;
    currentNodeCharId++;

    var realocation = realocateLine( currentLineId, currentLineCharId );

    if( realocation > 0 ){

        currentLineId++;

        currentLine       = currentParagraph.lineList[ currentLineId ];
        currentLineCharId = realocation;
        newNode           = getNodeInPosition( currentLine, currentLineCharId );
        currentNodeId     = newNode.nodeId;
        currentNode       = currentLine.nodeList[ currentNodeId ];
        currentNodeCharId = newNode.nodeChar;
        temporalStyle     = null;

        positionAbsoluteY += currentLine.height * currentParagraph.spacing;

        // Reiniciamos la posición horizontal
        positionAbsoluteX  = 0;
        positionAbsoluteX += currentPage.marginLeft;
        positionAbsoluteX += getLineIndentationLeftOffset( currentLineId, currentParagraph );
        positionAbsoluteX += getLineOffset( currentLine, currentParagraph );

        for( i = 0; i < currentNodeId; i++ ){
            positionAbsoluteX += currentLine.nodeList[ i ].width;
        }

        positionAbsoluteX += currentNode.charList[ currentNodeCharId - 1 ];

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
            positionAbsoluteX += currentLine.nodeList[ i ].width;
        }

        positionAbsoluteX += currentNode.charList[ currentNodeCharId - 1 ];

    }

    resetBlink();

    if( !realtime ){
        return;
    }

    // To Do -> Basarse en las posiciones originales, no el las nuevas
    var paragraphId = currentParagraphId;
    var charId      = currentLineCharId - 1;

    for( i = 0; i < currentPageId; i++ ){
        paragraphId += pageList[ i ].paragraphList.length;
    }

    for( i = 0; i < currentLineId; i++ ){
        charId += currentParagraph.lineList[ i ].totalChars;
    }

    realtime.send({
        
        cmd  : CMD_NEWCHAR,
        data : [ paragraphId, charId, newChar ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};

var handleCharSelection = function( newChar ){

    var i;
    var paragraphIdStart     = currentRangeStart.paragraphId;
    var charInParagraphStart = currentRangeStart.lineChar;
    var paragraphIdEnd       = currentRangeEnd.paragraphId;
    var charInParagraphEnd   = currentRangeEnd.lineChar;

    for( i = 0; i < currentRangeStart.pageId; i++ ){
        paragraphIdStart += pageList[ i ].paragraphList.length;
    }

    for( i = 0; i < currentRangeStart.lineId; i++ ){
        charInParagraphStart += currentRangeStart.paragraph.lineList[ i ].totalChars;
    }

    for( i = 0; i < currentRangeEnd.pageId; i++ ){
        paragraphIdEnd += pageList[ i ].paragraphList.length;
    }

    for( i = 0; i < currentRangeEnd.lineId; i++ ){
        charInParagraphEnd += currentRangeEnd.paragraph.lineList[ i ].totalChars;
    }

    // Si está en el mismo nodo
    if(
        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId &&
        currentRangeStart.nodeId === currentRangeEnd.nodeId
    ){

        currentRangeStart.line.totalChars -= currentRangeStart.node.string.length;
        currentRangeStart.node.string      = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar ) + newChar + currentRangeStart.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeStart.line.totalChars += currentRangeStart.node.string.length;
        
        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );
        
    // Si está en la misma línea pero en distintos nodos
    }else if(
        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId
    ){

        // Nodo inicial
        currentRangeStart.line.totalChars -= currentRangeStart.node.string.length;
        currentRangeStart.node.string      = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar ) + newChar;
        currentRangeStart.line.totalChars += currentRangeStart.node.string.length;

        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );

        // Eliminado de nodos intermedios
        for( i = currentRangeStart.nodeId + 1; i < currentRangeEnd.nodeId; i++ ){
            currentRangeStart.line.totalChars -= currentRangeStart.line.nodeList[ i ].string.length;
        }

        currentRangeStart.line.nodeList = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId + 1 ).concat( currentRangeEnd.line.nodeList.slice( currentRangeEnd.nodeId ) );

        // Nodo final
        currentRangeEnd.line.totalChars -= currentRangeEnd.node.string.length;
        currentRangeEnd.node.string      = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeEnd.line.totalChars += currentRangeEnd.node.string.length;

        measureNode( currentRangeEnd.paragraph, currentRangeEnd.line, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.node, currentRangeEnd.nodeId, currentRangeEnd.nodeChar );
        
    // Si están en varias líneas
    }else{

        // Línea inicial
        // Nodo inicial
        currentRangeStart.line.totalChars -= currentRangeStart.node.string.length;
        currentRangeStart.node.string      = currentRangeStart.node.string.slice( 0, currentRangeStart.nodeChar ) + newChar;
        currentRangeStart.line.totalChars += currentRangeStart.node.string.length;

        measureNode( currentRangeStart.paragraph, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );

        // Eliminamos los nodos siguientes de la línea
        for( i = currentRangeStart.nodeId + 1; i < currentRangeStart.line.nodeList.length; i++ ){
            currentRangeStart.line.totalChars -= currentRangeStart.line.nodeList[ i ].string.length;
        }

        currentRangeStart.line.nodeList = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId + 1 );

        // Líneas intermedias
        removeRangeLines( false, currentRangeStart, currentRangeEnd );

        // Línea final
        // Eliminamos los primeros nodes de la línea
        for( i = 0; i < currentRangeEnd.nodeId; i++ ){
            currentRangeEnd.line.totalChars -= currentRangeEnd.line.nodeList[ i ].string.length;
        }

        currentRangeEnd.line.totalChars -= currentRangeEnd.node.string.length;
        currentRangeEnd.node.string      = currentRangeEnd.node.string.slice( currentRangeEnd.nodeChar );
        currentRangeEnd.line.totalChars += currentRangeEnd.node.string.length;
        currentRangeEnd.line.nodeList    = currentRangeEnd.line.nodeList.slice( currentRangeEnd.nodeId );

        measureNode( currentRangeEnd.paragraph, currentRangeEnd.line, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.node, currentRangeEnd.nodeId, 0 );

    }

    setCursor( currentRangeStart.pageId, currentRangeStart.paragraphId, currentRangeStart.lineId, currentRangeStart.lineChar + 1, currentRangeStart.nodeId, currentRangeStart.nodeChar + 1, true );
    realocateLineInverse( currentLineId, currentLineCharId );
    resetBlink();

    realtime.send({
        
        cmd  : CMD_RANGE_NEWCHAR,
        data : [ paragraphIdStart, charInParagraphStart, paragraphIdEnd, charInParagraphEnd, newChar ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};

var handleEnter = function(){

    verticalKeysEnabled = false;

    // To Do -> Comprobar que entra en la página

    var i, maxSize, movedLines;
    var newPageId           = 0;
    var newParagraph        = createParagraph( currentPage );
    var newParagraphId      = currentParagraphId + 1;
    var newLine             = newParagraph.lineList[ 0 ];
    var newNode             = newLine.nodeList[ 0 ];
    var originalPageId      = currentPageId;
    var originalParagraph   = currentParagraph;
    var originalParagraphId = currentParagraphId;
    var originalLineId      = currentLineId;
    var originalLineChar    = currentLineCharId;

    // Heredamos las propiedades del párrafo
    newParagraph.align                   = currentParagraph.align;
    newParagraph.indentationLeft         = currentParagraph.indentationLeft;
    newParagraph.indentationRight        = currentParagraph.indentationRight;
    newParagraph.indentationSpecialType  = currentParagraph.indentationSpecialType;
    newParagraph.indentationSpecialValue = currentParagraph.indentationSpecialValue;
    newParagraph.spacing                 = currentParagraph.spacing;
    newParagraph.width                   = currentParagraph.width;

    // To Do -> A tener en cuenta con el siguiente paso ( herencia de altura de la linea ), quizás el primer nodo pase a tener un tamaño diferente que el de la linea actual
    // Si es una lista lo clonamos
    if( currentParagraph.listMode === LIST_BULLET){

        newLine.nodeList.unshift( $.extend( true, {}, currentParagraph.lineList[ 0 ].nodeList[ 0 ] ) );

        newParagraph.listMode = currentParagraph.listMode;
        newLine.tabList       = [ 1 ]; // To Do -> Herencia de tabs
        newLine.totalChars    = newLine.nodeList[ 0 ].string.length;

    }else if( currentParagraph.listMode === LIST_NUMBER){

        newLine.nodeList.unshift( $.extend( true, {}, currentParagraph.lineList[ 0 ].nodeList[ 0 ] ) );

        newParagraph.listMode        = currentParagraph.listMode;
        newLine.nodeList[ 0 ].string = ( parseInt( newLine.nodeList[ 0 ].string, 10 ) + 1 ) + '.' + '\t';
        newLine.tabList              = [ newLine.nodeList[ 0 ].string.indexOf('\t') ]; // To Do -> Herencia de tabs
        newLine.totalChars           = newLine.nodeList[ 0 ].string.length;

        measureNode( newParagraph, newLine, 0, 0, newLine.nodeList[ 0 ], 0, 0 );

    }

    // Partimos la línea si no estamos al principio de ella
    if( currentLineCharId ){

        // Obtenemos las líneas a mover y el texto
        movedLines = currentParagraph.lineList.slice( currentLineId + 1 );

        // Clonamos el nodo actual
        newNode.string = currentNode.string.slice( currentNodeCharId );
        newNode.style  = $.extend( {}, currentNode.style );
        newNode.height = currentNode.height;

        if( currentLineCharId === currentLine.totalChars ){

            for( i in temporalStyle ){
                setNodeStyle( currentParagraph, currentLine, newNode, i, temporalStyle[ i ] );
            }

            temporalStyle = null;

        }

        measureNode( newParagraph, newLine, 0, 0, newNode, 0, 0 );

        newLine.totalChars += newNode.string.length;

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

            if( newLine.nodeList[ i ].height > maxSize ){
                maxSize = newLine.nodeList[ i ].height;
            }

        }

        newParagraph.height = maxSize * newParagraph.spacing;
        newLine.height      = maxSize;

        maxSize = 0;
        
        for( i = 0; i < currentLine.nodeList.length; i++ ){

            if( currentLine.nodeList[ i ].height > maxSize ){
                maxSize = currentLine.nodeList[ i ].height;
            }

        }

        currentParagraph.height -= currentLine.height * currentParagraph.spacing;
        currentParagraph.height += maxSize * currentParagraph.spacing;
        currentLine.height       = maxSize;

        // Movemos las líneas siguientes
        newParagraph.lineList     = newParagraph.lineList.concat( currentParagraph.lineList.slice( currentLineId + 1 ) );
        currentParagraph.lineList = currentParagraph.lineList.slice( 0, currentLineId + 1 );

        // Insertamos el párrafo en su posición
        currentPage.paragraphList = currentPage.paragraphList.slice( 0, currentParagraphId + 1 ).concat( newParagraph ).concat( currentPage.paragraphList.slice( currentParagraphId + 1 ) );

    // Si estamos al principio de la línea pero no en la primera linea del párrafo
    }else if( currentLineId ){

        movedLines                = currentParagraph.lineList.slice( currentLineId );
        newParagraph.lineList     = movedLines;
        currentParagraph.lineList = currentParagraph.lineList.slice( 0, currentLineId );
        currentPage.paragraphList = currentPage.paragraphList.slice( 0, currentParagraphId + 1 ).concat( newParagraph ).concat( currentPage.paragraphList.slice( currentParagraphId + 1 ) );

    // Al principio del párrafo
    }else{

        movedLines          = [];
        newNode.style       = $.extend( {}, currentNode.style );
        newNode.height      = currentNode.height;
        newLine.height      = currentNode.height;
        newParagraph.height = currentNode.height * newParagraph.spacing;

        // Insertamos el párrafo en su posición
        currentPage.paragraphList = currentPage.paragraphList.slice( 0, currentParagraphId ).concat( newParagraph ).concat( currentPage.paragraphList.slice( currentParagraphId ) );

    }

    // Actualizamos las alturas del párrafo de origen y destino
    for( i = 0; i < movedLines.length; i++ ){

        currentParagraph.height -= movedLines[ i ].height * currentParagraph.spacing;
        newParagraph.height     += movedLines[ i ].height * currentParagraph.spacing;

    }

    var lastLineInPage = currentPage.paragraphList.length - 2 === currentParagraphId && currentParagraph.lineList.length - 1 === currentLineId;
    var realocation    = realocatePage( currentPageId );

    if( realocation && lastLineInPage ){

        newPageId      = realocation.pageId;
        newParagraphId = realocation.paragraphId;

    }else{
        newPageId = currentPageId;
    }

    // Posicionamos el cursor
    setCursor( newPageId, newParagraphId, 0, 0, 0, 0 );
    realocateLineInverse( 0, 0 );
    resetBlink();

    if( !realtime ){
        return;
    }

    // To Do -> Basarse en las posiciones originales, no el las nuevas
    var paragraphId = originalParagraphId;
    var charId      = originalLineChar;

    for( i = 0; i < originalPageId; i++ ){
        paragraphId += pageList[ i ].paragraphList.length;
    }

    for( i = 0; i < originalLineId; i++ ){
        charId += originalParagraph.lineList[ i ].totalChars;
    }

    realtime.send({
        
        cmd  : CMD_ENTER,
        data : [ paragraphId, charId ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};

var handleRemoteBackspace = function(  pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar  ){

    // Principio del documento
    if( !pageId && !paragraphId && !lineId && !lineChar ){
        console.log( 'principio del documento, se ignora' );
        return;
    }

    var nodePosition, i;

    // Principio de línea
    if( !lineChar ){

        // La línea es la primera del párrafo
        if( lineId === 0 ){

            // To Do -> Saltos entre distintas páginas

            // Si hay contenido fusionamos los párrafos
            var prevParagraph   = page.paragraphList[ paragraphId - 1 ];
            var mergeParagraphs = line.totalChars > 0;
            var newPageId       = pageId;
            var mergePreLastLine;

            if( mergeParagraphs ){

                mergePreLastLine        = prevParagraph.lineList.length - 1;
                prevParagraph.lineList  = prevParagraph.lineList.concat( paragraph.lineList );
                prevParagraph.height   += paragraph.height;

            }

            page.paragraphList = page.paragraphList.slice( 0, paragraphId ).concat( page.paragraphList.slice( paragraphId + 1 ) );

            if( mergeParagraphs ){
                mergeParagraphs = realocateLineInverse( mergePreLastLine + 1, lineChar );
            }

            realocatePageInverse( newPageId );

        }else{

            var prevLine = paragraph.lineList[ lineId - 1 ];
            var prevNode = prevLine.nodeList.slice( -1 )[ 0 ];
            var original = prevLine.totalChars - 1;

            prevNode.string      = prevNode.string.slice( 0, -1 );
            prevNode.charList    = prevNode.charList.slice( 0, -1 );
            prevNode.width       = prevNode.charList.slice( -1 )[ 0 ];
            prevLine.totalChars += line.totalChars - 1;
            prevLine.nodeList    = prevLine.nodeList.concat( line.nodeList );
            paragraph.lineList   = paragraph.lineList.slice( 0, lineId ).concat( paragraph.lineList.slice( lineId + 1 ) );
            paragraph.height    -= line.height * paragraph.spacing;
            paragraph.height    -= prevLine.height * paragraph.spacing;

            // Actualizamos las alturas de las líneas
            var maxSize = 0;

            for( i = 0; i < prevLine.nodeList.length; i++ ){

                if( prevLine.nodeList[ i ].height > maxSize ){
                    maxSize = prevLine.nodeList[ i ].height;
                }

            }

            prevLine.height   = maxSize;
            paragraph.height += maxSize * paragraph.spacing; // To Do -> Estamos seguros de que esto es correcto?

        }

    }else{

        node.string   = node.string.slice( 0, nodeChar - 1 ).concat( node.string.slice( nodeChar ) );
        node.charList = node.charList.slice( 0, nodeChar - 1 );

        measureNode( paragraph, line, lineId, lineChar - 1, node, nodeId, nodeChar - 1 );

        lineChar--;
        line.totalChars--;

        // Realocamos el contenido
        var realocation = realocateLineInverse( lineId, lineChar );

        // Se ha producido una realocation inversa
        if( realocation.realocation && realocation.lineChar > 0 ){
            return;
        }

        // El nodo se queda vacío y hay más nodos en la línea
        if( !node.string.length && line.nodeList.length > 1 ){

            line.nodeList = line.nodeList.slice( 0, nodeId ).concat( line.nodeList.slice( nodeId + 1 ) );

        // El nodo se queda vacío y no hay más nodos en la línea
        }else if( lineId && !node.string.length && line.nodeList.length === 1 ){

            paragraph.lineList = paragraph.lineList.slice( 0, lineId ).concat( paragraph.lineList.slice( lineId + 1 ) );
            paragraph.height   = paragraph.height - ( line.height * paragraph.spacing );

        }

    }

};

var handleRemoteBackspaceSelection = function( rangeStart, rangeEnd ){

    var i;

    // Si está en el mismo nodo
    if(
        rangeStart.pageId === rangeEnd.pageId &&
        rangeStart.paragraphId === rangeEnd.paragraphId &&
        rangeStart.lineId === rangeEnd.lineId &&
        rangeStart.nodeId === rangeEnd.nodeId
    ){

        rangeStart.line.totalChars -= rangeStart.node.string.length;
        rangeStart.node.string      = rangeStart.node.string.slice( 0, rangeStart.nodeChar ) + rangeStart.node.string.slice( rangeEnd.nodeChar );
        rangeStart.line.totalChars += rangeStart.node.string.length;
        
        measureNode( rangeStart.paragraph, rangeStart.line, rangeStart.lineId, rangeStart.lineChar, rangeStart.node, rangeStart.nodeId, rangeStart.nodeChar );
        
    // Si está en la misma línea pero en distintos nodos
    }else if(
        rangeStart.pageId === rangeEnd.pageId &&
        rangeStart.paragraphId === rangeEnd.paragraphId &&
        rangeStart.lineId === rangeEnd.lineId
    ){

        // Nodo inicial
        rangeStart.line.totalChars -= rangeStart.node.string.length;
        rangeStart.node.string      = rangeStart.node.string.slice( 0, rangeStart.nodeChar );
        rangeStart.line.totalChars += rangeStart.node.string.length;

        measureNode( rangeStart.paragraph, rangeStart.line, rangeStart.lineId, rangeStart.lineChar, rangeStart.node, rangeStart.nodeId, rangeStart.nodeChar );

        // Eliminado de nodos intermedios
        for( i = rangeStart.nodeId + 1; i < rangeEnd.nodeId; i++ ){
            rangeStart.line.totalChars -= rangeStart.line.nodeList[ i ].string.length;
        }

        rangeStart.line.nodeList = rangeStart.line.nodeList.slice( 0, rangeStart.nodeId + 1 ).concat( rangeEnd.line.nodeList.slice( rangeEnd.nodeId ) );

        // Nodo final
        rangeEnd.line.totalChars -= rangeEnd.node.string.length;
        rangeEnd.node.string      = rangeEnd.node.string.slice( rangeEnd.nodeChar );
        rangeEnd.line.totalChars += rangeEnd.node.string.length;

        measureNode( rangeEnd.paragraph, rangeEnd.line, rangeEnd.lineId, rangeEnd.lineChar, rangeEnd.node, rangeEnd.nodeId, rangeEnd.nodeChar );
        
    // Si están en varias líneas
    }else{

        // Línea inicial
        // Nodo inicial
        rangeStart.line.totalChars -= rangeStart.node.string.length;
        rangeStart.node.string      = rangeStart.node.string.slice( 0, rangeStart.nodeChar );
        rangeStart.line.totalChars += rangeStart.node.string.length;

        measureNode( rangeStart.paragraph, rangeStart.line, rangeStart.lineId, rangeStart.lineChar, rangeStart.node, rangeStart.nodeId, rangeStart.nodeChar );

        // Eliminamos los nodos siguientes de la línea
        for( i = rangeStart.nodeId + 1; i < rangeStart.line.nodeList.length; i++ ){
            rangeStart.line.totalChars -= rangeStart.line.nodeList[ i ].string.length;
        }

        // Si el nodo no se queda vacío
        if( rangeStart.node.string.length ){
            rangeStart.line.nodeList = rangeStart.line.nodeList.slice( 0, rangeStart.nodeId + 1 );
        }else{

            rangeStart.line.nodeList  = rangeStart.line.nodeList.slice( 0, rangeStart.nodeId );
            rangeStart.nodeId         = rangeStart.nodeId - 1; // To Do -> Y si el nodoId es 0? -> Y si se selecciona el párrafo entero?
            rangeStart.node           = rangeStart.line.nodeList[ rangeStart.nodeId ];
            rangeStart.nodeChar       = rangeStart.node.string.length;

        }

        // Líneas intermedias
        removeRangeLines( false, rangeStart, rangeEnd );

        // Línea final
        // Eliminamos los primeros nodes de la línea
        for( i = 0; i < rangeEnd.nodeId; i++ ){
            rangeEnd.line.totalChars -= rangeEnd.line.nodeList[ i ].string.length;
        }

        rangeEnd.line.totalChars -= rangeEnd.node.string.length;
        rangeEnd.node.string      = rangeEnd.node.string.slice( rangeEnd.nodeChar );
        rangeEnd.line.totalChars += rangeEnd.node.string.length;

        // Si el nodo no se queda vacío
        if( rangeEnd.node.string.length ){
            rangeEnd.line.nodeList = rangeEnd.line.nodeList.slice( rangeEnd.nodeId );
        }else{
            rangeEnd.line.nodeList = rangeEnd.line.nodeList.slice( rangeEnd.nodeId + 1 ); // To Do -> Estamos seguros de que esto es correcto?
        }

        measureNode( rangeEnd.paragraph, rangeEnd.line, rangeEnd.lineId, rangeEnd.lineChar, rangeEnd.node, rangeEnd.nodeId, 0 );

    }

};

var handleRemoteChar = function( pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar, newChar ){

    node.string   = node.string.slice( 0, nodeChar ) + newChar + node.string.slice( nodeChar );
    node.charList = node.charList.slice( 0, nodeChar );

    measureNode( paragraph, line, lineId, lineChar, node, nodeId, nodeChar );

    line.totalChars++;
    nodeChar++;
    lineChar++;

    /*var realocation = */
    realocateLine( lineId, lineChar ); // To Do -> Actualizar el realocateLine para que pueda funcionar en cualquier párrafo, no solo el que tiene el foco

    /*
    if( realocation > 0 ){

        lineId++;

        line          = paragraph.lineList[ lineId ];
        lineChar      = realocation;
        newNode       = getNodeInPosition( line, lineChar );
        nodeId        = newNode.nodeId;
        node          = line.nodeList[ nodeId ];
        nodeChar      = newNode.nodeChar;
        temporalStyle = null;

        positionAbsoluteY += line.height * paragraph.spacing;

        // Reiniciamos la posición horizontal
        positionAbsoluteX  = 0;
        positionAbsoluteX += currentPage.marginLeft;
        positionAbsoluteX += getLineIndentationLeftOffset( lineId, paragraph );
        positionAbsoluteX += getLineOffset( line, paragraph );

        for( i = 0; i < nodeId; i++ ){
            positionAbsoluteX += line.nodeList[ i ].width;
        }

        positionAbsoluteX += node.charList[ nodeChar - 1 ];

    }else if( temporalStyle ){

        setCursor( currentPageId, paragraphId, lineId, lineChar, nodeId, nodeChar, true );
        
        temporalStyle = null;

    }else{

        // Reiniciamos la posición horizontal
        // To Do -> Quizás pueda optimizarse
        positionAbsoluteX  = 0;
        positionAbsoluteX += currentPage.marginLeft;
        positionAbsoluteX += getLineIndentationLeftOffset( lineId, paragraph );
        positionAbsoluteX += getLineOffset( line, paragraph );

        for( i = 0; i < nodeId; i++ ){
            positionAbsoluteX += line.nodeList[ i ].width;
        }

        positionAbsoluteX += node.charList[ nodeChar - 1 ];

    }
    */

    /*
    node.string     = node.string.slice( 0, nodeChar ) + newChar + node.string.slice( nodeChar );
    line.totalChars = line.totalChars + 1;

    measureNode( paragraph, line, lineId, null, node, nodeId, nodeChar );
    */

};

var handleRemoteCharSelection = function( rangeStart, rangeEnd, newChar ){

    var i;

    // Si está en el mismo nodo
    if(
        rangeStart.pageId === rangeEnd.pageId &&
        rangeStart.paragraphId === rangeEnd.paragraphId &&
        rangeStart.lineId === rangeEnd.lineId &&
        rangeStart.nodeId === rangeEnd.nodeId
    ){

        rangeStart.line.totalChars -= rangeStart.node.string.length;
        rangeStart.node.string      = rangeStart.node.string.slice( 0, rangeStart.nodeChar ) + newChar + rangeStart.node.string.slice( rangeEnd.nodeChar );
        rangeStart.line.totalChars += rangeStart.node.string.length;
        
        measureNode( rangeStart.paragraph, rangeStart.line, rangeStart.lineId, rangeStart.lineChar, rangeStart.node, rangeStart.nodeId, rangeStart.nodeChar );
        
    // Si está en la misma línea pero en distintos nodos
    }else if(
        rangeStart.pageId === rangeEnd.pageId &&
        rangeStart.paragraphId === rangeEnd.paragraphId &&
        rangeStart.lineId === rangeEnd.lineId
    ){

        // Nodo inicial
        rangeStart.line.totalChars -= rangeStart.node.string.length;
        rangeStart.node.string      = rangeStart.node.string.slice( 0, rangeStart.nodeChar ) + newChar;
        rangeStart.line.totalChars += rangeStart.node.string.length;

        measureNode( rangeStart.paragraph, rangeStart.line, rangeStart.lineId, rangeStart.lineChar, rangeStart.node, rangeStart.nodeId, rangeStart.nodeChar );

        // Eliminado de nodos intermedios
        for( i = rangeStart.nodeId + 1; i < rangeEnd.nodeId; i++ ){
            rangeStart.line.totalChars -= rangeStart.line.nodeList[ i ].string.length;
        }

        rangeStart.line.nodeList = rangeStart.line.nodeList.slice( 0, rangeStart.nodeId + 1 ).concat( rangeEnd.line.nodeList.slice( rangeEnd.nodeId ) );

        // Nodo final
        rangeEnd.line.totalChars -= rangeEnd.node.string.length;
        rangeEnd.node.string      = rangeEnd.node.string.slice( rangeEnd.nodeChar );
        rangeEnd.line.totalChars += rangeEnd.node.string.length;

        measureNode( rangeEnd.paragraph, rangeEnd.line, rangeEnd.lineId, rangeEnd.lineChar, rangeEnd.node, rangeEnd.nodeId, rangeEnd.nodeChar );
        
    // Si están en varias líneas
    }else{

        // Línea inicial
        // Nodo inicial
        rangeStart.line.totalChars -= rangeStart.node.string.length;
        rangeStart.node.string      = rangeStart.node.string.slice( 0, rangeStart.nodeChar ) + newChar;
        rangeStart.line.totalChars += rangeStart.node.string.length;

        measureNode( rangeStart.paragraph, rangeStart.line, rangeStart.lineId, rangeStart.lineChar, rangeStart.node, rangeStart.nodeId, rangeStart.nodeChar );

        // Eliminamos los nodos siguientes de la línea
        for( i = rangeStart.nodeId + 1; i < rangeStart.line.nodeList.length; i++ ){
            rangeStart.line.totalChars -= rangeStart.line.nodeList[ i ].string.length;
        }

        rangeStart.line.nodeList = rangeStart.line.nodeList.slice( 0, rangeStart.nodeId + 1 );

        // Líneas intermedias
        removeRangeLines( false, rangeStart, rangeEnd );

        // Línea final
        // Eliminamos los primeros nodes de la línea
        for( i = 0; i < rangeEnd.nodeId; i++ ){
            rangeEnd.line.totalChars -= rangeEnd.line.nodeList[ i ].string.length;
        }

        rangeEnd.line.totalChars -= rangeEnd.node.string.length;
        rangeEnd.node.string      = rangeEnd.node.string.slice( rangeEnd.nodeChar );
        rangeEnd.line.totalChars += rangeEnd.node.string.length;
        rangeEnd.line.nodeList    = rangeEnd.line.nodeList.slice( rangeEnd.nodeId );

        measureNode( rangeEnd.paragraph, rangeEnd.line, rangeEnd.lineId, rangeEnd.lineChar, rangeEnd.node, rangeEnd.nodeId, 0 );

    }

};

var handleRemoteEnter = function( pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar ){

    var i, maxSize, movedLines;
    var newParagraph   = createParagraph( page );
    var newLine        = newParagraph.lineList[ 0 ];
    var newNode        = newLine.nodeList[ 0 ];

    // Heredamos las propiedades del párrafo
    newParagraph.align                   = paragraph.align;
    newParagraph.indentationLeft         = paragraph.indentationLeft;
    newParagraph.indentationRight        = paragraph.indentationRight;
    newParagraph.indentationSpecialType  = paragraph.indentationSpecialType;
    newParagraph.indentationSpecialValue = paragraph.indentationSpecialValue;
    newParagraph.spacing                 = paragraph.spacing;
    newParagraph.width                   = paragraph.width;

    // To Do -> A tener en cuenta con el siguiente paso ( herencia de altura de la linea ), quizás el primer nodo pase a tener un tamaño diferente que el de la linea actual
    // Si es una lista lo clonamos
    if( paragraph.listMode === LIST_BULLET){

        newLine.nodeList.unshift( $.extend( true, {}, paragraph.lineList[ 0 ].nodeList[ 0 ] ) );

        newParagraph.listMode = paragraph.listMode;
        newLine.tabList       = [ 1 ]; // To Do -> Herencia de tabs
        newLine.totalChars    = newLine.nodeList[ 0 ].string.length;

    }else if( paragraph.listMode === LIST_NUMBER){

        newLine.nodeList.unshift( $.extend( true, {}, paragraph.lineList[ 0 ].nodeList[ 0 ] ) );

        newParagraph.listMode        = paragraph.listMode;
        newLine.nodeList[ 0 ].string = ( parseInt( newLine.nodeList[ 0 ].string, 10 ) + 1 ) + '.' + '\t';
        newLine.tabList              = [ newLine.nodeList[ 0 ].string.indexOf('\t') ]; // To Do -> Herencia de tabs
        newLine.totalChars           = newLine.nodeList[ 0 ].string.length;

        measureNode( newParagraph, newLine, 0, 0, newLine.nodeList[ 0 ], 0, 0 );

    }

    // Partimos la línea si no estamos al principio de ella
    if( lineChar ){

        // Obtenemos las líneas a mover y el texto
        movedLines = paragraph.lineList.slice( lineId + 1 );

        // Clonamos el nodo actual
        newNode.string = node.string.slice( nodeChar );
        newNode.style  = $.extend( {}, node.style );
        newNode.height = node.height;

        if( lineChar === line.totalChars ){

            for( i in temporalStyle ){
                setNodeStyle( paragraph, line, newNode, i, temporalStyle[ i ] );
            }

            temporalStyle = null;

        }

        setCanvasTextStyle( newNode.style );

        for( i = 1; i <= newNode.string.length; i++ ){
            newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
        }

        newNode.width       = newNode.charList[ newNode.charList.length - 1 ];
        newLine.totalChars += newNode.string.length;

        // Eliminamos el contenido del nodo actual y actualizamos su tamaño
        node.string     = node.string.slice( 0, nodeChar );
        node.charList   = node.charList.slice( 0, nodeChar );
        node.width      = node.charList[ node.charList.length - 1 ];
        line.totalChars = line.totalChars - newNode.string.length;

        // Movemos los nodos siguientes
        newLine.nodeList     = newLine.nodeList.concat( line.nodeList.slice( nodeId + 1 ) );
        line.nodeList = line.nodeList.slice( 0, nodeId + 1 );

        // Actualizamos las alturas de las líneas
        maxSize = 0;

        for( i = 0; i < newLine.nodeList.length; i++ ){

            if( newLine.nodeList[ i ].height > maxSize ){
                maxSize = newLine.nodeList[ i ].height;
            }

        }

        newParagraph.height = maxSize * newParagraph.spacing;
        newLine.height      = maxSize;

        maxSize = 0;
        
        for( i = 0; i < line.nodeList.length; i++ ){

            if( line.nodeList[ i ].height > maxSize ){
                maxSize = line.nodeList[ i ].height;
            }

        }

        paragraph.height -= line.height * paragraph.spacing;
        paragraph.height += maxSize * paragraph.spacing;
        line.height       = maxSize;

        // Movemos las líneas siguientes
        newParagraph.lineList     = newParagraph.lineList.concat( paragraph.lineList.slice( lineId + 1 ) );
        paragraph.lineList = paragraph.lineList.slice( 0, lineId + 1 );

        // Insertamos el párrafo en su posición
        page.paragraphList = page.paragraphList.slice( 0, paragraphId + 1 ).concat( newParagraph ).concat( page.paragraphList.slice( paragraphId + 1 ) );

    // Si estamos al principio de la línea pero no en la primera linea del párrafo
    }else if( lineId ){

        movedLines                = paragraph.lineList.slice( lineId );
        newParagraph.lineList     = movedLines;
        paragraph.lineList = paragraph.lineList.slice( 0, lineId );
        page.paragraphList = page.paragraphList.slice( 0, paragraphId + 1 ).concat( newParagraph ).concat( page.paragraphList.slice( paragraphId + 1 ) );

    // Al principio del párrafo
    }else{

        movedLines          = [];
        newNode.style       = $.extend( {}, node.style );
        newNode.height      = node.height;
        newLine.height      = node.height;
        newParagraph.height = node.height * newParagraph.spacing;

        // Insertamos el párrafo en su posición
        page.paragraphList = page.paragraphList.slice( 0, paragraphId ).concat( newParagraph ).concat( page.paragraphList.slice( paragraphId ) );

    }

    // Actualizamos las alturas del párrafo de origen y destino
    for( i = 0; i < movedLines.length; i++ ){

        paragraph.height    -= movedLines[ i ].height * paragraph.spacing;
        newParagraph.height += movedLines[ i ].height * paragraph.spacing;

    }

    /*
    var lastLineInPage = page.paragraphList.length - 2 === paragraphId && paragraph.lineList.length - 1 === lineId;
    var realocation    = realocatePage( pageId );
    */
    realocatePage( pageId );

    /*
    if( realocation && lastLineInPage ){

        newPageId      = realocation.pageId;
        newParagraphId = realocation.paragraphId;

    }else{
        newPageId = pageId;
    }
    */

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
    if( !includeLimits || !start.line.nodeList[ nodeLoopId ] ){

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

var measureNode = function( paragraph, line, lineId, lineChar, node, nodeId, nodeChar ){

    var i;

    setCanvasTextStyle( node.style );

    node.charList = node.charList.slice( 0, nodeChar );

    // Si tiene tabuladores seguiremos un procedimiento especial
    if( /\t/.test( node.string ) ){

        // To Do -> Herencia de nodos anteriores
        // To Do -> Offset de la línea

        var current    = 0;
        var prev       = 0;
        var multiples  = 0;
        var heritage   = 0;
        var identation = getLineIndentationLeftOffset( lineId, paragraph );

        for( i = nodeChar + 1; i <= node.string.length; i++ ){

            // Si no es un tabulador seguimos el procedimiento habitual
            if( node.string[ i - 1 ] !== '\t' ){
                node.charList.push( ctx.measureText( node.string.slice( 0, i ) ).width + heritage );
                continue;
            }

            // Posición actual
            current = ctx.measureText( node.string.slice( 0, i ) ).width + heritage;

            // Posición anterior
            prev = node.charList.slice( -1 )[ 0 ] || 0;

            // Multiplos anteriores
            multiples = Math.ceil( prev / ( 1.26 * CENTIMETER ), 10 );

            // Si estamos justo en el límite sumamos 1
            if( ( prev / ( 1.26 * CENTIMETER ) ) === 0 ){
                multiples++;
            }

            // Calculamos la nueva posición
            heritage = ( 1.26 * CENTIMETER * multiples ) - identation - current;
            current  = ( 1.26 * CENTIMETER * multiples ) - identation;

            node.charList.push( current );

        }

    }else{

        for( i = nodeChar + 1; i <= node.string.length; i++ ){
            node.charList.push( ctx.measureText( node.string.slice( 0, i ) ).width );
        }

    }

    node.width = node.charList.slice( -1 )[ 0 ] || 0;

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
        tabList    : [],
        totalChars : 0,
        width      : 0

    };

};

var newNode = function(){

    return {

        blocked  : false,
        charList : [],
        height   : 0,
        string   : '',
        style    : {},
        width    : 0

    };

};

var newPage = function(){
    
    return {

        height          : 0,
        marginBottom    : 0,
        marginLeft      : 0,
        marginRight     : 0,
        marginTop       : 0,
        paragraphList   : [],
        width           : 0,
        backgroundColor : DEFAULT_PAGE_BACKGROUNDCOLOR

    };

};

var newParagraph = function(){

    return {

        align                   : ALIGN_LEFT,
        height                  : 0,
        indentationLeft         : 0,
        indentationRight        : 0,
        indentationSpecialType  : INDENTATION_NONE,
        indentationSpecialValue : 0,
        lineList                : [],
        listMode                : LIST_NONE,
        spacing                 : 1,
        width                   : 0

    };

};

var normalizeColor = function( color ){

    if( !color ){
        return '#000000';
    }

    if( color.indexOf('#') > -1 ){
        return color;
    }

    color = color.match(/(\d+)/g) || [ 0, 0, 0 ];

    for( var i in color ){

        color[ i ] = parseInt( color[ i ], 10 ).toString( 16 );
        color[ i ] = color[ i ].length === 1 ? '0' + color[ i ] : color[ i ];

    }

    return '#' + color.join('');

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

var normalizePlainParagraph = function( paragraph ){

    if( paragraph.nodeList.length === 1 ){
        return;
    }

    var comparation;

    for( var i = 1; i < paragraph.nodeList.length; ){

        comparation = compareNodeStyles( paragraph.nodeList[ i - 1 ], paragraph.nodeList[ i ] );

        if( comparation ){

            paragraph.nodeList[ i - 1 ].string += paragraph.nodeList[ i ].string;
            paragraph.nodeList                  = paragraph.nodeList.slice( 0, i).concat( paragraph.nodeList.slice( i + 1 ) );

        }else{
            i++;
        }

    }

};

var openFile = function( structure ){

    // To Do -> Error

    if( structure.mime === 'application/inevio-texts' ){

        structure.read( function( error, data ){

            // Asociamos todos los datos del fichero con sus variables correspondientes
            currentOpenFile = structure;

            setViewTitle( currentOpenFile.name );

            processFile( data );

            start();

        });

    }else if( structure.formats['inevio-texts'] ){

        structure.formats['inevio-texts'].read( function( error, data ){

            // Asociamos todos los datos del fichero con sus variables correspondientes
            currentOpenFile = structure;

            setViewTitle( currentOpenFile.name );

            processFile( data );

            start();

        });

    }else{
        alert( 'FILE FORMAT NOT RECOGNIZED' );
    }
    
};

var processFile = function( data ){

    data = wz.tool.decodeJSON( data );

    if( !data ){
        alert( 'FILE FORMAT NOT RECOGNIZED' );
        return;
    }

    //console.log( JSON.stringify( data, null, 4 ) );

    var i, j, value;
    var node;
    var line;
    var paragraph;
    var page = createPage(

        {
            width  : data.defaultPage.width * CENTIMETER,
            height : data.defaultPage.height * CENTIMETER
        },

        {
            top    : data.defaultPage.marginTop * CENTIMETER,
            right  : data.defaultPage.marginRight * CENTIMETER,
            bottom : data.defaultPage.marginBottom * CENTIMETER,
            left   : data.defaultPage.marginLeft * CENTIMETER
        }

    );

    page.paragraphList = [];

    for( i = 0; i < data.paragraphList.length; i++ ){

        paragraph = createParagraph( page );

        line          = paragraph.lineList[ 0 ];
        line.nodeList = [];

        //To Do -> Importar estilos
        setParagraphStyle( 0, page, i, paragraph, 'align', data.paragraphList[ i ].align );

        if( data.paragraphList[ i ].spacing ){
            paragraph.spacing = data.paragraphList[ i ].spacing;
        }

        if( data.paragraphList[ i ].listMode ){
            paragraph.listMode = data.paragraphList[ i ].listMode;
        }

        if( data.paragraphList[ i ].indentationSpecialType ){
            paragraph.indentationSpecialType = data.paragraphList[ i ].indentationSpecialType;
        }

        if( data.paragraphList[ i ].indentationSpecialValue ){
            paragraph.indentationSpecialValue = data.paragraphList[ i ].indentationSpecialValue * CENTIMETER;
        }
        
        if( data.paragraphList[ i ].indentationLeft ){

            value                      = data.paragraphList[ i ].indentationLeft * CENTIMETER;
            paragraph.indentationLeft += value;
            paragraph.width           -= value;

        }

        line.width -= getLineIndentationLeftOffset( 0, paragraph );

        for( j = 0; j < data.paragraphList[ i ].nodeList.length; j++ ){
            
            // To Do -> Importar estilos

            node         = createNode( line );
            node.string  = data.paragraphList[ i ].nodeList[ j ].string;
            node.blocked = !!data.paragraphList[ i ].nodeList[ j ].blocked;

            setNodeStyle( paragraph, line, node, 'color', data.paragraphList[ i ].nodeList[ j ].style.color );
            setNodeStyle( paragraph, line, node, 'font-family', data.paragraphList[ i ].nodeList[ j ].style['font-family'] );
            setNodeStyle( paragraph, line, node, 'font-style', data.paragraphList[ i ].nodeList[ j ].style['font-style'] );
            setNodeStyle( paragraph, line, node, 'font-weight', data.paragraphList[ i ].nodeList[ j ].style['font-weight'] );
            setNodeStyle( paragraph, line, node, 'text-decoration-underline', data.paragraphList[ i ].nodeList[ j ].style['text-decoration-underline'] );
            setNodeStyle( paragraph, line, node, 'font-size', data.paragraphList[ i ].nodeList[ j ].style['font-size'] );

            measureNode( paragraph, line, 0, line.totalChars, node, j, 0 );
            line.nodeList.push( node );

            line.totalChars += node.string.length;

        }

        page.paragraphList.push( paragraph );

    }

    pageList.push( page );

    // Realocamos el contenido
    for( i = 0; i < pageList.length; i++ ){

        for( j = 0; j < pageList[ i ].paragraphList.length; j++ ){

            setCursor( i, j, 0, 0, 0, 0, true );
            realocateLine( 0, 0 );

        }

    }
    
};

var realocateLine = function( id, lineChar ){

    var line    = currentParagraph.lineList[ id ];
    var counter = 0;

    if( !line || getNodesWidth( line ) <= line.width ){
        return counter;
    }

    var words, wordsToMove, newLine, newNode, stop, i, j, k, heritage, created, nodesToMove;

    // Nos hacemos con la nueva línea, si no existe la creamos
    if( !currentParagraph.lineList[ id + 1 ] ){

        created                   = true;
        newLine                   = createLine( id + 1, currentParagraph );
        newLine.nodeList          = [];
        currentParagraph.lineList = currentParagraph.lineList.slice( 0, id + 1 ).concat( newLine ).concat( currentParagraph.lineList.slice( id + 1 ) );

    }else{

        created = false;
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

            var charsMoved;

            // Si es distinto el movimiento es más sencillo
            if( wordsToMove[ 0 ].nodeList[ 0 ] !== k ){

                nodesToMove = line.nodeList.slice( wordsToMove[ 0 ].nodeList[ 0 ] );
                charsMoved  = 0;

                for( j = 0; j < nodesToMove.length; j++ ){
                    charsMoved += nodesToMove[ j ].string.length;
                }

                newLine.totalChars += charsMoved;
                line.nodeList       = line.nodeList.slice( 0, wordsToMove[ 0 ].nodeList[ 0 ] );
                line.totalChars    -= charsMoved;

                newLine.nodeList = nodesToMove.concat( newLine.nodeList );

            // La palabra actual comparte nodos con la siguiente, hay que partir
            }else{

                // Clonamos el nodo
                newNode        = createNode( line );
                newNode.style  = $.extend( {}, line.nodeList[ words[ i ].nodeList.slice( -1 )[ 0 ] ].style );
                newNode.height = line.nodeList[ words[ i ].nodeList.slice( -1 )[ 0 ] ].height;

                newLine.nodeList.unshift( newNode ); // To Do -> Quizás haya que actualizar la altura

                // Movemos el resto del contenido del nodo
                newNode.string                                            = line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].string.slice( wordsToMove[ 0 ].offset[ 0 ][ 0 ] );
                line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].string    = line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].string.slice( 0, wordsToMove[ 0 ].offset[ 0 ][ 0 ] );
                line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].charList  = line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].charList.slice( 0, wordsToMove[ 0 ].offset[ 0 ][ 0 ] );
                line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].width     = line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].charList.slice( -1 )[ 0 ];
                newLine.totalChars                                       += newNode.string.length;
                line.totalChars                                          -= newNode.string.length;
                line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].string    = line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].string.slice( 0, wordsToMove[ 0 ].offset[ 0 ][ 0 ] );
                line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].charList  = line.nodeList[ wordsToMove[ 0 ].nodeList[ 0 ] ].charList.slice( 0, wordsToMove[ 0 ].offset[ 0 ][ 0 ] );

                measureNode( currentParagraph, line, 0, 0, newNode, 0, 0 );

                nodesToMove = line.nodeList.slice( wordsToMove[ 0 ].nodeList[ 0 ] + 1 );
                charsMoved  = 0;

                for( j = 0; j < nodesToMove.length; j++ ){
                    charsMoved += nodesToMove[ j ].string.length;
                }

                // Movemos el resto de nodos a la siguiente linea
                newLine.nodeList    = newLine.nodeList.slice( 0, 1 ).concat( nodesToMove ).concat( newLine.nodeList.slice( 1 ) );
                newLine.totalChars += charsMoved;
                line.nodeList       = line.nodeList.slice( 0, wordsToMove[ 0 ].nodeList[ 0 ] + 1 );
                line.totalChars    -= charsMoved;

            }

            break;

        }

        heritage -= words[ i ].width;

        // To Do -> Nodos por arrastre (que narices es esto?)

        if( stop ){
            break;
        }

    }

    // Si no hay palabras enteras partimos la palabra actual
    if( !wordsToMove ){

        heritage = 0;

        for( i = 0; i < line.nodeList.length; i++ ){

            if( heritage + line.nodeList[ i ].width > line.width ){
                break;
            }

            heritage += line.nodeList[ i ].width;

        }

        nodesToMove = line.nodeList[ i ];

        for( j = 0; j < nodesToMove.charList.length; j++ ){

            if( heritage + nodesToMove.charList[ j ] > line.width ){
                break;
            }
            
        }

        heritage += nodesToMove.charList[ j ];

        // To Do -> Pueden darse casos en los que sea mejor mover un nodo entero
        // To Do -> Pueden darse casos en los que un nodo se quede vacío
        // To Do -> Actualizar las alturas de las lineas

        newNode               = createNode( line );
        newNode.style         = $.extend( {}, nodesToMove.style );
        newNode.height        = nodesToMove.height;
        newNode.string        = nodesToMove.string.slice( j );
        nodesToMove.string    = nodesToMove.string.slice( 0, j );
        nodesToMove.charList  = nodesToMove.charList.slice( 0, j );
        line.totalChars      -= newNode.string.length;
        newLine.totalChars   += newNode.string.length;

        measureNode( currentParagraph, line, 0, 0, newNode, 0, 0 );
        newLine.nodeList.unshift( newNode );

    }

    var maxSize = 0;
    
    for( j = 0; j < newLine.nodeList.length; j++ ){

        if( newLine.nodeList[ j ].height > maxSize ){
            maxSize = newLine.nodeList[ j ].height;
        }

    }

    if( created ){

        currentParagraph.height += maxSize * currentParagraph.spacing;
        newLine.height           = maxSize;

        realocatePage( currentPageId );

    }else{

        currentParagraph.height -= newLine.height * currentParagraph.spacing;
        currentParagraph.height += maxSize * currentParagraph.spacing;
        newLine.height           = maxSize;

    }

    counter = lineChar - line.totalChars;

    normalizeLine( newLine );
    realocateLine( id + 1, 0 );

    return counter;

};

var realocateLineInverse = function( id, modifiedChar, dontPropagate ){

    var line    = currentParagraph.lineList[ id ];
    var counter = { realocation : false, lineChar : 0 };
    var i, j, newNode, maxSize;

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

    // Si no hay palabras separadas comprobamos si debe entrar parte de la siguiente línea porque se ha partido la palabra
    if( !wordsToMove.length ){

        // Si la palabra no está rota
        if(
            lineWords.slice( -1 )[ 0 ].string.indexOf(' ') !== -1 &&
            nextLine.nodeList[ 0 ].string[ 0 ] !== ' '
        ){
            return counter;
        }

        var nodeId   = null;
        var charId   = null;
        var heritage = 0;

        for( i = 0; i < nextLine.nodeList.length; i++ ){
            
            if( nextLine.nodeList[ i ].width + currentWidth >= line.width ){
                nodeId = i;
                break;
            }

            heritage += nextLine.nodeList[ i ].width;

        }

        // To Do -> Seguro que esto hace falta?
        if( nodeId === null ){
            return counter;
        }

        for( i = 0; i < nextLine.nodeList[ nodeId ].charList.length; i++ ){
            
            if( heritage + nextLine.nodeList[ nodeId ].charList[ i ] + currentWidth > line.width ){
                charId = i - 1;
                break;
            }

            if( heritage + nextLine.nodeList[ nodeId ].charList[ i ] + currentWidth === line.width ){
                charId = i;
                break;
            }

        }

        if( charId === null || charId === -1 ){
            return counter;
        }

        // To Do -> Pueden darse casos en los que sea mejor mover un nodo entero
        // To Do -> Pueden darse casos en los que un nodo se quede vacío
        // To Do -> Pueden darse casos en los que haya que mover un conjunto de nodos
        // To Do -> Actualizar las alturas de las lineas

        var nodeToMove = nextLine.nodeList[ nodeId ];

        newNode              = createNode( line );
        newNode.style        = $.extend( {}, nodeToMove.style );
        newNode.height       = nodeToMove.height;
        newNode.string       = nodeToMove.string.slice( 0, charId + 1 );
        nodeToMove.string    = nodeToMove.string.slice( charId + 1 );
        line.totalChars     += newNode.string.length;
        newLine.totalChars  -= newNode.string.length;

        measureNode( currentParagraph, line, 0, 0, newNode, 0, 0 );
        measureNode( currentParagraph, nextLine, 0, 0, nodeToMove, 0, 0 );

        line.nodeList.push( newNode );
        
        return counter;

    }

    counter.realocation = true;

    // Comprobamos si la última palabra a mover comparte nodo con la siguiente y hay que partir
    var lastWordToMove = wordsToMove.slice( -1 )[ 0 ];
    var charsToMove    = 0;

    // Mismos nodos, necesitamos partir
    if( nextLineWords[ lastWordToMove + 1 ] && nextLineWords[ lastWordToMove ].nodeList.slice( -1 )[ 0 ] === nextLineWords[ lastWordToMove + 1 ].nodeList[ 0 ] ){
        
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
            console.log('to do - movimiento de nodos y partido del ultimo');
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

    // Actualizamos los tamaños
    maxSize = 0;
    
    for( j = 0; j < line.nodeList.length; j++ ){

        if( line.nodeList[ j ].height > maxSize ){
            maxSize = line.nodeList[ j ].height;
        }

    }

    if( maxSize !== line.height ){

        currentParagraph.height -= line.height * currentParagraph.spacing;
        currentParagraph.height += maxSize * currentParagraph.spacing;
        line.height              = maxSize;

    }

    maxSize = 0;
    
    for( j = 0; j < nextLine.nodeList.length; j++ ){

        if( nextLine.nodeList[ j ].height > maxSize ){
            maxSize = nextLine.nodeList[ j ].height;
        }

    }

    if( maxSize !== nextLine.height ){

        currentParagraph.height -= nextLine.height * currentParagraph.spacing;
        currentParagraph.height += maxSize * currentParagraph.spacing;
        nextLine.height          = maxSize;
        
    }

    if( !nextLine.totalChars ){

        currentParagraph.lineList  = currentParagraph.lineList.slice( 0, id + 1 ).concat( currentParagraph.lineList.slice( id + 2 ) );
        currentParagraph.height   -= nextLine.height * currentParagraph.spacing;

    }

    if( !dontPropagate ){
        realocateLineInverse( id + 1, 0 );
    }

    normalizeLine( line );

    return counter;

};

var realocatePage = function( id ){

    var page        = pageList[ id ];
    var height      = page.marginTop + page.marginBottom;
    var overflow    = false;
    var paragraphId = 0;

    // Comprobamos si entran todos los párrafos
    for( paragraphId = 0; paragraphId < page.paragraphList.length; paragraphId++ ){

        if( page.height < height + page.paragraphList[ paragraphId ].height ){
            overflow = true;
            break;
        }

        height += page.paragraphList[ paragraphId ].height;
        
    }

    if( !overflow ){
        return;
    }

    var paragraph = page.paragraphList[ paragraphId ];
    var lineId    = 0;
    var result    = null;

    // Comprobamos en que línea supera el tamaño
    for( lineId = 0; lineId < paragraph.lineList.length; lineId++ ){

        if( page.height < height + paragraph.lineList[ lineId ].height ){
            break;
        }

    }

    var newPage;

    if( pageList[ id + 1 ] ){
        newPage = pageList[ id + 1 ];
    }else{

        newPage = createPage(

            {
                width  : page.width,
                height : page.height
            },

            {
                top    : page.marginTop,
                right  : page.marginRight,
                bottom : page.marginBottom,
                left   : page.marginLeft
            },

            page.backgroundColor

        );

        newPage.paragraphList = [];

        pageList.push( newPage );

    }

    // Si la línea es 0 el movimiento es sencillo
    if( lineId === 0 ){

        newPage.paragraphList = page.paragraphList.slice( paragraphId ).concat( newPage.paragraphList );
        page.paragraphList    = page.paragraphList.slice( 0, paragraphId );

        result = {

            pageId      : id + 1,
            paragraphId : 0,
            lineId      : 0

        };

    // Si la línea es distinta de 0 el movimiento requiere partir párrafos
    }else{

    }

    realocatePage( id + 1 );

    return result;

};

var realocatePageInverse = function( id ){

    var page = pageList[ id ];

    // Si no hay párrafos en la página la eliminamos (salvo la primera que no puede eliminarse)
    if( id && !page.paragraphList.length ){
        pageList = pageList.slice( 0, id ).concat( pageList.slice( id + 1 ) );
    }

    // To Do -> Realocate de líneas
    
};

var realTimeConnect = function( error, firstConnection){

    // To Do -> Error
    console.log( error, 'connected', 'firstConnection', firstConnection );
    console.log( 1 );
    realtime.getUserList( true, function( error, list ){

        console.log( 2 );

        // To Do -> Error
        for( var i in list ){
            usersEditing[ list[ i ].id ] = list[ i ];
        }

        console.log( usersEditing );
        console.log( error, list );

    });

    if( !realtime ){
        return;
    }

    realtime.send({

        cmd : CMD_POSITION,
        pos : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};

var realTimeMessage = function( info, data ){

    if( info.selfClient ){
        return;
    }

    console.log( 'El usuario', info.sender, ' está editando', data );

    var page, pageId, paragraph, paragraphId, line, lineId, lineChar, node, nodeId, nodeChar, elements;

    if( data.cmd === CMD_NEWCHAR ){

        console.log('CMD_NEWCHAR');

        elements = getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] );

        handleRemoteChar( elements.pageId, elements.page, elements.paragraphId, elements.paragraph, elements.lineId, elements.line, elements.lineChar, elements.nodeId, elements.node, elements.nodeChar, data.data[ 2 ] );
        updatePages();

    }else if( data.cmd === CMD_RANGE_NEWCHAR ){

        console.log('CMD_RANGE_NEWCHAR');

        handleRemoteCharSelection( getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] ), getElementsByRemoteParagraph( data.data[ 2 ], data.data[ 3 ] ), data.data[ 4 ] );
        updatePages();

    }else if( data.cmd === CMD_BACKSPACE ){

        console.log('CMD_BACKSPACE');

        elements = getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] );

        handleRemoteBackspace( elements.pageId, elements.page, elements.paragraphId, elements.paragraph, elements.lineId, elements.line, elements.lineChar, elements.nodeId, elements.node, elements.nodeChar );
        updatePages();

    }else if( data.cmd === CMD_RANGE_BACKSPACE ){

        console.log('CMD_RANGE_BACKSPACE');

        handleRemoteBackspaceSelection( getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] ), getElementsByRemoteParagraph( data.data[ 2 ], data.data[ 3 ] ) );
        updatePages();

    }else if( data.cmd === CMD_ENTER ){

        console.log('CMD_ENTER');

        elements = getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] );

        handleRemoteEnter( elements.pageId, elements.page, elements.paragraphId, elements.paragraph, elements.lineId, elements.line, elements.lineChar, elements.nodeId, elements.node, elements.nodeChar );
        updatePages();

    }else if( data.cmd === CMD_NODE_STYLE ){

        console.log('CMD_NODE_STYLE');

        elements = getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] );

        console.log( elements );

        // Aplicamos el estilo
        setNodeStyle(

            elements.paragraph,
            elements.line,
            elements.node,
            data.data[ 2 ],
            data.data[ 3 ]

        );
        updatePages();

    }else if( data.cmd === CMD_RANGE_NODE_STYLE ){

        // Aplicamos el estilo
        setRangeNodeStyle(

            getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] ),
            getElementsByRemoteParagraph( data.data[ 2 ], data.data[ 3 ] ),
            data.data[ 4 ],
            data.data[ 5 ],
            true

        );
        updatePages();

    }else if( data.cmd === CMD_PARAGRAPH_STYLE ){

        console.log( data.data[ 0 ], data.data[ 1 ] );
        elements = getElementsByRemoteParagraph( data.data[ 0 ], 0 );

        // Aplicamos el estilo
        setParagraphStyle( elements.pageId, elements.page, elements.paragraphId, elements.paragraph, data.data[ 1 ], data.data[ 2 ] );
        updatePages();

    }else if( data.cmd === CMD_RANGE_PARAGRAPH_STYLE ){

        for( var i = data.data[ 0 ]; i <= data.data[ 1 ]; i++ ){

            elements = getElementsByRemoteParagraph( i, 0 );

            // Aplicamos el estilo
            setParagraphStyle( elements.pageId, elements.page, elements.paragraphId, elements.paragraph, data.data[ 2 ], data.data[ 3 ] );

        }

        updatePages();

    }

    updateRemoteUserPosition( info.sender, data.pos );

    console.log( 'Editando ', usersEditing );

};

var realTimeUserConnect = function( info ){

    if( info.selfUser ){
        return;
    }

    console.log( info );

    wz.user( info.sender, function( error, user ){

        console.log( arguments );

        // To Do -> Error

        usersEditing[ info.sender ] = user;

        console.log( usersEditing );

    });

    if( !realtime ){
        return;
    }

    realtime.send({

        cmd : CMD_POSITION,
        pos : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });
    
};

var removeRangeLines = function( includeLimits, start, end ){

    var pageLoop, pageLoopId, paragraphLoop, paragraphLoopId, lineLoopId, finalPage, finalParagraph, j, k, m;

    lineLoopId      = start.lineId;
    paragraphLoopId = start.paragraphId;
    pageLoopId      = start.pageId;

    // Recorremos las páginas
    for( j = pageLoopId; j <= end.pageId; j++ ){

        finalPage = j === end.pageId;
        pageLoop  = pageList[ j ];

        // Recorremos los párrafos
        for( k = paragraphLoopId; ( !finalPage && k < pageLoop.paragraphList.length ) || ( finalPage && k <= end.paragraphId ); k++ ){

            finalParagraph = finalPage && k === end.paragraphId;
            paragraphLoop  = pageLoop.paragraphList[ k ];

            // Recorremos las líneas
            for( m = lineLoopId; ( !finalParagraph && m < paragraphLoop.lineList.length ) || ( finalParagraph && m < end.lineId ); m++ ){

                if(
                    !includeLimits && (
                        ( j === currentRangeStart.pageId && k === currentRangeStart.paragraphId && m === currentRangeStart.lineId ) ||
                        ( j === currentRangeEnd.pageId && k === currentRangeEnd.paragraphId && m === currentRangeEnd.lineId )
                    )
                ){
                    continue;
                }
                
                paragraphLoop.lineList[ m ].nodeList = [];

            }

            paragraphLoop.lineList = paragraphLoop.lineList.filter( function( line ){

                paragraphLoop.height -= line.height * paragraphLoop.spacing;

                return line.nodeList.length;

            });

            lineLoopId = 0;

        }

        pageLoop.paragraphList = pageLoop.paragraphList.filter( function( paragraph ){
            return paragraph.lineList.length;
        });

        paragraphLoopId = 0;

    }

    pageList = pageList.filter( function( page ){
        return page.paragraphList.length;
    });

};

var resetBlink = function(){

    blinkTime    = Date.now();
    blinkStatus  = 0;
    blinkCurrent = false;

    if( selectedEnabled ){

        selectedEnabled = false;
        updateBlink();

    }

};

var saveDocument = function(){

    currentOpenFile.write( JSON.stringify( pageList ), function( error ){

        if( error ){
            alert( 'Error: ' + error );
            return;
        }

    });

};

var setNodeStyle = function( paragraph, line, node, key, value ){

    if( value ){
        node.style[ key ] = value;
    }else{
        delete node.style[ key ];
    }

    // Cambiamos la altura de la línea y el párrafo si es necesario
    if( key === 'font-size' ){

        var lineHeight = parseInt( testZone.css( 'font-size', value + 'pt' )[ 0 ].scrollHeight, 10 );

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

        paragraph.height -= line.height * paragraph.spacing;
        paragraph.height += lineHeight * paragraph.spacing;
        line.height       = lineHeight;

    }

};

var setParagraphStyle = function( pageId, page, paragraphId, paragraph, key, value, stopPropagation ){

    var i;

    if( key === 'indentationLeftAdd' ){

        if( paragraph.indentationLeft + value < 0 ){
            value = -paragraph.indentationLeft;
        }else if( paragraph.width - value <= 0 ){
            return;
        }

        paragraph.indentationLeft += value;
        paragraph.width           -= value;

        for( i = 0; i < paragraph.lineList.length; i++ ){
            paragraph.lineList[ i ].width -= value;
        }

        if( value >= 0 ){

            for( i = 0; i < paragraph.lineList.length; i++ ){
                realocateLine( i, 0 );
            }

        }else{

            for( i = 0; i < paragraph.lineList.length; i++ ){
                realocateLineInverse( i, 0 );

            }

        }

    }else if( key === 'listBullet' || key === 'listNumber' ){

        if( paragraph.listMode ){
            return;
        }

        value = 0.63 * CENTIMETER;

        var newNode = createNode( paragraph.lineList[ 0 ] );

        setParagraphStyle( pageId, page, paragraphId, paragraph, 'indentationLeftAdd', value );
        paragraph.lineList[ 0 ].nodeList.unshift( newNode );

        if( key === 'listNumber' ){

            paragraph.listMode = LIST_NUMBER;

            var number = 1;

            if( paragraphId > 0 ){

                if( page.paragraphList[ paragraphId - 1 ].listMode === LIST_NUMBER ){
                    number = parseInt( page.paragraphList[ paragraphId - 1 ].lineList[ 0 ].nodeList[ 0 ].string, 10 ) + 1;
                }

            }else if( pageId > 0 ){

                if( pageList[ pageId - 1 ].paragraphList.slice( -1 )[ 0 ].listMode === LIST_NUMBER ){
                    number = parseInt( pageList[ pageId - 1 ].paragraphList.slice( -1 )[ 0 ].lineList[ 0 ].nodeList[ 0 ].string, 10 ) + 1;
                }

            }

            newNode.string = number + '.' + '\t';

        }else{

            paragraph.listMode           = LIST_BULLET;
            newNode.string               = String.fromCharCode( 8226 ) + '\t';
            newNode.style['font-family'] = 'Webdings'; // To Do -> No usar webdings

        }

        newNode.blocked                     = true;
        newNode.style.color                 = '#000000';
        paragraph.indentationSpecialType    = INDENTATION_HANGING;
        paragraph.indentationSpecialValue   = value;
        paragraph.lineList[ 0 ].tabList     = [ newNode.string.indexOf('\t') ]; // To Do -> Conservar el resto de tabuladores
        paragraph.lineList[ 0 ].totalChars += newNode.string.length;
        
        setNodeStyle( paragraph, paragraph.lineList[ 0 ], newNode, 'font-size', paragraph.lineList[ 0 ].nodeList[ 1 ].style['font-size'] );

        measureNode( paragraph, paragraph.lineList[ 0 ], 0, 0, newNode, 0, 0 );

        for( i = 0; i < paragraph.lineList.length; i++ ){
            paragraph.lineList[ i ].width -= value;
        }

        for( i = 0; i < paragraph.lineList.length; i++ ){
            realocateLine( i, 0 );
        }

    }else if( key === 'listNone' ){

        if( !paragraph.listMode ){
            return;
        }

        value                               = paragraph.indentationLeft * -1;
        paragraph.listMode                  = LIST_NONE;
        paragraph.indentationSpecialType    = INDENTATION_NONE;
        paragraph.indentationSpecialValue   = 0;
        paragraph.lineList[ 0 ].tabList     = []; // To Do -> Conservar el resto de tabuladores
        paragraph.lineList[ 0 ].totalChars -= paragraph.lineList[ 0 ].nodeList[ 0 ].string.length;
        
        // Eliminamos el bullet
        paragraph.lineList[ 0 ].nodeList.shift();
        // To Do -> Medir de nuevo los nodos por si tienen tabuladores

        setParagraphStyle( pageId, page, paragraphId, paragraph, 'indentationLeftAdd', value, true );
    
    }else if( key == 'spacing' ){

        var prev = paragraph['spacing'];

        // Si no hay un cambio real no hacemos nada
        if( value === prev ){
            return;
        }

        paragraph['spacing'] = value;

        // Propagamos lo cambios necesarios al párrafo
        for( i = 0; i < paragraph.lineList.length; i++ ){

            paragraph.height -= paragraph.lineList[ i ].height * prev;
            paragraph.height += paragraph.lineList[ i ].height * value;

        }

    }else{
        paragraph[ key ] = value;
    }

    updatePages();

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

var setCursor = function( page, paragraph, line, lineChar, node, nodeChar, force, moveToLeft ){

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
    if( force || currentPageId !== page ){
        currentPage = pageList[ page ];
    }

    if( force || currentPageId !== page || currentParagraphId !== paragraph ){
        currentParagraph = currentPage.paragraphList[ paragraph ];
    }

    if( force || currentPageId !== page || currentParagraphId !== paragraph || currentLineId !== line ){
        currentLine = currentParagraph.lineList[ line ];
    }

    // Comprobamos que estamos en la posición del nodo correcta
    if(
        node > 0 &&
        nodeChar === 0 &&
        (
            !currentLine.nodeList[ node - 1 ] ||
            (
                currentLine.nodeList[ node - 1 ] &&
                !currentLine.nodeList[ node - 1 ].blocked
            )
        )
    ){
        
        node     = node - 1;
        nodeChar = currentLine.nodeList[ node ].string.length;

    }

    // Actualizamos el nodo si es necesario
    if( force || currentPageId !== page || currentParagraphId !== paragraph || currentLineId !== line || currentNodeId !== node ){
        currentNode = currentLine.nodeList[ node ];
    }

    // Si intentamos posicionarnos en un nodo bloqueado nos vamos al siguiente
    if( currentNode.blocked ){

        if( moveToLeft ){

            // Ignoramos el nodo anterior en la linea anterior porque a día de hoy no se dará nunca el caso

            // Si existe una línea anterior en el párrafo actual
            if( currentParagraph.lineList[ line - 1 ] ){

                return setCursor(

                    page,
                    paragraph,
                    line - 1,
                    currentParagraph.lineList[ line - 1 ].totalChars,
                    currentParagraph.lineList[ line - 1 ].nodeList.length - 1,
                    currentParagraph.lineList[ line - 1 ].nodeList.slice( -1 )[ 0 ].string.length,
                    true

                );

            }

            // Si existe un párrafo anterior en la página actual
            if( currentPage.paragraphList[ paragraph - 1 ] ){

                return setCursor(

                    page,
                    paragraph - 1,
                    currentPage.paragraphList[ paragraph - 1 ].lineList.length - 1,
                    currentPage.paragraphList[ paragraph - 1 ].lineList.slice( -1 )[ 0 ].totalChars,
                    currentPage.paragraphList[ paragraph - 1 ].lineList.slice( -1 )[ 0 ].nodeList.length - 1,
                    currentPage.paragraphList[ paragraph - 1 ].lineList.slice( -1 )[ 0 ].nodeList.slice( -1 )[ 0 ].string.length,
                    true

                );

            }

            // Si existe una página anterior en el documento
            if( pageList[ page - 1 ] ){

                return setCursor(

                    page - 1,
                    pageList[ page - 1 ].paragraphList.length - 1,
                    pageList[ page - 1 ].paragraphList.slice( -1 )[ 0 ].lineList.length - 1,
                    pageList[ page - 1 ].paragraphList.slice( -1 )[ 0 ].lineList.slice( -1 )[ 0 ].totalChars,
                    pageList[ page - 1 ].paragraphList.slice( -1 )[ 0 ].lineList.slice( -1 )[ 0 ].nodeList.length - 1,
                    pageList[ page - 1 ].paragraphList.slice( -1 )[ 0 ].lineList.slice( -1 )[ 0 ].nodeList.slice( -1 )[ 0 ].string.length,
                    true

                );
                
            }

            // En tal caso nos encontramos al principio del documento, setteamos el elemento siguiente al nodo bloqueado
            return setCursor( page, paragraph, line, currentNode.string.length, node + 1, 0, true );

        }

        return setCursor( page, paragraph, line, currentNode.string.length, node + 1, 0, true );

    }

    // Calculamos la posición vertical si es necesario
    if(
        force ||
        currentPageId !== page ||
        currentParagraphId !== paragraph ||
        currentLineId !== line
    ){

        // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
        positionAbsoluteY = 0;

        // Tamaño de cada página
        for( i = 0; i < page; i++ ){
            positionAbsoluteY += pageList[ i ].height + GAP;
        }

        // Márgen superior
        positionAbsoluteY += currentPage.marginTop;

        // Tamaño de cada párrafo
        for( i = 0; i < paragraph; i++ ){
            positionAbsoluteY += currentPage.paragraphList[ i ].height;
        }

        // Tamaño de cada línea
        for( i = 0; i < line; i++ ){
            positionAbsoluteY += currentParagraph.lineList[ i ].height * currentParagraph.spacing;
        }

    }

    // Calculamos la posición horizontal si es necesario
    if(
        force ||
        currentPageId !== page ||
        currentParagraphId !== paragraph||
        currentLineId !== line ||
        currentNodeId !== node ||
        currentLineCharId !== lineChar
    ){

        // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
        positionAbsoluteX = 0;

        // Márgen lateral de la página
        positionAbsoluteX += currentPage.marginLeft;

        // Margen lateral del párrafo
        positionAbsoluteX += getLineIndentationLeftOffset( line, currentParagraph );

        // Alineación de la línea
        positionAbsoluteX += getLineOffset( currentLine, currentParagraph );

        // Posicion dentro de la linea
        for( i = 0; i < node; i++ ){
            positionAbsoluteX += currentLine.nodeList[ i ].width;
        }

        if( nodeChar > 0 ){
            positionAbsoluteX += currentNode.charList[ nodeChar - 1 ];
        }

    }

    // Si hubo cambios limpiamos los estilos temporales
    if(
        currentPageId !== page ||
        currentParagraphId !== paragraph ||
        currentLineId !== line ||
        currentLineCharId !== lineChar ||
        currentNodeId !== node ||
        currentNodeCharId !== nodeChar
    ){
        clearTemporalStyle();
    }
    
    currentPageId      = page;
    currentParagraphId = paragraph;
    currentLineId      = line;
    currentLineCharId  = lineChar;
    currentNodeId      = node;
    currentNodeCharId  = nodeChar;

    resetBlink();
    
};

var setPagesStyle = function( key, value ){

    for( var i = 0; i < pageList.length; i++ ){
        setPageStyle( pageList[ i ], key, value );
    }

};

var setPageStyle = function( page, key, value ){

    if( key === 'pageBackgroundColor' ){
        page.backgroundColor = value;
    }

    updatePages();

};

var setRange = function( start, end, force ){

    // To Do -> Podemos pasarle las coordenadas para evitar cálculos
    // To Do -> Si no se le pueden pasar las coordenadas podemos utilizar los bucles para las dos alturas

    // Arreglamos los límites
    if(
        start.node.string.length === start.nodeChar &&
        start.nodeId + 1 < start.line.nodeList.length
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

    updateRange();

};

var setRangeNodeStyle = function( rangeStart, rangeEnd, key, value, propagated ){

    var i, j, newNode, endNode, newPositions;

    // Mismo nodo
    if(
        rangeStart.pageId === rangeEnd.pageId &&
        rangeStart.paragraphId === rangeEnd.paragraphId &&
        rangeStart.lineId === rangeEnd.lineId &&
        rangeStart.nodeId === rangeEnd.nodeId
    ){

        // Si es todo el nodo
        if( rangeStart.nodeChar === 0 && rangeEnd.nodeChar === rangeEnd.node.string.length ){

            newNode          = rangeStart.node;
            newNode.charList = [];

            setNodeStyle( rangeStart.paragraph, rangeStart.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Si comienza por el principio del nodo
        }else if( rangeStart.nodeChar === 0 ){

            newNode                  = createNode( rangeStart.line );
            newNode.string           = rangeStart.node.string.slice( rangeStart.nodeChar, rangeEnd.nodeChar );
            newNode.style            = $.extend( {}, rangeStart.node.style );
            newNode.height           = rangeStart.node.height;
            rangeStart.node.string   = rangeStart.node.string.slice( rangeEnd.nodeChar );
            rangeStart.node.charList = [];

            setNodeStyle( rangeStart.paragraph, rangeStart.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            measureNode( rangeStart.paragraph, rangeStart.line, rangeStart.lineId, 0, rangeStart.node, rangeStart.nodeId, 0 );

            rangeStart.line.nodeList = rangeStart.line.nodeList.slice( 0, rangeStart.nodeId ).concat( newNode ).concat( rangeStart.line.nodeList.slice( rangeStart.nodeId ) );
            rangeStart.node          = rangeStart.line.nodeList[ rangeEnd.nodeId ];
            newPositions             = getNodeInPosition( rangeEnd.line, rangeEnd.lineChar );
            rangeEnd.nodeId          = newPositions.nodeId;
            rangeEnd.node            = rangeEnd.line.nodeList[ rangeEnd.nodeId ];
            rangeEnd.nodeChar        = newPositions.nodeChar;

        // Si termina por el final del nodo
        }else if( rangeEnd.nodeChar === rangeEnd.node.string.length ){
            
            newNode                  = createNode( rangeStart.line );
            newNode.string           = rangeStart.node.string.slice( rangeStart.nodeChar );
            newNode.style            = $.extend( {}, rangeStart.node.style );
            newNode.height           = rangeStart.node.height;
            rangeStart.node.string   = rangeStart.node.string.slice( 0, rangeStart.nodeChar );
            rangeStart.node.charList = rangeStart.node.charList.slice( 0, rangeStart.nodeChar );

            setNodeStyle( rangeStart.paragraph, rangeStart.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            rangeStart.node.width    = rangeStart.node.charList[ rangeStart.node.string.length - 1 ] || 0;
            rangeStart.line.nodeList = rangeStart.line.nodeList.concat( newNode );
            currentNode                     = rangeStart.line.nodeList[ currentNodeId ];

            rangeStart.nodeId   = rangeStart.nodeId + 1;
            rangeStart.node     = rangeStart.line.nodeList[ rangeStart.nodeId ];
            rangeStart.nodeChar = 0;

        // El resto de casos
        }else{

            newNode                  = createNode( rangeStart.line );
            endNode                  = createNode( rangeStart.line );
            newNode.string           = rangeStart.node.string.slice( rangeStart.nodeChar, rangeEnd.nodeChar );
            newNode.style            = $.extend( {}, rangeStart.node.style );
            newNode.height           = rangeStart.node.height;
            endNode.string           = rangeEnd.node.string.slice( rangeEnd.nodeChar );
            endNode.style            = $.extend( {}, rangeEnd.node.style );
            endNode.height           = rangeEnd.node.height;
            rangeStart.node.string   = rangeStart.node.string.slice( 0, rangeStart.nodeChar );
            rangeStart.node.charList = rangeStart.node.charList.slice( 0 , rangeStart.nodeChar );
            rangeStart.node.width    = rangeStart.node.charList[ rangeStart.node.charList.length - 1 ];

            setNodeStyle( rangeStart.paragraph, rangeStart.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            setCanvasTextStyle( endNode.style );

            for( i = 1; i <= endNode.string.length; i++ ){
                endNode.charList.push( ctx.measureText( endNode.string.slice( 0, i ) ).width );
            }

            endNode.width            = endNode.charList[ i - 2 ] || 0;
            rangeStart.line.nodeList = rangeStart.line.nodeList.slice( 0, rangeStart.nodeId + 1 ).concat( newNode ).concat( endNode ).concat( rangeStart.line.nodeList.slice( rangeStart.nodeId + 1 ) );
            currentNode              = rangeStart.line.nodeList[ rangeStart.nodeId ];

            var newPositionsStart = getNodeInPosition( rangeStart.line, rangeStart.lineChar );
            var newPositionsEnd   = getNodeInPosition( rangeEnd.line, rangeEnd.lineChar );

            rangeStart.nodeId   = newPositionsStart.nodeId;
            rangeStart.node     = rangeStart.line.nodeList[ rangeStart.nodeId ];
            rangeStart.nodeChar = newPositionsStart.nodeChar;
            rangeEnd.nodeId     = newPositionsEnd.nodeId;
            rangeEnd.node       = rangeEnd.line.nodeList[ rangeEnd.nodeId ];
            rangeEnd.nodeChar   = newPositionsEnd.nodeChar;

        }

    // Varios nodos, misma linea
    }else if(

        rangeStart.pageId === rangeEnd.pageId &&
        rangeStart.paragraphId === rangeEnd.paragraphId &&
        rangeStart.lineId === rangeEnd.lineId

    ){

        // Tratamiento del primer nodo
        // Comprobamos si es una selección completa del nodo
        if( rangeStart.nodeChar === 0 ){

            newNode          = rangeStart.node;
            newNode.charList = [];

            setNodeStyle( rangeStart.paragraph, rangeStart.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Es parcial
        }else{
            
            newNode        = createNode( rangeStart.line );
            newNode.string = rangeStart.node.string.slice( rangeStart.nodeChar );
            newNode.style  = $.extend( {}, rangeStart.node.style );
            newNode.height = rangeStart.node.height;

            setNodeStyle( rangeStart.paragraph, rangeStart.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            rangeStart.node.string   = rangeStart.node.string.slice( 0, rangeStart.nodeChar );
            rangeStart.node.charList = rangeStart.node.charList.slice( 0, rangeStart.nodeChar );
            rangeStart.node.width    = rangeStart.node.charList[ rangeStart.nodeChar - 1 ];
            rangeStart.line.nodeList = rangeStart.line.nodeList.slice( 0, rangeStart.nodeId + 1 ).concat( newNode ).concat( rangeStart.line.nodeList.slice( rangeStart.nodeId + 1 ) );
            rangeStart.nodeId        = rangeStart.nodeId + 1;
            rangeStart.nodeChar      = 0;
            rangeStart.node          = rangeStart.line.nodeList[ rangeStart.nodeId ];
            rangeEnd.nodeId          = rangeEnd.nodeId + 1;

        }

        // Nodos intermedios
        for( i = rangeStart.nodeId + 1; i < rangeEnd.nodeId; i++ ){

            newNode          = rangeStart.line.nodeList[ i ];
            newNode.charList = [];

            setNodeStyle( rangeStart.paragraph, rangeStart.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( j = 1; j <= newNode.string.length; j++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, j ) ).width );
            }

            newNode.width = newNode.charList[ j - 2 ] || 0;

        }

        // Tratamiento del último nodo
        // Comprobamos si es una selección completa del nodo
        if( rangeEnd.nodeChar === rangeEnd.node.string.length ){

            newNode          = rangeEnd.node;
            newNode.charList = [];

            setNodeStyle( rangeEnd.paragraph, rangeEnd.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

        // Es parcial
        }else{
            
            newNode        = createNode( rangeEnd.line );
            newNode.string = rangeEnd.node.string.slice( 0, rangeEnd.nodeChar );
            newNode.style  = $.extend( {}, rangeEnd.node.style );
            newNode.height = rangeEnd.node.height;

            setNodeStyle( rangeEnd.paragraph, rangeEnd.line, newNode, key, value );
            setCanvasTextStyle( newNode.style );

            for( i = 1; i <= newNode.string.length; i++ ){
                newNode.charList.push( ctx.measureText( newNode.string.slice( 0, i ) ).width );
            }

            newNode.width = newNode.charList[ i - 2 ] || 0;

            rangeEnd.node.string   = rangeEnd.node.string.slice( rangeEnd.nodeChar );
            rangeEnd.node.charList = [];

            setCanvasTextStyle( rangeEnd.node.style );

            for( i = 1; i <= rangeEnd.node.string.length; i++ ){
                rangeEnd.node.charList.push( ctx.measureText( rangeEnd.node.string.slice( 0, i ) ).width );
            }

            rangeEnd.node.width    = rangeEnd.node.charList[ i - 2 ] || 0;
            rangeEnd.line.nodeList = rangeEnd.line.nodeList.slice( 0, rangeEnd.nodeId ).concat( newNode ).concat( rangeEnd.line.nodeList.slice( rangeEnd.nodeId ) );
            rangeEnd.node          = newNode;

        }

    // Varias líneas
    }else{

        var originalRangeStart, originalRangeEnd;

        // Aplicamos el estilo a la línea inicial
        originalRangeStart = rangeStart;
        originalRangeEnd   = rangeEnd;
        rangeEnd           = $.extend( {}, rangeStart );
        rangeEnd.lineChar  = rangeEnd.line.totalChars;
        rangeEnd.nodeId    = rangeEnd.line.nodeList.length - 1;
        rangeEnd.node      = rangeEnd.line.nodeList[ rangeEnd.nodeId ];
        rangeEnd.nodeChar  = rangeEnd.node.string.length;

        // To Do -> Ahora que se pasan como argumentos los rangos podemos ahorrarnos el modificar los rangos originales
        setRangeNodeStyle( rangeStart, rangeEnd, key, value, true );

        rangeEnd = originalRangeEnd;

        // Aplicamos el estilo a nodos intermedios
        mapRangeLines( false, rangeStart, rangeEnd, function( pageId, page, paragraphId, paragraph, lineId, line ){

            var newNode, i, j;

            for( i = 0; i < line.nodeList.length; i++ ){

                newNode          = line.nodeList[ i ];
                newNode.charList = [];

                setNodeStyle( paragraph, line, newNode, key, value );
                setCanvasTextStyle( newNode.style );

                for( j = 1; j <= newNode.string.length; j++ ){
                    newNode.charList.push( ctx.measureText( newNode.string.slice( 0, j ) ).width );
                }

                newNode.width = newNode.charList[ j - 2 ] || 0;

            }
            
        });

        // Aplicamos el estilo a la línea final
        rangeStart          = $.extend( {}, rangeEnd );
        rangeStart.lineChar = 0;
        rangeStart.nodeId   = 0;
        rangeStart.node     = rangeStart.line.nodeList[ 0 ];
        rangeStart.nodeChar = 0;

        // To Do -> Ahora que pasamos los rangos como argumentos podemos ahorrarnos copiar y modificar los rangos original
        setRangeNodeStyle( rangeStart, rangeEnd, key, value, true );

        rangeStart = originalRangeStart;

    }

    // To Do -> Tocaría hacer un realocateLine por aquí y tal
    if( !propagated ){

        currentNode = currentLine.nodeList[ currentNodeId ]; // To Do -> No estoy seguro de que esto esté en el mejor sitio posible, comprobar

        updatePages();
        setRange( rangeStart, rangeEnd, true );

    }

};

var setRangeParagraphStyle = function( key, value ){
    
    mapRangeParagraphs( currentRangeStart, currentRangeEnd, function( pageId, page, paragraphId, paragraph ){
        setParagraphStyle( pageId, page, paragraphId, paragraph, key, value );
    });

    updatePages();
    setRange( currentRangeStart, currentRangeEnd, true );

};

var setSelectedNodeStyle = function( key, value ){

    var i, charInParagraphStart, charInParagraphEnd, listModeParagraphStart, listModeParagraphEnd, requestStartCheck, requestEndCheck, firstNodeLengthStart, firstNodeLengthEnd;

    // Selección normal
    if( currentRangeStart ){

        // Calculamos las posiciones de inicio
        listModeParagraphStart = currentRangeStart.paragraph.listMode;
        charInParagraphStart   = currentRangeStart.lineChar;

        for( i = 0; i < currentRangeStart.lineId; i++ ){
            charInParagraphStart += currentRangeStart.paragraph.lineList[ i ].totalChars;
        }

        listModeParagraphEnd = currentRangeEnd.paragraph.listMode;
        charInParagraphEnd   = currentRangeEnd.lineChar;

        for( i = 0; i < currentRangeEnd.lineId; i++ ){
            charInParagraphEnd += currentRangeEnd.paragraph.lineList[ i ].totalChars;
        }

        // Aplicamos el estilo
        setRangeNodeStyle( currentRangeStart, currentRangeEnd, key, value );

        // Enviamos
        if( realtime ){

            realtime.send({
                
                cmd  : CMD_RANGE_NODE_STYLE,
                data : [ listModeParagraphStart, charInParagraphStart, listModeParagraphEnd, charInParagraphEnd, key, value ],
                pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

            });

        }

    // Principio de un párrafo vacío
    }else if( currentLineId === 0 && currentLine.totalChars === 0 ){

        // Calculamos las posiciones de inicio
        listModeParagraphStart = currentParagraph.listMode;
        charInParagraphStart   = currentLineCharId;

        for( i = 0; i < currentLineId; i++ ){
            charInParagraphStart += currentParagraph.lineList[ i ].totalChars;
        }

        // Aplicamos el estilo
        setNodeStyle( currentParagraph, currentLine, currentNode, key, value );

        // Enviamos
        if( realtime ){

            realtime.send({
                
                cmd  : CMD_NODE_STYLE,
                data : [ listModeParagraphStart, charInParagraphStart, key, value ],
                pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

            });

        }

    // Falso mononodo, acumulado de estilos
    }else{
        addTemporalStyle( key, value );
    }

};

var setSelectedParagraphsStyle = function( key, value ){

    var i, paragraphIdStart, paragraphIdEnd, charInParagraphStart, charInParagraphEnd, listModeParagraphStart, listModeParagraphEnd, requestStartCheck, requestEndCheck, firstNodeLengthStart, firstNodeLengthEnd;

    if( currentRangeStart ){

        // Calculamos las posiciones de inicio
        listModeParagraphStart = currentRangeStart.paragraph.listMode;
        charInParagraphStart   = currentRangeStart.lineChar;
        paragraphIdStart       = currentRangeStart.paragraphId;

        for( i = 0; i < currentRangeStart.pageId; i++ ){
            paragraphIdStart += pageList[ i ].paragraphList.length;
        }

        for( i = 0; i < currentRangeStart.lineId; i++ ){
            charInParagraphStart += currentRangeStart.paragraph.lineList[ i ].totalChars;
        }

        listModeParagraphEnd = currentRangeEnd.paragraph.listMode;
        charInParagraphEnd   = currentRangeEnd.lineChar;
        paragraphIdEnd       = currentRangeEnd.paragraphId;

        for( i = 0; i < currentRangeEnd.pageId; i++ ){
            paragraphIdStart += pageList[ i ].paragraphList.length;
        }

        for( i = 0; i < currentRangeEnd.lineId; i++ ){
            charInParagraphEnd += currentRangeEnd.paragraph.lineList[ i ].totalChars;
        }

        if( key === 'listNone' ){

            if( listModeParagraphStart ){
                firstNodeLengthStart = currentRangeStart.paragraph.lineList[ 0 ].nodeList[ 0 ].string.length;
            }

            if( listModeParagraphEnd ){
                firstNodeLengthEnd = 0; //currentRangeEnd.paragraph.lineList[ 0 ].nodeList[ 0 ].string.length;
            }

        }

        // Aplicamos el estilo
        setRangeParagraphStyle( key, value );

        // Enviamos
        if( realtime ){

            realtime.send({
                
                cmd  : CMD_RANGE_PARAGRAPH_STYLE,
                data : [ paragraphIdStart, paragraphIdEnd, key, value ],
                pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

            });

        }

        // Calculamos las correcciones
        if( key === 'listBullet' || key === 'listNumber' ){

            if( !listModeParagraphStart ){

                requestStartCheck     = true;
                charInParagraphStart += currentRangeStart.paragraph.lineList[ 0 ].nodeList[ 0 ].string.length;

            }

            if( !listModeParagraphEnd ){

                requestEndCheck     = true;
                charInParagraphEnd += currentRangeEnd.paragraph.lineList[ 0 ].nodeList[ 0 ].string.length;

            }
            
        }else if( key === 'listNone' ){
            
            if( listModeParagraphStart ){

                requestStartCheck     = true;
                charInParagraphStart -= firstNodeLengthStart;

            }

            if( listModeParagraphEnd ){

                requestEndCheck     = true;
                charInParagraphEnd -= firstNodeLengthEnd;

            }

        }

        // Arreglamos el rango
        if( requestStartCheck ){

            currentRangeStart.lineId = 0;

            while( true ){

                if( currentRangeStart.paragraph.lineList[ currentRangeStart.lineId ].totalChars >= charInParagraphStart ){
                    break;
                }

                charInParagraphStart     -= currentRangeStart.paragraph.lineList[ currentRangeStart.lineId ].totalChars;
                currentRangeStart.lineId += 1;

            }

            currentRangeStart.line     = currentRangeStart.paragraph.lineList[ currentRangeStart.lineId ];
            currentRangeStart.lineChar = charInParagraphStart;
            currentRangeStart.nodeId   = 0;

            while( true ){

                if( currentRangeStart.line.nodeList[ currentRangeStart.nodeId ].string.length > charInParagraphStart ){
                    break;
                }

                if( currentRangeStart.line.nodeList[ currentRangeStart.nodeId ].string.length === charInParagraphStart ){
                    currentRangeStart.nodeId += 1;
                    charInParagraphStart      = 0;
                    break;
                }

                charInParagraphStart     -= currentRangeStart.line.nodeList[ currentRangeStart.nodeId ].string.length;
                currentRangeStart.nodeId += 1;

            }

            currentRangeStart.node     = currentRangeStart.line.nodeList[ currentRangeStart.nodeId ];
            currentRangeStart.nodeChar = charInParagraphStart;

        }

        if( requestEndCheck ){

            currentRangeEnd.lineId = 0;

            while( true ){

                if( currentRangeEnd.paragraph.lineList[ currentRangeEnd.lineId ].totalChars >= charInParagraphEnd ){
                    break;
                }

                charInParagraphEnd     -= currentRangeEnd.paragraph.lineList[ currentRangeEnd.lineId ].totalChars;
                currentRangeEnd.lineId += 1;

            }

            currentRangeEnd.line     = currentRangeEnd.paragraph.lineList[ currentRangeEnd.lineId ];
            currentRangeEnd.lineChar = charInParagraphEnd;
            currentRangeEnd.nodeId   = 0;

            while( true ){

                if( currentRangeEnd.line.nodeList[ currentRangeEnd.nodeId ].string.length >= charInParagraphEnd ){
                    break;
                }

                charInParagraphEnd     -= currentRangeEnd.line.nodeList[ currentRangeEnd.nodeId ].string.length;
                currentRangeEnd.nodeId += 1;

            }

            currentRangeEnd.node     = currentRangeEnd.line.nodeList[ currentRangeEnd.nodeId ];
            currentRangeEnd.nodeChar = charInParagraphEnd;

        }

    }else{

        // Calculamos las posiciones de inicio
        listModeParagraphStart = currentParagraph.listMode;
        charInParagraphStart   = currentLineCharId;
        paragraphIdStart       = currentParagraphId;

        for( i = 0; i < currentPageId; i++ ){
            paragraphIdStart += pageList[ i ].paragraphList.length;
        }

        for( i = 0; i < currentLineId; i++ ){
            charInParagraphStart += currentParagraph.lineList[ i ].totalChars;
        }

        if( key === 'listNone' && listModeParagraphStart ){
            firstNodeLengthStart = currentParagraph.lineList[ 0 ].nodeList[ 0 ].string.length;
        }

        // Aplicamos el estilo
        setParagraphStyle( currentPageId, currentPage, currentParagraphId, currentParagraph, key, value );

        // Enviamos
        if( realtime ){

            realtime.send({
                
                cmd  : CMD_PARAGRAPH_STYLE,
                data : [ paragraphIdStart, key, value ],
                pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

            });

        }

        // Calculamos las correcciones
        if( ( key === 'listBullet' || key === 'listNumber' ) && !listModeParagraphStart ){

            requestStartCheck     = true;
            charInParagraphStart += currentParagraph.lineList[ 0 ].nodeList[ 0 ].string.length;

        }else if( key === 'listNone' && listModeParagraphStart ){
            
            requestStartCheck     = true;
            charInParagraphStart -= firstNodeLengthStart;

        }

        if( requestStartCheck ){

            currentLineId = 0;

            while( true ){

                if( currentParagraph.lineList[ currentLineId ].totalChars >= charInParagraphStart ){
                    break;
                }

                charInParagraphStart -= currentParagraph.lineList[ currentLineId ].totalChars;
                currentLineId        += 1;

            }

            currentLine       = currentParagraph.lineList[ currentLineId ];
            currentLineCharId = charInParagraphStart;
            currentNodeId     = 0;

            while( true ){

                if( currentLine.nodeList[ currentNodeId ].string.length >= charInParagraphStart ){
                    break;
                }

                charInParagraphStart -= currentLine.nodeList[ currentNodeId ].string.length;
                currentNodeId        += 1;

            }

            currentNode       = currentLine.nodeList[ currentNodeId ];
            currentNodeCharId = charInParagraphStart;

        }

        setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );
        resetBlink();

    }

};

var setViewTitle = function( name ){

    if( !name ){
        name = 'New Document';
    }

    viewTitle.text( name + ' - Texts' );

};

var start = function(){

    input.focus();

    if( !currentOpenFile ){

        pageList.push(

            createPage(

                {
                    width : PAGEDIMENSIONS['A4'].width * CENTIMETER,
                    height : PAGEDIMENSIONS['A4'].height * CENTIMETER
                },

                {

                    top    : MARGIN['Normal'].top * CENTIMETER,
                    right  : MARGIN['Normal'].right * CENTIMETER,
                    bottom : MARGIN['Normal'].bottom * CENTIMETER,
                    left   : MARGIN['Normal'].left * CENTIMETER

                }

            )

        );
        
        var paragraph = pageList[ 0 ].paragraphList[ 0 ];
        var line      = pageList[ 0 ].paragraphList[ 0 ].lineList[ 0 ];
        var node      = pageList[ 0 ].paragraphList[ 0 ].lineList[ 0 ].nodeList[ 0 ];

        setNodeStyle( paragraph, line, node, 'font-size', 12 );
        setNodeStyle( paragraph, line, node, 'font-family', 'Cambria' );
        setNodeStyle( paragraph, line, node, 'color', '#000000' );

        setViewTitle();

    }

    setCursor( 0, 0, 0, 0, 0, 0 );
    updateRuleLeft();
    drawRuleTop();
    updatePages();
    updateToolsLineStatus();
    activeRealTime();

    marginTopDown.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopUp.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopBox.css( 'x', parseInt( currentPage.marginLeft, 10 ) );

};

var trimRight = function( string ){
    return string.replace( /\s+$/g, '' );
};

var updateBlink = function(){

    if( selectedEnabled ){
        return;
    }

    fps++;

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
    var needUpdate = waitingRangeUpdate || ( !blinkCurrent && newCurrent ) || ( blinkCurrent && !newCurrent );

    if( needUpdate ){

        waitingRangeUpdate = false;

        checkCanvasSelectSize();

        // Los cursores remotos deben dibujarse antes para estar por devahi del actual
        for( var i in usersPosition ){

            if( !usersEditing[ i ] ){
                continue;
            }

            ctxSel.fillStyle = '#9575cd';
            ctxSel.font      = '11px Lato';

            // Cursor
            ctxSel.fillRect(

                parseInt( usersPosition[ i ][ 0 ], 10 ),
                parseInt( usersPosition[ i ][ 1 ] - scrollTop + usersPosition[ i ][ 2 ] - usersPosition[ i ][ 3 ], 10 ),
                2,
                usersPosition[ i ][ 3 ]

            );

            // Fondo del nombre
            ctxSel.fillRect(

                parseInt( usersPosition[ i ][ 0 ], 10 ),
                parseInt( usersPosition[ i ][ 1 ] - scrollTop + usersPosition[ i ][ 2 ] - usersPosition[ i ][ 3 ], 10 ) - 2 - 14, // 2 por la separación respecto al cursor y 14 del tamaño de la caja
                ctxSel.measureText( usersEditing[ i ].fullName ).width + 8, // 4 y 4 de margenes laterales
                14

            );

            // Texto del nombre
            ctxSel.fillStyle = '#ffffff';

            ctxSel.fillText(

                usersEditing[ i ].fullName,
                parseInt( usersPosition[ i ][ 0 ], 10 ) + 4, // 4 del margen lateral izquierdo
                parseInt( usersPosition[ i ][ 1 ] - scrollTop + usersPosition[ i ][ 2 ] - usersPosition[ i ][ 3 ], 10 ) - 2 - 3 // 2 por la separación respecto al cursor y 3 de la diferencia con el tamaño de la caja

            );

        }

        if( ( blinkGlobal && !( blinkCurrent && !newCurrent ) ) || ( !blinkCurrent && newCurrent ) ){

            blinkGlobal = true;

            debugTime('cursor on');

            blinkCurrent     = newCurrent;
            ctxSel.fillStyle = '#000000';

            ctxSel.fillRect( parseInt( positionAbsoluteX, 10 ), parseInt( positionAbsoluteY - scrollTop + currentLine.height - currentNode.height, 10 ), 1, currentNode.height );

            debugTimeEnd('cursor on');

        }else if( blinkCurrent && !newCurrent ){

            debugTime('cursor off');

            blinkGlobal  = false;
            blinkCurrent = newCurrent;

            debugTimeEnd('cursor off');

        }

    }

    requestAnimationFrame( updateBlink );

};

var updatePages = function(){

    if( waitingPageUpdate ){
        return;
    }

    waitingPageUpdate = true;

    requestAnimationFrame( drawPages );

};

var updateRange = function(){

    if( waitingRangeUpdate ){
        return;
    }

    waitingRangeUpdate = true;

    requestAnimationFrame( drawRange );

};

var updateRemoteUserPosition = function( userId, pos ){

    usersPosition[ userId ] = pos;
    waitingRangeUpdate      = true;

};

var updateRuleLeft = function(){

    if( waitingRuleLeftUpdate ){
        return;
    }

    waitingRuleLeftUpdate = true;

    requestAnimationFrame( drawRuleLeft );

};

var updateToolsLineStatus = function(){

    var styles, nodeStyles, paragraphStyles;

    if( currentRangeStart ){

        styles          = getCommonStyles( currentRangeStart, currentRangeEnd );
        nodeStyles      = styles.node;
        paragraphStyles = styles.paragraph;

    }else{

        nodeStyles      = currentNode.style;
        paragraphStyles = {

            align    : currentParagraph.align,
            spacing  : currentParagraph.spacing,
            listMode : currentParagraph.listMode

        };

    }

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

// Events
win
.on( 'mousedown', function(){

    if( !toolsListEnabled && !toolsColorEnabled ){
        return;
    }

    toolsListEnabled = false;
    toolsColorEnabled = false;

    input.focus();
    toolsListContainer.css( 'display', 'none' );
    toolsColorContainer.css( 'display', 'none' );
    toolsList.removeClass('active-fontfamily active-fontsize active-linespacing active-page-dimensions active-page-margins');
    toolsColor.removeClass('active-color active-page-color');

})

.on( 'app-param', function( e, params ){

    // To Do -> Comprobar que params no va vacio
    if( params && params.command === 'openFile' ){
        openFile( params.data );
    }

})

.key( 'esc', function( e ){

    if( !toolsListEnabled && !toolsColorEnabled ){
        return;
    }

    toolsListEnabled  = false;
    toolsColorEnabled = false;

    input.focus();
    toolsListContainer.css( 'display', 'none' );
    toolsColorContainer.css( 'display', 'none' );
    toolsList.removeClass('active-fontfamily active-fontsize active-linespacing active-page-dimensions active-page-margins');
    toolsColor.removeClass('active-color active-page-color');

})

.on( 'click', '.wz-ui-header, .toolbar', function(e){

    if( $(e.target).closest('.wz-view-minimize, .wz-view-close').length ){
        return;
    }

    input.focus();

})

.on( 'ui-view-restore', function(){
    input.focus();
});

win.parent().on( 'wz-dragend', function(){
    input.focus();
});

saveButton.on( 'click', function(){
    
    if( currentOpenFile && currentOpenFile.mime === 'application/inevio-texts' ){
        saveDocument();
    }else{
        createDocument();
    }

});

input.on( 'keydown', function(e){

    if( e.ctrlKey || e.metaKey ){
        return;
    }else if( e.key && e.key.length === 1 ){

        handleChar( e.key );
        updatePages();

        waitingCheckLetter = false;
        input[ 0 ].value   = '';

    }else if( e.which === 8 ){

        handleBackspace();
        updatePages();

    }else if( e.which === 13 ){

        handleEnter();
        updatePages();

    }else if( e.which === 37 ){
        handleArrowLeft();
    }else if( e.which === 38 ){
        handleArrowUp();
    }else if( e.which === 39 ){
        handleArrowRight();
    }else if( e.which === 40 ){
        handleArrowDown();
    }else if( e.which === 46 ){

        handleDel();
        updatePages();

    }else{
        waitingCheckLetter = true;
    }

});

input.on( 'keypress', function(){
    
    if( waitingCheckLetter && !waitingCheckLetterInput ){

        waitingCheckLetterInput = true;

        setTimeout( function(){

            if( input[ 0 ].value ){

                for( var i = 0; i < input[ 0 ].value.length; i++ ){
                    handleChar( input[ 0 ].value[ i ] );
                }
                
                updatePages();

            }

            input[ 0 ].value        = '';
            waitingCheckLetter      = false;
            waitingCheckLetterInput = false;

        }, 4 );

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
    var height = -scrollTop;

    // Buscamos la página
    for( pageId = 0; pageId < pageList.length; pageId++ ){

        if( pageList[ pageId ].height + GAP + height < posY ){
            height += pageList[ pageId ].height + GAP;
        }else{
            break;
        }

    }

    if( pageList[ pageId ] ){

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

        if( page.paragraphList[ paragraphId ] ){
            
            paragraph = page.paragraphList[ paragraphId ];

            // Buscamos la línea
            for( lineId = 0; lineId < paragraph.lineList.length; lineId++ ){
            
                if( ( paragraph.lineList[ lineId ].height * paragraph.spacing ) + height < posY ){
                    height += paragraph.lineList[ lineId ].height * paragraph.spacing;
                }else{
                    break;
                }

            }

            if( paragraph.lineList[ lineId ] ){
                line = paragraph.lineList[ lineId ];
            }else{
                line = paragraph.lineList[ --lineId ];
            }

        }else{

            paragraph = page.paragraphList[ --paragraphId ];
            lineId    = paragraph.lineList.length - 1;
            line      = paragraph.lineList[ lineId ];

        }

    }else{

        page        = pageList[ --pageId ];
        paragraphId = page.paragraphList.length - 1;
        paragraph   = page.paragraphList[ paragraphId ];
        lineId      = paragraph.lineList.length - 1;
        line        = paragraph.lineList[ lineId ];

    }

    // Buscamos la posición horizontal
    var width = 0;

    // Tenemos en cuenta el margen izquierdo
    width += page.marginLeft;

    // Tenemos en cuenta el margen del párrafo
    width += getLineIndentationLeftOffset( lineId, paragraph );

    // Tenemos en cuenta la alineación del párrafo
    width += getLineOffset( line, paragraph );

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

    var clickCounter = e.originalEvent.detail;

    // To Do -> No usar un setCursor, ya tenemos calculadas todas las posiciones
    if( clickCounter === 1 ){
        currentMultipleHash = [ start.pageId, start.paragraphId, start.lineId, start.lineChar ];
    }

    // Click que no coincide con los clicks previos
    if(
        clickCounter === 1 ||
        ( clickCounter > 1 && compareHashes( currentMultipleHash, [ start.pageId, start.paragraphId, start.lineId, start.lineChar ] ) )
    ){

        setCursor( pageId, paragraphId, lineId, lineChar, nodeId, nodeChar, true );
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

        if( !realtime ){
            return;
        }

        realtime.send({

            cmd : CMD_POSITION,
            pos : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]
            
        });

    // Click que coincide con los clicks previos y corresponde a seleccionar la palabra
    }else if( clickCounter === 2 || clickCounter === 4 ){

        var words  = getWordsMetrics( line );
        var wordId = 0;

        lineChar = 0;

        offset = page.marginLeft + getLineOffset( line, paragraph );

        if( posX > offset ){

            for( wordId = 0; wordId < words.length - 1; wordId++ ){

                if( offset <= posX && words[ wordId ].width + offset >= posX ){
                    break;
                }

                lineChar += words[ wordId ].string.length;
                offset   += words[ wordId ].width;

            }

        }

        var word = words[ wordId ];

        selectionStart = {

            pageId      : pageId,
            page        : page,
            paragraphId : paragraphId,
            paragraph   : paragraph,
            lineId      : lineId,
            line        : line,
            lineChar    : lineChar,
            nodeId      : word.nodeList[ 0 ],
            node        : line.nodeList[ word.nodeList[ 0 ] ],
            nodeChar    : word.offset[ 0 ][ 0 ]

        };

        setRange(

            selectionStart,

            {

                pageId      : pageId,
                page        : page,
                paragraphId : paragraphId,
                paragraph   : paragraph,
                lineId      : lineId,
                line        : line,
                lineChar    : lineChar + word.string.length,
                nodeId      : word.nodeList.slice( -1 )[ 0 ],
                node        : line.nodeList[ word.nodeList.slice( -1 )[ 0 ] ],
                nodeChar    : word.offset.slice( -1 )[ 0 ][ 1 ] + 1

            }

        );

        console.log('selecciona la palabra', wordId, word );

    // Click que coincide con los clicks previos y corresponde a seleccionar el párrafo
    }else if( clickCounter === 3 ){
        console.log('seleccionamos el párrafo', paragraphId, paragraph );

        selectionStart = {

            pageId      : pageId,
            page        : page,
            paragraphId : paragraphId,
            paragraph   : paragraph,
            lineId      : 0,
            line        : paragraph.lineList[ 0 ],
            lineChar    : 0,
            nodeId      : 0,
            node        : paragraph.lineList[ 0 ].nodeList[ 0 ],
            nodeChar    : 0

        };

        line = paragraph.lineList.slice( -1 )[ 0 ];
        node = line.nodeList.slice( -1 )[ 0 ];

        setRange(

            selectionStart,

            {

                pageId      : pageId,
                page        : page,
                paragraphId : paragraphId,
                paragraph   : paragraph,
                lineId      : paragraph.lineList.length - 1,
                line        : line,
                lineChar    : line.totalChars,
                nodeId      : line.nodeList.length - 1,
                node        : node,
                nodeChar    : node.string.length

            }

        );

    }

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
    var height = -scrollTop;

    // Buscamos la página
    for( pageId = 0; pageId < pageList.length; pageId++ ){

        if( pageList[ pageId ].height + GAP + height < posY ){
            height += pageList[ pageId ].height + GAP;
        }else{
            break;
        }

    }

    if( pageList[ pageId ] ){

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

        if( page.paragraphList[ paragraphId ] ){
            
            paragraph = page.paragraphList[ paragraphId ];

            // Buscamos la línea
            for( lineId = 0; lineId < paragraph.lineList.length; lineId++ ){
            
                if( ( paragraph.lineList[ lineId ].height * paragraph.spacing ) + height < posY ){
                    height += paragraph.lineList[ lineId ].height * paragraph.spacing;
                }else{
                    break;
                }

            }

            if( paragraph.lineList[ lineId ] ){
                line = paragraph.lineList[ lineId ];
            }else{
                line = paragraph.lineList[ --lineId ];
            }

        }else{

            paragraph = page.paragraphList[ --paragraphId ];
            lineId    = paragraph.lineList.length - 1;
            line      = paragraph.lineList[ lineId ];

        }

    }else{

        page        = pageList[ --pageId ];
        paragraphId = page.paragraphList.length - 1;
        paragraph   = page.paragraphList[ paragraphId ];
        lineId      = paragraph.lineList.length - 1;
        line        = paragraph.lineList[ lineId ];

    }

    // Buscamos la posición horizontal
    var width = 0;

    // Tenemos en cuenta el margen izquierdo
    width += page.marginLeft;

    // Tenemos en cuenta el margen del párrafo
    width += getLineIndentationLeftOffset( lineId, paragraph );

    // Tenemos en cuenta la alineación del párrafo
    width += getLineOffset( line, paragraph );

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

})

.on( 'mousewheel', function( e, delta, x, y ){

    if( currentDocumentHeight <= canvasPages.height ){
        return;
    }

    var originalScrollTop = scrollTop;

    // El plugin de mousewheel está ya normalizado, anteriormete teníamos un factor de correción de x30
    scrollTop -= y;

    if( scrollTop < 0 ){
        scrollTop = 0;
    }else if( scrollTop > maxScrollTop ){
        scrollTop = maxScrollTop;
    }

    if( originalScrollTop === scrollTop ){
        return;
    }

    updatePages();
    updateRuleLeft();

    if( currentRangeStart ){
        updateRange();
    }else{
        resetBlink();
    }

});

toolsMenu
.on( 'click', 'li:not(.active)', function(){

    $(this).siblings('.active').removeClass('active');
    $(this).addClass('active');
    toolsLine.find('article')
        .removeClass('active')
        .eq( $(this).index() )
            .addClass('active');

});

toolsLine
.on( 'click', '.tool-button', function(){

    input.focus();
    buttonAction[ $(this).attr('data-tool') ]( $(this).attr('data-tool-value') );
    updateToolsLineStatus(); // To Do -> Quizás pueda optimizarse y aplicarse solo a los estilos que lo necesiten

})

.on( 'click', '.tool-fontfamily', function(){

    toolsListEnabled = true;

    if( !fontfamilyCode ){

        for( var i = 0; i < FONTFAMILY.length; i++ ){
            fontfamilyCode += '<li data-value="' + FONTFAMILY[ i ] + '"><i></i><span>' + FONTFAMILY[ i ] + '</span></li>';
        }

    }

    toolsList
        .addClass('active-fontfamily')
        .html( fontfamilyCode );

    toolsListContainer
        .css({

            top     : $(this).position().top + $(this).outerHeight(),
            left    : $(this).position().left,
            display : 'block'

        });

    toolsList.find('[data-value="' + $(this).text() + '"]').addClass('active');

})

.on( 'click', '.tool-fontsize', function(){

    toolsListEnabled = true;

    if( !fontsizeCode ){

        for( var i = 0; i < FONTSIZE.length; i++ ){
            fontsizeCode += '<li data-value="' + FONTSIZE[ i ] + '"><i></i><span>' + FONTSIZE[ i ] + '</span></li>';
        }

    }

    toolsList
        .addClass('active-fontsize')
        .html( fontsizeCode );
        
    toolsListContainer
        .css({

            top     : $(this).position().top + $(this).outerHeight(),
            left    : $(this).position().left,
            display : 'block'

        });

    toolsList.find('[data-value="' + $(this).text() + '"]').addClass('active');

})

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


})

.on( 'click', '.tool-button-page-color', function(){

    toolsColorEnabled = true;

    toolsColorContainer
        .css({

            top     : $(this).position().top + $(this).outerHeight(),
            left    : $(this).position().left,
            display : 'block'

        });

    toolsColor.addClass('active-page-color');

})

.on( 'click', '.tool-button-line-spacing', function(){

    toolsListEnabled = true;

    if( !linespacingCode ){

        for( var i = 0; i < LINESPACING.length; i++ ){
            linespacingCode += '<li data-value="' + parseFloat( LINESPACING[ i ] ) + '"><i></i><span>' + LINESPACING[ i ] + '</span></li>';
        }

    }

    toolsList
        .addClass('active-linespacing')
        .html( linespacingCode );

    toolsListContainer
        .css({

            top     : $(this).position().top + $(this).outerHeight(),
            left    : $(this).position().left,
            display : 'block'

        });

    toolsList.find('[data-value="' + $(this).attr('data-value') + '"]').addClass('active');

})

.on( 'click', '.tool-button-page-dimensions', function(){

    toolsListEnabled = true;

    if( !pageDimensionsCode ){

        for( var i in PAGEDIMENSIONS ){
            pageDimensionsCode += '<li data-value="' + PAGEDIMENSIONS[ i ].width + '-' + PAGEDIMENSIONS[ i ].height + '"><i></i><span>' + i + '</span><span class="small">' + PAGEDIMENSIONS[ i ].width + 'cm x ' + PAGEDIMENSIONS[ i ].height + 'cm</span></li>';
        }

    }

    toolsList
        .addClass('active-page-dimensions')
        .html( pageDimensionsCode );

    toolsListContainer
        .css({

            top     : $(this).position().top + $(this).outerHeight(),
            left    : $(this).position().left,
            display : 'block'

        });

    toolsList.find('[data-value="' + parseFloat( ( currentPage.width / CENTIMETER ).toFixed( 2 ) ) + '-' + parseFloat( ( currentPage.height / CENTIMETER ).toFixed( 2 ) ) + '"]').addClass('active');

})

.on( 'click', '.tool-button-page-margins', function(){

    toolsListEnabled = true;

    if( !marginsCode ){

        for( var i in MARGIN ){
            marginsCode += '<li data-value="' + MARGIN[ i ].top + '-' + MARGIN[ i ].left + '-' + MARGIN[ i ].top + '-' + MARGIN[ i ].left + '"><i></i><span>' + i + '</span><span class="small"><span class="small-half">Top: ' + MARGIN[ i ].top + 'cm</span><span class="small-half">Bottom: ' + MARGIN[ i ].bottom + 'cm</span></span><span class="small"><span class="small-half">Left: ' + MARGIN[ i ].left + 'cm</span><span class="small-half">Right: ' + MARGIN[ i ].right + 'cm</span></li>';
        }

    }

    toolsList
        .addClass('active-page-margins')
        .html( marginsCode );

    toolsListContainer
        .css({

            top     : $(this).position().top + $(this).outerHeight(),
            left    : $(this).position().left,
            display : 'block'

        });

    toolsList.find('[data-value="' + parseFloat( ( currentPage.marginTop / CENTIMETER ).toFixed( 2 ) ) + '-' + parseFloat( ( currentPage.marginRight / CENTIMETER ).toFixed( 2 ) ) + '-' + parseFloat( ( currentPage.marginBottom / CENTIMETER ).toFixed( 2 ) ) + '-' + parseFloat( ( currentPage.marginRight / CENTIMETER ).toFixed( 2 ) ) + '"]').addClass('active');
    
});

toolsList
.on( 'mousedown', function( e ){
    e.stopPropagation();
})

.on( 'click', 'li', function(){

    toolsListEnabled = false;

    input.focus();
    toolsListContainer.css( 'display', 'none' );

    // Modo Tipografía
    if( toolsList.hasClass('active-fontfamily') ){
        setSelectedNodeStyle( 'font-family', $(this).text() );

    // Modo Tamaño de letra
    }else if( toolsList.hasClass('active-fontsize') ){
        setSelectedNodeStyle( 'font-size', parseInt( $(this).text(), 10 ) );
    
    // Modo Interlineado
    }else if( toolsList.hasClass('active-linespacing') ){
        setSelectedParagraphsStyle( 'spacing', parseFloat( $(this).text() ) );
    }

    toolsList.removeClass('active-fontfamily active-fontsize active-linespacing active-page-dimensions active-page-margins');
    updateToolsLineStatus();

});

toolsColor
.on( 'mousedown', function( e ){
    e.stopPropagation();
})

.on( 'click', 'td', function(){

    toolsColorEnabled = false;

    if( toolsColor.hasClass('active-color') ){

        toolsColorContainer.css( 'display', 'none' );
        toolsColor.removeClass('active-color');

        toolsColorColor
            .attr( 'data-tool-value', normalizeColor( $(this).css('background-color') ) )
            .css( 'background-color', $(this).css('background-color') )
            .click();

    }else if( toolsColor.hasClass('active-page-color') ){

        toolsColorContainer.css( 'display', 'none' );
        toolsColor.removeClass('active-page-color');

        setPagesStyle( 'pageBackgroundColor', normalizeColor( $(this).css('background-color') ) );

    }

});

// Start
// Start
if( !params ){
    start();
}
