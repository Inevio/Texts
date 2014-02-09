
    // Cache Elements
    var win   = $( this );
    var zone  = $( '.weetext-paper-zone', win );
    var menu  = $( '.stupid-container', win );
    var title = $( '.weetext-paper-title span', win );
    var paper = $( '.weetext-paper', zone ).first();

    var typoMenu  = $( '.weetext-typo', win );
    var sizeMenu  = $( '.weetext-size', win );
    var colorMenu = $( '.weetext-color', win );
    var dropMenu  = typoMenu.add( sizeMenu ).add( colorMenu );

    var remoteCaretPrototype = $('<i class="weetext-remote-carret"></i>');
    var collaborationHost    = null;
    var collaborationActive  = false;
    var collaborationUsers   = [];

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
            check : function( item ){ return toggle[ 'align-left' ].on === fn.common.align( item );},
            off   : 'left',
            on    : 'left'

        },

        'align-center' : {

            css   : 'text-align',
            scope : 'block',
            check : function( item ){ return toggle[ 'align-center' ].on === fn.common.align( item );},
            off   : 'left',
            on    : 'center'

        },

        'align-right' : {

            css   : 'text-align',
            scope : 'block',
            check : function( item ){ return toggle[ 'align-right' ].on === fn.common.align( item );},
            off   : 'left',
            on    : 'right'

        },

        'align-justify' : {
            
            css   : 'text-align',
            scope : 'block',
            check : function( item ){ return toggle[ 'align-justify' ].on === fn.common.align( item );},
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

    // Modules
    var fn = {

        common : {

            align : function( input ){
                
                /*
                 *
                 * Alineación común entre todos los nodos que se pasan como parámetro
                 * 
                 * Entrada
                 * - Objeto jQuery
                 *
                 * Salida
                 * Dos posibles valores
                 * - Un string con la alineación común
                 * - Un objeto null si no hay alineación común
                 *
                 */

                var first = input.first();
                var value = input.css('text-align');
                
                input = input.not(first);

                input.each( function(){
                    
                    if( $( this ).css('text-align') !== value ){
                        value = false;
                        return false;
                    }
                    
                });
                
                if( value ){
                    return value;
                }else{
                    return null;
                }
            
            },

            font : function( input ){

                /*
                 *
                 * Tipo de letra común entre todos los nodos que se pasan como parámetro
                 * 
                 * Entrada
                 * - Objeto jQuery
                 *
                 * Salida
                 * Dos posibles valores
                 * - Un string con la familia común
                 * - Un objeto null si no hay familia común
                 *
                 */
                
                var first = input.first();
                var value = input.css('font-family');
                
                input = input.not(first);

                input.each( function(){
                    
                    if( $( this ).css('font-family') !== value ){
                        value = false;
                        return false;
                    }
                    
                });
                
                if( value ){
                    return $.trim( value.split( ',', 1 )[ 0 ] ).replace( /"|'*/mg, '' );
                }else{
                    return null;
                }
                
            },

            parent : function( input ){

                /*
                 *
                 * Padre común entre todos los nodos que se pasan como parámetro
                 * 
                 * Entrada
                 * - Objeto jQuery
                 *
                 * Salida
                 * Dos posibles valores
                 * - Un string con el padre común
                 * - Un objeto null si no hay padre común
                 *
                 */

                var p  = input.closest('p');
                var li = input.closest('li');

                if( p.size() && li.size() === 0 ){
                    return 'p';
                }else if( li.size() && p.size() === 0 ){
                    return 'li';
                }else{
                    return null;
                }
             
            },

            size : function( input ){

                /*
                 *
                 * Tamaño común entre todos los nodos que se pasan como parámetro
                 * 
                 * Entrada
                 * - Objeto jQuery
                 *
                 * Salida
                 * Dos posibles valores
                 * - Un entero con el tamaño común
                 * - Un objeto null si no hay tamaño común
                 *
                 */

                var first = input.first();
                var value = parseInt( first.css('font-size'), 10 );
                
                input = input.not( first );

                input.each( function(){
                    
                    if( parseInt( $( this ).css('font-size'), 10 ) !== value ){
                        value = false;
                        return false;
                    }
                    
                });
                
                if( value ){
                    return value;
                }else{
                    return null;
                }

            }

        },

        compare : function( firstText, secondText, full ){

            if( full ){
                return firstText === secondText;
            }

            firstText  = $( '<div></div>' ).append( $( firstText ).filter( '#content, #page' ) ).html();
            secondText = $( '<div></div>' ).append( $( secondText ).filter( '#content, #page' ) ).html();

            return firstText === secondText;

        },

        parse : {

            txt : function( text ){

                var parent   = $('<div></div>');
                var paragraf = text.split( /\r?\n/ );

                for( var i = 0; i < paragraf.length; i++ ) {

                    if( paragraf[ i ] ){
                        parent.append( $('<p></p>').text( paragraf[ i ] ) );
                    }else{
                        parent.append( $('<p></p>').html( '&nbsp;' ) );
                    }
                    

                }

                return { content : parent.html() };

            },

            weeDoc : function( data ){

                data = $( data );
                
                // To Do -> Comprobación de metas
                // To Do -> Personalización de página

                if( !data.filter('meta[name="application-name"][content="weeDoc"]').length ){
                    throw 'FILE IS NOT A WEEDOC';
                }

                var page  = data.filter('#page').children().first().attr('style').split(/;\s*/g);
                var style = {};
                var css   = {};
                var tmp   = null;

                for( var i in page ){

                    tmp = page[ i ].split(/\s*:\s*/ );

                    style[ tmp[ 0 ] ] = tmp[ 1 ];

                }

                if( style[ 'margin-top' ] ){
                    css[ 'padding-top' ] = style[ 'margin-top' ];
                }

                if( style[ 'margin-left' ] ){
                    css[ 'padding-left' ] = style[ 'margin-left' ];
                }

                if( style[ 'margin-bottom' ] ){
                    css[ 'padding-bottom' ] = style[ 'margin-bottom' ];
                }

                if( style[ 'margin-right' ] ){
                    css[ 'padding-right' ] = style[ 'margin-right' ];
                }

                return { content : data.filter('#content').html(), page : css };

            }

        },

        save : function(){

            var content = '';

            zone.find('.weetext-paper').each( function(){
                content += $( this ).html();
            });

            var page  = zone.find('.weetext-paper').first().attr('style');
            var style = {};

            if( page ){

                page = page.split(/;\s*/g);

                var tmp = null;

                for( var i in page ){

                    tmp = page[ i ].split(/\s*:\s*/ );

                    style[ tmp[ 0 ] ] = tmp[ 1 ];

                }

            }else{

            }

            // To Do -> Save file

            return wz.app.storage('createWeeDoc')( {}, content, style );

        }

    };

    // Functions
    /*
     * (void) updateState((mixed) input)
     * Actualiza los botones del menú según las propiedades de la entrada.
     */
    var updateState = function(input){
        
        input = $(input);

        var font = fn.common.font( input );
        var size = Math.round( parseFloat( wz.tool.pixelsToPoints( fn.common.size( input ) ) ) );
        
        $( '.button-typo span', menu ).text( ( font === null ) ? lang.severalFonts : font );
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
        
        var align = fn.common.align( input );
        var list  = fn.common.parent( input );

        if(align === null){
            $('.button-align',menu).removeClass('active');
        }else{
            $('.button-align-' + align, menu).addClass('active').siblings().removeClass('active');
        }

        if( list === 'li' ){
            $( '.button-bullets', menu ).addClass('active');
        }else{
            $( '.button-bullets', menu ).removeClass('active');
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
        var nodes        = getSelectedNodes( zone[ 0 ] );
        
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
    
        getBigParents( getSelectedNodes( zone[ 0 ] ) ).each( function(){
            collaborationSendSurroundedText(getChildrenIndex( $( this ) ), $( this ).html() );
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
    var renderInput = function( data, pageConfig ){

        paper.css( pageConfig );

        var height    = paper.height();
        var tmpHeight = height;
        var newPaper  = paper.clone().empty();
        var nowPaper  = paper.empty();
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

    var replaceParagraphType = function( tags, replaceStr, css ){
        
        tags.each( function(){

            tmp     = $( replaceStr ).html( $( this ).html() ).css( css );
            //newTags = newTags.add( tmp );

            $( this ).replaceWith( tmp );

        });

    };

    /*
     * (void) windowTitle( (string) title)
     * Inserta el código indicado en las páginas
     */
    var windowTitle = function( text ){
        title.text( text );
    };

    var saveFile = function( callback ){

        wz.fs( openFileID.id, function( error, structure ){

            // To Do -> Error
            if( error ){
                alert( error, null, win.data().win );
                return false;
            }

            var text = fn.save();

            structure.write( text, function( error ){

                if( error ){
                    alert( 'Error: ' + error, null, win.data().win );
                }else{

                    openFileText   = text;
                    openFileLength = openFileText.length;

                    wz.banner()
                        .title( 'weeText - ' + structure.name )
                        .text( structure.name + ' ' + lang.fileSaved )
                        .icon( 'https://static.weezeel.com/app/7/floppy.png' )
                        .render();

                    wz.tool.secureCallback( callback )();

                }

            });

        });

    };

    var createFile = function( callback ){

        callback = wz.tool.secureCallback( callback );

        prompt( lang.newName, function( name ){

            if( name === false ){
                callback( 'USER ABORT' );
                return false;
            }

            var text    = fn.save();
            var tmpName = name.split('.');

            if( tmpName[ tmpName.length - 1 ] !== 'html' ){
                name = name + '.html';
            }

            wz.fs.create( name, 'text/html', 'root', text, function( error, structure ){

                if( error ){

                    alert( error, function(){
                        createFile( callback );
                    }, win.data().win );
                    
                    return false;

                }

                openFileID     = structure;
                openFileText   = text;
                openFileLength = openFileText.length;

                windowTitle( structure.name );

                wz.banner()
                    .title( 'weeText - ' + structure.name )
                    .text( structure.name + ' ' + lang.fileSaved )
                    .icon( 'https://static.weezeel.com/app/7/floppy.png' )
                    .render();

                wz.tool.secureCallback( callback )();

            });

        }, win.data().win );

    };

    var selectStart = function( node ){

        var range = new $.Range( node );

        if( !node.text().length ){
            node.html('&nbsp;');//.addClass('empty-node');
        }
            
        range.collapse( true );
        
        range.select();

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

        var prototype = typoMenu.children('.wz-prototype');

        for( var i in fontFamily ){

            typoMenu.append(

                prototype.clone()
                    .removeClass('wz-prototype')
                    .data( 'font-family', fontFamily[ i ].value )
                    .children('span')
                        .text( fontFamily[ i ].name )
                    .parent()

            );

        }

        prototype.remove();

    };

    var generateFontSizeMenu = function(){

        var prototype = sizeMenu.children('.wz-prototype');

        for( var i in fontSize ){

            sizeMenu.append(

                prototype.clone()
                    .removeClass('wz-prototype')
                    .data( 'font-size', fontSize[ i ].value )
                    .children('span')
                        .text( fontSize[ i ].name )
                    .parent()

            );

        }

        prototype.remove();

    };

    var saveStatus = function( structure ){

        // File Info
        openFileID     = structure;
        openFileText   = fn.save();
        openFileLength = openFileText.length;

    };

    var positionMenu = function( reference, menu ){

        var refOffset = reference.offset().left;
        var refWidth  = reference.outerWidth();
        var winOffset = win.offset().left;

        menu.css( 'left', ( refOffset - winOffset ) + ( refWidth / 2 ) - ( menu.outerWidth() / 2 ) );

    };

    var openFile = function( structure ){

        if( structure.mime === 'text/plain' ){

            structure.read( function( error, data ){
                
                // To Do -> Error
                data = fn.parse.txt( data );

                data.page = {};

                renderInput( data.content, data.page );
                windowTitle( structure.name );
                saveStatus( structure );

                selectStart( $( '.weetext-paper', zone ).first().find('p, li').first() );

                //requestCollaboration( structure );

            });

        }else if(
            
            (
                structure.mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                structure.mime === 'application/vnd.oasis.opendocument.text' ||
                structure.mime === 'application/msword' ||
                structure.mime === 'text/rtf'
            ) && structure.formats.html

        ){
            
            structure.formats.html.read( function( error, data ){                    

                // To Do -> Error
                try{
                    data = fn.parse.weeDoc( data );
                }catch( e ){
                    alert( 'FILE FORMAT NOT RECOGNIZED', null, win.data().win );
                    return false;
                }

                renderInput( data.content, data.page );
                windowTitle( structure.name );
                saveStatus( structure );
                selectStart( $( '.weetext-paper', zone ).first().find('p, li').first() );

                //requestCollaboration( structure );

            });

        }else if( structure.mime === 'text/html' ){

            structure.read( function( error, data ){                    

                // To Do -> Error
                try{
                    data = fn.parse.weeDoc( data );
                }catch( e ){
                    alert( 'FILE FORMAT NOT RECOGNIZED', null, win.data().win );
                    return false;
                }

                renderInput( data.content, data.page );
                windowTitle( structure.name );
                saveStatus( structure );

                selectStart( $( '.weetext-paper', zone ).first().find('p, li').first() );

                //requestCollaboration( structure );

            });

        }else{
            alert( 'FILE FORMAT NOT RECOGNIZED', null, win.data().win );
        }
    
    };

    var requestCollaboration = function( structure ){

        var promises = [ $.Deferred(), $.Deferred() ];

        structure.sharedWith( function( error, owner, permissions, list ){
            promises[ 0 ].resolve( [ error, owner, permissions, list ] );
        });

        wz.user.connectedFriends( function( error, list ){
            promises[ 1 ].resolve( [ error, list ] );
        });

        $.when( promises[ 0 ], promises[ 1 ] )
            .then( function( shared, connected ){

                shared    = shared[ 3 ];
                connected = connected[ 1 ];

                var sharedConnected = shared.filter( function( element ){

                    for( var i in connected ){

                        if( element.id === connected[ i ].id ){
                            return true;
                        }

                    }

                    return false;

                });

                for( var i in shared ){

                    if( shared[ i ].id !== wz.system.user().id ){
                        requestCollaborationToUser( shared[ i ].id );
                    }

                }

                collaborationUsers = shared;

            });

    };

    var requestCollaborationToUser = function( userId ){

        wz.message()
            .app( 7 )
            .user( userId )
            .message( {

                command  : 'requestCollaboration',
                position : 0
                
            } )
            .send();

    };

    var collaborationAddLetter = function( childrenIndex, position, letter, text ){

        var element = zone;

        for( var i in childrenIndex ){
            element = element.children().eq( childrenIndex[ i ] );
        };

        element.html( text );

    };

    var collaborationAddLine = function( childrenIndex, text ){

        var element = zone;

        childrenIndex[ childrenIndex.length - 1 ] = childrenIndex[ childrenIndex.length - 1 ] - 1;

        for( var i in childrenIndex ){
            element = element.children().eq( childrenIndex[ i ] );
        };

        element.after( text );

    };

    var collaborationChangeParagraph = function( childrenIndex, type, css ){

        var element = zone;

        for( var i in childrenIndex ){
            element = element.children().eq( childrenIndex[ i ] );
        };

        replaceParagraphType( element, type, css );

    };

    var collaborationSurroundedText = function( childrenIndex, text ){

        var element = zone;

        for( var i in childrenIndex ){
            element = element.children().eq( childrenIndex[ i ] );
        };

        element.html( text );

    };

    var collaborationSendAddLetter = function( childrenIndex, position, letter, text ){

        for( var i in collaborationUsers ){
            collaborationSendAddLetterToUser( collaborationUsers[ i ].id, childrenIndex, position, letter, text );
        }

    };

    var collaborationSendAddLetterToUser = function( userId, childrenIndex, position, letter, text ){

        wz.message()
            .app( 7 )
            .user( userId )
            .message( {

                command       : 'addLetter',
                childrenIndex : childrenIndex,
                position      : position,
                letter        : letter,
                text          : text
                
            } )
            .send();

    };

    var collaborationSendAddLine = function( childrenIndex, text ){

        for( var i in collaborationUsers ){
            collaborationSendAddLineToUser( collaborationUsers[ i ].id, childrenIndex, text );
        }

    };

    var collaborationSendAddLineToUser = function( userId, childrenIndex, text ){

        wz.message()
            .app( 7 )
            .user( userId )
            .message( {

                command       : 'addLine',
                childrenIndex : childrenIndex,
                text          : text
                
            } )
            .send();

    };

    var collaborationSendChangeParagraph = function( childrenIndex, type, css ){

        for( var i in collaborationUsers ){
            collaborationSendChangeParagraphToUser( collaborationUsers[ i ].id, childrenIndex, type, css );
        }

    };

    var collaborationSendChangeParagraphToUser = function( userId, childrenIndex, type, css ){

        wz.message()
            .app( 7 )
            .user( userId )
            .message( {

                command       : 'changeParagraph',
                childrenIndex : childrenIndex,
                type          : type,
                css           : css
                
            } )
            .send();

    };

    var collaborationSendSurroundedText = function( childrenIndex, text ){

        for( var i in collaborationUsers ){
            collaborationSendSurroundedTextToUser( collaborationUsers[ i ].id, childrenIndex, text );
        }

    };

    var collaborationSendSurroundedTextToUser = function( userId, childrenIndex, text ){

        wz.message()
            .app( 7 )
            .user( userId )
            .message( {

                command       : 'surroundedText',
                childrenIndex : childrenIndex,
                text          : text

                
            } )
            .send();

    };

    var getChildrenIndex = function( element ){
        
        var parents       = element.add( element.parentsUntil( zone ) );
        var childrenIndex = [];

        parents.each( function(){
            childrenIndex.push( $( this ).index() );
        });

        return childrenIndex;

    };

    // Events
    win
    .on( 'app-param', function( e, params ){

        // To Do -> Comprobar que params no va vacio
        if( params && params.command === 'openFile' ){
            openFile( params.data );
        }

    })

    .on( 'click', '.wz-view-close', function( e ){

        e.stopPropagation();

        var text = fn.save();

        if( text.length === openFileLength && fn.compare( text, openFileText ) ){
            wz.view.remove();
            return false;
        }

        confirm( lang.saveChanges, function( answer ){

            if( answer ){

                if( openFileID && openFileID.mime === 'text/html' ){

                    saveFile( function(){
                        wz.view.remove();
                    });

                }else{

                    createFile( function(){
                        wz.view.remove();
                    });

                }

            }else{
                wz.view.remove();
            }

        });

    })
    
    .on( 'ui-view-blur', function(){
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
    })

    .on( 'message', function( e, data ){

        var mes = data.message;
        var com = mes.command;

        if( com === 'requestCollaboration' ){

            if( collaborationHost === true ){
                // To Do
            }else{
                // To Do
            }

            remoteCaretPrototype.clone().appendTo( $( 'p', win ) );

        }else if( com === 'addLetter' ){
            collaborationAddLetter( mes.childrenIndex, mes.position, mes.letter, mes.text );
        }else if( com === 'addLine' ){
            collaborationAddLine( mes.childrenIndex, mes.text );
        }else if( com === 'changeParagraph' ){
            collaborationChangeParagraph( mes.childrenIndex, mes.type, mes.css );
        }else if( com === 'surroundedText' ){
            collaborationSurroundedText( mes.childrenIndex, mes.text );
        }

    })

    .on( 'mousedown', 'menu', function( e ){
        e.preventDefault();
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

        if( openFileID && openFileID.mime === 'text/html' ){
            saveFile();
        }else{
            createFile();
        }

    })

    .on( 'click', '.weetext-options-new', function(){

        alert( lang.notWorking, null, win.data().win );

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

        newTags.each( function(){
            collaborationSendChangeParagraph( getChildrenIndex( $( this ) ), replaceStr, css );
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
        
    })

    .on( 'keyup', function( e ){

        var allTags       = getSelectedTags( this );
        var tag           = allTags.first();
        var text          = tag.text();
        var selection     = tag.selection();
        var selStart      = selection.start - 1;
        var selEnd        = selection.end;
        var letter        = text.slice( selStart, selEnd );
        var childrenIndex = getChildrenIndex( tag );

        if( e.which === 13){

            collaborationSendAddLine( childrenIndex, $('<div></div>').append( tag.clone() ).html() );

            // To Do -> Eliminar esto cuando se implemente eliminaciones masivas
            childrenIndex[ childrenIndex.length - 1 ] = childrenIndex[ childrenIndex.length - 1 ] - 1;
            collaborationSendAddLetter( childrenIndex, selStart, letter, tag.prev().html() );

        }else{
            collaborationSendAddLetter( childrenIndex, selStart, letter, tag.html() );
        }

        var page    = allTags.closest('.weetext-paper');
        var current = allTags.closest('p, li');
        var rows    = current.prevAll('p, li').add( current );
        var top     = 0;

        if( current.length && e.which !== 8 ){

            rows.each( function(){
                top += $(this).outerHeight( true );
            });

            if( top > page.height() ){

                if( !page.next('.weetext-paper').length ){
                    page.after( paper.clone().empty() );
                }

                current.appendTo( page.next('.weetext-paper') );

                selectEnd( current );

            }

        }else{

            var prev = page.prev('.weetext-paper');

            if( prev.length ){

                page.remove();
                selectEnd( prev.children('p, li').last() );

            }

        }

    });

    // Create Menus
    generateFontFamilyMenu();
    generateFontSizeMenu();

    // Insert Pointer
    $( '.weetext-paper', zone ).first().focus();

    var paragraph = $( '.weetext-paper', zone ).first().find('p, li').last();

    selectStart( paragraph );

    normalizeSelection();
    updateState( getSelectedTags( zone[ 0 ] ) );

    // Default state
    var openFileID     = null;
    var openFileText   = fn.save();
    var openFileLength = openFileText.length;

    // Save status
    //saveStatus( null ); // To Do -> Ver que es esto
