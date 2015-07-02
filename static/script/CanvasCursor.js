
var CanvasCursor = function(){

    // To Do -> console.warn('ToDo','CanvasCursor','draw','clean & range support');

    TCanvas.call( this );

    this.canvas       = $('.selections');
    this.ctx          = this.canvas[ 0 ].getContext('2d');
    this.blinkTime    = Date.now();
    this.blinkStatus  = 0;
    this.blinkCurrent = false;
    this.enabled      = false;

};

CanvasCursor.prototype = new TCanvas();

CanvasCursor.prototype.constructor = CanvasCursor;

CanvasCursor.prototype.draw = function(){

    if( selectionRange.isValid() ){
        this.drawRange();
    }else{
        this.drawCursor();
    }

};

CanvasCursor.prototype.drawCursor = function(){

    this.waiting = false;

    if( !this.enabled ){

        this.updateSize();
        return this;

    }

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

        var offset = parseInt( ( ( this.canvas[ 0 ].width / pixelRatio ) - cursor.page.width ) / 2, 10 );

        if( offset < 0 ){
            offset = 0;
        }

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

            console.log( offset, cursor.positionX );

            blinkGlobal = true;

            this.blinkCurrent  = newCurrent;
            this.ctx.fillStyle = '#000000';

            this.ctx.fillRect(

                parseInt( offset + cursor.positionX, 10 ),
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

    return this;

};

CanvasCursor.prototype.drawRange = function(){

    this.waiting = false;

    this.updateSize();

    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle   = this.enabled ? '#7ebe30' : '#868c8e';

    // To Do -> El día de mañana, si puede haber páginas de distintos tamaños esto habrá que cambiarlo
    var offset = parseInt( ( ( this.canvas[ 0 ].width / pixelRatio ) - cursor.page.width ) / 2, 10 );

    if( offset < 0 ){
        offset = 0;
    }

    // To Do -> Puede optimizarse evitando recalcular las posiciones continuamente
    selectionRange.mapNodes( ( function( node, start, end ){

        if( !node.width || node.blocked ){
            return;
        }

        this.ctx.beginPath();
        this.ctx.rect(

            offset + node.getPositionX( start ),
            node.getPositionY() - scrollTop,
            node.visualChars[ end - 1 ] - ( node.visualChars[ start - 1 ] || 0 ),
            node.parent.height * node.parent.parent.spacing

        );
        this.ctx.fill();

    } ).bind( this ) );

    this.ctx.globalAlpha = 1;

    return this;

};

CanvasCursor.prototype.enableBlink = function( value ){

    this.enabled = value;

    this.requestDraw();

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
