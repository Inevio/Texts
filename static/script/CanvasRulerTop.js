
var CanvasRulerTop = function(){

    TCanvas.call( this );

    this.canvas  = $('.rule-top');
    this.ctx     = this.canvas[ 0 ].getContext('2d');

};

CanvasRulerTop.prototype = new TCanvas();

CanvasRulerTop.prototype.constructor = CanvasRulerTop;

CanvasRulerTop.prototype.draw = function(){

    // To Do -> console.warn('ToDo','CanvasRulerTop','draw','clean');

    this.waiting = false;

    this.updateSize();

    var offset = parseInt( ( ( canvasPages.canvas[ 0 ].width / pixelRatio ) - cursor.page.width ) / 2, 10 );

    if( offset < 0 ){
        offset = 0;
    }

    // Dibujamos el fondo
    this.ctx.beginPath();
    this.ctx.rect( offset, 0, cursor.page.width, 15 );
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();

    // Dibujamos el fondo del margen izquierdo
    this.ctx.beginPath();
    this.ctx.rect( offset + 1, 1, cursor.page.marginLeft, 13 );
    this.ctx.fillStyle = '#e9eaea';
    this.ctx.fill();

    // Dibujamos el fondo del margen derecho
    this.ctx.beginPath();
    this.ctx.rect( offset + cursor.page.width - cursor.page.marginRight, 1, cursor.page.marginRight, 13 );
    this.ctx.fillStyle = '#e9eaea';
    this.ctx.fill();

    // Calculamos la posición de inicio
    var limit      = ( cursor.page.width - cursor.page.marginLeft ) / CENTIMETER ;
    var pos        = -1 * parseFloat( ( cursor.page.marginLeft / CENTIMETER ).toFixed( 2 ) );
    var correction = parseFloat( ( parseFloat( Math.ceil( pos * 4 ) / 4 ).toFixed( 2 ) - pos ).toFixed( 2 ) ); // Redondea al múltiplo de 0.25 más cercano
    var width      = correction * CENTIMETER;

    // Ajusta la posición al redondea al múltiplo de 0.25 más cercano
    pos += correction;

    // Dibujamos las líneas
    this.ctx.font         = '10px Effra';
    this.ctx.textAlign    = 'center';
    this.ctx.textBaseline = 'middle';

    while( pos < limit ){

        // Si es 0 no lo representamos
        if( !pos ){

            width += 0.25 * CENTIMETER;
            pos   += 0.25;
            continue;

        }

        // Si es una posición entera ponemos el número
        if( parseInt( pos, 10 ) === pos ){

            this.ctx.fillStyle = '#6e6e6e';

            this.ctx.fillText( Math.abs( pos ).toString(), offset + width, 8 );

        // Si es múltiplo de 0.5, le toca linea grande
        }else if( pos % 0.5 === 0 ){ // To Do -> Quizás haya algún problema con la precisión de las divisiones de JS. Estar pendientes

            this.ctx.fillStyle = '#ccd3d5';

            this.ctx.beginPath();
            this.ctx.rect( offset + parseInt( width, 10 ), 4, 1, 7 );
            this.ctx.fill();

        // Es un múltiplo de 0.25, le toca linea pequeña
        }else{

            this.ctx.fillStyle = '#ccd3d5';

            this.ctx.beginPath();
            this.ctx.rect( offset + parseInt( width, 10 ), 6, 1, 3 );
            this.ctx.fill();

        }

        width += 0.25 * CENTIMETER;
        pos   += 0.25;

    }

    // Dibujamos el borde¡e
    this.ctx.beginPath();
    this.ctx.rect( offset + 0.5, 0.5, cursor.page.width, 14 );
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#ccd3d5';
    this.ctx.stroke();

};
