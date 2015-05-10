
var CanvasCursor = function(){

    console.warn('ToDo','CanvasCursor','draw','clean & range support');

    this.canvas       = $('.selections');
    this.ctx          = this.canvas[ 0 ].getContext('2d');
    this.waiting      = false;
    this.blinkTime    = Date.now();
    this.blinkStatus  = 0;
    this.blinkCurrent = false;

};

CanvasCursor.prototype.draw = function(){

    if( selectionRange.isValid() ){
        this.drawRange();
    }else{
        this.drawCursor();
    }

};

CanvasCursor.prototype.drawCursor = function(){

    this.waiting = false;

    /*
    if( selectedEnabled ){
            return;
    }
    */

    //fps++;

    if( !this.blinkEnabled ){

        this.blinkEnabled = true;
        this.blinkTime    = Date.now();
        this.blinkStatus  = 0;

    }else{

        this.blinkStatus = Date.now() - this.blinkTime;

        if( this.blinkStatus > 1200 ){

            this.blinkStatus = this.blinkStatus % 1200;
            this.blinkTime   = Date.now();

        }
        
    }

    var newCurrent = this.blinkStatus < 600;
    var needUpdate = /*waitingRangeUpdate ||*/ ( !this.blinkCurrent && newCurrent ) || ( this.blinkCurrent && !newCurrent );

    if( needUpdate ){

        /*waitingRangeUpdate = false;*/

        this.updateSize();

        // Los cursores remotos deben dibujarse antes para estar por devahi del actual
        /*
        for( var i in usersPosition ){

            if( !usersEditing[ i ] ){
                continue;
            }

            this.ctx.fillStyle = '#9575cd';
            this.ctx.font      = '11px Lato';

            // Cursor
            this.ctx.fillRect(

                parseInt( usersPosition[ i ].x, 10 ),
                parseInt( usersPosition[ i ].y - scrollTop + usersPosition[ i ].line.height - usersPosition[ i ].node.height, 10 ),
                2,
                usersPosition[ i ].node.height

            );

            // Fondo del nombre
            this.ctx.fillRect(

                parseInt( usersPosition[ i ].x, 10 ),
                parseInt( usersPosition[ i ].y - scrollTop + usersPosition[ i ].line.height - usersPosition[ i ].node.height, 10 ) - 2 - 14, // 2 por la separación respecto al cursor y 14 del tamaño de la caja
                this.ctx.measureText( usersEditing[ i ].fullName ).width + 8, // 4 y 4 de margenes laterales
                14

            );

            // Texto del nombre
            this.ctx.fillStyle = '#ffffff';

            this.ctx.fillText(

                usersEditing[ i ].fullName,
                parseInt( usersPosition[ i ].x, 10 ) + 4, // 4 del margen lateral izquierdo
                parseInt( usersPosition[ i ].y - scrollTop + usersPosition[ i ].line.height - usersPosition[ i ].node.height, 10 ) - 2 - 3 // 2 por la separación respecto al cursor y 3 de la diferencia con el tamaño de la caja

            );

        }
        */

        if( ( blinkGlobal && !( this.blinkCurrent && !newCurrent ) ) || ( !this.blinkCurrent && newCurrent ) ){

            blinkGlobal = true;

            this.blinkCurrent  = newCurrent;
            this.ctx.fillStyle = '#000000';

            this.ctx.fillRect(

                parseInt( cursor.positionX, 10 ),
                parseInt( cursor.positionY - scrollTop + cursor.line.height - cursor.node.height, 10 ),
                1,
                cursor.node.height

            );

        }else if( this.blinkCurrent && !newCurrent ){

            blinkGlobal       = false;
            this.blinkCurrent = newCurrent;

        }

    }

    this.requestDraw();

};

