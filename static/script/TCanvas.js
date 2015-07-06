
var TCanvas = function(){

    this.canvas  = undefined;
    this.ctx     = undefined;
    this.waiting = false;

};

TCanvas.prototype.requestDraw = function(){

    if( this.waiting ){
        return;
    }

    this.waiting = true;

    requestAnimationFrame( this.draw.bind( this ) );

};

TCanvas.prototype.updateSize = function(){

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
