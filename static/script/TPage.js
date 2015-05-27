
var TPage = function(){

    this.id;
    this.parent;
    this.paragraphs = [];

    // Properties
    this.width           = 0;
    this.height          = 0;
    this.marginTop       = 0;
    this.marginRight     = 0;
    this.marginBottom    = 0;
    this.marginLeft      = 0;
    this.backgroundColor = DEFAULT_PAGE_BACKGROUNDCOLOR;

};

TPage.prototype.append = function( paragraph ){

    if( paragraph.parent ){
        paragraph.parent.remove( paragraph.id );
    }

    paragraph.id     = this.paragraphs.push( paragraph ) - 1;
    paragraph.parent = this;

    paragraph.updateWidth();

    if( this.parent ){
        this.reallocate();
    }

    return this;

};

TPage.prototype.clone = function(){

    var newPage = new TPage();

    // Properties
    newPage.width           = this.width;
    newPage.height          = this.height;
    newPage.marginTop       = this.marginTop;
    newPage.marginRight     = this.marginRight;
    newPage.marginBottom    = this.marginBottom;
    newPage.marginLeft      = this.marginLeft;
    newPage.backgroundColor = this.backgroundColor;

    return newPage;

};

TPage.prototype.insert = function( position, paragraph ){

    if( paragraph.parent ){
        paragraph.parent.remove( paragraph.id );
    }

    this.paragraphs  = this.paragraphs.slice( 0, position ).concat( paragraph ).concat( this.paragraphs.slice( position ) );
    paragraph.parent = this;

    for( var i = position; i < this.paragraphs.length; i++ ){

        this.paragraphs[ i ].id = i;
        this.paragraphs[ i ].updateWidth();

    }

    this.reallocate();

    return this;

};

TPage.prototype.next = function(){
    return this.parent.pages[ this.id + 1 ];
};

TPage.prototype.prev = function(){
    return this.parent.pages[ this.id - 1 ];
};

TPage.prototype.reallocate = function(){

    this.parent.reallocate();

    return this;

};

TPage.prototype.remove = function( position ){

    this.paragraphs[ position ].id     = undefined;
    this.paragraphs[ position ].parent = undefined;

    this.paragraphs = this.paragraphs.slice( 0, position ).concat( this.paragraphs.slice( position + 1 ) );

    for( var i = position; i < this.paragraphs.length; i++ ){

        this.paragraphs[ i ].id--;
        this.paragraphs[ i ].updateWidth();

    }

    this.reallocate();

    return this;

};

TPage.prototype.setBackgroundColor = function( color ){

    this.backgroundColor = color;

    return this;

};

TPage.prototype.setDimensions = function( width, height ){

    this.width  = parseInt( width, 10 ) || 0;
    this.height = parseInt( height, 10 ) || 0;

    return this;

};

TPage.prototype.setMargins = function( top, right, bottom, left ){

    this.marginTop    = parseInt( top, 10 ) || 0;
    this.marginRight  = parseInt( right, 10 ) || 0;
    this.marginBottom = parseInt( bottom, 10 ) || 0;
    this.marginLeft   = parseInt( left, 10 ) || 0;

    return this;

};
