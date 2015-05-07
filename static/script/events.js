
// Events
win
.on( 'mousedown', function(){

    /*
    if( !toolsListEnabled && !toolsColorEnabled ){
        return;
    }

    toolsListEnabled = false;
    toolsColorEnabled = false;
    */
    input.focus();
    /*
    toolsListContainer.css( 'display', 'none' );
    toolsColorContainer.css( 'display', 'none' );
    toolsList.removeClass('active-fontfamily active-fontsize active-linespacing active-moreoptions active-page-dimensions active-page-margins');
    toolsColor.removeClass('active-color active-page-color');
    */

})

.on( 'ui-view-restore ui-view-focus', function(){
    input.focus();
});

input
.on( 'keydown', function( e ){

    if( e.ctrlKey || e.metaKey ){
        return;
    }

    if( e.keyCode === KEY_TAB ){
        
        handleChar('\t');
        canvasPages.requestDraw();
        e.preventDefault();

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
        canvasPages.requestDraw();

        keydownHandled = true;

    }else if( e.keyCode === KEY_DEL ){

        handleDel();
        canvasPages.requestDraw();

        keydownHandled = true;

    }

})

.on( 'keypress', function(e){

    if( e.ctrlKey || e.metaKey ){
        return;
    }

    if( compositionEnded && e.which === KEY_BACKSPACE ){

        handleBackspace();
        canvasPages.requestDraw();

    }else if( e.key && e.key.length === 1 ){

        // Este método solo funcionaba en Firefox cuando se escribió. Aunque Firefox es compatible
        // con el método del setTimeout para recuperar lo tecleado, este caso es mucho más rápido,
        // permitiendo que Firefox sea el navegador más eficiente a la hora de teclear

        handleChar( e.key );
        canvasPages.requestDraw();
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
        canvasPages.requestDraw();

    }else if( compositionEnded && e.keyCode === KEY_DEL ){

        handleDel();
        canvasPages.requestDraw();

    }else if( !waitingCheckLetter && !keydownHandled ){

        waitingCheckLetter = true;

        setTimeout( function(){

            if( input[ 0 ].value ){

                for( var i = 0; i < input[ 0 ].value.length; i++ ){
                    handleChar( input[ 0 ].value[ i ] );
                }
                
                canvasPages.requestDraw();

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
        canvasPages.requestDraw();

    }
    
})

.on( 'compositionend', function( e ){

    handleBackspace();
    handleChar( e.originalEvent.data );
    cleanComposition( true );
    canvasPages.requestDraw();

    compositionCounter = 0;
    compositionEnded   = true;

});

// Color Panel
toolsLine
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

        'background-color' : normalizeColor( $(this).css('background-color') ),
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
            .css( 'background-color', normalizeColor( toolsColorHover.css('background-color') ) )
            .click();

    }else if( toolsColor.hasClass('active-page-color') ){

        toolsColorContainer.css( 'display', 'none' );
        toolsColor.removeClass('active-page-color');

        setPagesStyle( 'pageBackgroundColor', normalizeColor( toolsColorHover.css('background-color') ) );

    }

});
