
var checkCursorPosition = function( node, position ){

    if( node.id !== 0 ){

        if( position === 0 && !node.prev().blocked ){

            node     = node.prev();
            position = node.string.length;

        }

    }else if( node.blocked ){

        node     = node.next();
        position = 0;

    }

    return {

        node     : node,
        position : position

    };

};

var cleanComposition = function( isEnd ){

    if( !isEnd && compositionCounter ){
        input.blur().focus();
    }

    compositionEnded = false;
    input[ 0 ].value = '';

};

var cloneObject = function( obj ){

    var target = {};

    for( var i in obj ){

        if( obj.hasOwnProperty( i ) ){
            target[ i ] = obj[ i ];
        }

    }

    return target;

};

var compareHashes = function( first, second ){

    for( var i = 0; i < first.length; i++ ){

        if( first[ i ] > second[ i ] ){
            return -1;
        }else if( second[ i ] > first[ i ] ){
            return 1;
        }

    }

    return 0;

};

var clipboardCopy = function( e ){

    var raw = selectionRange.getRaw();
    var res = {

        'text/plain'        : [],
        //'text/html'         : '',
        'text/inevio-texts' : raw

    };

    for( var i = 0; i < raw.length; i++ ){

        var text = '';

        for( var j = 0; j < raw[ i ].nodeList.length; j++ ){
            text += raw[ i ].nodeList[ j ].string;
        }

        res['text/plain'].push( text );

    }

    res['text/plain']        = res['text/plain'].join('\r\n');
    res['text/inevio-texts'] = JSON.stringify( res['text/inevio-texts'] );

    return res;

};

var clipboardCut = function( e ){

    var res = clipboardCopy( e );

    if( selectionRange.isValid() ){
        handleBackspaceSelection();
    }

    realtime.setStatus( USER_EDITING );

    canvasPages.requestDraw();

    return res;

};

var createDocument = function( cb ){

    var name;

    if( currentOpenFile ){
        name = currentOpenFile.name.replace( /(\.docx|\.doc|\.odt|\.rtf)$/i, '' );
    }else{
        name = lang.newDocument;
    }

    wz.fs.saveFile( 'root', { name : name, extension : 'docx' }, function( error, destiny, userName, replace ){

        name = userName.replace( /(\.docx|\.doc|\.odt|\.rtf)$/i, '' );

        if( error ){
            return callback( error );
        }

        cb = wz.tool.secureCallback( cb );

        var dialog = wz.dialog();

        dialog
            .setTitle( lang.saving )
            .setButton( 0, 'button' );

        dialog = dialog.render();

        dialog
            .addClass('saving')
            .find('button')
                .remove();

        var file     = JSON.stringify( currentDocument.getRaw() );
        var counter  = 0;
        var callback = function( error, structure ){


            if( error && error !== 'FILE NAME EXISTS ALREADY' ){

                dialog.parent().remove();
                alert( error );
                return cb( error );

            }

            if( error && error === 'FILE NAME EXISTS ALREADY' ){


                counter += 1;

                return createFile( name + ' (' + counter + ')' + '.docx', destiny, file, callback );

            }

            currentOpenFile = structure;
            lastSavedStatus = JSON.stringify( currentDocument.getRaw() );

            dialog.parent().remove();
            setViewTitle( currentOpenFile.name );
            /*
            displaySaveSuccessFully();
            */
            cb();

        };

        createFile( name + '.docx', destiny, file, callback );

    });

};

var createFile = function( name, destiny, data, callback ){

    wz.fs.create({

        name    : name,
        destiny : destiny,
        data    : data,
        convert : {

            from : 'application/inevio-texts',
            to   : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        }

    }, callback );

};

var diffObject = function( base, changes ){

    var res = {};

    for( var i in changes ){

        if( changes[ i ] !== base[ i ] ){
            res[ i ] = changes[ i ];
        }

    }

    return res;

};