CanvasCursor.prototype.drawRange = function(){

    this.waiting = false;

    // Calculamos la altura de inicio
    var range       = selectionRange.getLimits();
    var startWidth  = range.startNode.getPositionX( range.startChar );
    var startHeight = range.startNode.getPositionY();
    var i;

    // Procedimiento de coloreado
    var width  = 0;
    var offset = 0;

    // Si principio y fin están en la misma linea
    if(
        range.startPage.id === range.endPage.id &&
        range.startParagraph.id === range.endParagraph.id &&
        range.startLine.id === range.endLine.id
    ){

        this.updateSize();

        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle   = '#7EBE30';

        // Si el nodo inicial es el mismo que el final
        if( range.startNode.id === range.endNode.id ){

            if( range.endNode.justifyCharList ){
                width = range.endNode.justifyCharList[ range.endChar - 1 ] - ( range.startNode.justifyCharList[ range.startChar - 1 ] || 0 );
            }else{
                width = range.endNode.chars[ range.endChar - 1 ] - ( range.startNode.chars[ range.startChar - 1 ] || 0 );
            }
            
        }else{

            if( range.startNode.justifyCharList ){

                width += range.startNode.justifyWidth - ( range.startNode.justifyCharList[ range.startChar - 1 ] || 0 );
            
                for( i = range.startNode.id + 1; i < range.endNode.id; i++ ){
                    width += range.startLine.nodes[ i ].justifyWidth;
                }

                width += range.endNode.justifyCharList[ range.endChar - 1 ] || 0;

            }else{

                width += range.startNode.width - ( range.startNode.chars[ range.startChar - 1 ] || 0 );
            
                for( i = range.startNode.id + 1; i < range.endNode.id; i++ ){
                    width += range.startLine.nodes[ i ].width;
                }

                width += range.endNode.chars[ range.endChar - 1 ] || 0;

            }
            
        }

        this.ctx.rect(

            startWidth,
            startHeight - scrollTop,
            width,
            range.startLine.height * range.startParagraph.spacing

        );

        this.ctx.fill();

        this.ctx.globalAlpha = 1;

    // Principio y fin en distintas líneas
    }else{

        this.updateSize();

        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle   = '#7EBE30';

        // Coloreamos la linea del principio de forma parcial
        if( range.startNode.justifyCharList ){
            width = range.startNode.justifyWidth - ( range.startNode.justifyCharList[ range.startChar - 1 ] || 0 );
        }else{
            width = range.startNode.width - ( range.startNode.chars[ range.startChar - 1 ] || 0 );
        }
            
        for( i = range.startNode.id + 1; i < range.startLine.nodes.length; i++ ){
            width += range.startLine.nodes[ i ].justifyWidth || range.startLine.nodes[ i ].width;
        }

        this.ctx.beginPath();
        this.ctx.rect(

            startWidth,
            parseInt( startHeight - scrollTop, 10 ),
            width,
            range.startLine.height * range.startParagraph.spacing

        );

        this.ctx.fill();

        startHeight += range.startLine.height * range.startParagraph.spacing;

        var currentPageId  = range.startPage.id;
        var heightHeritage = 0;

        // Coloreamos las lineas intermedias de forma completa
        mapRangeLines( true, currentRangeStart, currentRangeEnd, function( pageId, page, paragraphId, paragraph, lineId, line ){

            // To Do -> Esto es un workaround porque el false no funciona como debería
            // To Do -> Esta podría ser una solución mejor para evitar los límites en el mapRangeLines
            if(
                ( pageId === range.startPage.id && paragraphId === range.startParagraph.id && lineId === range.startLine.id ) ||
                ( pageId === range.endPage.id && paragraphId === range.endParagraph.id && lineId === range.endLine.id )
            ){
                return;
            }

            if( currentPageId !== pageId ){

                heightHeritage += currentDocument.pages[ currentPageId ].height + GAP;
                currentPageId   = pageId;
                startHeight     = page.marginTop;

            }

            offset = page.marginLeft + getOffsetIndentationLeft( lineId, paragraph ) + getLineOffset( line, paragraph );
            width  = 0;

            // Obtenemos el tamaño de rectangulo a colorear
            for( var n = 0; n < line.nodes.length; n++ ){
                width += line.nodes[ n ].justifyWidth || line.nodes[ n ].width;
            }

            // Coloreamos la línea
            this.ctx.beginPath();
            this.ctx.rect(

                offset,
                parseInt( heightHeritage + startHeight - scrollTop, 10 ),
                width,
                line.height * paragraph.spacing

            );

            this.ctx.fill();
            
            startHeight += line.height * paragraph.spacing;

        });

        if( currentPageId !== range.endPage.id ){

            heightHeritage += currentDocument.pages[ currentPageId ].height + GAP;
            currentPageId   = range.endLine.id;
            startHeight     = range.endPage.marginTop;

        }

        // Coloreamos la línea del final de forma parcial
        width  = 0;
        offset = range.endPage.marginLeft + getOffsetIndentationLeft( range.endLine.id, range.endParagraph ) + getLineOffset( range.endLine, range.endParagraph );

        for( i = 0; i < range.endNode.id; i++ ){
            width += range.endLine.nodes[ i ].justifyWidth || range.endLine.nodes[ i ].width;
        }

        // To Do -> Que debe pasar si es se coge el fallback 0?
        if( range.endNode.justifyCharList ){
            width += range.endNode.justifyCharList[ range.endChar - 1 ] || 0;
        }else{
            width += range.endNode.chars[ range.endChar - 1 ] || 0;
        }

        this.ctx.beginPath();
        this.ctx.rect(

            offset,
            parseInt( heightHeritage + startHeight - scrollTop, 10 ),
            width,
            range.endLine.height * range.endParagraph.spacing

        );

        this.ctx.fill();

        this.ctx.globalAlpha = 1;

    }

};

CanvasCursor.prototype.requestDraw = function(){

    if( this.waiting ){
        return;
    }

    this.waiting = true;

    requestAnimationFrame( this.draw.bind( this ) );

};

CanvasCursor.prototype.resetBlink = function(){

    this.blinkTime    = Date.now();
    this.blinkStatus  = 0;
    this.blinkCurrent = false;

    //if( selectedEnabled ){

        //selectedEnabled = false;
        this.requestDraw();

    //}

};

CanvasCursor.prototype.updateSize = function(){

    if( activeHiRes ){

        var oldWidth  = this.canvas.width();
        var oldHeight = this.canvas.height();

        this.canvas[ 0 ].width  = oldWidth * pixelRatio;
        this.canvas[ 0 ].height = oldHeight * pixelRatio;

        this.canvas[ 0 ].style.width  = oldWidth + 'px';
        this.canvas[ 0 ].style.height = oldHeight + 'px';

        this.ctx.scale( pixelRatio, pixelRatio );

    }else{

        this.canvas[ 0 ].width  = this.canvas.width();
        this.canvas[ 0 ].height = this.canvas.height();

    }

};
