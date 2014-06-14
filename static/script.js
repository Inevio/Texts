
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

        console.log('No implementado');
        return;


    }else{

        var prev = currentLine.charList[ currentCharId - 2 ] || 0;
        var next = currentLine.charList[ currentCharId - 1 ];

        console.log( prev, next );

        positionAbsoluteX += ( prev - next );
        currentCharId--;

    }

    resetBlink();

};

var handleArrowRight = function(){

    if( currentCharId === currentLine.string.length ){
        console.log('No implementado');
        return;
    }else{

        var prev = currentLine.charList[ currentCharId - 1 ] || 0;
        var next = currentLine.charList[ currentCharId ];

        positionAbsoluteX += next - prev;

        currentCharId++;

    }

    resetBlink();

};

var handleBackspace = function(){

    // Principio de linea
    if( currentCharId === 0 ){

        // Principio del documento, lo comprobamos antes porque es un caso especial
        if( !currentPageId && !currentParagraphId && !currentLineId && !currentCharId ){
            return;
        }

        var line      = 0;
        var paragraph = 0;
        var page      = 0;
        var charId    = 0;

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

    }else if( currentLine.string.length === currentCharId ){

        var prev = currentLine.charList[ currentLine.charList.length - 2 ] || 0;
        var next = currentLine.charList[ currentLine.charList.length - 1 ];

        positionAbsoluteX += ( prev - next );
        currentLine.string = currentLine.string.slice( 0, -1 );
        currentLine.charList.pop();
        currentCharId--;

    }else{
        // To Do -> No está al final de la línea
    }

    resetBlink();

};

var handleChar = function( newChar ){

    if( currentLine.string.length === currentCharId ){

        currentLine.string += newChar;
        currentLine.charList.push( ctx.measureText( currentLine.string ).width );
        currentCharId++;

        var prev = currentLine.charList[ currentCharId - 2 ] || 0;
        var next = currentLine.charList[ currentCharId - 1 ];

        positionAbsoluteX += next - prev;

    }else{
        
        currentLine.string = currentLine.string.slice( 0, currentCharId ) + newChar + currentLine.string.slice( currentCharId );

        currentLine.charList = currentLine.charList.slice( 0, currentCharId );

        currentCharId++;

        for( var i = currentCharId; i < currentLine.string.length; i++ ){
            currentLine.charList.push( ctx.measureText( currentLine.string.slice( 0, i ) ).width );
        }

        var prev = currentLine.charList[ currentCharId - 2 ] || 0;
        var next = currentLine.charList[ currentCharId - 1 ];

        positionAbsoluteX += next - prev;


    }

    resetBlink();

};

var handleEnter = function(){

    // To Do -> Comprobar que entra en la página
    // To Do -> Intro a mitad de línea
    // To Do -> Herencia de estilos

    var paragraph = currentPage.paragraphList.push( createParagraph( currentPage ) ) - 1;

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

// Start
start();