var getElementsByPosition = function( posX, posY ){

    var pageId, page, paragraphId, paragraph, lineId, line, lineChar, nodeId, node, nodeChar;

    // Buscamos la posición vertical
    var height = -scrollTop;

    // Buscamos la página
    for( pageId = 0; pageId < currentDocument.pages.length; pageId++ ){

        if( currentDocument.pages[ pageId ].height + GAP + height < posY ){
            height += currentDocument.pages[ pageId ].height + GAP;
        }else{
            break;
        }

    }

    if( currentDocument.pages[ pageId ] ){

        page = currentDocument.pages[ pageId ];

        // Tenemos en cuenta el margen superior
        height += page.marginTop;

        // Buscamos el párrafo
        for( paragraphId = 0; paragraphId < page.paragraphs.length; paragraphId++ ){

            if( page.paragraphs[ paragraphId ].height + height < posY ){
                height += page.paragraphs[ paragraphId ].height;
            }else{
                break;
            }

        }

        if( page.paragraphs[ paragraphId ] ){

            paragraph = page.paragraphs[ paragraphId ];

            // Buscamos la línea
            for( lineId = 0; lineId < paragraph.lines.length; lineId++ ){

                if( ( paragraph.lines[ lineId ].height * paragraph.spacing ) + height < posY ){
                    height += paragraph.lines[ lineId ].height * paragraph.spacing;
                }else{
                    break;
                }

            }

            if( paragraph.lines[ lineId ] ){
                line = paragraph.lines[ lineId ];
            }else{
                line = paragraph.lines[ --lineId ];
            }

        }else{

            paragraph = page.paragraphs[ --paragraphId ];
            lineId    = paragraph.lines.length - 1;
            line      = paragraph.lines[ lineId ];

        }

    }else{

        page        = currentDocument.pages[ --pageId ];
        paragraphId = page.paragraphs.length - 1;
        paragraph   = page.paragraphs[ paragraphId ];
        lineId      = paragraph.lines.length - 1;
        line        = paragraph.lines[ lineId ];

    }

    // Buscamos la posición horizontal
    var width = 0;

    // Tenemos en cuenta el margen izquierdo
    width += page.marginLeft;

    // Tenemos en cuenta el margen del párrafo
    width += line.getOffsetIndentationLeft();

    // Tenemos en cuenta la alineación del párrafo
    width += line.getOffset();

    // Buscamos el nodo y el nodeChar
    // Principio del primer nodo
    if( width >= posX ){

        nodeId   = 0;
        node     = line.nodes[ nodeId ];
        nodeChar = 0;
        lineChar = 0;

    }else{

        lineChar = 0;

        for( nodeId = 0; nodeId < line.nodes.length; nodeId++ ){

            if( width <= posX && line.nodes[ nodeId ].visualWidth + width >= posX ){

                node = line.nodes[ nodeId ];

                for( nodeChar = 0; nodeChar < node.string.length; ){

                    if( node.visualChars[ nodeChar ] - ( ( node.visualChars[ nodeChar ] - ( node.visualChars[ nodeChar - 1 ] || 0 ) ) / 2 ) + width >= posX ){
                        break;
                    }

                    lineChar++;
                    nodeChar++;

                }

                break;

            }

            width    += line.nodes[ nodeId ].visualWidth;
            lineChar += line.nodes[ nodeId ].string.length;

        }

        // Si no hay nodo es porque está al final de la línea
        if( !node ){

            lineChar = line.totalChars();
            nodeId   = line.nodes.length - 1;
            node     = line.nodes[ nodeId ];
            nodeChar = node.string.length;

        }

    }

    return {

        page      : page,
        paragraph : paragraph,
        line      : line,
        node      : node,
        char      : nodeChar

    };

};

var getGlobalParagraphId = function( paragraph ){

    var pageId = paragraph.parent.id;
    var id     = 0;

    for( var i = 0; i < pageId; i++ ){
        id += currentDocument.pages[ i ].paragraphs.length;
    }

    return id + paragraph.id;

};

var getGlobalParagraphCharId = function( node, charId ){

    var line      = node.parent;
    var paragraph = line.parent;
    var id        = 0;


    for( var i = 0; i < line.id; i++ ){
        id += paragraph.lines[ i ].totalChars();
    }


    for( var i = 0; i < node.id; i++ ){

        if( !line.nodes[ i ].blocked ){
            id += line.nodes[ i ].string.length;
        }

    }


    return id + charId;

};

