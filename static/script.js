/*global $:true */
/*global wz:true*/
/*global lang:true*/
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
var BROWSER_FIREFOX = 0;
var BROWSER_IE = 1;
var BROWSER_WEBKIT = 2;
var BROWSER_TYPE = /webkit/i.test( navigator.userAgent ) ? BROWSER_WEBKIT : ( /trident/i.test( navigator.userAgent ) ? BROWSER_IE : BROWSER_FIREFOX );
var CENTIMETER = 37.795275591;
var CMD_SYNC = 0;
var CMD_DOCUMENT = 1;
var CMD_DOCUMENT_READY = 2;
var CMD_POSITION = 3;
var CMD_NEWCHAR = 4;
var CMD_RANGE_NEWCHAR = 5;
var CMD_BACKSPACE = 6;
var CMD_RANGE_BACKSPACE = 7;
var CMD_ENTER = 8;
var CMD_NODE_STYLE = 9;
var CMD_RANGE_NODE_STYLE = 10;
var CMD_PARAGRAPH_STYLE = 11;
var CMD_RANGE_PARAGRAPH_STYLE = 12;
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
var KEY_BACKSPACE = 8;
var KEY_ENTER = 13;
var KEY_ARROW_LEFT = 37;
var KEY_ARROW_UP = 38;
var KEY_ARROW_RIGHT = 39;
var KEY_ARROW_DOWN = 40;
var KEY_DEL = 46;
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
var MOUSE_NORMAL = 0;
var MOUSE_TEXT = 1;
var MOUSE_STATUS = [

    { add : 'normal', remove : 'text' },
    { add : 'text',   remove : 'normal' }

];
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
var PARAGRAPH_SPLIT_NONE = 0;
var PARAGRAPH_SPLIT_START = 1;
var PARAGRAPH_SPLIT_MIDDLE = 2;
var PARAGRAPH_SPLIT_END = 3;
var PASTE_FORMATS = [ 'text/html', 'text/plain' ];

// DOM variables
var win                 = $(this);
var saveButton          = $('.option-save');
var moreButton          = $('.option-more');
var toolsMenu           = $('.toolbar-menu');
var toolsLine           = $('.tools-line');
var toolsListContainer  = $('.toolbar-list-container');
var toolsList           = $('.toolbar-list');
var toolsColorContainer = $('.toolbar-color-picker-container');
var toolsColor          = $('.toolbar-color-picker');
var toolsColorHover     = $('.toolbar-color-picker-hover');
var toolsColorColor     = $('.tool-button-color .color');
var pages               = $('.pages');
var selections          = $('.selections');
var ruleLeft            = $('.rule-left');
var ruleTop             = $('.rule-top');
var marginTopDown       = $('.ruler-arrow-down');
var marginTopUp         = $('.ruler-arrow-up');
var marginTopBox        = $('.ruler-box');
var input               = $('.input');
var textarea            = $('.textarea');
var testZone            = $('.test-zone');
var viewTitle           = $('.document-title');
var loading             = $('.loading');
var scrollV             = $('.scroll-vertical');
var scrollVItem         = $('.scroll-vertical-seeker');
var canvasPages         = pages[ 0 ];
var canvasSelect        = selections[ 0 ];
var canvasRuleLeft      = ruleLeft[ 0 ];
var canvasRuleTop       = ruleTop[ 0 ];
var ctx                 = canvasPages.getContext('2d');
var ctxSel              = canvasSelect.getContext('2d');
var ctxRuleLeft         = canvasRuleLeft.getContext('2d');
var ctxRuleTop          = canvasRuleTop.getContext('2d');
var backingStoreRatio   = ctx.webkitBackingStorePixelRatio ||
                          ctx.mozBackingStorePixelRatio ||
                          ctx.msBackingStorePixelRatio ||
                          ctx.oBackingStorePixelRatio ||
                          ctx.backingStorePixelRatio || 1;
var pixelRatio          = wz.tool.devicePixelRatio() / backingStoreRatio;
var activeHiRes         = wz.tool.devicePixelRatio() !== backingStoreRatio;

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

// Composition Variables
var compositionCounter = 0;
var compositionEnded   = false;
var keydownHandled     = false;

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
var currentMouse          = MOUSE_NORMAL;
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

var calculateScroll = function(){

    if( positionAbsoluteY < scrollTop ){
        updateScroll( positionAbsoluteY - GAP );
        return true;
    }

    if( ( scrollTop + ( canvasPages.height / pixelRatio ) - ( GAP / 2 ) ) < positionAbsoluteY + currentLine.height ){
        updateScroll( positionAbsoluteY + currentLine.height + GAP - ( canvasPages.height / pixelRatio ) );
        return true;
    }

    if( scrollTop > maxScrollTop ){
        updateScroll( maxScrollTop );
        return true;
    }

};

var checkCanvasPagesSize = function(){

    if( activeHiRes ){

        var oldWidth  = pages.width();
        var oldHeight = pages.height();

        canvasPages.width  = oldWidth * pixelRatio;
        canvasPages.height = oldHeight * pixelRatio;

        canvasPages.style.width  = oldWidth + 'px';
        canvasPages.style.height = oldHeight + 'px';

        ctx.scale( pixelRatio, pixelRatio );

    }else{

        canvasPages.width  = pages.width();
        canvasPages.height = pages.height();

    }

};

var checkCanvasSelectSize = function(){

    if( activeHiRes ){

        var oldWidth  = selections.width();
        var oldHeight = selections.height();

        canvasSelect.width  = oldWidth * pixelRatio;
        canvasSelect.height = oldHeight * pixelRatio;

        canvasSelect.style.width  = oldWidth + 'px';
        canvasSelect.style.height = oldHeight + 'px';

        ctxSel.scale( pixelRatio, pixelRatio );

    }else{

        canvasSelect.width  = selections.width();
        canvasSelect.height = selections.height();

    }

};

var checkCanvasRuleLeftSize = function(){

    if( activeHiRes ){

        var oldWidth  = ruleLeft.width();
        var oldHeight = ruleLeft.height();

        canvasRuleLeft.width  = oldWidth * pixelRatio;
        canvasRuleLeft.height = oldHeight * pixelRatio;

        canvasRuleLeft.style.width  = oldWidth + 'px';
        canvasRuleLeft.style.height = oldHeight + 'px';

        ctxRuleLeft.scale( pixelRatio, pixelRatio );

    }else{

        canvasRuleLeft.width  = ruleLeft.width();
        canvasRuleLeft.height = ruleLeft.height();

    }

};

