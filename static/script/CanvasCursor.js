
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