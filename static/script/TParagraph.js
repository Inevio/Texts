
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

    console.warn('ToDo','TParagraph','append');

    line.id     = this.lines.push( line ) - 1;
    line.parent = this;

    return this;

};
