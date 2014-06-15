
// Constantes
var DEBUG = false;
var PAGE_A4 = {

    width  : 794, // 21 cm
    height : 1122 // 29.7 cm

};

var MARGIN_NORMAL = {

    top    : 94, //2.5 cm
    right  : 94, //2.5 cm
    bottom : 94, //2.5 cm
    left   : 94  //2.5 cm

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

// Current variables
var currentPage        = null;
var currentPageId      = null;
var currentParagraph   = null;
var currentParagraphId = null;
var currentLine        = null;
var currentLineId      = null;
var currentLineHeight  = null;
var currentCharId      = null;
var currentStyle       = '12pt Helvetica';
var positionAbsoluteX  = null;
var positionAbsoluteY  = null;

var checkCanvasPagesSize = function(){
    
    canvasPages.width  = pages.width();
    canvasPages.height = pages.height();

};

var checkCanvasSelectSize = function(){

    canvasSelect.width  = selections.width();
    canvasSelect.height = selections.height();

};

var createLine = function( paragraph ){

    var line = newLine();

    // To Do -> Asignar la altura dinámicamente
    line.height = parseInt( testZone.css('line-height'), 10 );

    // To Do -> Herencia de ancho
    line.width = paragraph.width;

    return line;

};

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

var createParagraph = function( page ){

    var paragraph = newParagraph();

    // To Do -> Alto de linea dinamico
    // To Do -> Ancho de linea dinamico
    paragraph.width = page.width;

    // Creamos la línea inicial
    var line = createLine( paragraph );

    paragraph.lineList.push( line );

    paragraph.height += line.height;

    return paragraph;

};

var debugTime = function( name ){

    if( DEBUG ){
        debugTime( name );
    }
    
};

var debugTimeEnd = function( name ){
    
    if( DEBUG ){
        debugTimeEnd( name );
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
    //var pHeritage = 0;
    //var lHeritage = 0;
    var heritage  = 0;

    for( var i = 0; i < page.paragraphList.length; i++ ){

        paragraph = page.paragraphList[ i ];

        for( var j = 0; j < paragraph.lineList.length; j++ ){

            // To Do -> Gaps
            // To Do -> Altura de línea
            line = paragraph.lineList[ j ];

            ctx.fillStyle = '#000';
            ctx.font      = '12pt Helvetica';

            ctx.fillText(

                line.string,
                page.marginLeft + 20,
                page.marginTop + 20 + line.height + heritage

            );

            heritage += line.height;
            //lHeritage += line.height;

        }

        //pHeritage += paragraph.height;

    }

    debugTimeEnd('draw');

};

var handleArrowLeft = function(){

    // Principio de linea
    if( currentCharId === 0 ){

        // Principio del documento, lo comprobamos antes porque es un caso especial
        if( !currentPageId && !currentParagraphId && !currentLineId && !currentCharId ){
            return;
        }

        var line, paragraph, page, charId;

        // Principio de párrafo
        if( currentLineId === 0 ){

            // Principio de página
            if( currentParagraphId === 0){

                page      = currentPageId - 1;
                paragraph = pageList[ page ].paragraphList.length - 1;
                line      = pageList[ page ].paragraphList[ paragraph ].lineList.length - 1;
                charId    = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].string.length;

            }else{

                page      = currentPageId;
                paragraph = currentParagraphId - 1;
                line      = pageList[ page ].paragraphList[ paragraph ].lineList.length - 1;
                charId    = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].string.length;

            }

        }else{

            page      = currentPageId;
            paragraph = currentParagraphId;
            line      = currentLineId - 1;
            charId    = currentParagraph[ line ].string.length;

        }

        setCursor( page, paragraph, line, charId );

    }else{

        var prev = currentLine.charList[ currentCharId - 2 ] || 0;
        var next = currentLine.charList[ currentCharId - 1 ];

        positionAbsoluteX += ( prev - next );
        currentCharId--;

    }

    resetBlink();

};

var handleArrowRight = function(){

    if( currentCharId === currentLine.string.length ){

        var line, paragraph, page, charId;

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
                charId    = 0;

            }else{

                page      = currentPageId;
                paragraph = currentParagraphId + 1;
                line      = 0;
                charId    = 0;

            }

        }else{

            page      = currentPageId;
            paragraph = currentParagraphId;
            line      = currentLineId + 1;
            charId    = 0;

        }

        setCursor( page, paragraph, line, charId );

    }else{

        var prev = currentLine.charList[ currentCharId - 1 ] || 0;
        var next = currentLine.charList[ currentCharId ];

        positionAbsoluteX += next - prev;

        currentCharId++;

    }

    resetBlink();

};

