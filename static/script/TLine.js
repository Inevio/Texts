
var TLine = function(){

    this.id;
    this.parent;
    this.nodes = [];

    // Properties
    this.height     = 0;
    this.totalChars = 0;
    this.width      = 0;

};

TLine.prototype.append = function( node ){

    console.warn('ToDo','TLine','append');

    node.id     = this.nodes.push( node ) - 1;
    node.parent = this;

    return this;

};

TLine.prototype.updateHeight = function(){

    var lineHeight = 0;

    for( var i = 0; i < this.nodes.length; i++ ){

        if( this.nodes[ i ].height > lineHeight ){
            lineHeight = this.nodes[ i ].height;
        }

    }

    if( lineHeight !== this.height ){
        
        this.parent.height -= this.height * this.parent.spacing;
        this.parent.height += lineHeight * this.parent.spacing;
        this.height         = lineHeight;

    }

    return this;

};
