
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

    this.canvas[ 0 ].width  = this.canvas.width() * pixelRatio;
    this.canvas[ 0 ].height = this.canvas.height() * pixelRatio;

    if( activeHiRes ){
        this.ctx.scale( pixelRatio, pixelRatio );
    }

};