var handleBackspace = function(){

    var prev, next;

    // Principio de linea
    if( currentCharId === 0 ){

        // Principio del documento, lo comprobamos antes porque es un caso especial
        if( !currentPageId && !currentParagraphId && !currentLineId && !currentCharId ){
            return;
        }

        var line, paragraph, page, charId;

        // Principio de párrafo
        if( currentLineId === 0 ){

            // Principio de página
            if( currentParagraphId === 0){

                page      = currentPageId - 1;
                paragraph = pageList[ page ].paragraphList.length - 1;
                line      = pageList[ page ].paragraphList[ paragraph ].lineList.length - 1;
                charId    = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].string.length;

            }else{

                page      = currentPageId;
                paragraph = currentParagraphId - 1;
                line      = pageList[ page ].paragraphList[ paragraph ].lineList.length - 1;
                charId    = pageList[ page ].paragraphList[ paragraph ].lineList[ line ].string.length;

            }

        }else{

            page      = currentPageId;
            paragraph = currentParagraphId;
            line      = currentLineId - 1;
            charId    = currentParagraph[ line ].string.length;

        }

        setCursor( page, paragraph, line, charId );

    // Final de la linea
    }else if( currentLine.string.length === currentCharId ){

        prev = currentLine.charList[ currentLine.charList.length - 2 ] || 0;
        next = currentLine.charList[ currentLine.charList.length - 1 ];

        positionAbsoluteX += ( prev - next );
        currentLine.string = currentLine.string.slice( 0, -1 );
        currentLine.charList.pop();
        currentCharId--;

    // En medio de la linea
    }else{

        prev = currentLine.charList[ currentCharId - 2 ] || 0;
        next = currentLine.charList[ currentCharId - 1 ];

        positionAbsoluteX   += ( prev - next );
        currentLine.string   = currentLine.string.slice( 0, currentCharId - 1 ) + currentLine.string.slice( currentCharId );
        currentLine.charList = currentLine.charList.slice( 0, currentCharId - 1 );

        for( var i = currentCharId; i <= currentLine.string.length; i++ ){
            currentLine.charList.push( ctx.measureText( currentLine.string.slice( 0, i ) ).width );
        }

        currentCharId--;

    }

    resetBlink();

};

var handleChar = function( newChar ){

    var prev, next;

    // Final de linea
    if( currentLine.string.length === currentCharId ){

        currentLine.string += newChar;
        currentLine.charList.push( ctx.measureText( currentLine.string ).width );
        currentCharId++;

        prev = currentLine.charList[ currentCharId - 2 ] || 0;
        next = currentLine.charList[ currentCharId - 1 ];

        positionAbsoluteX += next - prev;

    // Cualquier otra posición
    }else{
        
        currentLine.string   = currentLine.string.slice( 0, currentCharId ) + newChar + currentLine.string.slice( currentCharId );
        currentLine.charList = currentLine.charList.slice( 0, currentCharId );

        currentCharId++;

        for( var i = currentCharId; i < currentLine.string.length; i++ ){
            currentLine.charList.push( ctx.measureText( currentLine.string.slice( 0, i ) ).width );
        }

        prev = currentLine.charList[ currentCharId - 2 ] || 0;
        next = currentLine.charList[ currentCharId - 1 ];

        positionAbsoluteX += next - prev;

    }

    resetBlink();

};

var handleEnter = function(){

    // To Do -> Comprobar que entra en la página
    // To Do -> Intro a mitad de línea
    // To Do -> Herencia de estilos

    var paragraph = createParagraph( currentPage );
    var endList   = currentPage.paragraphList.slice( currentParagraphId + 1 );

    currentPage.paragraphList = currentPage.paragraphList.slice( 0, currentParagraphId + 1 );
    paragraph                 = currentPage.paragraphList.push( paragraph ) - 1;
    currentPage.paragraphList = currentPage.paragraphList.concat( endList );

    setCursor( currentPageId, paragraph, 0, 0 );
    resetBlink();

};

var newLine = function(){

    return {

        charList   : [],
        height     : null,
        width      : null,
        string     : '',
        styleStops : []

    };

};

var newPage = function(){
    
    return {

        width         : null,
        height        : null,
        marginTop     : null,
        marginRight   : null,
        marginBottom  : null,
        marginLeft    : null,
        paragraphList : []

    };

};

var newParagraph = function(){

    return {

        interline     : null,
        justification : null,
        lineList      : [],
        width         : 0,
        height        : 0

    };

};

var resetBlink = function(){

    blinkTime    = Date.now();
    blinkStatus  = 0;
    blinkCurrent = false;

};

var start = function(){
    
    input.focus();
    createPage( PAGE_A4, MARGIN_NORMAL );
    setCursor( 0, 0, 0, 0 );
    drawPages();

};

