
wz.app.addScript( 7, 'common', function( win ){
    
    // Cache Elements
    var zone  = $( '.weetext-paper-zone', win );
    var menu  = $( '.stupid-container', win );
    var title = $( '.weetext-paper-title span', win );
    var paper = $( '.weetext-paper', zone ).first();

    var typoMenu  = $( '.weetext-typo', win );
    var sizeMenu  = $( '.weetext-size', win );
    var colorMenu = $( '.weetext-color', win );
    var dropMenu  = typoMenu.add( sizeMenu ).add( colorMenu );

    // Info
    var openFileID     = null;
    var openFileText   = null;
    var openFileLength = null;
    
    // Local Info
    var list = {

        'font-weight' : {

            lighter : '100',
            normal  : '400',
            bold    : '700',
            bolder  : '800'

        }

    };

    var toggle = {

        bold : {

            css   : 'font-weight',
            scope : 'inline',
            check : function( input ){ return isBold( input ); },
            off   : '400',
            on    : '700'

        },

        italic : {

            css   : 'font-style',
            scope : 'inline',
            check : function( input ){ return isItalic( input ); },
            off   : 'normal',
            on    : 'italic'

        },

        underline : {

            css   : 'text-decoration',
            scope : 'inline',
            check : function( input ){ return isUnderline( input ); },
            off   : 'none',
            on    : 'underline'

        },

        'align-left' : {

            css   : 'text-align',
            scope : 'block',
            check : function( item ){ return toggle[ 'align-left' ].on === commonAlign( item );},
            off   : 'left',
            on    : 'left'

        },

        'align-center' : {

            css   : 'text-align',
            scope : 'block',
            check : function( item ){ return toggle[ 'align-center' ].on === commonAlign( item );},
            off   : 'left',
            on    : 'center'

        },

        'align-right' : {

            css   : 'text-align',
            scope : 'block',
            check : function( item ){ return toggle[ 'align-right' ].on === commonAlign( item );},
            off   : 'left',
            on    : 'right'

        },

        'align-justify' : {
            
            css   : 'text-align',
            scope : 'block',
            check : function( item ){ return toggle[ 'align-justify' ].on === commonAlign( item );},
            off   : 'left',
            on    : 'justify'

        }

    };

    var fontFamily = [

        { name : 'Arial', value : 'Arial, sans-serif' },
        { name : 'Times New Roman', value : '"Times New Roman", serif' },
        { name : 'Effra', value : 'Effra, sans-serif' }

    ];

    var fontSize = [

        { name : '6pt', value : '6pt' },
        { name : '8pt', value : '8pt' },
        { name : '9pt', value : '9pt' },
        { name : '11pt', value : '10pt' },
        { name : '12pt', value : '12pt' },
        { name : '14pt', value : '14pt' },
        { name : '18pt', value : '18pt' },
        { name : '20pt', value : '20pt' },
        { name : '24pt', value : '24pt' },
        { name : '30pt', value : '30pt' },
        { name : '36pt', value : '36pt' },
        { name : '48pt', value : '48pt' },
        { name : '60pt', value : '60pt' },
        { name : '72pt', value : '72pt' }

    ];

    // Functions
    /*
     * (void) updateState((mixed) input)
     * Actualiza los botones del menú según las propiedades de la entrada.
     */
    var updateState = function(input){
        
        input = $(input);

        var font = commonFont( input );
        var size = Math.round( parseFloat( wz.tool.pixelsToPoints( commonSize( input ) ) ) );
        
        $( '.button-typo span', menu ).text( ( font === null ) ? '(several fonts)' : font );
        $( '.button-size span', menu ).text( isNaN( size ) ? '--' : size + 'pt' );

        if( font !== null ){

            typoMenu.children()
                .removeClass('active')
                .each( function(){

                    if( $( 'span', this ).text() === font ){

                        $(this).addClass('active');
                        return false;

                    }

                });

        }

        if( !isNaN( size ) ){

            size = size + 'pt';

            sizeMenu.children()
                .removeClass('active')
                .each( function(){

                    if( $( 'span', this ).text() === size ){

                        $(this).addClass('active');
                        return false;

                    }

                });
                
        }
        
        var align = commonAlign(input);

        if(align === null){
            $('.button-align',menu).removeClass('active');
        }else{
            $('.button-align-' + align, menu).addClass('active').siblings().removeClass('active');
        }
        
        if(isBold(input)){
            $('.button-bold',menu).addClass('active');
        }else{
            $('.button-bold',menu).removeClass('active');
        }
        
        if(isItalic(input)){
            $('.button-italic',menu).addClass('active');
        }else{
            $('.button-italic',menu).removeClass('active');
        }
        
        if(isUnderline(input)){
            $('.button-underline',menu).addClass('active');
        }else{
            $('.button-underline',menu).removeClass('active');
        }
        
    };

    /*
     * (mixed) commonFont((jQuery) input)
     * Determina si un conjunto de elementos tienen la misma familia de fuente.
     */
    var commonFont = function( input ){
        
        var first = input.first();
        var value = input.css('font-family');
        
        input = input.not(first);
        input.each(function(){
            
            if($(this).css('font-family') !== value){
                
                value = false;
                return false;
                
            }
            
        });
        
        if(value === false){
            return null;
        }else{
            return $.trim(value.split(',',1)[0]).replace(/"|'*/mg,'');
        }
        
    };

    /*
     * (mixed) commonAlign((jQuery) input)
     * Determina si un conjunto de elementos tienen la misma alineación.
     */
    var commonAlign = function( input ){
        
        var first = input.first();
        var value = input.css('text-align');
        
        input = input.not(first);
        input.each(function(){
            
            if($(this).css('text-align') !== value){
                
                value = false;
                return false;
                
            }
            
        });
        
        if(value === false){
            return null;
        }else{
            return value;
        }
        
    };

    /*
     * (boolean) isBold((jQuery) input)
     * Determina si un conjunto de elementos están en negrita o no.
     */
    var isBold = function( input ){
        
        var first = input.first();
        var value = input.css('font-weight');
        
        if(normalizeCSS('font-weight',value) !== '700'){
            return false;
        }
        
        input = input.not(first);
        input.each(function(){
            
            if($(this).css('font-weight') !== value){
                
                value = false;
                return false;
                
            }
            
        });
        
        if(value === false){
            return false;
        }else{
            return true;
        }
        
    };
    
    /*
     * (boolean) isItalic((jQuery) input)
     * Determina si un conjunto de elementos están en cursiva/itálica o no.
     */
    var isItalic = function( input ){
        
        var value = true;
        
        input.each(function(){
            
            if($(this).css('font-style') !== 'italic'){
                
                value = false;
                return false;
                
            }
            
        });
        
        return value;
        
    };
    
    /*
     * (boolean) isUnderline((jQuery) input)
     * Determina si un conjunto de elementos están en subrayados o no.
     */
    var isUnderline = function( input ){
        
        var value = true;
        
        input.each(function(){
            
            if($(this).css('text-decoration') !== 'underline'){
                
                value = false;
                return false;
                
            }
            
        });
        
        return value;
        
    };

    /*
     * (string) normalizeCSS((mixed) atribute, (mixed) value)
     * Para ciertos atributos CSS no todos los navegadores usan los mismos valores para conseguir
     * el mismo resultado. Esta función genera un valor único normalizado para evitar discrepancias
     * y equivalente para todos los navegadores y el código en si.
     */
    var normalizeCSS = function( atribute, value ){
        
        if(typeof atribute !== 'undefined' && typeof value !== 'undefined'){
            
            atribute = atribute.toString();
            value    = value.toString();
            
        }else{
            throw 'Incomplete input';
        }
        
        if(typeof list[atribute] !== 'undefined' && typeof list[atribute][value] !== 'undefined'){
            return list[atribute][value];
        }else{
            return value;
        }
        
    };

    /*
     * (mixed) commonSize((jQuery) input)
     * Determina si un conjunto de elementos tienen el mismo tamaño de fuente.
     */
    var commonSize = function( input ){
        
        var first = input.first();
        var value = parseInt( input.css('font-size'), 10 );
        
        input = input.not( first );
        input.each( function(){
            
            if( parseInt( $(this).css('font-size'), 10 ) !== value){
                
                value = false;
                return false;
                
            }
            
        });
        
        if( value === false ){
            return null;
        }else{
            return value;
        }
        
    };

    /*
     * (void) normalizeSelection()
     * Normaliza los tags seleccionados, muy útil cuando los rangos son simples
     */
    var normalizeSelection = function(){
        
        var tags = getSelectedTags( zone[ 0 ] ).filter('p, li');
        
        if( tags.size() === 1 ){

            if( tags.text().length === 0 ){
                selectEnd( tags );
            }else{

                var sel = tags.selection();

                if( sel.start === 0 && sel.end === 0 ){
                    tags.selection( sel.start, sel.end );
                }else if( tags.text().length === sel.start && sel.start === sel.end ){
                    selectEnd( tags );
                }else{
                    tags.selection( sel.start, sel.end );
                }

            }

        }else{
            
            var sel = zone.selection();
            zone.selection( sel.start, sel.end );
            
        }
        
    };

    /*
     * (jQuery) getSelectedTags()
     * Devuelve las etiquetas que se encuentran seleccionadas
     */
    var getSelectedTags = function( reference ){
        return getTagNode( getSelectedNodes( reference ) );
    };
    
    /*
     * (jQuery) getSelectedNodes()
     * Devuelve los nodos de texto que se encuentran seleccionados
     */
    var getSelectedNodes = function( reference ){
        
        var range     = new $.Range.current(reference);
        var container = range.range.commonAncestorContainer;
        var list      = $().add(getSelectedSubNodes(container));
        
        if(list.size() === 0 && $(container).selection() !== null){
            list = $(container);
        }
        
        return list;
        
    };
    
    /*
     * (jQuery) getSelectedSubNodes()
     * Devuelve los nodos de texto que se encuentran seleccionados animadados dentro de un nodo padre
     */
    var getSelectedSubNodes = function( node ){
        
        var list = $();
        var inSelection = false;
        
        $(node.childNodes).each(function(){
            
            if($(this).selection() !== null){
                
                if(this.nodeName === "#text"){
                    
                    if(this.length === 0){
                        $(this).remove();
                    }else{
                        list = list.add(this);
                    }
                    
                }else{
                    list = list.add(getSelectedSubNodes(this));
                }
                
                inSelection = true;
                
            }else if(inSelection){
                return false;
            }
            
        });
        
        return list;
        
    };
    
    /*
     * (jQuery) getTagNode()
     * Devuelve las etiquetas que contienen los nodos de texto del parámetro
     */
    var getTagNode = function( node ){
        
        var list = $();
        
        $(node).each(function(){
            
            if(this.nodeName === '#text'){
                list = list.add($(this).parent());
            }else{
                list = list.add($(this));
            }
            
        });
        
        return list;
        
    };

    /*
     * (void) surroundSelection((string) command, (string) value)
     * Llega a la conclusión de que rango debe someterse al surround
     */
    var surroundSelection = function( command, value ){
        
        var tmpSelection = null;
        var tmpRange     = null;
        var monoNode     = null;
        var parent       = null;
        var length       = null;
        var selection    = zone.selection();
        var nodes        = getSelectedNodes(zone[0]);
        
        nodes.each(function(){
            
            tmpSelection = $(this).selection();
            $(this).selection(tmpSelection.start, tmpSelection.end);
            
            tmpRange = new $.Range.current(this);
            parent   = $(this.parentElement);
            
            if(parent.is('p, li')){
                
                object   = $('<span></span>').css(command, value);
                tmpRange.range.surroundContents(object[0]);
                
                if(tmpSelection.width === 0){
                    monoNode = object;
                }else{
                    cleanArround(object);
                }
                
            }else if(parent.is('span')){
                
                length = parent.text().length;
                
                if(length === tmpSelection.width){
                    
                    parent.css(command,value);
                    
                }else{
                    
                    $(this).selection(tmpSelection.start, tmpSelection.end);
                    
                    if(tmpSelection.end === 0 || (tmpSelection.start !== 0 && tmpSelection.end !== length)){
                        
                        parent.selection(tmpSelection.end, length);
                        
                        tmpRange = new $.Range.current(this);
                        object = $('<span></span>').attr('style',parent.attr('style'));
                        tmpRange.range.surroundContents(object[0]);
                        parent.after(object);
                        
                        cleanArround(object);
                        
                        if(tmpSelection.width === 0){
                            
                            object = $('<span></span>').attr('style',parent.attr('style')).css(command, value);
                            parent.after(object);
                            monoNode = object;
                            
                        }else{
                            
                            parent.selection(tmpSelection.start, tmpSelection.end);
                            
                            tmpRange = new $.Range.current(this);
                            object = $('<span></span>').attr('style',parent.attr('style')).css(command, value);
                            tmpRange.range.surroundContents(object[0]);
                            parent.after(object);
                            
                            cleanArround(object);
                            
                        }
                        
                    }else if(tmpSelection.start === 0){
                        
                        tmpRange = new $.Range.current(this);
                        object = $('<span></span>').attr('style',parent.attr('style')).css(command, value);
                        tmpRange.range.surroundContents(object[0]);
                        parent.before(object);
                        
                        cleanArround(object);
                        
                    }else if(tmpSelection.end === length){
                        
                        tmpRange = new $.Range.current(this);
                        object = $('<span></span>').attr('style',parent.attr('style')).css(command, value);
                        tmpRange.range.surroundContents(object[0]);
                        parent.after(object);
                        
                        cleanArround(object);
                        
                    }else{
                        throw Error('Wrong Cut Position');
                    }
                    
                }
                
            }else{
                throw Error('Wrong Parent Selected');
            }
            
            if(monoNode === null){
                
                zone.selection(selection.start, selection.end);
                updateState(getTagNode(getSelectedNodes(zone[0])));
                
            }else{
                
                cleanArround(monoNode);
                
                monoNode
                    .text(' ')
                    .selection(0,1);
                    
                updateState(getTagNode(getSelectedNodes(zone[0])));
                
                monoNode.text('');
                
            }
            
        });
        
    };

    /*
     * (void) cleanArround( (jQuery) node)
     * Limpia los nodos de texto vacios aledanos y el mismo
     */
    var cleanArround = function( node ){
        
        node = $(node)[0];
        
        if(node.previousSibling.nodeName === '#text' && node.previousSibling.length === 0){
            $(node.previousSibling).remove();
        }
        
        if(node.nextSibling.nodeName === '#text' && node.nextSibling.length === 0){
            $(node.nextSibling).remove();
        }
        
        if(node.nodeName === '#text' && node.length === 0){
            $(node).remove();
        }
        
    };

    /*
     * (jQuery) getBigParents()
     * Devuelve las padres "especiales" seleccionadas
     */
    var getBigParents = function( reference ){
        return reference.closest('p, li');
    };

    /*
     * (void) renderInput( (string) data)
     * Inserta el código indicado en las páginas
     */
    var renderInput = function( data ){

        var height    = paper.height();
        var tmpHeight = height;
        var newPaper  = paper.clone().empty();
        var nowPaper  = paper.empty().html('<!-- weedoc -->');
        var tmpPaper  = $();
        var items     = [];

        $( data ).filter('p, li').each( function(){
            items.push( this );
        });

        for( var i in items ){

            nowPaper.append( items[ i ] );

            tmpHeight -= $( items[ i ] ).outerHeight( true );

            if( tmpHeight < 0 ){

                tmpPaper  = newPaper.clone();

                nowPaper.after( tmpPaper );

                nowPaper  = tmpPaper;
                tmpPaper  = $();
                tmpHeight = height;

                nowPaper.append( items[ i ] );

                tmpHeight -= $( items[ i ] ).outerHeight( true );

            }

        }

    };

    /*
     * (void) windowTitle( (string) title)
     * Inserta el código indicado en las páginas
     */
    var windowTitle = function( text ){
        title.text( text );
    };

    var extractText = function(){
        return $.trim( $( '.weetext-paper', zone ).html() );
    };

    var saveFile = function( callback ){

        wz.structure( openFileID, function( error, structure ){

            // To Do -> Error
            if( error ){
                alert( error );
                return false;
            }

            var text = extractText();

            structure.write( text, function( error ){

                if( error ){
                    alert( 'Error: ' + error );
                }else{

                    openFileText   = text;
                    openFileLength = openFileText.length;

                    wz.banner()
                        .title( 'weeText - ' + structure.name )
                        .text( 'File saved' )
                        .render();

                    wz.tool.secureCallback( callback )();

                }

            });

        });

    };

    var createFile = function( callback ){

        var name = prompt( 'New file name' );
        var text = extractText();

        wz.structure.create( name, 'text/plain', 'root', text, function( error, structure ){

            if( error ){

                alert( error );
                createFile();
                return false;

            }

            openFileID     = structure.id;
            openFileText   = text;
            openFileLength = openFileText.length;

            windowTitle( structure.name );

            wz.banner()
                .title( 'weeText - ' + structure.name )
                .text( 'Archivo guardado' )
                .render();

            wz.tool.secureCallback( callback )();

        });

    };

    var selectEnd = function( node ){

        var range = new $.Range( node );

        if( !node.text().length ){

            node.html('&nbsp;');//.addClass('empty-node');
            range.collapse( true );

        }else{
            range.collapse( false );
        }

        range.select();

    };

    var generateFontFamilyMenu = function(){

        var prototype = typoMenu.children('.prototype');

        for( var i in fontFamily ){

            typoMenu.append(

                prototype.clone()
                    .removeClass('prototype')
                    .data( 'font-family', fontFamily[ i ].value )
                    .children('span')
                        .text( fontFamily[ i ].name )
                    .parent()

            );

        }

        prototype.remove();

    };

    var generateFontSizeMenu = function(){

        var prototype = sizeMenu.children('.prototype');

        for( var i in fontSize ){

            sizeMenu.append(

                prototype.clone()
                    .removeClass('prototype')
                    .data( 'font-size', fontSize[ i ].value )
                    .children('span')
                        .text( fontSize[ i ].name )
                    .parent()

            );

        }

        prototype.remove();

    };

    var saveStatus = function( id ){

        // File Info
        openFileID     = id;
        openFileText   = extractText();
        openFileLength = openFileText.length;

    };

    var positionMenu = function( reference, menu ){

        var refOffset = reference.offset().left;
        var refWidth  = reference.outerWidth();
        var winOffset = win.offset().left;

        menu.css( 'left', ( refOffset - winOffset ) + ( refWidth / 2 ) - ( menu.outerWidth() / 2 ) );

    };

    // Events
    win
    .on( 'app-param', function( e, params ){

        // To Do -> Comprobar que params no va vacio

        wz.structure( params[ 0 ], function( error, structure ){
            
            structure.read( function( error, data ){

                var comment = $( data ).first()[ 0 ];

                if( comment.nodeName !== '#comment' || comment.nodeValue !== ' weedoc ' ){
                    alert( 'FILE FORMAT NOT RECOGNIZED' );
                    return false;
                }

                renderInput( data );
                windowTitle( structure.name );

                saveStatus( structure.id );

            });

        });

    })

    .on( 'click', '.wz-win-close', function( e ){

        e.stopPropagation();

        var text = extractText();

        if( text.length === openFileLength && text === openFileText ){
            wz.app.closeWindow( win.data('win') );
            return false;
        }

        if( confirm( 'Do you want to save changes?' ) ){

            if( openFileID ){

                saveFile( function(){
                    wz.app.closeWindow( win.data('win') );
                });

            }else{

                createFile( function(){
                    wz.app.closeWindow( win.data('win') );
                });

            }

        }else{
            wz.app.closeWindow( win.data('win') );
        }

    })
    
    .on( 'wz-blur', function(){
        $( '.weetext-size', win ).removeClass( 'show' );
        $( '.weetext-color', win ).removeClass( 'show' );
        $( '.weetext-typo', win ).removeClass( 'show' );
    })
    
    .on( 'mousedown', function(){

        if( $( this ).hasClass('weetext-drop-menu') ){

            dropMenu.removeClass('show');
            $( this ).removeClass('weetext-drop-menu');

        }
        
    })
    
    .on( 'mousedown', '.button-typo', function( e ){
        
        e.stopPropagation();
        
        if( !typoMenu.hasClass('show') ){
            
            dropMenu.removeClass('show');
            typoMenu.addClass('show');
            win.addClass('weetext-drop-menu');

            positionMenu( $( this ), typoMenu );

        }else{
            dropMenu.removeClass('show');
        }

    })
    
    .on( 'mousedown', '.button-size', function( e ){
        
        e.stopPropagation();
        
        if( !sizeMenu.hasClass('show') ){
            
            dropMenu.removeClass('show');
            sizeMenu.addClass('show');
            win.addClass('weetext-drop-menu');

            positionMenu( $( this ), sizeMenu );

        }else{
            dropMenu.removeClass('show');
        }  
        
    })
    
    .on( 'mousedown', '.button-color .weetext-options-display', function( e ){
        
        e.stopPropagation();
        
        if( !colorMenu.hasClass('show') ){
            
            dropMenu.removeClass('show');
            colorMenu.addClass('show');
            win.addClass('weetext-drop-menu');

            positionMenu( $( this ), colorMenu );

        }else{
            dropMenu.removeClass('show');
        }  
        
    })

    .on( 'click', '.button-color-indicator', function(){
        surroundSelection( 'color', $( this ).css('background-color') );
    });

    typoMenu
    .on( 'mousedown', 'li', function(){
        surroundSelection( 'font-family', $(this).data('font-family') );
    });

    sizeMenu
    .on( 'mousedown', 'li', function(){
        surroundSelection( 'font-size', $(this).data('font-size') );
    });

    colorMenu
    .on( 'mousedown', '.weetext-color', function( e ){    
        e.stopPropagation();      
    })

    .on( 'mousedown', '.table-container td', function( e ){

        $( '.weetext-color', win ).removeClass( 'show' );   
        win.removeClass('weetext-drop-menu');

        surroundSelection( 'color', $( this ).css('background-color') );

        $( '.button-color-indicator', menu ).css( 'background-color', $( this ).css('background-color') );

    });

    menu
    .on( 'mousedown', '.weetext-button, .weetext-button-drop', function( e ){
        // Evita la perdida de la seleccion
        e.preventDefault();
    })

    .on( 'click', '.weetext-options-save', function( e ){

        if( openFileID ){
            saveFile();
        }else{
            createFile();
        }

    })

    .on( 'click', '.button-toggle', function( e ){
        
        e.preventDefault();
        
        var action = $(this).attr('data-action');
        var tags   = null;
        
        if( typeof toggle[ action ] === 'undefined' ){
            throw Error('Bad Id Input');
        }
        
        if( toggle[ action ].scope === 'block' ){
            
            tags = getBigParents(getTagNode(getSelectedNodes(zone[0])));
            
            if( toggle[ action ].check(tags) ){
                
                tags.css(toggle[ action ].css, toggle[ action ].off);
                updateState(tags);
                
            }else{
                
                tags.css(toggle[ action ].css, toggle[ action ].on);
                updateState(tags);
                
            }
            
        }else if( toggle[ action ].scope === 'inline' ){
            
            tags = getTagNode(getSelectedNodes(zone[0]));
            
            if( toggle[ action ].check(tags) ){
                surroundSelection(toggle[ action ].css, toggle[ action ].off);
            }else{
                surroundSelection(toggle[ action ].css, toggle[ action ].on);
            }
            
        }else{
            throw Error('Bad Toggle Input');
        }
        
    })

    .on( 'click', '.button-bullets', function( e ){

        var tags       = getBigParents( getTagNode( getSelectedNodes( zone[ 0 ] ) ) );
        var tmp        = null;
        var newTags    = $();
        var selection  = zone.selection();
        var replaceStr = '<li></li>';
        var css        = { 'margin-left' : '1.25cm' };

        tmp = tags.filter('li');

        if( tmp.size() ){

            if( tmp.size() === tags.size() ){

                replaceStr = '<p></p>';
                css        = {};

            }else{

                newTags = tmp;
                tags    = tags.not( tmp );

            }

        }

        tags.each( function(){

            tmp     = $( replaceStr ).html( $( this ).html() ).css( css );
            newTags = newTags.add( tmp );

            $( this ).replaceWith( tmp );

        });

        if( tags.size() === 1 ){
            selectEnd( newTags );
        }else{
            zone.selection( selection.start, selection.end );
        }

        normalizeSelection();
        updateState( getSelectedTags( zone[ 0 ] ) );

        tags      = newTags;
        newTags   = null;
        tmp       = null;
        selection = null;

    });

    zone
    .on( 'mouseup', function( e ){
        
        normalizeSelection();
        updateState( getSelectedTags( this ) );
        
    });

    // Create Menus
    generateFontFamilyMenu();
    generateFontSizeMenu();

    // Insert Pointer
    $( '.weetext-paper', zone ).first().focus();

    var paragraph = $( '.weetext-paper', zone ).first().find('p, li').last();

    selectEnd( paragraph );

    normalizeSelection();
    updateState( getSelectedTags( zone[ 0 ] ) );

    // Save status
    saveStatus( null );

});