var getNodeByGlobalId = function( paragraph, charId ){

    var counter = charId;
    var node    = paragraph.lines[ 0 ].nodes[ 0 ];

    while( node ){

        if( node.parent.parent.id !== paragraph.id ){
            return;
        }

        if( node.blocked ){
            node = node.next();
            continue;
        }


        if( counter - node.string.length <= 0 ){

            return {

                node : node,
                char : counter

            };

        }

        counter -= node.string.length;
        node     = node.next();

    }

};

var getParagraphByGlobalId = function( paragraphId ){

    var counter = paragraphId;

    for( var i = 0; i < currentDocument.pages.length; i++ ){

        if( counter - currentDocument.pages[ i ].paragraphs.length <= 0 ){
            return currentDocument.pages[ i ].paragraphs[ counter ];
        }

        counter -= currentDocument.pages[ i ].paragraphs.length;

    }

};

var handleArrowDown = function(){

    cleanComposition();
    cursor.verticalMove( 1 );

};

var handleArrowLeft = function( shiftKey ){

    cleanComposition();

    if( !shiftKey && selectionRange.isValid() ){
        selectionRange.collapseLeft();
    }else{
        cursor.move( -1, true, shiftKey );
    }

};

var handleArrowRight = function( shiftKey ){

    cleanComposition();

    if( !shiftKey && selectionRange.isValid() ){
        selectionRange.collapseRight();
    }else{
        cursor.move( 1, true, shiftKey );
    }

};

var handleArrowUp = function(){

    cleanComposition();
    cursor.verticalMove( -1 );

};

var handleBackspace = function(){

    if( selectionRange.isValid() ){
        handleBackspaceSelection();
    }else{
        handleBackspaceNormal();
    }

};

var handleBackspaceNormal = function(){

    var node = cursor.node;
    var char = cursor.char;

    if( cursor.paragraphChar ){

        cursor.move( -1, true );
        node.remove( char - 1 );
        node.deleteIfEmpty();

    }else if( !cursor.paragraphChar && cursor.paragraph.listMode ){

        cursor.paragraph.setStyle('listNone');
        updateToolsLineStatus();
        return handleBackspaceNormal();

    }else if( cursor.line.id ){

        //var paragraph = cursor.paragraph;
        var node = cursor.node.prev();

        cursor.move( -1, true );
        node.remove( node.string.length - 1 );

    }else if( cursor.page.id || cursor.paragraph.id ){

        var paragraph = cursor.paragraph;

        cursor.move( -1, true );
        paragraph.prev().merge( paragraph );

    }

    updateToolsLineStatus();
    canvasPages.requestDraw();

};

var handleBackspaceSelection = function(){

    var range              = selectionRange.getLimits();
    var startParagraphHash = range.startParagraph.getHash();

    selectionRange.mapParagraphs( function( paragraph ){

        if(
            compareHashes( paragraph.getHash(), startParagraphHash ) === 0 ||
            compareHashes( paragraph.getHash(), range.endParagraph.getHash() ) === 0
        ){
            return;
        }

        paragraph.parent.remove( paragraph.id );

    });

    selectionRange.update();
    selectionRange.mapNodes( function( node, start, stop ){

        if(
            start === 0 &&
            stop === node.string.length
        ){
            node.slice( 0, 0 ).deleteIfEmpty();
        }else if( start === 0 ){
            node.slice( stop );
        }else if( stop === node.string.length ){
            node.slice( 0, start );
        }else{

            var newNode = node.clone().slice( stop );

            node.slice( 0, start );
            node.parent.insert( node.id + 1, newNode );

        }

    });

    if( !range.endParagraph.totalChars() ){
        range.endParagraph.parent.remove( range.endParagraph.id );
    }

    selectionRange.collapseLeft();

};

var handleChar = function( newChar ){

    if( selectionRange.isValid() ){
        handleCharSelection( newChar );
    }else{
        handleCharNormal( newChar );
    }

    realtime.setStatus( USER_EDITING );

};

var handleCharNormal = function( newChar ){

    cursor.node.insert( cursor.char, newChar, styleController.temporal.get() );
    canvasPages.requestDraw();
    cursor.move( newChar.length );

};

