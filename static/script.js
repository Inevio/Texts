
var win         = $(this);
var header      = $('.wz-ui-header');
var toolsLine   = $('.tools-line');
var sheet       = $('canvas');
var editorFloat = $('.editor-float');
var scrollH     = $('.scroll-horizontal');
var scrollHItem = $('.scroll-horizontal-seeker');
var scrollV     = $('.scroll-vertical');
var scrollVItem = $('.scroll-vertical-seeker');
var canvas      = sheet[ 0 ];
var ctx         = canvas.getContext('2d');

var realtime      = null;
var usersActive   = {};
var usersPosition = {};
var usersEditing  = {};
