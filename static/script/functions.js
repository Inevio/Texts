
var setViewTitle = function( name ){

    if( !name ){
        name = lang.newDocument;
    }

    viewTitle.text( name );

};

var start = function(){

    input.focus();

    currentDocument = new TDocument();

    //if( !currentOpenFile ){

        var page      = new TPage();
        var paragraph = new TParagraph();
        var line      = new TLine();
        var node      = new TNode();

        page
        .setDimensions(

            PAGEDIMENSIONS['A4'].width * CENTIMETER,
            PAGEDIMENSIONS['A4'].height * CENTIMETER

        )
        .setMargins(

            MARGIN['Normal'].top * CENTIMETER,
            MARGIN['Normal'].right * CENTIMETER,
            MARGIN['Normal'].bottom * CENTIMETER,
            MARGIN['Normal'].left * CENTIMETER

        );

        currentDocument.append( page );
        page.append( paragraph );
        paragraph.append( line );
        line.append( node );
        
        node.setSize( 12 );
        node.setFont('Cambria');
        node.setColor('#000000');

        setViewTitle();

        console.log( currentDocument );

    //}

    cursor.setNode( node, 0 );
    /*
    updateScroll( 0 );
    */
    canvasPages.requestDraw();
    canvasRulerLeft.requestDraw();
    canvasRulerTop.requestDraw();
    canvasCursor.requestDraw();
    /*
    updateToolsLineStatus();
    activeRealTime();
    saveStatus();

    loading.css( 'display', 'none' );

    marginTopDown.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopUp.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopBox.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    */

};
