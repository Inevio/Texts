
// DOM variables
var win                 = $(this);
var newButton           = $('.option-new');
var saveButton          = $('.option-save');
var moreButton          = $('.option-more');
var closeButton         = $('.wz-view-close');
var toolsMenu           = $('.toolbar-menu');
var toolsLine           = $('.tools-line');
var toolsListContainer  = $('.toolbar-list-container');
var toolsList           = $('.toolbar-list');
var toolsColorContainer = $('.toolbar-color-picker-container');
var toolsColor          = $('.toolbar-color-picker');
var toolsColorHover     = $('.toolbar-color-picker-hover');
var toolsColorColor     = $('.tool-button-color .color');
//var pages               = new CanvasDocument();
//var selections          = new CanvasCursor();
//var ruleLeft            = new CanvasRuleLeft();
//var ruleTop             = new CanvasRuleTop();
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
var cursor              = new Cursor();
var canvasPages         = new CanvasDocument();
var canvasCursor        = new CanvasCursor();
var canvasRulerLeft     = new CanvasRulerLeft();
var canvasRulerTop      = new CanvasRulerTop();
//var ctx                 = canvasPages.getContext('2d');
//var ctxSel              = canvasSelect.getContext('2d');
//var ctxRuleLeft         = canvasRuleLeft.getContext('2d');
//var ctxRuleTop          = canvasRuleTop.getContext('2d');
var backingStoreRatio   = canvasPages.ctx.webkitBackingStorePixelRatio ||
                          canvasPages.ctx.mozBackingStorePixelRatio ||
                          canvasPages.ctx.msBackingStorePixelRatio ||
                          canvasPages.ctx.oBackingStorePixelRatio ||
                          canvasPages.ctx.backingStorePixelRatio || 1;
var pixelRatio          = wz.tool.devicePixelRatio() / backingStoreRatio;
var activeHiRes         = wz.tool.devicePixelRatio() !== backingStoreRatio;

// Realtime variables
var realtime      = null;
var usersPosition = {};
var usersEditing  = {};

// Waiting variables
var waitingCheckLetter      = false;
var waitingCheckLetterInput = false;
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
var selectionRange       = new Range();
var selectionEnabled     = false;
var selectionStart       = null;
var selectedEnabled      = true;
var verticalKeysEnabled  = false;
var verticalKeysPosition = 0;

// Scroll variables
var scrollTop    = 0;
var maxScrollTop = 0;

// Current variables
var currentDocument       = null;
var currentOpenFile       = null;
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
// var positionAbsoluteX     = 0;
// var positionAbsoluteY     = 0;
var currentRangeStart     = null;
var currentRangeEnd       = null;
var currentRangeStartHash = null;
var currentRangeEndHash   = null;
var currentMultipleHash   = null;
var currentMouse          = MOUSE_NORMAL;
var temporalStyle         = null;
var toolsListEnabled      = false;
var toolsColorEnabled     = false;
var lastStatus            = null;

// Button actions
/*
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
*/

// Preprocesed data
var fontfamilyCode     = '';
var fontsizeCode       = '';
var linespacingCode    = '';
var pageDimensionsCode = '';
var marginsCode        = '';

//var fps = 0;

// Start
if( !params ){
    start();
}else{

    /*
    loading
        .css( 'display', 'block' )
        .text('Loading file...');
    */

}
