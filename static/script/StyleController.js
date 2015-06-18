
var StyleController = function(){
	this.temporal = new TemporalStyle();
};

StyleController.prototype.setNodeStyle = function( type, value ){

	var temporal;

    // Selección normal
    if( selectionRange.isValid() ){

		var i = 0;

		selectionRange.mapNodes( function( node, start, stop ){

			if(
	            start === 0 &&
	            stop === node.string.length
	        ){
				node.setStyle( type, value );
	        }else if( start === 0 ){

				node.split( start, stop );
				node.setStyle( type, value );

	        }else{

				node.split( start, stop );
				node.next().setStyle( type, value );

	        }

			i++;

		});

    // Principio de un párrafo vacío
	}else if(
		cursor.line.id === 0 &&
		cursor.line.totalChars() === 0
	){

		cursor.node.setStyle( type, value );

    // Falso mononodo, acumulado de estilos
    }else{

		temporal = true;

        this.temporal.set( type, value );

    }

	cursor.updatePositionX();
	cursor.updatePositionY();
	selectionRange.update();
	canvasPages.requestDraw();
	canvasCursor.resetBlink();
	updateToolsLineStatus();


	if( !temporal ){
		realtime.setStatus( USER_EDITING );
	}

	return this;

};

StyleController.prototype.setParagraphStyle = function( type, value ){

	// Selección normal
    if( selectionRange.isValid() ){

		selectionRange.mapParagraphs( function( paragraph ){

			if( type === 'listBullet' || type === 'listNumber' ){

				if( paragraph.totalChars() ){
					paragraph.setStyle( type, value );
				}

			}else{
				paragraph.setStyle( type, value );
			}

		});

	}else{
		cursor.paragraph.setStyle( type, value );
	}

	cursor.updatePositionX();
	cursor.updatePositionY();
	canvasPages.requestDraw();
	canvasCursor.resetBlink();
	realtime.setStatus( USER_EDITING );

};

StyleController.prototype.toggleNodeStyle = function( type, value ){

	if( selectionRange.isValid() ){

		var range = selectionRange.getCommonStyles();


		if( range.nodes[ type ] ){
			this.setNodeStyle( type, null );
		}else{
			this.setNodeStyle( type, value );
		}

	}else if(
        cursor.node.style[ type ] ||
        this.temporal.get( type )
    ){
        this.setNodeStyle( type, null );
    }else{
        this.setNodeStyle( type, value );
    }

};