var setCursor = function( page, paragraph, line, letter  ){

    // Ignoramos si el cursor se vuelve a poner en el mismo sitio
    if(
        currentPageId === page &&
        currentParagraphId === paragraph &&
        currentLineId === line &&
        currentCharId === letter
    ){
        return;
    }

    // Actualizamos solo los campos que sean necesarios
    if( currentPageId !== page ){
        currentPage = pageList[ page ];
    }

    if( currentPageId !== page || currentParagraphId !== paragraph ){
        currentParagraph = currentPage.paragraphList[ paragraph ];
    }
    
    if( currentPageId !== page || currentParagraphId !== paragraph || currentLineId !== line ){

        currentLine = currentParagraph.lineList[ line ];
        // To Do -> Actualizamos el alto de línea
        currentLineHeight = parseInt( testZone.css('line-height'), 10 );

    }

    // Calculamos la posición vertical si es necesario
    if(
        currentPageId !== page ||
        currentParagraphId !== paragraph||
        currentLineId !== line
    ){

        // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
        positionAbsoluteY = 0;

        // Gap inicial
        positionAbsoluteY += 20;

        // Tamaño de cada página
        for( var i = 0; i < page; i++ ){
            positionAbsoluteY += pageList[ i ].height;
            // To Do -> Gaps entre páginas
        }

        // Tamaño de cada párrafo
        for( var i = 0; i < paragraph; i++ ){
            positionAbsoluteY += currentPage.paragraphList[ i ].height;
            // To Do -> Gaps entre páginas
        }

        // Tamaño de cada línea
        for( var i = 0; i < line; i++ ){
            positionAbsoluteY += currentPage.lineList[ i ].height;
            // To Do -> Gaps entre páginas
        }

        // Márgen superior
        positionAbsoluteY += currentPage.marginTop;

    }

    // Calculamos la posición horizontal si es necesario
    if(
        currentPageId !== page ||
        currentParagraphId !== paragraph||
        currentLineId !== line ||
        currentCharId !== letter
    ){

        // To Do -> Seguramente esto pueda optimizarse guardando pasos intermedios
        positionAbsoluteX = 0;

        // Gap inicial
        positionAbsoluteX += 20;

        // Márgen superior
        positionAbsoluteX += currentPage.marginLeft;

        // Posicion dentro de la linea
        if( letter > 0 ){
            positionAbsoluteX += currentLine.charList[ letter - 1 ];
        }

    }
    
    currentPageId      = page;
    currentParagraphId = paragraph;
    currentLineId      = line;
    currentCharId      = letter;

    updateBlink();
    
};

var updateBlink = function(){

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

        ctxSel.rect( positionAbsoluteX + 0.5, positionAbsoluteY + 0.5, 0, currentLineHeight );
        ctxSel.stroke();

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
input.on( 'keydown', function(e){

    if( e.key && e.key.length === 1 ){
        handleChar( e.key );
    }else if( e.which === 8 ){
        handleBackspace();
    }else if( e.which === 13 ){
        handleEnter();
    }else if( e.which === 37 ){
        handleArrowLeft();
    }else if( e.which === 39 ){
        handleArrowRight();
    }else{
        console.log( e.which );
    }

    drawPages();

});

selections.on( 'mousedown', function(e){

    var offset = selections.offset();
    var posX   = e.pageX - offset.left;
    var posY   = e.pageY - offset.top;

    // Buscamos la posición vertical
    var height = 0;

    // Tenemos en cuenta el gap
    height += 20;

    // Buscamos la página
    for( var page = 0; page < pageList.length; page++ ){

        if( pageList[ page ].height + height < posY ){
            height += pageList[ page ].height;
        }else{
            break;
        }

    }

    var pageId = page;

    page = pageList[ page ];

    // Tenemos en cuenta el margen superior
    height += page.marginTop;

    // Buscamos el párrafo
    for( var paragraph = 0; paragraph < page.paragraphList.length; paragraph++ ){

        if( page.paragraphList[ paragraph ].height + height < posY ){
            height += page.paragraphList[ paragraph ].height;
        }else{
            break;
        }

    }

    var paragraphId = paragraph;

    paragraph = page.paragraphList[ paragraph ];

    // Buscamos la línea
    for( var line = 0; line < paragraph.lineList.length; line++ ){
        
        if( paragraph.lineList[ line ].height + height < posY ){
            height += paragraph.lineList[ line ].height;
        }else{
            break;
        }

    }

    var lineId = line;

    line = paragraph.lineList[ line ];

    // Buscamos la posición horizontal
    var width = 0;

    // Tenemos en cuenta el gap
    width += 20;

    // Tenemos en cuenta el margen izquierdo
    width += page.marginLeft;

    // Buscamos el caracter
    for( var i = 0; i < line.string.length; i++ ){

        if( line.charList[ i ] - ( ( line.charList[ i ] - ( line.charList[ i - 1 ] || 0 ) ) / 2 ) + width >= posX ){
            width += line.charList[ i ];
            break;
        }

    }

    // To Do -> No usar un setCursor, ya tenemos calculadas todas las posiciones
    setCursor( pageId, paragraphId, lineId, i );
    resetBlink();

});

// Start
start();
