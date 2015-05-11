
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

    // To Do -> Hacer realocate si es conveniente (a decision del programador)

    return this;

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

    console.warn('ToDo','Page Insert','Realocate Page');

    return this;

};

TPage.prototype.next = function(){
    return this.parent.pages[ this.id + 1 ];
};

TPage.prototype.prev = function(){
    return this.parent.pages[ this.id - 1 ];
};

TPage.prototype.remove = function( paragraph ){

    this.paragraphs[ position ].id     = undefined;
    this.paragraphs[ position ].parent = undefined;

    this.paragraphs = this.paragraphs.slice( 0, position ).concat( this.paragraphs.slice( position + 1 ) );

    for( var i = position; i < this.paragraphs.length; i++ ){

        this.paragraphs[ i ].id--;
        this.paragraphs[ i ].updateWidth();

    }

    // To Do -> Hacer realocate si es conveniente (a decision del programador)

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
