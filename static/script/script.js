
// DOM variables
var win                 = $(this);
//var newButton           = $('.option-new');
var saveButton          = $('.option-save');
//var moreButton          = $('.option-more');
var closeButton         = $('.wz-view-close');
var usersNumber         = $('.users-number');
var toolsMenu           = $('.toolbar-menu');
var toolsLine           = $('.tools-line');
var toolsListContainer  = $('.toolbar-list-container');
var toolsList           = $('.toolbar-list');
var toolsColorContainer = $('.toolbar-color-picker-container');
var toolsColor          = $('.toolbar-color-picker');
var toolsColorHover     = $('.toolbar-color-picker-hover');
var toolsColorColor     = $('.tool-button-color .color');
//var marginTopDown       = $('.ruler-arrow-down');
//var marginTopUp         = $('.ruler-arrow-up');
//var marginTopBox        = $('.ruler-box');
var input               = $('.input');
var textarea            = $('.textarea');
var testZone            = $('.test-zone');
var viewTitle           = $('.document-title');
//var loading             = $('.loading');
var scrollV             = $('.scroll-vertical');
var scrollVItem         = $('.scroll-vertical-seeker');
var collaborativeList   = $('.collaborative');
var collaborativeProto  = collaborativeList.find('.wz-prototype');
var cursor              = new Cursor();
var canvasPages         = new CanvasDocument();
var canvasCursor        = new CanvasCursor();
var canvasRulerLeft     = new CanvasRulerLeft();
var canvasRulerTop      = new CanvasRulerTop();
var ui                  = new UI();
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
var realtime = new RealTime();

// Waiting variables
var waitingCheckLetter      = false;
//var waitingCheckLetterInput = false;
//var waitingRangeUpdate      = false;
//var waitingRuleLeftUpdate   = false;

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
var selectionRange   = new Range();
var selectionEnabled = false;

// Scroll variables
var scrollTop    = 0;
var maxScrollTop = 0;

// Current variables
var currentDocument       = null;
var currentOpenFile       = null;
/*
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
var positionAbsoluteX     = 0;
var positionAbsoluteY     = 0;
var currentRangeStart     = null;
var currentRangeEnd       = null;
var currentRangeStartHash = null;
var currentRangeEndHash   = null;
*/
var currentMultipleHash   = null;
var currentMouse          = MOUSE_NORMAL;
//var lastStatus            = null;
var styleController       = new StyleController();

// Preprocesed data
var fontfamilyCode     = '';
var fontsizeCode       = '';
var linespacingCode    = '';
//var pageDimensionsCode = '';
//var marginsCode        = '';

//var fps = 0;

// Start
if( !params ){

    start({

        info : {},
        defaultPage : {

            height       : PAGEDIMENSIONS['A4'].height,
            width        : PAGEDIMENSIONS['A4'].width,
            marginTop    : MARGIN['Normal'].top,
            marginLeft   : MARGIN['Normal'].left,
            marginBottom : MARGIN['Normal'].bottom,
            marginRight  : MARGIN['Normal'].right

        },
        paragraphList : [

            {

                align            : 0,
                indentationLeft  : 0,
                indentationRight : 0,
                spacing          : 1,
                nodeList         : [

                    {

                        string : "",
                        style  : {

                            'color'       : '#000000',
                            'font-family' : 'Cambria',
                            'font-size'   : 12

                        }

                    }

                ]

            }

        ]

    });

}else{

    /*
    loading
        .css( 'display', 'block' )
        .text('Loading file...');
    */

}