var checkCanvasRuleTopSize = function(){

    if( activeHiRes ){

        var oldWidth  = ruleTop.width();
        var oldHeight = ruleTop.height();

        canvasRuleTop.width  = oldWidth * pixelRatio;
        canvasRuleTop.height = oldHeight * pixelRatio;

        canvasRuleTop.style.width  = oldWidth + 'px';
        canvasRuleTop.style.height = oldHeight + 'px';

        ctxRuleTop.scale( pixelRatio, pixelRatio );

    }else{

        canvasRuleTop.width  = ruleTop.width();
        canvasRuleTop.height = ruleTop.height();

    }

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

var cleanComposition = function( isEnd ){

    if( !isEnd && compositionCounter ){
        input.blur().focus();
    }

    compositionEnded = false;
    input[ 0 ].value = '';

};

var clearTemporalStyle = function(){
    
    temporalStyle = null;

    updateToolsLineStatus();

};

var clipboardCopy = function( e ){

    var res = {

        'text/plain' : '',
        'text/html'  : ''

    };

    // Si no hay selección
    if( !currentRangeStart || !currentRangeEnd ){
        return res;
    }

    // Misma línea
    if(
        currentRangeStart.pageId === currentRangeEnd.pageId &&
        currentRangeStart.paragraphId === currentRangeEnd.paragraphId &&
        currentRangeStart.lineId === currentRangeEnd.lineId
    ){

        // Mismo nodo
        if( currentRangeStart.nodeId === currentRangeEnd.nodeId ){

            res['text/plain'] += currentRangeStart.node.string.slice( currentRangeStart.nodeChar, currentRangeEnd.nodeChar );
            res['text/html']  += nodeToSpan( currentRangeStart.node, currentRangeStart.nodeChar, currentRangeEnd.nodeChar );

        }else{

            for( var i = currentRangeStart.nodeId; i <= currentRangeEnd.nodeId; i++ ){

                if( i === currentRangeStart.nodeId ){

                    res['text/plain'] += currentRangeStart.line.nodeList[ i ].string.slice( currentRangeStart.nodeChar );
                    res['text/html']  += nodeToSpan( currentRangeStart.line.nodeList[ i ], currentRangeStart.nodeChar );

                }else if( i === currentRangeEnd.nodeId ){

                    res['text/plain'] += currentRangeStart.line.nodeList[ i ].string.slice( 0, currentRangeEnd.nodeChar );
                    res['text/html']  += nodeToSpan( currentRangeStart.line.nodeList[ i ], 0, currentRangeEnd.nodeChar );

                }else{

                    res['text/plain'] += currentRangeStart.line.nodeList[ i ].string;
                    res['text/html']  += nodeToSpan( currentRangeStart.line.nodeList[ i ] );

                }

            }

        }

    }else{

        var paragraphHash = currentRangeStart.pageId + '-' + currentRangeStart.paragraphId;

        for( var i = currentRangeStart.nodeId; i < currentRangeStart.line.nodeList.length; i++ ){
            
            if( i === currentRangeStart.nodeId ){

                res['text/plain'] += currentRangeStart.line.nodeList[ i ].string.slice( currentRangeStart.nodeChar );
                res['text/html']  += nodeToSpan( currentRangeStart.line.nodeList[ i ], currentRangeStart.nodeChar );

            }else{

                res['text/plain'] += currentRangeStart.line.nodeList[ i ].string;
                res['text/html']  += nodeToSpan( currentRangeStart.line.nodeList[ i ] );

            }

        }

        mapRangeLines( false, currentRangeStart, currentRangeEnd, function( pageId, page, paragraphId, paragraph, lineId, line ){

            if( pageId + '-' + paragraphId !== paragraphHash ){

                res['text/plain'] += '\n';
                res['text/html']  += '<br />\n';
                paragraphHash      = pageId + '-' + paragraphId;

            }
            
            for( var i = 0; i < line.nodeList.length; i++ ){

                res['text/plain'] += line.nodeList[ i ].string;
                res['text/html']  += nodeToSpan( line.nodeList[ i ] );

            }

        });

        if( currentRangeEnd.pageId + '-' + currentRangeEnd.paragraphId !== paragraphHash ){
            
            res['text/plain'] += '\n';
            res['text/html']  += '<br />\n';

        }

        for( var i = 0; i <= currentRangeEnd.nodeId; i++ ){

            if( i === currentRangeEnd.nodeId ){

                res['text/plain'] += currentRangeStart.line.nodeList[ i ].string.slice( 0, currentRangeEnd.nodeChar );
                res['text/html']  += nodeToSpan( currentRangeStart.line.nodeList[ i ], 0, currentRangeEnd.nodeChar );

            }else{

                res['text/plain'] += currentRangeStart.line.nodeList[ i ].string;
                res['text/html']  += nodeToSpan( currentRangeStart.line.nodeList[ i ] );

            }

        }

    }

    return res;

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

    var file = generateDocument();
    var name;

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

        displaySaveSuccessFully();

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

var displaySaveSuccessFully = function(){

    wz.banner()
        .setTitle( 'Texts - ' + currentOpenFile.name )
        .setText( currentOpenFile.name + ' ' + lang.fileSaved )
        .setIcon( 'https://static.inevio.com/app/7/floppy.png' )
        .render();

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
    var i, j, k, m, l, startX, startY, endX, endY, underlineHeight, tracks, trackHeritage, trackChars;

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

        // Draw the paragraphs
        for( i = 0; i < page.paragraphList.length; i++ ){

            paragraph = page.paragraphList[ i ];

            // Draw the lines
            for( j = 0; j < paragraph.lineList.length; j++ ){

                // To Do -> Gaps
                // To Do -> Altura de línea
                line = paragraph.lineList[ j ];

                if( line.totalChars ){

                    wHeritage = getLineOffset( line, paragraph );

                    // Draw the nodes
                    for( k = 0; k < line.nodeList.length; k++ ){

                        node          = line.nodeList[ k ];
                        ctx.fillStyle = node.style.color;
                        startX        = parseInt( page.marginLeft + getLineIndentationLeftOffset( j, paragraph ) + wHeritage, 10 );
                        startY        = parseInt( pageHeight + page.marginTop + line.height + hHeritage, 10 );

                        setCanvasTextStyle( node.style );

                        if(
                            paragraph.align !== ALIGN_JUSTIFY ||
                            j === paragraph.lineList.length - 1
                        ){
                            ctx.fillText( node.string, startX, startY );
                        }else{

                            tracks        = node.string.split(/( +)/g);
                            trackHeritage = 0;
                            trackChars    = 0;

                            for( l = 0; l < tracks.length; l++ ){

                                if( tracks[ l ][ 0 ] === ' ' ){
                                    trackHeritage = node.justifyCharList[ trackChars + tracks[ l ].length - 1 ];
                                }else if( tracks[ l ] ){
                                    ctx.fillText( tracks[ l ], startX + trackHeritage, startY );
                                }

                                trackChars += tracks[ l ].length;

                            }

                        }

                        wHeritage += node.justifyWidth || node.width;

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

                }

                hHeritage += line.height * paragraph.spacing;

            }

        }

        pageHeight            += Math.round( page.height ) + GAP;
        currentDocumentHeight += Math.round( page.height ) + GAP;

        if( m + 1 < pageList.length ){
            maxScrollTop += Math.round( page.height ) + GAP;
        }else if( ( canvasPages.height / pixelRatio ) < page.height ){
            maxScrollTop += page.height - ( canvasPages.height / pixelRatio ) + /*(*/ GAP /** 2 )*/;
        }

    }

    debugTimeEnd('draw');

};

var drawRange = function(){

    waitingRangeUpdate = false;

    // Calculamos la altura de inicio
    var startHeight = getElementPositionY( currentRangeStart.page, currentRangeStart.pageId, currentRangeStart.paragraph, currentRangeStart.paragraphId, currentRangeStart.line, currentRangeStart.lineId );
    var startWidth  = getElementPositionX( currentRangeStart.page, currentRangeStart.pageId, currentRangeStart.paragraph, currentRangeStart.paragraphId, currentRangeStart.line, currentRangeStart.lineId, currentRangeStart.node, currentRangeStart.nodeId, currentRangeStart.nodeChar );
    var i;

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

            if( currentRangeEnd.node.justifyCharList ){
                width = currentRangeEnd.node.justifyCharList[ currentRangeEnd.nodeChar - 1 ] - ( currentRangeStart.node.justifyCharList[ currentRangeStart.nodeChar - 1 ] || 0 );
            }else{
                width = currentRangeEnd.node.charList[ currentRangeEnd.nodeChar - 1 ] - ( currentRangeStart.node.charList[ currentRangeStart.nodeChar - 1 ] || 0 );
            }
            
        }else{

            if( currentRangeStart.node.justifyCharList ){

                width += currentRangeStart.node.justifyWidth - ( currentRangeStart.node.justifyCharList[ currentRangeStart.nodeChar - 1 ] || 0 );
            
                for( i = currentRangeStart.nodeId + 1; i < currentRangeEnd.nodeId; i++ ){
                    width += currentRangeStart.line.nodeList[ i ].justifyWidth;
                }

                width += currentRangeEnd.node.justifyCharList[ currentRangeEnd.nodeChar - 1 ] || 0;

            }else{

                width += currentRangeStart.node.width - ( currentRangeStart.node.charList[ currentRangeStart.nodeChar - 1 ] || 0 );
            
                for( i = currentRangeStart.nodeId + 1; i < currentRangeEnd.nodeId; i++ ){
                    width += currentRangeStart.line.nodeList[ i ].width;
                }

                width += currentRangeEnd.node.charList[ currentRangeEnd.nodeChar - 1 ] || 0;

            }
            
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
        if( currentRangeStart.node.justifyCharList ){
            width = currentRangeStart.node.justifyWidth - ( currentRangeStart.node.justifyCharList[ currentRangeStart.nodeChar - 1 ] || 0 );
        }else{
            width = currentRangeStart.node.width - ( currentRangeStart.node.charList[ currentRangeStart.nodeChar - 1 ] || 0 );
        }
            
        for( i = currentRangeStart.nodeId + 1; i < currentRangeStart.line.nodeList.length; i++ ){
            width += currentRangeStart.line.nodeList[ i ].justifyWidth || currentRangeStart.line.nodeList[ i ].width;
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
                width += line.nodeList[ n ].justifyWidth || line.nodeList[ n ].width;
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
            width += currentRangeEnd.line.nodeList[ i ].justifyWidth || currentRangeEnd.line.nodeList[ i ].width;
        }

        // To Do -> Que debe pasar si es se coge el fallback 0?
        if( currentRangeEnd.node.justifyCharList ){
            width += currentRangeEnd.node.justifyCharList[ currentRangeEnd.nodeChar - 1 ] || 0;
        }else{
            width += currentRangeEnd.node.charList[ currentRangeEnd.nodeChar - 1 ] || 0;
        }

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

var generateDocument = function(){

    var pageId, page, paragraphId, paragraph, currentParagraph, lineId, line, nodeId;

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

    return file;

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
            paragraph : {

                align    : start.paragraph.align,
                spacing  : start.paragraph.spacing,
                listMode : start.paragraph.listMode

            }

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
        var i     = 0;
        var limit = line.nodeList.length;

        if(
            start.pageId === pageId &&
            start.paragraphId === paragraphId &&
            start.lineId === lineId
        ){
            i = start.nodeId;
        }

        if(
            end.pageId === pageId &&
            end.paragraphId === paragraphId &&
            end.lineId === lineId
        ){
            limit = end.nodeId + 1;
        }

        for( ; i < limit; i++ ){

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

var getElementsByRemoteParagraph = function( remoteParagraphId, remoteParagraphChar, isEnd ){

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

    // Fix range
    // Si es el principio de un rango y está al final del nodo
    if(
        !isEnd,
        node.string.length === nodeChar
    ){

        // Si no es último nodo de la línea
        if( nodeId + 1 < line.nodeList.length ){

            nodeId   = nodeId + 1;
            node     = line.nodeList[ nodeId ];
            nodeChar = 0;

        // Si no es la última línea del párrafo
        }else if( lineId + 1 < paragraph.lineList.length ){

            lineId   = lineId + 1;
            line     = paragraph.lineList[ lineId ];
            lineChar = 0;
            nodeId   = 0;
            node     = line.nodeList[ 0 ];
            nodeChar = 0;
            
        // Si no es el último párrafo de la página
        }else if( paragraphId + 1 < page.paragraphList.length ){

            paragraphId = paragraphId + 1;
            paragraph   = page.paragraphList[ paragraphId ];
            lineId      = 0;
            line        = paragraph.lineList[ 0 ];
            lineChar    = 0;
            nodeId      = 0;
            node        = line.nodeList[ 0 ];
            nodeChar    = 0;
            
        // Si no es la última página del documento
        // To Do -> Comprobar en que casos ocurre esto y si es necesario hacer una condición o poner directamente un else
        }else if( pageId + 1 < pageList.length ){

            pageId      = pageId + 1;
            page        = pageList[ pageId ];
            paragraphId = 0;
            paragraph   = paragraph.lineList[ 0 ];
            lineId      = 0;
            line        = paragraph.lineList[ 0 ];
            lineChar    = 0;
            nodeId      = 0;
            node        = line.nodeList[ 0 ];
            nodeChar    = 0;

        }
        
    }

    if(
        isEnd &&
        nodeChar === 0 &&
        nodeId > 0
    ){
        // To Do -> Cambio a otra línea si es necesario
        nodeId   = nodeId - 1;
        node     = line.nodeList[ nodeId ];
        nodeChar = node.string.length;
    }

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

var getElementPosition = function( page, pageId, paragraph, paragraphId, line, lineId, node, nodeId, nodeChar ){

    return {

        x : getElementPositionX( page, pageId, paragraph, paragraphId, line, lineId, node, nodeId, nodeChar ),
        y : getElementPositionY( page, pageId, paragraph, paragraphId, line, lineId, node, nodeId, nodeChar )
    };

};

var getElementPositionX = function( page, pageId, paragraph, paragraphId, line, lineId, node, nodeId, nodeChar ){

    // Calculamos la posición horizontal
    var i = 0;
    var x = 0;

    // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
    x = 0;

    // Márgen lateral de la página
    x += page.marginLeft;

    // Margen lateral del párrafo
    x += getLineIndentationLeftOffset( lineId, paragraph );

    // Alineación de la línea
    x += getLineOffset( line, paragraph );

    // Posicion dentro de la linea
    for( i = 0; i < nodeId; i++ ){
        x += line.nodeList[ i ].justifyWidth || line.nodeList[ i ].width;
    }

    if( nodeChar > 0 ){

        if( node.justifyCharList ){
            x += node.justifyCharList[ nodeChar - 1 ];
        }else{
            x += node.charList[ nodeChar - 1 ];   
        }
        
    }

    return x;

};

var getElementPositionY = function( page, pageId, paragraph, paragraphId, line, lineId, node, nodeId, nodeChar ){

    // Calculamos la posición vertical
    var i = 0;
    var y = 0;

    // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios

    // Tamaño de cada página
    for( i = 0; i < pageId; i++ ){
        y += pageList[ i ].height + GAP;
    }

    // Márgen superior
    y += page.marginTop;

    // Tamaño de cada párrafo
    for( i = 0; i < paragraphId; i++ ){
        y += page.paragraphList[ i ].height;
    }

    // Tamaño de cada línea
    for( i = 0; i < lineId; i++ ){
        y += paragraph.lineList[ i ].height * paragraph.spacing;
    }

    return y;

};

var getGlobalParagraphId = function( pageId, paragraphId ){

    for( var i = 0; i < pageId; i++ ){
        paragraphId += pageList[ i ].paragraphList.length;
    }

    return paragraphId;

};

var getGlobalParagraphChar = function( paragraph, lineId, lineCharId ){

    var charId = lineCharId;

    for( var i = 0; i < lineId; i++ ){
        charId += currentParagraph.lineList[ i ].totalChars;
    }

    return charId;
    
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
    
    if( paragraph.align === ALIGN_LEFT || paragraph.align === ALIGN_JUSTIFY ){
        return 0;
    }else if( paragraph.align === ALIGN_CENTER ){
        return ( line.width - getLineTextTrimmedWidth( line ) ) / 2;
    }else if( paragraph.align === ALIGN_RIGHT ){
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

            tmp   = nodeList[ i ].string.split(/( +)/g);
            words = [ tmp[ 1 ] ];

            // Sino no solo hay espacio
            if( nodeList[ i ].string.length !== nodeList[ i ].string.split(' ').length - 1 ){

                tmp   = nodeList[ i ].string.slice( tmp[ 1 ].length );
                words = words.concat( tmp.match(/( *[\S*\t*]+ *| +)/g) || [''] );

            }

        }else{
            words = nodeList[ i ].string.match(/( *[\S*\t*]+ *| +)/g) || [''];
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

    cleanComposition();

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
        
        if( currentNode.justifyCharList ){
            verticalKeysPosition = currentNode.justifyCharList[ currentNodeCharId - 1 ] || 0;
        }else{
            verticalKeysPosition = currentNode.charList[ currentNodeCharId - 1 ] || 0;
        }

        verticalKeysPosition += getLineIndentationLeftOffset( currentLineId, currentParagraph );
        verticalKeysEnabled   = true;

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
        charList = nodeList[ i ].justifyCharList || nodeList[ i ].charList;
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
        pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]

    });

};

var handleArrowLeft = function(){

    cleanComposition();

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

        var prev, next;

        if( currentNode.justifyCharList ){

            prev = currentNode.justifyCharList[ currentNodeCharId - 2 ] || 0;
            next = currentNode.justifyCharList[ currentNodeCharId - 1 ];

        }else{

            prev = currentNode.charList[ currentNodeCharId - 2 ] || 0;
            next = currentNode.charList[ currentNodeCharId - 1 ];

        }

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
        pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]
        
    });

};

var handleArrowRight = function(){

    cleanComposition();

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

        var prev, next;

        if( currentNode.justifyCharList ){

            prev = currentNode.justifyCharList[ currentNodeCharId - 1 ] || 0;
            next = currentNode.justifyCharList[ currentNodeCharId ];

        }else{

            prev = currentNode.charList[ currentNodeCharId - 1 ] || 0;
            next = currentNode.charList[ currentNodeCharId ];

        }

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
        pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]
        
    });

};