var handleCharSelection = function( newChar ){

    handleBackspaceSelection();
    handleCharNormal( newChar );

};

var handleDel = function(){

    if( selectionRange.isValid() ){
        handleBackspaceSelection();
    }else{
        handleDelNormal();
    }

    realtime.setStatus( USER_EDITING );

};

var handleDelNormal = function(){

    cursor.move( 1, true );
    handleBackspaceNormal();

};

var handleEnter = function(){

    if( selectionRange.isValid() ){
        handleEnterSelection();
    }else{
        handleEnterNormal();
    }

    realtime.setStatus( USER_EDITING );

};

var handleEnterNormal = function(){

    if(
        cursor.paragraph.listMode &&
        !cursor.line.id &&
        !cursor.line.nodes[ 1 ].string.length
    ){
        cursor.paragraph.setStyle('listNone');
        return updateToolsLineStatus();
    }

    cursor.paragraph.split( cursor.line.id, cursor.node.id, cursor.char );
    cursor.page.reallocate();
    canvasPages.requestDraw();
    cursor.move( 1, true );

};

var handleEnterSelection = function(){

    handleBackspaceSelection();
    handleEnterNormal();

};

var insertPlainText = function( text ){

    if( selectionRange.isValid() ){
        handleBackspaceSelection();
    }

    /*text = text.replace( /\t/g, ' ' ); // To Do -> Soportar tabuladores*/
    text = text.replace( /\r\n/g, '\n' );
    text = text.replace( /\r/g, '\n' );
    text = text.split('\n');

    // Si no hay ningún salto de línea
    for( var i = 0; i < text.length; i++ ){

        // Si no es la primera línea
        if( i ){
            handleEnter();
        }

        // Si la línea no está vacía
        if( text[ i ].length ){

            var list = text[ i ].split(/(\s+)/g);

            for( var k = 0; k < list.length; k++ ){

                if( list[ k ].length ){
                    handleCharNormal( list[ k ] );
                }

            }

        }

    }

};

var insertTextsText = function( text ){

    console.warn('insertTextsText','ToDo','Lists');

    var obj = JSON.parse( text );

    if( selectionRange.isValid() ){
        handleBackspaceSelection();
    }

    var newNode, tmp;

    for( var i = 0; i < obj.length; i++ ){

        if( i ){
            handleEnter();
        }

        for( var j = 0; j < obj[ i ].nodeList.length; j++ ){

            tmp = obj[ i ].nodeList[ j ];

            if(
                !tmp.string.length ||
                tmp.blocked
            ){
                continue;
            }

            newNode = new TNode();

            newNode.setStyle( tmp.style );

            if( !cursor.char ){
                cursor.line.insert( cursor.node.id, newNode, true );
            }else if( cursor.char === cursor.node.string.length ){
                cursor.line.insert( cursor.node.id + 1, newNode, true );
            }else{

                cursor.node.split( cursor.char );
                cursor.line.insert( cursor.node.id + 1, newNode, true );

            }

            newNode.replace( tmp.string );
            cursor.setNode( newNode, newNode.string.length );

        }

    }

};

var normalizeColor = function( color ){

    if( !color ){
        return '#000000';
    }

    if( color[ 0 ] === '#' ){
        return color.slice( 0, 7 );
    }

    color = color.match(/(\d+)/g) || [ 0, 0, 0 ];
    color = color.slice( 0, 3 ); // Prevents alpha if color was a rgba

    for( var i in color ){

        color[ i ] = parseInt( color[ i ], 10 ).toString( 16 );
        color[ i ] = color[ i ].length === 1 ? '0' + color[ i ] : color[ i ];

    }

    return '#' + color.join('');

};

var openFile = function( structureId ){

    // To Do -> Error

    wz.fs( structureId, function( error, structure ){

        if( structure.formats['inevio-texts'] ){

            realtime.setController( structure.realtime() );

            structure.formats['inevio-texts'].read( function( error, data ){

                // Asociamos todos los datos del fichero con sus variables correspondientes
                currentOpenFile = structure;

                start( JSON.parse( data ) );
                setViewTitle( currentOpenFile.name );

            });

        /*
        }else if( structure.mime === 'application/inevio-texts' ){

            console.warn('Deprecated');
            structure.read( function( error, data ){

                // Asociamos todos los datos del fichero con sus variables correspondientes
                currentOpenFile = structure;

                processFile( data );
                start();
                setViewTitle( currentOpenFile.name );

            });
        */

        }else{
            alert( 'FILE FORMAT NOT RECOGNIZED' );
        }

    });

};

