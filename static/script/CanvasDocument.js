
var CanvasDocument = function(){

    this.canvas  = $('.pages');
    this.ctx     = this.canvas[ 0 ].getContext('2d');
    this.waiting = false;
    this.height  = 0;

};

CanvasDocument.prototype.draw = function(){

	console.warn('ToDo','CanvasDocument','draw','clean');

	this.waiting = false;

    var page       = null;
    var paragraph  = null;
    var line       = null;
    var node       = null;
    var pageHeight = 0.5;
    var wHeritage  = 0;
    var hHeritage  = 0;
    var startX, startY, endX, endY, underlineHeight, tracks, trackHeritage, trackChars;

    this.updateSize();

    // To Do -> El scroll podría estar más optimizado
    this.height   = pageHeight;
    maxScrollTop  = pageHeight;
    pageHeight   -= parseInt( scrollTop, 10 );

    // To Do -> Renderizar solo la parte que deba mostrarse
    for( var m = 0; m < currentDocument.pages.length; m++ ){

        // Draw the page
        page      = currentDocument.pages[ m ];
        hHeritage = 0;

        this.ctx.beginPath();
        this.ctx.rect( 0.5, pageHeight, page.width, page.height );
        this.ctx.fillStyle = page.backgroundColor;
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#cacaca';
        this.ctx.stroke();

        // Draw the paragraphs
        for( var i = 0; i < page.paragraphs.length; i++ ){

            paragraph = page.paragraphs[ i ];

            // Draw the lines
            for( var j = 0; j < paragraph.lines.length; j++ ){

                // To Do -> Gaps
                // To Do -> Altura de línea
                line = paragraph.lines[ j ];

                if( line.totalChars ){

                    wHeritage = line.getOffset();

                    // Draw the nodes
                    for( var k = 0; k < line.nodes.length; k++ ){

                        node                  = line.nodes[ k ];
                        this.ctx.fillStyle    = node.style.color;
                        this.ctx.textBaseline = 'bottom';
                        startX                = parseInt( page.marginLeft + line.getOffsetIndentationLeft() + wHeritage, 10 );
                        startY                = parseInt( pageHeight + page.marginTop + line.height + hHeritage, 10 );

                        this.setTextStyle( node.style );

                        if(
                            node.string.lastIndexOf('\t') === -1 &&
                            (
                                paragraph.align !== ALIGN_JUSTIFY ||
                                j === paragraph.lines.length - 1
                            )
                        ){
                            this.ctx.fillText( node.string, startX, startY );
                        }else{

                            tracks        = node.string.split(/(\S+)/g);
                            trackHeritage = 0;
                            trackChars    = 0;

                            for( var l = 0; l < tracks.length; l++ ){

                                if( tracks[ l ][ 0 ] === ' ' || tracks[ l ][ 0 ] === '\t' ){

                                    if(
                                        paragraph.align === ALIGN_JUSTIFY &&
                                        node.justifyCharList
                                    ){
                                        trackHeritage = node.justifyCharList[ trackChars + tracks[ l ].length - 1 ];
                                    }else{
                                        trackHeritage = node.chars[ trackChars + tracks[ l ].length - 1 ];
                                    }

                                }else if( tracks[ l ] ){
                                    this.ctx.fillText( tracks[ l ], startX + trackHeritage, startY );
                                }

                                trackChars += tracks[ l ].length;

                            }

                        }

                        wHeritage += node.justifyWidth || node.width;

                        if( !node.style['text-decoration-underline'] ){
                            continue;
                        }

                        underlineHeight = parseInt( node.height, 10 ) / 15;

                        if(underlineHeight < 1){
                            underlineHeight = 1;
                        }

                        startY = startY + underlineHeight;
                        endX   = startX + node.width;
                        endY   = startY;

                        this.ctx.beginPath();

                        this.ctx.strokeStyle = node.style.color;
                        this.ctx.lineWidth   = underlineHeight;

                        this.ctx.moveTo( parseInt( startX, 10 ), parseInt( startY, 10 ) + 0.5 );
                        this.ctx.lineTo( parseInt( endX, 10 ), parseInt( endY, 10 ) + 0.5 );
                        this.ctx.stroke();

                    }

                }

                hHeritage += line.height * paragraph.spacing;

            }

        }

        pageHeight            += Math.round( page.height ) + GAP;
        this.height += Math.round( page.height ) + GAP;

        if( m + 1 < currentDocument.pages.length ){
            maxScrollTop += Math.round( page.height ) + GAP;
        }else if( ( this.canvas[ 0 ].height / pixelRatio ) < page.height ){
            maxScrollTop += page.height - ( this.canvas[ 0 ].height / pixelRatio ) + /*(*/ GAP /** 2 )*/;
        }

    }

};

CanvasDocument.prototype.requestDraw = function(){

	if( this.waiting ){
        return;
    }

    this.waiting = true;

    requestAnimationFrame( this.draw.bind( this ) );

};

CanvasDocument.prototype.setTextStyle = function( style ){

	var font = '';

    if( style['font-style'] ){
        font += style['font-style'];
    }

    if( style['font-weight'] ){
        font += ( font.length ? ' ' : '' ) + style['font-weight'];
    }

    font += ( font.length ? ' ' : '' );
    font += style['font-size'] + 'pt';
    font += ' ';
    font += style['font-family'];

    this.ctx.font = font;

    return this;

};

CanvasDocument.prototype.updateSize = function(){

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