var handleArrowUp = function(){

    var pageId, paragraph, paragraphId, line, lineId, lineChar, nodeId, nodeChar, nodeList, charList, i, j, wHeritage;

    cleanComposition();

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
        
        if( currentNode.justifyCharList ){
            verticalKeysPosition = currentNode.justifyCharList[ currentNodeCharId - 1 ] || 0;
        }else{
            verticalKeysPosition = currentNode.charList[ currentNodeCharId - 1 ] || 0;    
        }
        
        verticalKeysPosition += getLineIndentationLeftOffset( currentLineId, currentParagraph );
        verticalKeysEnabled   = true;

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
        charList = nodeList[ i ].justifyCharList || nodeList[ i ].charList;
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
        pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]
        
    });

};

var handleBackspace = function( dontSend ){

    if( currentRangeStart ){
        handleBackspaceSelection( dontSend );
    }else{
        handleBackspaceNormal( dontSend );
    }

};

var handleBackspaceNormal = function( dontSend ){

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

            // Si hay contenido fusionamos los párrafos
            var prevParagraph;
            var mergeParagraphs;
            var pageId;
            var mergePreLastLine;

            // El párrafo es el primero de la página
            if( currentParagraphId === 0 ){
                prevParagraph = pageList[ currentPageId - 1 ].paragraphList[ pageList[ currentPageId - 1 ].paragraphList.length - 1 ];
            }else{
                prevParagraph = currentPage.paragraphList[ currentParagraphId - 1 ];
            }

            mergeParagraphs = currentLine.totalChars > 0;
            pageId          = currentPageId;

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

                updateRuleLeft();
                
            }

            currentParagraph = currentPage.paragraphList[ currentParagraphId ];

            if( mergeParagraphs ){

                mergeParagraphs = realocateLineInverse( currentParagraph, mergePreLastLine + 1, currentLineCharId );

                if( mergeParagraphs.realocation && mergeParagraphs.lineChar > 0 ){

                    currentLineId     = mergePreLastLine;
                    currentLine       = currentParagraph.lineList[ currentLineId ];
                    currentLineCharId = mergeParagraphs.lineChar;
                    nodePosition      = getNodeInPosition( currentLine, mergeParagraphs.lineChar );
                    currentNodeId     = nodePosition.nodeId;
                    currentNode       = currentLine.nodeList[ currentNodeId ];
                    currentNodeCharId = nodePosition.nodeChar;

                }else{

                    /*
                    currentLineId     = currentParagraph.lineList.length - 1;
                    currentLine       = currentParagraph.lineList[ currentLineId ];
                    currentLineCharId = currentLine.totalChars;
                    currentNodeId     = currentLine.nodeList.length - 1;
                    currentNode       = currentLine.nodeList[ currentNodeId ];
                    currentNodeCharId = currentNode.string.length;
                    */

                    //currentLineId     = currentParagraph.lineList.length - 1;
                    currentLine       = currentParagraph.lineList[ currentLineId ];
                    //currentLineCharId = currentLine.totalChars;
                    //currentNodeId     = currentLine.nodeList.length - 1;
                    currentNode       = currentLine.nodeList[ currentNodeId ];
                    //currentNodeCharId = currentNode.string.length;

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

            var realocate = realocateLine( currentPageId, currentParagraph, currentLineId, original );

            //measureLineJustify( currentParagraph, currentLine, currentLineId );
            
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
        var realocation = realocateLineInverse( currentParagraph, currentLineId, currentLineCharId );

        //measureLineJustify( currentParagraph, currentLine, currentLineId );

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
    setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true ); // To Do -> Seguramente pueda optimizarse sin necesidad de recalcular toda la nueva posición
    resetBlink();
    clearTemporalStyle();

    if( updateTools ){
        updateToolsLineStatus();
    }

    if( !realtime || dontSend ){
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

var handleBackspaceSelection = function( dontSend ){

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

        // Líneas intermedias
        removeRangeLines( false, currentRangeStart, currentRangeEnd );
        
        // Calculamos los nuevos id's del párrafo y linea final
        if(
            currentRangeStart.pageId === currentRangeEnd.pageId &&
            currentRangeStart.paragraphId === currentRangeEnd.paragraphId
        ){
            currentRangeEnd.lineId = currentRangeStart.lineId + 1;
        }else{

            currentRangeEnd.lineId = 0;

            if( currentRangeStart.pageId === currentRangeEnd.pageId ){
                currentRangeEnd.paragraphId = currentRangeStart.paragraphId + 1;
            }else{
                currentRangeEnd.paragraphId = 0;
            }

        }

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
            measureNode( currentRangeEnd.paragraph, currentRangeEnd.line, currentRangeEnd.lineId, currentRangeEnd.lineChar, currentRangeEnd.node, currentRangeEnd.nodeId, 0 );

            // To Do -> Quizás haya que arreglar el lineChar y nodeChar

        // Si el nodo se queda vacio pero hay nodos después
        }else if( currentRangeEnd.line.nodeList[ currentRangeEnd.line.nodeId + 1 ] ){

            currentRangeEnd.line.nodeList = currentRangeEnd.line.nodeList.slice( currentRangeEnd.nodeId + 1 );
            currentRangeStart.nodeId         = currentRangeStart.nodeId + 1;
            currentRangeStart.node           = currentRangeStart.line.nodeList[ currentRangeStart.nodeId ];
            currentRangeStart.nodeChar       = 0;

        // Si el nodo se queda vacio y no hay más nodos en la linea
        }else{
            currentRangeEnd.paragraph.lineList = currentRangeEnd.paragraph.lineList.slice( currentRangeEnd.lineId + 1 );
        }

        // Borramos los párrafos que sean necesarios
        // Si el rango empieza y termina en el mismo párrafo
        if(
            (
                currentRangeStart.pageId !== currentRangeEnd.pageId ||
                currentRangeStart.paragraphId !== currentRangeEnd.paragraphId
            ) &&
            !currentRangeEnd.paragraph.lineList.length
        ){
            currentRangeEnd.page.paragraphList = currentRangeEnd.page.paragraphList.slice( 0, currentRangeEnd.paragraphId ).concat( currentRangeEnd.page.paragraphList.slice( currentRangeEnd.paragraphId + 1 ) );
        }

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

            // To Do -> Quizás haya que arreglar el lineChar y nodeChar

        // Si se ha quedado vacío pero hay más nodos antes
        }else if( currentRangeStart.nodeId > 0 ){

            currentRangeStart.line.nodeList  = currentRangeStart.line.nodeList.slice( 0, currentRangeStart.nodeId );
            currentRangeStart.nodeId         = currentRangeStart.nodeId - 1;
            currentRangeStart.node           = currentRangeStart.line.nodeList[ currentRangeStart.nodeId ];
            currentRangeStart.nodeChar       = currentRangeStart.node.string.length;

        // Si se ha quedado vacío y era el primer nodo de la línea
        }else{
            currentRangeStart.paragraph.lineList = currentRangeStart.paragraph.lineList.slice( 0, currentRangeStart.lineId || 1 );
        }

        // Borramos los párrafos que sean necesarios
        // Si el rango empieza y termina en el mismo párrafo
        if(
            currentRangeStart.pageId === currentRangeEnd.pageId &&
            currentRangeStart.paragraphId === currentRangeEnd.paragraphId
        ){

            if( !currentRangeStart.paragraph.lineList.length ){
                currentRangeStart.page.paragraphList = currentRangeStart.page.paragraphList.slice( 0, currentRangeStart.paragraphId ).concat( currentRangeStart.page.paragraphList.slice( currentRangeStart.paragraphId + 1 ) );
            }

            // To Do -> Quizás haya que cambiar las coordenadas
        }else{

            // Si el párrafo se queda vacío
            if(
                currentRangeStart.paragraph.lineList[ 0 ].nodeList[ 0 ].string.length &&
                currentRangeEnd.paragraph.lineList.length
            ){
                mergeParagraphs( currentRangeStart.pageId, currentRangeStart.page, currentRangeStart.paragraphId, currentRangeStart.paragraphId + 1 );
            }else if(
                !currentRangeStart.paragraph.lineList[ 0 ].nodeList[ 0 ].string.length &&
                currentRangeEnd.paragraph.lineList[ 0 ].nodeList[ 0 ].string.length
            ){
                currentRangeStart.page.paragraphList = currentRangeStart.page.paragraphList.slice( 0, currentRangeStart.paragraphId ).concat( currentRangeStart.page.paragraphList.slice( currentRangeStart.paragraphId + 1 ) );
            }

        }

        realocatePageInverse( currentRangeStart.pageId );

        // Si el párrafo no existe
        if( !pageList[ currentRangeStart.pageId ].paragraphList[ currentRangeStart.paragraphId ] ){
            currentRangeStart.paragraphId = currentRangeStart.paragraphId - 1;
        }

    }

    setCursor( currentRangeStart.pageId, currentRangeStart.paragraphId, currentRangeStart.lineId, currentRangeStart.lineChar, currentRangeStart.nodeId, currentRangeStart.nodeChar, true );
    realocateLineInverse( currentParagraph, currentLineId, currentLineCharId );
    resetBlink();

    if( !realtime || dontSend ){
        return;
    }

    realtime.send({
        
        cmd  : CMD_RANGE_BACKSPACE,
        data : [ paragraphIdStart, charInParagraphStart, paragraphIdEnd, charInParagraphEnd ],
        pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

    });

};

