
var TDocument = function(){

    this.pages = [];

    this.reallocating = false;

};

TDocument.prototype.append = function( page ){

    if( page.parent ){
        page.parent.remove( page.id );
    }

    page.id     = this.pages.push( page ) - 1;
    page.parent = this;

    return this;

};

TDocument.prototype.height = function(){

    var height = GAP;

    for( var i = 0; i < this.pages.length; i++ ){
        height += this.pages[ i ].height + GAP;
    }

    return height;

};

TDocument.prototype.reallocate = function(){

    if( this.reallocating ){
        return this;
    }

    this.reallocating = true;

    // Obtenemos los párrafos
    var paragraph = this.pages[ 0 ].paragraphs[ 0 ];
    var list      = [];

    while( paragraph ){

        list.push( paragraph );

        paragraph = paragraph.next();

    }

    var page      = this.pages[ 0 ];
    var available = page.height - page.marginTop - page.marginBottom;
    var assigned  = [];

    // Asociamos párrafo con cada página
    for( var i = 0; i < list.length; i++ ){

        if( available < list[ i ].height ){

            if( !page.next() ){
                this.append( page.clone() );
            }

            page = page.next();

            available = page.height - page.marginTop - page.marginBottom;

        }

        assigned.push({

            page      : page,
            paragraph : list[ i ]

        });

        available -= list[ i ].height;

    }

    // Insertamos cada párrafo en su página
    for( var i = 0; i < assigned.length; i++ ){
        assigned[ i ].page.append( assigned[ i ].paragraph );
    }

    // Limpiamos las páginas vacías
    for( var i = 0; i < this.pages.length; ){

        if(

            !this.pages[ i ].id ||
            this.pages[ i ].paragraphs.length

        ){

            i++;
            continue;

        }

        this.remove( i );

    }

    this.reallocating = false;

    return this;

};

TDocument.prototype.remove = function( position ){

    this.pages[ position ].id     = undefined;
    this.pages[ position ].parent = undefined;

    this.pages = this.pages.slice( 0, position ).concat( this.pages.slice( position + 1 ) );

    for( var i = position; i < this.pages.length; i++ ){
        this.pages[ i ].id--;
    }

    return this;

};
