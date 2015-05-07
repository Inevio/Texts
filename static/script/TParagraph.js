
var TParagraph = function(){

    this.id;
    this.parent;
    this.lines = [];

    // Properties
    this.align                   = ALIGN_LEFT;
    this.height                  = 0;
    this.indentationLeft         = 0;
    this.indentationRight        = 0;
    this.indentationSpecialType  = INDENTATION_NONE;
    this.indentationSpecialValue = 0;
    this.listMode                = LIST_NONE;
    this.spacing                 = 1;
    this.width                   = 0;
    this.split                   = 0;

};

TParagraph.prototype.append = function( line ){

    if( line.parent ){
        line.parent.remove( line.id );
    }

    line.id     = this.lines.push( line ) - 1;
    line.parent = this;

    line.updateWidth();

    return this;

};

TParagraph.prototype.insert = function( position, line ){
    
    if( line.parent ){
        line.parent.remove( line.id );
    }

    this.lines  = this.lines.slice( 0, position ).concat( line ).concat( this.lines.slice( position ) );
    line.parent = this;

    for( var i = position; i < this.lines.length; i++ ){

        this.lines[ i ].id = i;

        this.lines[ i ].updateWidth();

    }

    this.updateHeight();

    // To Do -> Hacer realocate si es conveniente (a decision del programador)
    
    return this;

};

TParagraph.prototype.next = function(){

    var paragraph = this.parent.paragraphs[ this.id + 1 ];

    if( paragraph ){
        return paragraph;
    }

    var page = this.parent.next();

    while( page ){

        if( page.paragraphs.length ){
            return page.paragraphs[ 0 ];
        }

        page = this.parent.next();
        
    }

};

TParagraph.prototype.prev = function(){
    
    var paragraph = this.parent.paragraphs[ this.id - 1 ];

    if( paragraph ){
        return paragraph;
    }

    var page = this.parent.next();

    while( page ){

        if( page.paragraphs.length ){
            return page.paragraphs[ page.paragraphs.length - 1 ];
        }

        page = this.parent.next();
        
    }

};

TParagraph.prototype.remove = function( position ){

    this.lines[ position ].id     = undefined;
    this.lines[ position ].parent = undefined;

    this.lines = this.lines.slice( 0, position ).concat( this.lines.slice( position + 1 ) );

    for( var i = position; i < this.lines.length; i++ ){

        this.lines[ i ].id--;
        this.lines[ i ].updateWidth();
    
    }

    // To Do -> Hacer realocate si es conveniente (a decision del programador)

    return this;

};

TParagraph.prototype.updateHeight = function(){
    
    this.height = 0;

    for( var i = 0; i < this.lines.length; i++ ){
        this.height += this.lines[ i ].height;
    }

    return this;

};

TParagraph.prototype.updateWidth = function(){

    this.width = this.parent.width - this.parent.marginLeft - this.parent.marginRight;

    // To Do -> Recursivo

    return this;

};
