
var UI = function(){

    this.dropdownActive = -1;
    this.cached = [];

};

UI.prototype.hideDropdowns = function(){

    this.dropdownActive = -1;

    toolsList.removeClass( DROPDOWN_CLASS.join(' ') );
    toolsColor.removeClass('active-color');
    toolsListContainer.hide();
    toolsColorContainer.hide();

};

UI.prototype.showDropdown = function( type, origin ){

    this.hideDropdowns();

    origin              = $( origin );
    this.dropdownActive = type;

    if( type === DROPDOWN_FONTFAMILY || type === DROPDOWN_FONTSIZE || type === DROPDOWN_LINESPACING ){

        if( !this.cached[ type ] ){

            this.cached[ type ] = '';

            for( var i = 0; i < DROPDOWN[ type ].length; i++ ){
                this.cached[ type ] += '<li data-value="' + ( type === DROPDOWN_LINESPACING ? parseFloat( DROPDOWN[ type ][ i ] ) : DROPDOWN[ type ][ i ] ) + '"><i></i><span>' + DROPDOWN[ type ][ i ] + '</span></li>';
            }

        }

        toolsList
            .addClass( DROPDOWN_CLASS[ type ] )
            .html( this.cached[ type ] );

        toolsListContainer
            .css({

                top     : origin.position().top + origin.outerHeight(),
                left    : origin.position().left,
                display : 'block'

            });

        toolsList.find('[data-value="' + ( type === DROPDOWN_LINESPACING ? origin.attr('data-value') : origin.text() ) + '"]').addClass('active');

    }else if( type === DROPDOWN_COLOR ){

        toolsColor.addClass('active-color');

        toolsColorContainer
            .css({

                top     : origin.position().top + origin.outerHeight(),
                left    : origin.position().left,
                display : 'block'

            });

    }

};
