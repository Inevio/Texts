
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

    console.warn('ToDo','TPage','append');

    paragraph.id     = this.paragraphs.push( paragraph ) - 1;
    paragraph.parent = this;

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