var saveDocument = function( callback ){

    callback = wz.tool.secureCallback( callback );

    var dialog = wz.dialog();

    dialog
        .setTitle( lang.saving )
        .setButton( 0, 'button' );

    dialog = dialog.render();

    dialog
        .addClass('saving')
        .find('button')
            .remove();

    currentOpenFile.write(

        JSON.stringify( currentDocument.getRaw() ),
        {

            from : 'application/inevio-texts',
            to   : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        },
        function( error ){

            lastSavedStatus = JSON.stringify( currentDocument.getRaw() );

            dialog.parent().remove();

            if( error ){
                alert( error );
            }

            callback( error );

        }

    );

};

var setViewTitle = function( name ){

    if( !name ){
        name = lang.newDocument;
    }

    viewTitle.text( name );

};

var start = function( document ){

    input.focus();

    currentDocument = new TDocument();

    var page = new TPage();
    var paragraph, line, node;

    page
    .setDimensions(

        document.defaultPage.width * TWIP_TO_PIXEL,
        document.defaultPage.height * TWIP_TO_PIXEL

    )
    .setMargins(

        document.defaultPage.marginTop * TWIP_TO_PIXEL,
        document.defaultPage.marginRight * TWIP_TO_PIXEL,
        document.defaultPage.marginBottom * TWIP_TO_PIXEL,
        document.defaultPage.marginLeft * TWIP_TO_PIXEL

    );

    currentDocument.append( page );

    for( var i = 0; i < document.paragraphList.length; i++ ){

        paragraph = new TParagraph();
        line      = new TLine();

        page.append( paragraph );
        paragraph.append( line );

        for( var j = ( document.paragraphList[ i ].listMode ? 1 : 0 ); j < document.paragraphList[ i ].nodeList.length; j++ ){

            var list  = document.paragraphList[ i ].nodeList[ j ].string.split(/(\s+)/g);
            var nodes = [];

            for( var k = 0; k < list.length; k++ ){

                node = new TNode();

                node.setStyle( document.paragraphList[ i ].nodeList[ j ].style );
                node.replace( list[ k ] );
                nodes.push( node );

            }

            line.append( nodes );

        }

        if( document.paragraphList[ i ].listMode ){

            if( document.paragraphList[ i ].listMode === LIST_BULLET ){
                paragraph.setStyle('listBullet');
            }else if( document.paragraphList[ i ].listMode === LIST_NUMBER ){
                paragraph.setStyle('listNumber');
            }

        }

        paragraph.reallocate();

    }

    setViewTitle();

    /*
    updateScroll( 0 );
    */
    cursor.setNode( currentDocument.pages[ 0 ].paragraphs[ 0 ].lines[ 0 ].nodes[ 0 ], 0 );
    canvasPages.requestDraw();
    canvasRulerLeft.requestDraw();
    canvasRulerTop.requestDraw();
    canvasCursor.requestDraw();
    updateToolsLineStatus();

    /*
    activeRealTime();
    saveStatus();

    loading.css( 'display', 'none' );

    marginTopDown.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopUp.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    marginTopBox.css( 'x', parseInt( currentPage.marginLeft, 10 ) );
    */

    lastSavedStatus = JSON.stringify( currentDocument.getRaw() );

};

var trimRight = function( string ){
    return string.replace( / +$/g, '' );
};