var handleDel = function( dontSend ){

    if( currentRangeStart ){
        handleBackspaceSelection( dontSend );
    }else{
        handleDelNormal( dontSend );
    }

};

var handleDelNormal = function( dontSend ){

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

        // Final de línea
        if( currentNodeId === currentLine.nodeList.length - 1 ){

            // Final de párrafo
            if( currentLineId === currentParagraph.lineList.length - 1 ){

                // Final de la página
                if( currentParagraphId === currentPage.paragraphList.length - 1 ){
                
                }else{

                }

            }else{

            }

        }else{

        }

        console.log('to do');

    }else{

        currentNode.string      = currentNode.string.slice( 0, currentNodeCharId ) + currentNode.string.slice( currentNodeCharId + 1 );
        currentLine.totalChars -= 1;

        measureNode( currentParagraph, currentLine, currentLineId, currentLineCharId, currentNode, currentNodeId, currentNodeCharId );

    }

    //measureLineJustify( currentParagraph, currentLine, currentLineId );
    setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );
    realocateLineInverse( currentParagraph, currentLineId, currentLineCharId );
    resetBlink();

    // To Do -> Implementar colaborativo

};

var handleChar = function( newChar, dontSend ){

    if( currentRangeStart ){
        handleCharSelection( newChar, dontSend );
    }else{
        handleCharNormal( newChar, dontSend );
    }

};

