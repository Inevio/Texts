
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

var handleBackspace = function(){

    if( !currentLine.string.length ){
        // To Do
        return;
    }

    if( currentLine.string.length === currentCharId ){

        var prev = currentLine.charList[ currentLine.charList.length - 2 ] || 0;
        var next = currentLine.charList[ currentLine.charList.length - 1 ];

        positionAbsoluteX += ( prev - next );
        currentLine.string = currentLine.string.slice( 0, -1 );
        currentLine.charList.pop();
        currentCharId--;

    }else{
        // To Do -> No está al final de la línea
    }

    blinkTime    = Date.now();
    blinkStatus  = 0;
    blinkCurrent = false;

};

var handleChar = function( newChar ){

    if( currentLine.string.length === currentCharId ){

        currentLine.string += newChar;
        currentLine.charList.push( ctx.measureText( currentLine.string ).width );
        currentCharId++;

        var prev = currentLine.charList[ currentLine.charList.length - 2 ] || 0;
        var next = currentLine.charList[ currentLine.charList.length - 1 ];

        positionAbsoluteX += next - prev;

    }else{
        // To Do -> No está al final de la línea
    }

    blinkTime    = Date.now();
    blinkStatus  = 0;
    blinkCurrent = false;

};

var handleEnter = function(){

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
    }

    drawPages();

});

// Start
start();
