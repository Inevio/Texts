
var StyleController = function(){
	this.temporal = new TemporalStyle();
};

StyleController.prototype.setNodeStyle = function( type, value ){

    var i, charInParagraphStart, charInParagraphEnd, paragraphIdStart, paragraphIdEnd;

    // Selección normal
    if( selectionRange.isValid() ){

		selectionRange.mapNodes( function( node, start, stop ){

			// Nodo completo
			if( start === 0 && stop === node.string.length ){
				node.setStyle( type, value );
			}else{

				node.split( start, stop );
				node.next().setStyle( type, value );

			}

		});

		canvasPages.requestDraw();
		canvasCursor.requestDraw();

    // Principio de un párrafo vacío
    }else if( currentLineId === 0 && currentLine.totalChars() === 0 ){

        // Calculamos las posiciones de inicio
        /*
		paragraphIdStart     = currentParagraphId;
        charInParagraphStart = currentLineCharId;

        for( i = 0; i < currentPageId; i++ ){
            paragraphIdStart += currentDocument.pages[ i ].paragraphs.length;
        }

        for( i = 0; i < currentLineId; i++ ){
            charInParagraphStart += currentParagraph.lines[ i ].totalChars();
        }

        // Aplicamos el estilo
        setNodeStyle( currentParagraph, currentLine, currentNode, type, value );

        // Enviamos
        if( realtime ){

            realtime.send({

                cmd  : CMD_NODE_STYLE,
                data : [ paragraphIdStart, charInParagraphStart, type, value ],
                pos  : [ positionAbsoluteX, positionAbsoluteY, currentLine.height, currentNode.height ]

            });

        }
		*/

    // Falso mononodo, acumulado de estilos
    }else{
        this.temporal.set( type, value );
    }

};

/*
StyleController.prototype.setNodeStyleToNode = function(){};
*/

StyleController.prototype.setParagraphStyle = function( type, value ){

	// Selección normal
    if( selectionRange.isValid() ){

		selectionRange.mapParagraphs( function( paragraph ){
			paragraph.setStyle( type, value );
		});

	}else{
		cursor.paragraph.setStyle( type, value );
	}

	cursor.updatePositionX();
	canvasPages.requestDraw();
	canvasCursor.resetBlink();

};

StyleController.prototype.toggleNodeStyle = function( type, value ){

	if(
        ( selectionRange.isValid() && selectionRange.startNode.style[ type ] ) ||
        cursor.node.style[ type ] ||
        this.temporal.get( type )
    ){
        this.setNodeStyle( type, null );
    }else{
        this.setNodeStyle( type, value );
    }

};