var handleCharNormal = function( newChar, dontSend ){

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

    currentLine.totalChars += newChar.length;
    currentLineCharId      += newChar.length;
    currentNodeCharId      += newChar.length;

    var realocation = realocateLine( currentPageId, currentParagraph, currentLineId, currentLineCharId );

    //measureLineJustify( currentParagraph, currentLine, currentLineId );

    if( realocation > 0 ){

        currentLineId++;

        currentLine = currentParagraph.lineList[ currentLineId ];

        var forceCursor = false;

        if( !currentLine ){

            forceCursor         = true;
            currentPageId      += 1;
            currentPage         =  pageList[ currentPageId ];
            currentParagraphId  = 0;
            currentParagraph    = currentPage.paragraphList[ currentParagraphId ];
            currentLineId       = 0;
            currentLine         = currentParagraph.lineList[ currentLineId ];

            // To Do -> Cambiar el cursor con un setCursor
        }

        currentLineCharId = realocation;
        newNode           = getNodeInPosition( currentLine, currentLineCharId );
        currentNodeId     = newNode.nodeId;
        currentNode       = currentLine.nodeList[ currentNodeId ];
        currentNodeCharId = newNode.nodeChar;
        temporalStyle     = null;

        if( forceCursor ){
            setCursor( currentPageId, currentParagraphId, currentLineId, currentLineCharId, currentNodeId, currentNodeCharId, true );
        }else{

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

            calculateScroll();

        }

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
            positionAbsoluteX += currentLine.nodeList[ i ].justifyWidth || currentLine.nodeList[ i ].width;
        }

        if( currentNode.justifyCharList ){
            positionAbsoluteX += currentNode.justifyCharList[ currentNodeCharId - 1 ];
        }else{
            positionAbsoluteX += currentNode.charList[ currentNodeCharId - 1 ];
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

};

var handleCharSelection = function( newChar, dontSend ){

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

var handleEnter = function( dontSend ){

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
    realocateLineInverse( newParagraph, 0, 0 );
    resetBlink();

    if( !realtime || dontSend ){
        return;
    }

    // To Do -> Basarse en las posiciones originales, no el las nuevas
    var paragraphId = getGlobalParagraphId( newPageId, newParagraphId );
    var charId      = getGlobalParagraphChar( newParagraph, 0, 0 );

    realtime.send({
        
        cmd  : CMD_ENTER,
        data : [ getGlobalParagraphId( originalPageId, originalParagraphId ), getGlobalParagraphChar( originalParagraph, originalLineId, originalLineChar ) ],
        pos  : [ getGlobalParagraphId( newPageId, newParagraphId ), getGlobalParagraphChar( newParagraph, 0, 0 ) ]

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
                mergeParagraphs = realocateLineInverse( paragraph, mergePreLastLine + 1, lineChar );
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
        var realocation = realocateLineInverse( paragraph, lineId, lineChar );

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

    realocateLine( pageId, paragraph, lineId, lineChar );

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

var hideDocument = function(){
    
    pages.css( 'display', 'none' );
    selections.css( 'display', 'none' );
    ruleTop.css( 'display', 'none' );
    ruleLeft.css( 'display', 'none' );

};

var insertHtmlText = function( text ){

    text = removeHtmlComments( text );
    text = removeHtmlPseudoXml( text );

    var document = $('<div></div>').html( text );
    var style    = document.find('style');

    // Eliminamos tags inutiles
    document.find('meta, link, xml').remove();

    // Estilos
    var styleParsed = [];

    // Parseo de estilos
    style.each( function(){
        styleParsed = styleParsed.concat( parseHtmlStyle( $( this ).html() ) );
    });

    style.remove();

    // Aplicado de estilos
    for( var i = 0; i < styleParsed.length; i++ ){
        document.find( styleParsed[ i ][ 0 ] ).css( styleParsed[ i ][ 1 ] );
    }

    // Borramos todas las clases
    document.find('*').removeAttr('class');

    // Aplanamos los párrafos
    document.find('p').each( function(){
        $(this).html( normalizeHtmlChildren( this, 0 ) );
    });

    var result = [];

    // Generamos el JSON
    document.find('p').each( function(){
        console.log( $(this).html() );
    });
    
};

var insertPlainText = function( text ){

    text = text.replace( /\t/g, ' ' ); // To Do -> Soportar tabuladores
    text = text.split('\n');

    // Si no hay ningún salto de línea
    for( var i = 0; i < text.length; i++ ){

        // Si no es la primera línea
        if( i ){
            handleEnter();
        }

        // Si la línea no está vacía
        if( text[ i ].length ){

            if( currentRangeStart ){
                handleCharSelection( text[ i ] );
            }else{
                handleCharNormal( text[ i ] );
            }

        }

    }

};

var logAllNodesWidth = function(){

    var list = [];

    for( var lp = 0; lp < pageList.length; lp++ ){

        for( var lpg = 0; lpg < pageList[ lp ].paragraphList.length; lpg++ ){

            for( var ll = 0; ll < pageList[ lp ].paragraphList[ lpg ].lineList.length; ll++ ){

                for( var ln = 0; ln < pageList[ lp ].paragraphList[ lpg ].lineList[ ll ].nodeList.length; ln++ ){
                    
                    list.push({

                        page : lp,
                        paragraph : lpg,
                        line : ll,
                        node : ln,
                        width : pageList[ lp ].paragraphList[ lpg ].lineList[ ll ].nodeList[ ln ].width,
                        lastCharWidth : pageList[ lp ].paragraphList[ lpg ].lineList[ ll ].nodeList[ ln ].charList.slice( -1 )[ 0 ]

                    });

                }

            }

        }

    }

    console.table( list );

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

var measureLineJustify = function( paragraph, line, lineId ){

    if(
        lineId === 0 &&
        paragraph.lineList.length === 1
    ){

        // To Do -> Comprobar en que casos hace falta esto y optimizarlo para que se use solo en esos, no siempre
        if( paragraph.align === ALIGN_JUSTIFY ){

            for( var i = 0; i < line.nodeList.length; i++ ){

                delete line.nodeList[ i ].justifyCharList;
                delete line.nodeList[ i ].justifyWidth;

            }

        }

        return;

    }

    if(
        paragraph.align !== ALIGN_JUSTIFY ||
        lineId === paragraph.lineList.length - 1
    ){
        return;
    }

    var words     = getWordsMetrics( line );
    var text      = '';
    var textWidth = 0;

    for( var wordId = 0; wordId < words.length; wordId++ ){

        text += words[ wordId ].string;

        if( wordId !== words.length - 1 ){
            textWidth += words[ wordId ].width;
        }else{
            textWidth += words[ wordId ].widthTrim;
        }

    }

    // Limpiamos la línea
    var textTrimmed = text.replace( / +$/, '' );
    var spaces      = textTrimmed.split(' ').length - 1;
    var increment   = ( line.width - textWidth ) / spaces;
    var nodes       = line.nodeList.length;
    var nodeId      = 0;
    var wHeritage   = 0;
    var charId      = 0;
    var totalCharId = 0;
    var node, justifyCharList;

    for( nodeId = 0; nodeId < nodes; nodeId++ ){

        wHeritage       = 0;
        node            = line.nodeList[ nodeId ];
        justifyCharList = [];

        for( charId = 0; charId < node.string.length; charId++ ){

            if( node.string[ charId ] === ' ' && totalCharId < textTrimmed.length ){
                wHeritage += increment;
            }

            justifyCharList.push( node.charList[ charId ] + wHeritage );

            totalCharId++;

        }

        node.justifyCharList = justifyCharList;
        node.justifyWidth    = justifyCharList.slice( -1 )[ 0 ];

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

var mergeParagraphs = function( pageId, page, firstId, secondId ){
    
    var firstParagraph  = page.paragraphList[ firstId ];
    var secondParagraph = page.paragraphList[ secondId ];

    var newNodeList = [];
    var maxHeight   = 0;
    var totalChars  = 0;
    var i, j, line;

    // To Do -> Esto puede optimizarse mucho, estamos aplanando los dos párrafos enteros para luego recolocarlos en uno solo
    for( i = 0; i < firstParagraph.lineList.length; i++ ){

        line = firstParagraph.lineList[ i ];

        for( j = 0; j < line.nodeList.length; j++ ){

            newNodeList.push( line.nodeList[ j ] );

            totalChars += line.nodeList[ j ].string.length;

        }

        if( line.height > maxHeight ){
            maxHeight = line.height;
        }

    }

    for( i = 0; i < secondParagraph.lineList.length; i++ ){

        line = secondParagraph.lineList[ i ];

        for( j = 0; j < line.nodeList.length; j++ ){

            newNodeList.push( line.nodeList[ j ] );

            totalChars += line.nodeList[ j ].string.length;

        }

        if( line.height > maxHeight ){
            maxHeight = line.height;
        }

    }

    firstParagraph.height   = maxHeight * firstParagraph.spacing;
    line                    = firstParagraph.lineList[ 0 ];
    firstParagraph.lineList = [ line ];
    line.height             = maxHeight;
    line.totalChars         = totalChars;
    line.nodeList           = newNodeList;
    page.paragraphList      = page.paragraphList.slice( 0, firstId + 1 ).concat( page.paragraphList.slice( secondId + 1 ) );

    if( firstParagraph.split === PARAGRAPH_SPLIT_START && secondParagraph.split === PARAGRAPH_SPLIT_END ){
        firstParagraph.split = PARAGRAPH_SPLIT_NONE;
    }
    
    realocateLine( pageId, firstParagraph, 0, 0 );

    // To Do -> Quizás habría que hacer un realocate a la inversa de la página

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
        width                   : 0,
        split                   : 0

    };

};

var nodeToSpan = function( node, start, end ){
    return '<span style="' + nodeToSpanStyle( node.style ) + '">' + node.string.slice( start, end ) + '</span>';
};

var nodeToSpanStyle = function( style ){

    var res = '';

    if( style.color ){
        res += 'color:' + style.color + ';';
    }

    if( style['font-family'] ){
        res += 'font-family:' + style['font-family'] + ';';
    }

    if( style['font-size'] ){
        res += 'font-size:' + style['font-size'] + ';';
    }

    if( style['font-style'] ){
        res += 'font-style:' + style['font-style'] + ';';
    }

    if( style['font-weight'] ){
        res += 'font-weight:' + style['font-weight'] + ';';
    }

    if( style['text-decoration-underline'] ){
        res += 'text-decoration:underline;';
    }

    return res;

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

var normalizeHtmlChildren = function( element, level ){

    var children = $( element.childNodes );
    var result   = $('<div></div>');

    // Aplanamos
    children.each( function(){

        if( this.nodeType === 3 ){ // 3 es el tipo de nodo de un TextNode
            result.append( $( element ).clone().empty().append( this ) );
        }else if( $(this).children().length ){

            var newChildren = $( normalizeHtmlChildren( this, level + 1 ) );
            var that        = $(this);

            newChildren.each( function(){

                var newStyle = parseHtmlAttrStyle( that.attr( 'style' ) + ';' + $(this).attr( 'style' ) );

                $(this).removeAttr('style').css( newStyle );

            });

            result.append( newChildren.html() );

        }else{
            result.append( this );
        }

    });

    // Si estamos en el nivel más bajo corregimos aquellos elementos que no sean spans
    if( !level ){

        result.find('b').each( function(){
            $(this).replaceWith( $('<span></span>').attr( 'style', $(this).attr('style') ).css( 'font-weight', 'bold' ).html( $(this).html() ) );
        });

        result.find('i').each( function(){
            $(this).replaceWith( $('<span></span>').attr( 'style', $(this).attr('style') ).css( 'font-style', 'italic' ).html( $(this).html() ) );
        });

        result.find('u').each( function(){
            $(this).replaceWith( $('<span></span>').attr( 'style', $(this).attr('style') ).css( 'text-decoration', 'underline' ).html( $(this).html() ) );
        });

        result = result.html().replace( /\n/ig, ' ' );
        result = result.replace( /&nbsp; /ig, ' ' );
        result = result.replace( /&quot;/ig, '\'' );

    }

    return result;

};

var normalizeLine = function( line ){

    if( line.nodeList.length === 1 ){
        return;
    }

    var comparation;

    for( var i = 1; i < line.nodeList.length; ){

        comparation = compareNodeStyles( line.nodeList[ i - 1 ], line.nodeList[ i ] );

        if( comparation && !line.nodeList[ i - 1 ].blocked && !line.nodeList[ i ].blocked ){
            
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

        if( comparation && !paragraph.nodeList[ i - 1 ].blocked && !paragraph.nodeList[ i ].blocked ){

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

var parseHtmlLineStyle = function( text ){

    // Separamos nombres de las reglas del contenido de las reglas
    text = text.replace( '}', '' ).split('{');

    // Hacemos una limpieza de la línea
    text = text.filter( function( part ){
        return part !== null && part.length;
    });

    // Hacemos un trim de las partes
    text = text.map( function( part ){
        return $.trim( part );
    });

    // Si termina en punto una regla debe eliminarse
    if( text[ 0 ].slice( -1 ) === '.' ){

        text[ 0 ] = text[ 0 ].slice( 0, -1 );
        text[ 1 ] = {};

        return text;

    }

    // Arreglamos los importants
    text[ 1 ] = text[ 1 ].replace( '! important', '!important' );

    // Separamos el estilo en reglas
    text[ 1 ] = text[ 1 ].split(';');

    // Eliminamos los strings vacíos
    text[ 1 ] = text[ 1 ].filter( function( part ){
        return part !== null && part.length;
    });

    // Parseamos las reglas
    text[ 1 ] = text[ 1 ].map( function( rule ){

        rule = $.trim( rule );
        rule = rule.split(':');

        rule[ 0 ] = $.trim( rule[ 0 ] );
        rule[ 1 ] = $.trim( rule[ 1 ] );

        return rule;

    });

    // Convertimos el array a un objeto CSS
    var result = {};

    for( var i in text[ 1 ] ){
        result[ text[ 1 ][ i ][ 0 ] ] = text[ 1 ][ i ][ 1 ];
    }

    text[ 1 ] = result;

    return text;

};

var parseHtmlStyle = function( text ){

    // Eliminamos comentarios, tabuladores e interpretamos línea a línea
    text = removeHtmlComments( text );
    text = text.replace( '\t', '' );
    text = text.split('\n');

    // Hacemos un trim de líneas
    text = text.map( function( line ){
        return $.trim( line );
    });

    // Eliminamos las líneas vacías e inútiles
    text = text.filter( function( line ){
        return line.length && line[ 0 ] !== '{' && line[ 0 ] !== '@';
    });

    // Prevenimos lineas rotas
    var tmp     = '';
    var newText = [];

    for( var i in text ){

        tmp += text[ i ];

        if( text[ i ][ text[ i ].length - 1 ] === '}' ){
            
            newText.push( tmp );
            tmp = '';

        }

    }

    text    = newText;
    newText = null;

    // Parseamos linea a línea
    text = text.map( function( line ){
        return parseHtmlLineStyle( line );
    });

    return text;

};

var parseHtmlAttrStyle = function( data ){

    var obj = {};
    data    = data.split(/;\s*/ig);

    data.map( function( item ){

        if( item ){

            item             = item.split(/\s*:\s*/ig);
            obj[ item[ 0 ] ] = item[ 1 ]; // ? item[ 1 ].replace( /"/g, '\'' ) : '';

        }

    });

    delete obj['undefined'];

    return obj;

};

var processFile = function( data, noDecode ){

    if( !noDecode ){
        data = wz.tool.decodeJSON( data );
    }

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

    pageList           = [];
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
            realocateLine( i, pageList[ i ].paragraphList[ j ], 0, 0 );

        }

    }
    
};

var realocateLine = function( pageId, paragraph, lineId, lineChar, dontPropagate ){

    var line    = paragraph.lineList[ lineId ];
    var counter = 0;

    if( !line ){
        return counter;
    }

    if( getNodesWidth( line ) <= line.width ){
        measureLineJustify( paragraph, line, lineId );
        return counter;
    }

    var words, wordsToMove, newLine, newNode, stop, i, j, k, heritage, created, nodesToMove;

    // Nos hacemos con la nueva línea, si no existe la creamos
    if( !paragraph.lineList[ lineId + 1 ] ){

        created            = true;
        newLine            = createLine( lineId + 1, paragraph );
        newLine.nodeList   = [];
        paragraph.lineList = paragraph.lineList.slice( 0, lineId + 1 ).concat( newLine ).concat( paragraph.lineList.slice( lineId + 1 ) );

    }else{

        created = false;
        newLine = paragraph.lineList[ lineId + 1 ];

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

                measureNode( paragraph, line, 0, 0, newNode, 0, 0 );

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
        nodesToMove.width     = nodesToMove.charList.slice( -1 )[ 0 ];
        line.totalChars      -= newNode.string.length;
        newLine.totalChars   += newNode.string.length;

        measureNode( paragraph, line, 0, 0, newNode, 0, 0 );
        newLine.nodeList.unshift( newNode );

    }

    var maxSize = 0;
    
    for( j = 0; j < newLine.nodeList.length; j++ ){

        if( newLine.nodeList[ j ].height > maxSize ){
            maxSize = newLine.nodeList[ j ].height;
        }

    }

    if( created ){

        paragraph.height += maxSize * paragraph.spacing;
        newLine.height    = maxSize;

        realocatePage( pageId );

    }else{

        paragraph.height -= newLine.height * paragraph.spacing;
        paragraph.height += maxSize * paragraph.spacing;
        newLine.height    = maxSize;

    }

    counter = lineChar - line.totalChars;

    normalizeLine( newLine );

    if( !dontPropagate ){
        realocateLine( pageId, paragraph, lineId + 1, 0 );
    }

    measureLineJustify( paragraph, line, lineId );

    return counter;

};

var realocateLineInverse = function( paragraph, id, modifiedChar, dontPropagate ){

    var line    = paragraph.lineList[ id ];
    var counter = { realocation : false, lineChar : 0 };
    var i, j, newNode, maxSize;

    // Si la línea no existe se ignora
    if( !line ){
        return counter;
    }

    var lineWords = getWordsMetrics( line );

    if( !lineWords.length ){
        measureLineJustify( paragraph, line, id );
        return counter;
    }

    // Comprobamos si al ser la primera palabra la que ha cambiado debemos intentar hacer un realocado con la linea superior
    // To Do -> Comprobar si modified char alguna vez coge el valor 0
    if( !dontPropagate && id > 0 && lineWords[ 0 ].string.length >= modifiedChar ){

        var totalChars = paragraph.lineList[ id - 1 ].totalChars;

        counter          = realocateLineInverse( paragraph, id - 1, 0, true );
        counter.lineChar = totalChars + currentLineCharId; // To Do -> Quizás alguna vez deba ser sin currentLineCharId sino que debería llevar un valor concreto. Comprobar

    }

    // Comprobamos si la palabra de la siguiente línea puede entrar en la línea actual
    var nextLine = paragraph.lineList[ id + 1 ];

    if( !nextLine ){
        measureLineJustify( paragraph, line, id ); // To Do -> Hara falta aqui realmente?
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
            measureLineJustify( paragraph, line, id );
            return counter;
        }

        var nodeId   = null;
        var charId   = null;
        
        heritage = 0;

        for( i = 0; i < nextLine.nodeList.length; i++ ){
            
            if( nextLine.nodeList[ i ].width + currentWidth >= line.width ){
                nodeId = i;
                break;
            }

            heritage += nextLine.nodeList[ i ].width;

        }

        // To Do -> Seguro que esto hace falta?
        if( nodeId === null ){
            measureLineJustify( paragraph, line, id );
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
            measureLineJustify( paragraph, line, id );
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

        measureNode( paragraph, line, 0, 0, newNode, 0, 0 );
        measureNode( paragraph, nextLine, 0, 0, nodeToMove, 0, 0 );

        line.nodeList.push( newNode );
        
        measureLineJustify( paragraph, line, id );
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

        paragraph.height -= line.height * paragraph.spacing;
        paragraph.height += maxSize * paragraph.spacing;
        line.height       = maxSize;

    }

    maxSize = 0;
    
    for( j = 0; j < nextLine.nodeList.length; j++ ){

        if( nextLine.nodeList[ j ].height > maxSize ){
            maxSize = nextLine.nodeList[ j ].height;
        }

    }

    if( maxSize !== nextLine.height ){

        paragraph.height -= nextLine.height * paragraph.spacing;
        paragraph.height += maxSize * paragraph.spacing;
        nextLine.height   = maxSize;
        
    }

    if( !nextLine.totalChars ){

        paragraph.lineList  = paragraph.lineList.slice( 0, id + 1 ).concat( paragraph.lineList.slice( id + 2 ) );
        paragraph.height   -= nextLine.height * paragraph.spacing;

    }

    if( !dontPropagate ){
        realocateLineInverse( paragraph, id + 1, 0 );
    }

    // To Do -> Esto es un fixeo no muy óptimo, no se están actualizando bien las alturas de los párrafos. Hacerlo más optimo.
    //          Para emular el error necesitamos 1 párrafo de varias lineas, una linea en blanco, 1 párrafo de varias lineas,
    //          una linea en blanco y 1 párrafo de varias lineas.
    //          Nos vamos al principio del segundo párrafo con contenido y borramos. Volvemos a borrar. Si intentamos seleccionar
    //          el segundo párrafo vacio no se pondrá el cursor en posición correcta porque el primer párrafo ahora no tendrá la
    //          altura adecuada.

    var height = 0;

    for( i = 0; i < paragraph.lineList.length; i++ ){
        height += paragraph.lineList[ i ].height;
    }

    paragraph.height = height;

    normalizeLine( line );
    measureLineJustify( paragraph, line, id );

    return counter;

};

var realocatePage = function( id, propagated ){

    var i;
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

        if( propagated ){

            // Fusionamos los párrafos que sean necesarios
            for( i = 1; i < page.paragraphList.length; ){
                
                if( page.paragraphList[ i - 1 ].split && page.paragraphList[ i ].split ){
                    mergeParagraphs( id + 1, page, i - 1, i );
                }else{
                    i++;
                }

            }

        }

        return;

    }

    var paragraph = page.paragraphList[ paragraphId ];
    var lineId    = 0;
    var result    = null;

    // Comprobamos en que línea supera el tamaño
    for( lineId = 0; lineId < paragraph.lineList.length; lineId++ ){

        if( page.height < height + ( paragraph.lineList[ lineId ].height * paragraph.spacing ) ){
            break;
        }

        height += paragraph.lineList[ lineId ].height * paragraph.spacing;

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

        var previouslySliced = !!paragraph.split;

        if( paragraph.split ){

            if( paragraph.split === PARAGRAPH_SPLIT_END ){
                paragraph.split = PARAGRAPH_SPLIT_MIDDLE;
            }

        }else{
            paragraph.split = PARAGRAPH_SPLIT_START;
        }

        var newParagraph = $.extend( {}, paragraph );

        height = 0;

        for( i = lineId; i < paragraph.lineList.length; i++ ){
            height += paragraph.lineList[ i ].height * paragraph.spacing;
        }

        newParagraph.height    = height;
        newParagraph.lineList  = paragraph.lineList.slice( lineId );
        paragraph.height      -= height;
        paragraph.lineList     = paragraph.lineList.slice( 0, lineId );

        if( newPage.paragraphList[ 0 ] && newPage.paragraphList[ 0 ].split ){
            newParagraph.split = PARAGRAPH_SPLIT_MIDDLE;
        }else{
            newParagraph.split = PARAGRAPH_SPLIT_END;
        }
        
        newPage.paragraphList.unshift( newParagraph );

        if( previouslySliced ){
            mergeParagraphs( id + 1, newPage, 0, 1 );
        }

    }

    // Fusionamos los párrafos que sean necesarios
    for( i = 1; i < newPage.paragraphList.length; ){
        
        if( newPage.paragraphList[ i - 1 ].split && newPage.paragraphList[ i ].split ){
            mergeParagraphs( id + 1, newPage, i - 1, i );
        }else{
            i++;
        }

    }

    realocatePage( id + 1, true );

    return result;

};

var realocatePageInverse = function( id ){

    var i;
    var page = pageList[ id ];

    // Si no hay párrafos en la página la eliminamos (salvo la primera que no puede eliminarse)
    if( id && !page.paragraphList.length ){

        pageList     = pageList.slice( 0, id ).concat( pageList.slice( id + 1 ) );
        maxScrollTop = GAP - ( canvasPages.height / pixelRatio );

        for( i = 0; i < pageList.length; i++ ){
            maxScrollTop += Math.round( pageList[ i ].height ) + GAP;
        }

        return;

    }

    var nextPage, nextParagraph;
    var heightUsed = 0;

    for( i = 0; i < page.paragraphList.length; i++ ){
        heightUsed += page.paragraphList[ i ].height;
    }

    nextPage = pageList[ id + 1 ];

    if( !nextPage ){
        return;
    }

    nextParagraph = nextPage.paragraphList[ 0 ];

    // Si no entra la siguiente línea, paramos
    if( page.height - page.marginTop - page.marginBottom - heightUsed < nextParagraph.lineList[ 0 ].height ){
        return;
    }

    var prevParagraph = page.paragraphList.slice( -1 )[ 0 ];
    var newParagraph  = $.extend( {}, nextParagraph );

    nextParagraph.lineList  = nextParagraph.lineList.slice( 1 );
    newParagraph.lineList   = newParagraph.lineList.slice( 0, 1 );
    newParagraph.height     = newParagraph.lineList[ 0 ].height;
    nextParagraph.height   -= newParagraph.height;

    page.paragraphList.push( newParagraph );

    // Si hemos partido un párrafo en dos
    if( nextParagraph.lineList.length ){

        if( prevParagraph.split === PARAGRAPH_SPLIT_START || prevParagraph.split === PARAGRAPH_SPLIT_MIDDLE ){
            newParagraph.split = PARAGRAPH_SPLIT_MIDDLE;
        }else{
            newParagraph.split =  PARAGRAPH_SPLIT_START;
        }
        
    }else{

        // To Do -> Esto podría optimizarse, estamos duplicando un párrafo que se podría mover entero
        if( newParagraph.split === PARAGRAPH_SPLIT_END ){
            newParagraph.split = PARAGRAPH_SPLIT_END;
        }else if( prevParagraph.slipt === PARAGRAPH_SPLIT_START || prevParagraph.split === PARAGRAPH_SPLIT_MIDDLE ){
            newParagraph.split = PARAGRAPH_SPLIT_MIDDLE;
        }

        nextPage.paragraphList = nextPage.paragraphList.slice( 1 );

    }

    if( newParagraph.split && newParagraph.split !== PARAGRAPH_SPLIT_START && prevParagraph.split && prevParagraph.split !== PARAGRAPH_SPLIT_END ){

        mergeParagraphs( id, page, page.paragraphList.length - 2, page.paragraphList.length - 1 );

        newParagraph.split = prevParagraph.split;

    }

    realocatePageInverse( id + 1 );

    // To Do -> Esto se puede optimizar mucho, estamos llamando recursivamente a esta función para comprobar si entran líneas siguientes. Ya tenemos parte de los cálculos hechos así que se pueden evitar hacer de nuevo
    realocatePageInverse( id );
    
};

var realTimeConnect = function( error, firstConnection){

    // To Do -> Error
    //console.log( error, 'connected', 'firstConnection', firstConnection );
    realtime.getUserList( true, function( error, list ){

        // To Do -> Error
        for( var i in list ){
            usersEditing[ list[ i ].id ] = list[ i ];
        }

        //console.log( usersEditing );
        //console.log( error, list );

    });

    if( !realtime ){
        return;
    }

    realtime.send({

        cmd : CMD_POSITION,
        pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]

    });

};

var realTimeMessage = function( info, data ){

    if( info.selfClient ){
        return;
    }

    console.log( 'El usuario', info.sender, ' está editando', data );

    var page, pageId, paragraph, paragraphId, line, lineId, lineChar, node, nodeId, nodeChar, elements;

    if( data.cmd === CMD_SYNC ){
        
        console.log( 'CMD_SYNC' );
        
        hideDocument();
        
        loading
            .css( 'display', 'block' )
            .text( 'Joining to the document...');

    }else if( data.cmd === CMD_DOCUMENT ){

        console.log( 'CMD_DOCUMENT' );

        processFile( data.data, true );
        setCursor( 0, 0, 0, 0, 0, 0, true );
        loading.css( 'display', 'none' );
        showDocument();

        realtime.send({

            cmd : CMD_DOCUMENT_READY,
            pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]

        });

    }else if( data.cmd === CMD_DOCUMENT_READY ){

        console.log( 'CMD_DOCUMENT_READY' );

        loading.css( 'display', 'none' );
        showDocument();

    }else if( data.cmd === CMD_NEWCHAR ){

        console.log('CMD_NEWCHAR');

        elements = getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ], true );

        handleRemoteChar( elements.pageId, elements.page, elements.paragraphId, elements.paragraph, elements.lineId, elements.line, elements.lineChar, elements.nodeId, elements.node, elements.nodeChar, data.data[ 2 ] );
        updatePages();

    }else if( data.cmd === CMD_RANGE_NEWCHAR ){

        console.log('CMD_RANGE_NEWCHAR');

        handleRemoteCharSelection( getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] ), getElementsByRemoteParagraph( data.data[ 2 ], data.data[ 3 ], true ), data.data[ 4 ] );
        updatePages();

    }else if( data.cmd === CMD_BACKSPACE ){

        console.log('CMD_BACKSPACE');

        elements = getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ], true );

        handleRemoteBackspace( elements.pageId, elements.page, elements.paragraphId, elements.paragraph, elements.lineId, elements.line, elements.lineChar, elements.nodeId, elements.node, elements.nodeChar );
        updatePages();

    }else if( data.cmd === CMD_RANGE_BACKSPACE ){

        console.log('CMD_RANGE_BACKSPACE');

        handleRemoteBackspaceSelection( getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ] ), getElementsByRemoteParagraph( data.data[ 2 ], data.data[ 3 ], true ) );
        updatePages();

    }else if( data.cmd === CMD_ENTER ){

        console.log('CMD_ENTER');

        elements = getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ], true );
        console.log( elements );

        handleRemoteEnter( elements.pageId, elements.page, elements.paragraphId, elements.paragraph, elements.lineId, elements.line, elements.lineChar, elements.nodeId, elements.node, elements.nodeChar );
        updatePages();

    }else if( data.cmd === CMD_NODE_STYLE ){

        console.log('CMD_NODE_STYLE');

        elements = getElementsByRemoteParagraph( data.data[ 0 ], data.data[ 1 ], true );

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
            getElementsByRemoteParagraph( data.data[ 2 ], data.data[ 3 ], true ),
            data.data[ 4 ],
            data.data[ 5 ],
            true,
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

    if( data.pos ){
        console.log( info.sender, data.pos );
        updateRemoteUserPosition( info.sender, data.pos );
    }

};

