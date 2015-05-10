
// Button actions
var buttonAction = {

    bold : function(){
        styleController.toggleNodeStyle( 'font-weight', 'bold' );
    },

    italic : function(){
        styleController.toggleNodeStyle( 'font-style', 'italic' );
    },

    underline : function(){
        styleController.toggleNodeStyle( 'text-decoration-underline', true );
    },

    color : function( value ){
        styleController.setNodeStyle( 'color', value );
    },

    left : function(){
        styleController.setParagraphStyle( 'align', ALIGN_LEFT );
    },

    center : function(){
        styleController.setParagraphStyle( 'align', ALIGN_CENTER );
    },

    right : function(){
        styleController.setParagraphStyle( 'align', ALIGN_RIGHT );
    },

    justify : function(){
        styleController.setParagraphStyle( 'align', ALIGN_JUSTIFY );
    },

    indentDec : function(){
        styleController.setParagraphStyle( 'indentationLeftAdd', -1.27 * CENTIMETER );
    },

    indentInc : function(){
        styleController.setParagraphStyle( 'indentationLeftAdd', 1.27 * CENTIMETER );
    },

    listBullet : function(){

        if( $( '.tool-button-list-unsorted', toolsLine ).hasClass('active') ){
            styleController.setParagraphStyle('listNone');
        }else{
            styleController.setParagraphStyle('listBullet');
        }

    },

    listNumber : function(){

        if( $( '.tool-button-list-sorted', toolsLine ).hasClass('active') ){
            styleController.setParagraphStyle('listNone');
        }else{
            styleController.setParagraphStyle('listNumber');
        }

    }

};
