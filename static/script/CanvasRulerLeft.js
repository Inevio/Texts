
var CanvasRulerLeft = function(){

    TCanvas.call( this );

    this.canvas  = $('.rule-left');
    this.ctx     = this.canvas[ 0 ].getContext('2d');

};

CanvasRulerLeft.prototype = new TCanvas();

CanvasRulerLeft.prototype.constructor = CanvasRulerLeft;

CanvasRulerLeft.prototype.draw = function(){

    console.warn('ToDo','CanvasRulerLeft','draw','clean');

    // To Do -> Seguramente el alto no corresponde
    // To Do -> Renderizar solo la parte que deba mostrarse

    this.waiting = false;

    this.updateSize();

    // Calculamos cuanto espacio hay por encima de la página actual
    var top = 0;

    for( var i = 0; i < cursor.page.id; i++ ){
        top = currentDocument.pages[ i ].height + GAP;
    }

    // Comprobamos si deben dibujarse los márgenes de la página actual
    if( scrollTop > top + cursor.page.height ){
        return;
    }

    top -= scrollTop;

    // Dibujamos el fondo
    this.ctx.beginPath();
    this.ctx.rect( 0, top, 15, cursor.page.height );
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#cacaca';
    this.ctx.stroke();

    // Dibujamos el fondo del margen izquierdo
    this.ctx.beginPath();
    this.ctx.rect( 1, 1 + top, 13, cursor.page.marginTop );
    this.ctx.fillStyle = '#e4e4e4';
    this.ctx.fill();

    // Dibujamos el fondo del margen derecho
    this.ctx.beginPath();
    this.ctx.rect( 1, top + cursor.page.height - cursor.page.marginBottom, 13, cursor.page.marginBottom );
    this.ctx.fillStyle = '#e4e4e4';
    this.ctx.fill();

    // Calculamos la posición de inicio
    var limit      = ( cursor.page.height - cursor.page.marginTop ) / CENTIMETER;
    var pos        = -parseFloat( ( cursor.page.marginTop / CENTIMETER ).toFixed( 2 ) );
    var correction = parseFloat( ( parseFloat( Math.ceil( pos * 4 ) / 4 ).toFixed( 2 ) - pos ).toFixed( 2 ) ); // Redondea al múltiplo de 0.25 más cercano
    var height     = correction * CENTIMETER;

    // Ajusta la posición al redondea al múltiplo de 0.25 más cercano
    pos += correction;

    // Dibujamos las líneas
    this.ctx.font         = '10px Effra';
    this.ctx.textAlign    = 'center';
    this.ctx.textBaseline = 'middle';

    while( pos < limit ){

        // Si es 0 no lo representamos
        if( !pos ){

            height += 0.25 * CENTIMETER;
            pos    += 0.25;
            continue;

        }

        // Si es una posición entera ponemos el número
        if( parseInt( pos, 10 ) === pos ){

            this.ctx.fillStyle = '#6e6e6e';

            this.ctx.fillText( Math.abs( pos ).toString(), 7.5, parseInt( height + top, 10 ) );

        // Si es múltiplo de 0.5, le toca linea grande
        }else if( pos % 0.5 === 0 ){ // To Do -> Quizás haya algún problema con la precisión de las divisiones de JS. Estar pendientes

            this.ctx.fillStyle = '#cacaca';

            this.ctx.beginPath();
            this.ctx.rect( 4, parseInt( height + top, 10 ), 7, 1 );
            this.ctx.fill();

        // Es un múltiplo de 0.25, le toca linea pequeña
        }else{

            this.ctx.fillStyle = '#cacaca';

            this.ctx.beginPath();
            this.ctx.rect( 6, parseInt( height + top, 10 ), 3, 1 );
            this.ctx.fill();

        }

        height += 0.25 * CENTIMETER;
        pos    += 0.25;

    }

    // Dibujamos el borde
    this.ctx.beginPath();
    this.ctx.rect( 0.5, 0.5 + top, 14, cursor.page.height );
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#cacaca';
    this.ctx.stroke();

};
