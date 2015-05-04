
var TDocument = function(){
    this.pages = [];
};

TDocument.prototype.append = function( page ){

    page.id     = this.pages.push( page ) - 1;
    page.parent = this;

    return this;

};
