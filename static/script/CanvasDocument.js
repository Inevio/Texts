
var CanvasDocument = function(){

    TCanvas.call( this );

    this.canvas = $('.pages');
    this.ctx    = this.canvas[ 0 ].getContext('2d');
    this.height = 0;

};

CanvasDocument.prototype = new TCanvas();

CanvasDocument.prototype.constructor = CanvasDocument;

CanvasDocument.prototype.draw = function(){

	// To Do -> console.warn('ToDo','CanvasDocument','draw','clean');

	this.waiting = false;

    var page       = null;
    var paragraph  = null;
    var line       = null;
    var node       = null;
    var pageHeight = 0.5;
    var wHeritage  = 0;
    var hHeritage  = 0;
    var offset     = 0;
    var startX, startY, endX, endY, underlineHeight, tracks, trackHeritage, trackChars;

    this.updateSize();

    // To Do -> El scroll podría estar más optimizado
    this.height  = pageHeight;
    pageHeight  -= parseInt( scrollTop, 10 );

    // To Do -> Renderizar solo la parte que deba mostrarse
    for( var m = 0; m < currentDocument.pages.length; m++ ){

        offset = parseInt( ( ( this.canvas[ 0 ].width / 2 ) - currentDocument.pages[ m ].width ) / 2, 10 );

        if( offset < 0 ){
            offset = 0;
        }

        // Draw the page
        page      = currentDocument.pages[ m ];
        hHeritage = 0;

        this.ctx.beginPath();
        this.ctx.rect( offset + 0.5, pageHeight, page.width, page.height );
        this.ctx.fillStyle = page.backgroundColor;
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#ccd3d5';
        this.ctx.stroke();

        // Draw the paragraphs
        for( var i = 0; i < page.paragraphs.length; i++ ){

            paragraph = page.paragraphs[ i ];

            // Draw the lines
            for( var j = 0; j < paragraph.lines.length; j++ ){

                // To Do -> Gaps
                // To Do -> Altura de línea
                line = paragraph.lines[ j ];

                if( line.totalChars( true ) ){

                    wHeritage = offset + line.getOffset();

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
                                    trackHeritage = node.visualChars[ trackChars + tracks[ l ].length - 1 ];
                                }else if( tracks[ l ] ){
                                    this.ctx.fillText( tracks[ l ], startX + trackHeritage, startY );
                                }

                                trackChars += tracks[ l ].length;

                            }

                        }

                        wHeritage += node.visualWidth;

                        if( !node.style['text-decoration-underline'] ){
                            continue;
                        }

                        underlineHeight = parseInt( node.height, 10 ) / 15;

                        if(underlineHeight < 1){
                            underlineHeight = 1;
                        }

                        this.ctx.fillStyle = node.style.color;
                        this.ctx.fillRect( Math.floor( startX ), startY + Math.round( underlineHeight ), Math.ceil( node.width ), Math.round( underlineHeight ) );

                    }

                }

                hHeritage += line.height * paragraph.spacing;

            }

        }

        pageHeight  += Math.round( page.height ) + GAP;
        this.height += Math.round( page.height ) + GAP;

    }

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