var realTimeUserConnect = function( info ){

    if( info.selfUser ){
        return;
    }

    console.log( info );

    loading.css( 'display', 'block' ).text('A user is joining to the document...');
    hideDocument();

    wz.user( info.sender, function( error, user ){

        console.log( arguments );

        loading.css( 'display', 'block' ).text( user.name + ' is joining to the document...' );

        // To Do -> Error

        usersEditing[ info.sender ] = user;

        console.log( usersEditing );

    });

    if( !realtime ){
        return;
    }

    realtime.send({

        cmd : CMD_SYNC,
        pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]

    });

    realtime.send({

        cmd  : CMD_DOCUMENT,
        data : generateDocument()

    });
    
};

var removeHtmlComments = function( text ){

    if( text.match( /<!--[\s\S]*?-->/g ) ){

        text = text.replace( /<!--[\s\S]*?-->/g, '' );

        return removeHtmlComments( text );

    }else{
        return text;
    }

};

var removeHtmlPseudoXml = function( text ){
    return text.replace( /<o:p>[\s\S]*?<\/o:p>/g, '' );
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

                if( !line.nodeList.length ){
                    paragraphLoop.height -= line.height * paragraphLoop.spacing;
                }

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

    currentOpenFile.write( JSON.stringify( generateDocument() ), function( error ){

        if( error ){
            alert( 'Error: ' + error );
            return;
        }

        displaySaveSuccessFully();

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
                realocateLine( pageId, paragraph, i, 0 );
            }

        }else{

            for( i = 0; i < paragraph.lineList.length; i++ ){
                realocateLineInverse( paragraph, i, 0 );
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

            if( i ){
                paragraph.lineList[ i ].width -= value;
            }

        }

        for( i = 0; i < paragraph.lineList.length; i++ ){
            realocateLine( pageId, paragraph, i, 0 );
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

    }else if( key === 'align' ){

        // Si aplicamos la misma alineacion a un parrafo se ignora el cambio
        if( paragraph[ key ] !== value ){

            // Si el párrafo estaba justificado, desjustificamos su contenido
            if( paragraph[ key ] === ALIGN_JUSTIFY ){

                var j, line, node;

                for( i = 0; i < paragraph.lineList.length; i++ ){

                    line = paragraph.lineList[ i ];

                    for( j = 0; j < line.nodeList.length; j++ ){

                        node = line.nodeList[ j ];

                        delete node.justifyCharList;
                        delete node.justifyWidth;

                    }

                }

            }

            paragraph[ key ] = value;

            // Si hemos justificado el párrafo, justificamos su contenido
            if( value === ALIGN_JUSTIFY ){

                for( i = 0; i < paragraph.lineList.length; i++ ){
                    measureLineJustify( paragraph, paragraph.lineList[ i ], i );
                }

            }

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
        positionAbsoluteY = getElementPositionY( currentPage, page, currentParagraph, paragraph, currentLine, line );
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
        positionAbsoluteX = getElementPositionX( currentPage, page, currentParagraph, paragraph, currentLine, line, currentNode, node, nodeChar );
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

    if( calculateScroll() ){
        updatePages();
    }

    updateRuleLeft(); // To Do -> Esto no debería ejecutarse todas las veces, solo aquellas en las que haga falta
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

    // Arreglamos los límites
    // Si está al final del nodo
    if( start.node.string.length === start.nodeChar ){

        // Si no es último nodo de la línea
        if( start.nodeId + 1 < start.line.nodeList.length ){

            start.nodeId   = start.nodeId + 1;
            start.node     = start.line.nodeList[ start.nodeId ];
            start.nodeChar = 0;

        // Si no es la última línea del párrafo
        }else if( start.lineId + 1 < start.paragraph.lineList.length ){

            start.lineId   = start.lineId + 1;
            start.line     = start.paragraph.lineList[ start.lineId ];
            start.lineChar = 0;
            start.nodeId   = 0;
            start.node     = start.line.nodeList[ 0 ];
            start.nodeChar = 0;
            
        // Si no es el último párrafo de la página
        }else if( start.paragraphId + 1 < start.page.paragraphList.length ){

            start.paragraphId = start.paragraphId + 1;
            start.paragraph   = start.page.paragraphList[ start.paragraphId ];
            start.lineId      = 0;
            start.line        = start.paragraph.lineList[ 0 ];
            start.lineChar    = 0;
            start.nodeId      = 0;
            start.node        = start.line.nodeList[ 0 ];
            start.nodeChar    = 0;
            
        // Si no es la última página del documento
        // To Do -> Comprobar en que casos ocurre esto y si es necesario hacer una condición o poner directamente un else
        }else if( start.pageId + 1 < pageList.length ){

            start.pageId      = start.pageId + 1;
            start.page        = pageList[ start.pageId ];
            start.paragraphId = 0;
            start.paragraph   = start.paragraph.lineList[ 0 ];
            start.lineId      = 0;
            start.line        = start.paragraph.lineList[ 0 ];
            start.lineChar    = 0;
            start.nodeId      = 0;
            start.node        = start.line.nodeList[ 0 ];
            start.nodeChar    = 0;

        }
        
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

var setRangeNodeStyle = function( rangeStart, rangeEnd, key, value, propagated, realocate ){

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

    if( !propagated || realocate ){
        
        // To Do -> Esto se puede hacer más óptimo, recolocar todo un párrafo no parece muy óptimo en la mayor parte de los casos
        mapRangeParagraphs( rangeStart, rangeEnd, function( pageId, page, paragraphId, paragraph ){

            for( var i = 0; i < paragraph.lineList.length; i++ ){
                realocateLine( pageId, paragraph, i, 0 );
            }

            for( var j = 0; j < paragraph.lineList.length; j++ ){
                realocateLineInverse( paragraph, j, 0 );
            }

        });

    }

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

    var i, charInParagraphStart, charInParagraphEnd, paragraphIdStart, paragraphIdEnd;

    // Selección normal
    if( currentRangeStart ){

        // Calculamos las posiciones de inicio
        paragraphIdStart     = currentRangeStart.paragraphId;
        charInParagraphStart = currentRangeStart.lineChar;

        for( i = 0; i < currentRangeStart.pageId; i++ ){
            paragraphIdStart += pageList[ i ].paragraphList.length;
        }

        for( i = 0; i < currentRangeStart.lineId; i++ ){
            charInParagraphStart += currentRangeStart.paragraph.lineList[ i ].totalChars;
        }

        paragraphIdEnd     = currentRangeEnd.paragraphId;
        charInParagraphEnd = currentRangeEnd.lineChar;

        for( i = 0; i < currentRangeEnd.pageId; i++ ){
            paragraphIdEnd += pageList[ i ].paragraphList.length;
        }

        for( i = 0; i < currentRangeEnd.lineId; i++ ){
            charInParagraphEnd += currentRangeEnd.paragraph.lineList[ i ].totalChars;
        }

        // Aplicamos el estilo
        setRangeNodeStyle( currentRangeStart, currentRangeEnd, key, value );

        // Resignamos el rango correctamente
        // To Do -> Quizás deberíamos delegarlo al setRangeNodeStyle

        currentRangeStart = getElementsByRemoteParagraph( paragraphIdStart, charInParagraphStart );
        currentRangeEnd   = getElementsByRemoteParagraph( paragraphIdEnd, charInParagraphEnd, true );

        // Enviamos
        if( realtime ){

            realtime.send({
                
                cmd  : CMD_RANGE_NODE_STYLE,
                data : [ paragraphIdStart, charInParagraphStart, paragraphIdEnd, charInParagraphEnd, key, value ],
                pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

            });

        }

    // Principio de un párrafo vacío
    }else if( currentLineId === 0 && currentLine.totalChars === 0 ){

        // Calculamos las posiciones de inicio
        paragraphIdStart     = currentParagraphId;
        charInParagraphStart = currentLineCharId;

        for( i = 0; i < currentPageId; i++ ){
            paragraphIdStart += pageList[ i ].paragraphList.length;
        }

        for( i = 0; i < currentLineId; i++ ){
            charInParagraphStart += currentParagraph.lineList[ i ].totalChars;
        }

        // Aplicamos el estilo
        setNodeStyle( currentParagraph, currentLine, currentNode, key, value );

        // Enviamos
        if( realtime ){

            realtime.send({
                
                cmd  : CMD_NODE_STYLE,
                data : [ paragraphIdStart, charInParagraphStart, key, value ],
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

        }else if( key === 'indentationLeftAdd' ){
            requestStartCheck = true;
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

    viewTitle.text( name );

};

var showDocument = function(){
    
    pages.css( 'display', 'block' );
    selections.css( 'display', 'block' );
    ruleTop.css( 'display', 'block' );
    ruleLeft.css( 'display', 'block' );

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
    updateScroll( 0 );
    updateRuleLeft();
    drawRuleTop();
    updatePages();
    updateToolsLineStatus();
    activeRealTime();

    loading.css( 'display', 'none' );

    marginTopDown.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopUp.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopBox.css( 'x', parseInt( currentPage.marginLeft, 10 ) );

};

var trimRight = function( string ){
    return string.replace( / +$/g, '' );
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

                parseInt( usersPosition[ i ].x, 10 ),
                parseInt( usersPosition[ i ].y - scrollTop + usersPosition[ i ].line.height - usersPosition[ i ].node.height, 10 ),
                2,
                usersPosition[ i ].node.height

            );

            // Fondo del nombre
            ctxSel.fillRect(

                parseInt( usersPosition[ i ].x, 10 ),
                parseInt( usersPosition[ i ].y - scrollTop + usersPosition[ i ].line.height - usersPosition[ i ].node.height, 10 ) - 2 - 14, // 2 por la separación respecto al cursor y 14 del tamaño de la caja
                ctxSel.measureText( usersEditing[ i ].fullName ).width + 8, // 4 y 4 de margenes laterales
                14

            );

            // Texto del nombre
            ctxSel.fillStyle = '#ffffff';

            ctxSel.fillText(

                usersEditing[ i ].fullName,
                parseInt( usersPosition[ i ].x, 10 ) + 4, // 4 del margen lateral izquierdo
                parseInt( usersPosition[ i ].y - scrollTop + usersPosition[ i ].line.height - usersPosition[ i ].node.height, 10 ) - 2 - 3 // 2 por la separación respecto al cursor y 3 de la diferencia con el tamaño de la caja

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

    pos   = getElementsByRemoteParagraph( pos[ 0 ], pos[ 1 ] );
    pos.x = getElementPositionX( pos.page, pos.pageId, pos.paragraph, pos.paragraphId, pos.line, pos.lineId, pos.node, pos.nodeId, pos.nodeChar );
    pos.y = getElementPositionY( pos.page, pos.pageId, pos.paragraph, pos.paragraphId, pos.line, pos.lineId, pos.node, pos.nodeId, pos.nodeChar );

    console.log( pos.x, pos.y );

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

var updateScroll = function( value, noUpdateScrollBar ){
    
    scrollTop = value;

    updatePages();
    updateRuleLeft();

    if( currentRangeStart ){
        updateRange();
    }else{
        resetBlink();
    }

    if( noUpdateScrollBar ){
        return;
    }

    scrollVItem.css( 'y', parseInt( ( scrollV.height() - scrollVItem.outerHeight() ) * ( scrollTop / maxScrollTop ), 10 ) );

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
    toolsList.removeClass('active-fontfamily active-fontsize active-linespacing active-moreoptions active-page-dimensions active-page-margins');
    toolsColor.removeClass('active-color active-page-color');

})

.on( 'ui-view-ready', function(){

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
    toolsList.removeClass('active-fontfamily active-fontsize active-linespacing active-moreoptions active-page-dimensions active-page-margins');
    toolsColor.removeClass('active-color active-page-color');

})

.on( 'click', '.wz-ui-header, .toolbar', function(e){

    if( $(e.target).closest('.wz-view-minimize, .wz-view-close').length ){
        return;
    }

    input.focus();

})

.on( 'ui-view-restore ui-view-focus', function(){
    input.focus();
})

.key( 'ctrl+c, cmd+c', function(){
    textarea.val(' ').select(); // Tiene que existir algo para que se invoque un evento copy
})

.key( 'ctrl+v, cmd+v', function(){
    textarea.val(' ').select(); // Tiene que existir algo para que se invoque un evento paste
})

wz.system.on( 'copy', function( copy ){
    
    copy( clipboardCopy() );
    input.focus();

});

wz.system.on( 'paste', function( paste ){

    var content = paste();
    var type    = null;

    for( var i = 0; i < PASTE_FORMATS.length; i++ ){

        if( typeof content[ PASTE_FORMATS[ i ] ] !== 'undefined' ){

            type    = PASTE_FORMATS[ i ];
            content = content[ type ];

            break;

        }

    }

    if( !type ){
        return;
    }

    if( type === 'text/html' ){
        insertHtmlText( content );
    }else if( type === 'text/plain' ){
        insertPlainText( content );
    }

    updatePages();
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

moreButton.on( 'click', function(){

    toolsListEnabled = true;

    toolsList
        .addClass('active-moreoptions')
        .html(
            '<li><i class="pdf"></i>Export as PDF</li>'
        );

    toolsListContainer
        .css({

            top     : $(this).position().top + $(this).outerHeight(),
            left    : $(this).position().left,
            display : 'block'

        });

});

input
.on( 'keydown', function( e ){

    if( e.ctrlKey || e.metaKey ){
        return;
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
        updatePages();

        keydownHandled = true;

    }else if( e.keyCode === KEY_DEL ){

        handleDel();
        updatePages();

        keydownHandled = true;

    }else if( e.keyCode === KEY_DEL ){

        handleDel();
        updatePages();

        keydownHandled = true;

    }

})

.on( 'keypress', function(e){

    if( e.ctrlKey || e.metaKey ){
        return;
    }else if( compositionEnded && e.which === KEY_BACKSPACE ){

        handleBackspace();
        updatePages();

    }else if( e.key && e.key.length === 1 ){

        // Este método solo funcionaba en Firefox cuando se escribió. Aunque Firefox es compatible
        // con el método del setTimeout para recuperar lo tecleado, este caso es mucho más rápido,
        // permitiendo que Firefox sea el navegador más eficiente a la hora de teclear

        handleChar( e.key );
        updatePages();

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
        updatePages();

    }else if( compositionEnded && e.keyCode === KEY_DEL ){

        handleDel();
        updatePages();

    }else if( !waitingCheckLetter && !keydownHandled ){

        waitingCheckLetter = true;

        setTimeout( function(){

            if( input[ 0 ].value ){

                for( var i = 0; i < input[ 0 ].value.length; i++ ){
                    handleChar( input[ 0 ].value[ i ] );
                }
                
                updatePages();

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
        updatePages();

    }
    
})

.on( 'compositionend', function( e ){

    handleBackspace();
    handleChar( e.originalEvent.data );
    cleanComposition( true );
    updatePages();

    compositionCounter = 0;
    compositionEnded   = true;

});

selections
.on( 'mousedown', function(e){

    if( e.button === 2 ){
        return;
    }

    verticalKeysEnabled = false;
    selectionEnabled    = true;

    cleanComposition();
    e.preventDefault();

    var pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar, charList;
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

                    charList = node.justifyCharList || node.charList;

                    if( charList[ nodeChar ] - ( ( charList[ nodeChar ] - ( charList[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX ){
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

        if( realtime ){
            
            realtime.send({

                cmd : CMD_POSITION,
                pos : [ getGlobalParagraphId( currentPageId, currentParagraphId ), getGlobalParagraphChar( currentParagraph, currentLineId, currentLineCharId ) ]
                
            });

        }

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

// Controlador de drag
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
            if( width <= posX && ( line.nodeList[ nodeId ].justifyWidth || line.nodeList[ nodeId ].width ) + width >= posX ){

                node = line.nodeList[ nodeId ];

                for( nodeChar = 0; nodeChar < node.string.length; ){
                    
                    if( node.justifyCharList ){

                        if( node.justifyCharList[ nodeChar ] - ( ( node.justifyCharList[ nodeChar ] - ( node.justifyCharList[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX ){
                            break;
                        }

                    }else{

                        if( node.charList[ nodeChar ] - ( ( node.charList[ nodeChar ] - ( node.charList[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX ){
                            break;
                        }

                    }

                    nodeChar++;
                    lineChar++;

                }

                break;

            }

            lineChar += line.nodeList[ nodeId ].string.length;
            width    += line.nodeList[ nodeId ].justifyWidth || line.nodeList[ nodeId ].width;
            nodeId   += 1;

        }

        if( !node ){

            lineChar = line.totalChars;
            nodeId   = line.nodeList.length - 1;
            node     = line.nodeList[ nodeId ];
            nodeChar = node.string.length;

        }

    }

    if( nodeChar === 0 ){

        if( nodeId === 0 ){

            if( lineId === 0 ){

                if( paragraphId === 0 ){

                    if( pageId !== 0 ){

                        pageId      = pageId - 1;
                        page        = pageList[ pageId ];
                        paragraphId = page.paragraphList.length - 1;
                        paragraph   = page.paragraphList[ paragraphId ];
                        lineId      = paragraph.lineList.length - 1;
                        line        = paragraph.lineList[ lineId ];
                        lineChar    = line.totalChars;
                        nodeId      = line.nodeList.length - 1;
                        node        = line.nodeList[ nodeId ];
                        nodeChar    = node.string.length;
                    }

                }else{

                    paragraphId = paragraphId - 1;
                    paragraph   = page.paragraphList[ paragraphId ];
                    lineId      = paragraph.lineList.length - 1;
                    line        = paragraph.lineList[ lineId ];
                    lineChar    = line.totalChars;
                    nodeId      = line.nodeList.length - 1;
                    node        = line.nodeList[ nodeId ];
                    nodeChar    = node.string.length;
       
                }

            }else{

                lineId   = lineId - 1;
                line     = paragraph.lineList[ lineId ];
                lineChar = line.totalChars;
                nodeId   = line.nodeList.length - 1;
                node     = line.nodeList[ nodeId ];
                nodeChar = node.string.length;

            }

        }else{

            nodeId   = nodeId - 1;
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

// Controlador de mouse
.on( 'mousemove', function(e){

    var offset   = selections.offset();
    var posX     = e.pageX - offset.left;
    var posY     = e.pageY - offset.top;
    var heritage = 0;

    for( var pageId = 0; pageId < pageList.length; pageId++ ){

        if( pageList[ pageId ].height + heritage - scrollTop >= posY ){
            break;
        }

        if( pageList[ pageId ].height + GAP + heritage - scrollTop >= posY ){
            pageId = null;
            break;
        }

        heritage += pageList[ pageId ].height + GAP;

    }

    var page = pageList[ pageId ];

    if( !page || pageId === null ){

        if( currentMouse !== MOUSE_NORMAL ){

            selections
                .addClass( MOUSE_STATUS[ MOUSE_NORMAL ].add )
                .removeClass( MOUSE_STATUS[ MOUSE_NORMAL ].remove );

            currentMouse = MOUSE_NORMAL;

        }

        return;

    }

    if(
        posX <= page.marginLeft ||
        posX >  page.width - page.marginRight ||
        pageList[ pageId ].marginTop + heritage - scrollTop >= posY ||
        pageList[ pageId ].height - pageList[ pageId ].marginBottom + heritage - scrollTop < posY
    ){

        if( currentMouse !== MOUSE_NORMAL ){

            selections
                .addClass( MOUSE_STATUS[ MOUSE_NORMAL ].add )
                .removeClass( MOUSE_STATUS[ MOUSE_NORMAL ].remove );

            currentMouse = MOUSE_NORMAL;

        }

        return;

    }

    if( currentMouse !== MOUSE_TEXT ){

        selections
            .addClass( MOUSE_STATUS[ MOUSE_TEXT ].add )
            .removeClass( MOUSE_STATUS[ MOUSE_TEXT ].remove );

        currentMouse = MOUSE_TEXT;

    }

})

.on( 'mouseup', function(){

    selectionEnabled = false;

    updateToolsLineStatus();

})

.on( 'mousewheel', function( e, delta, x, y ){

    if( currentDocumentHeight <= ( canvasPages.height / pixelRatio ) ){
        return;
    }

    var originalScrollTop = scrollTop;
    var newScroll         = scrollTop;

    // El plugin de mousewheel está ya normalizado, anteriormete teníamos un factor de correción de x30
    newScroll -= y;

    if( newScroll < 0 ){
        newScroll = 0;
    }else if( newScroll > maxScrollTop ){
        newScroll = maxScrollTop;
    }

    if( originalScrollTop === newScroll ){
        return;
    }

    updateScroll( newScroll );

})

.on( 'contextmenu', function( e ){

    var hasClipboard = /*window.clipboardData ||*/ e.originalEvent.clipboardData;

    wz.menu()
        .addOption( lang.copy, function(e){

            if( hasClipboard ){
                clipboardCopy( e );
            }else{

                wz.dialog()
                    .setTitle( lang.unsupportedCopy )
                    .setText( lang.unsupportedCopyDescription )
                    .setButton( 0, lang.accept )
                    .render();

            }

        })
        .addOption( lang.cut, function(){})
        .addOption( lang.paste, function(){})
        .render();

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

    // Modo más opciones
    }else if( toolsList.hasClass('active-moreoptions') ){
        
        var name = ( currentOpenFile ? currentOpenFile.name.replace( /.docx|.texts$/i, '' ) : 'New document' ) + '.pdf';

        wz.banner()
                .setTitle( 'Texts - Exporting PDF...' )
                .setText( name + ' is being exported' )
                .setIcon( 'https://static.inevio.com/app/7/floppy.png' )
                .render();

        wz.tool.textsDocumentToPdf( name, 'root', generateDocument(), function( error ){

            if( error ){
                alert( error );
                return;
            }

            wz.banner()
                .setTitle( 'Texts - ' + name )
                .setText( name + ' ' + lang.fileSaved )
                .setIcon( 'https://static.inevio.com/app/7/floppy.png' )
                .render();

        });

    }

    toolsList.removeClass('active-fontfamily active-fontsize active-linespacing active-moreoptions active-page-dimensions active-page-margins');
    updateToolsLineStatus();

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

        'background-color' : $(this).css('background-color'),
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
            .css( 'background-color', toolsColorHover.css('background-color') )
            .click();

    }else if( toolsColor.hasClass('active-page-color') ){

        toolsColorContainer.css( 'display', 'none' );
        toolsColor.removeClass('active-page-color');

        setPagesStyle( 'pageBackgroundColor', normalizeColor( toolsColorHover.css('background-color') ) );

    }

});

scrollV
.on( 'wz-dragmove', function( e, x, y ){

    e.stopPropagation();

    updateScroll( parseInt( maxScrollTop * y, 10 ), true );

});

// Start
if( !params ){
    start();
}else{

    loading
        .css( 'display', 'block' )
        .text('Loading file...');

}