var updateToolsLineStatus = function(){

    var styles, nodeStyles, paragraphStyles;

    if( selectionRange.isValid() ){

        styles          = selectionRange.getCommonStyles();
        nodeStyles      = styles.nodes;
        paragraphStyles = styles.paragraphs;

    }else{

        nodeStyles      = cursor.node.style;
        paragraphStyles = {

            align    : cursor.paragraph.align,
            spacing  : cursor.paragraph.spacing,
            listMode : cursor.paragraph.listMode

        };

    }

    // Estilos de nodos
    if( styleController.temporal.get('font-family') ){
        toolsLine.find('.tool-fontfamily').text( styleController.temporal.get('font-family') );
    }else if( nodeStyles['font-family'] ){
        toolsLine.find('.tool-fontfamily').text( nodeStyles['font-family'] );
    }else{
        toolsLine.find('.tool-fontfamily').text('');
    }

    if( styleController.temporal.get('font-size') ){
        $( '.tool-fontsize', toolsLine ).text( styleController.temporal.get('font-size') );
    }else if( nodeStyles['font-size'] ){
        $( '.tool-fontsize', toolsLine ).text( nodeStyles['font-size'] );
    }else{
        $( '.tool-fontsize', toolsLine ).text('');
    }

    if( typeof styleController.temporal.get('font-weight') !== 'undefined' ){

        if( styleController.temporal.get('font-weight') ){

            $( '.tool-button-bold', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-bold', toolsLine ).removeClass('active');
        }

    }else{

        if( nodeStyles['font-weight'] ){
            $( '.tool-button-bold', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-bold', toolsLine ).removeClass('active');
        }

    }

    if( typeof styleController.temporal.get('font-style') !== 'undefined' ){

        if( styleController.temporal.get( 'font-style' ) ){
            $( '.tool-button-italic', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-italic', toolsLine ).removeClass('active');
        }

    }else{

        if( nodeStyles['font-style'] ){
            $( '.tool-button-italic', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-italic', toolsLine ).removeClass('active');
        }

    }

    if( typeof styleController.temporal.get('text-decoration-underline') !== 'undefined' ){

        if( styleController.temporal.get( 'text-decoration-underline' ) ){
            $( '.tool-button-underline', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-underline', toolsLine ).removeClass('active');
        }

    }else{

        if( nodeStyles['text-decoration-underline'] ){
            $( '.tool-button-underline', toolsLine ).addClass('active');
        }else{
            $( '.tool-button-underline', toolsLine ).removeClass('active');
        }

    }

    // Estilos de párrafos
    if( paragraphStyles.align === ALIGN_LEFT ){

        $( '.tool-button-left', toolsLine ).addClass('active');
        $( '.tool-button-center, .tool-button-right, .tool-button-justify', toolsLine ).removeClass('active');

    }else if( paragraphStyles.align === ALIGN_CENTER ){

        $( '.tool-button-center', toolsLine ).addClass('active');
        $( '.tool-button-left, .tool-button-right, .tool-button-justify', toolsLine ).removeClass('active');

    }else if( paragraphStyles.align === ALIGN_RIGHT ){

        $( '.tool-button-right', toolsLine ).addClass('active');
        $( '.tool-button-left, .tool-button-center, .tool-button-justify', toolsLine ).removeClass('active');

    }else if( paragraphStyles.align === ALIGN_JUSTIFY ){

        $( '.tool-button-justify', toolsLine ).addClass('active');
        $( '.tool-button-left, .tool-button-center, .tool-button-right', toolsLine ).removeClass('active');

    }

    if( paragraphStyles.spacing > 0 ){
        $( '.tool-button-line-spacing', toolsLine ).attr( 'data-value', paragraphStyles.spacing );
    }else{
        $( '.tool-button-line-spacing', toolsLine ).removeAttr('data-value');
    }

    if( paragraphStyles.listMode === LIST_NONE ){
        $( '.tool-button-list-unsorted, .tool-button-list-sorted', toolsLine ).removeClass('active');
    }else if( paragraphStyles.listMode === LIST_BULLET ){

        $( '.tool-button-list-unsorted', toolsLine ).addClass('active');
        $( '.tool-button-list-sorted', toolsLine ).removeClass('active');

    } if( paragraphStyles.listMode === LIST_NUMBER ){

        $( '.tool-button-list-unsorted', toolsLine ).removeClass('active');
        $( '.tool-button-list-sorted', toolsLine ).addClass('active');

    }

};

$(this).data( 'getOpenedId', function(){ return currentOpenFile ? currentOpenFile.id : null; })
