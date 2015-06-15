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
/*
var CLOSEOPTION_DONTSAVE = 0;
var CLOSEOPTION_CANCEL = 1;
var CLOSEOPTION_SAVE = 2;
*/
var CENTIMETER = 37.79527559055;
var CHUNK_FILE_NODES = 40;
var CMD_GET_STATUS = 0;
var CMD_SET_STATUS = 1;
/*
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
*/
var DEFAULT_PAGE_BACKGROUNDCOLOR = '#ffffff';
/*
var DIMENSION_TO_CM = 1440 / 2.54;
*/
var FONTFAMILY = [ 'Arial', 'Cambria', 'Comic Sans MS', 'Courier', 'Helvetica', 'Times New Roman', 'Trebuchet MS', 'Verdana' ];
var FONTSIZE = [ 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72 ];
var GAP = 20;
var INDENTATION_NONE = 0;
var INDENTATION_FIRSTLINE = 1;
var INDENTATION_HANGING = 2;
var INFO_DESCRIPTION = 'Inevio Texts File';
var INFO_GENERATOR = 'Inevio Texts';
var INFO_VERSION = '1.1';
var KEY_BACKSPACE = 8;
var KEY_TAB = 9;
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

    'Normal'              : { top : 1440, left : 1440, bottom : 1440, right : 1440 },
//    'Narrow'              : { top : 1.27, left : 1.27, bottom : 1.27, right : 1.27 },
//    'Moderate'            : { top : 2.54, left : 1.9,  bottom : 2.54, right : 1.9  },
//    'Wide'                : { top : 2.54, left : 5.08, bottom : 2.54, right : 5.08 },
//    'Mirrored'            : { top : 2.54, left : 3.17, bottom : 2.54, right : 2.54 },
//    'Office 2003 Default' : { top : 2.54, left : 3.17, bottom : 2.54, right : 3.17 }

};
var MOUSE_NORMAL = 0;
var MOUSE_TEXT = 1;
var MOUSE_STATUS = [

    { add : 'normal', remove : 'text' },
    { add : 'text',   remove : 'normal' }

];
var PAGEDIMENSIONS = {

//    'US Letter'          : { width : 21.59, height : 27.94 },
//    'US Legal'           : { width : 21.59, height : 35.56 },
    'A4'                 : { width : 11907,    height : 16839  },
//    'A5'                 : { width : 14.81, height : 20.99 },
//    'JIS B5'             : { width : 18.2,  height : 25.71 },
//    'B5'                 : { width : 17.6,  height : 25.01 },
//    'Envelope #10'       : { width : 10.48, height : 24.13 },
//    'Envelope DL'        : { width : 11.01, height : 22.01 },
//    'Tabloid'            : { width : 27.94, height : 43.17 },
//    'A3'                 : { width : 29.7,  height : 42.01 },
//    'Tabloid Oversize'   : { width : 30.48, height : 45.71 },
//    'ROC 16K'            : { width : 19.68, height : 27.3  },
//    'Envelope Choukei 3' : { width : 11.99, height : 23.49 },
//    'Super B/A3'         : { width : 33.02, height : 48.25 }

};
/*
var PARAGRAPH_SPLIT_NONE = 0;
var PARAGRAPH_SPLIT_START = 1;
var PARAGRAPH_SPLIT_MIDDLE = 2;
var PARAGRAPH_SPLIT_END = 3;
*/
var PASTE_FORMATS = [ 'text/inevio-texts', /*'text/html',*/ 'text/plain' ];
var TWIP_TO_PIXEL = 0.06666666666667;
var USER_VIEWING = 0;
var USER_EDITING = 1;
var USER_SAVED = 2;
var USER_STATUSES = [ 'viewing', 'editing', 'saved' ];
var DROPDOWN_FONTFAMILY = 0;
var DROPDOWN_FONTSIZE = 1;
var DROPDOWN_LINESPACING = 2;
var DROPDOWN_COLOR = 3;
var DROPDOWN_COLLABORATIVE = 4;
var DROPDOWN = [ FONTFAMILY, FONTSIZE, LINESPACING ];
var DROPDOWN_CLASS = [ 'active-fontfamily', 'active-fontsize', 'active-linespacing' ];
