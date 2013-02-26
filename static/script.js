
wz.app.addScript( 7, 'common', function( win ){
    
    // Cache Elements
    var zone  = $( '.weetext-paper-zone', win );
    var menu  = $( '.stupid-container', win );
    var title = $( '.weetext-paper-title span', win );

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

    // Functions
    /*
     * (void) updateState((mixed) input)
     * Actualiza los botones del menú según las propiedades de la entrada.
     */
    var updateState = function(input){
        
        input = $(input);
        
        $( '.button-font-type span', menu ).text( commonFont( input ) );
        $( '.button-font-size span', menu ).text( Math.round( parseFloat( wz.tool.pixelsToPoints( commonSize( input ) ) ) ) );
        
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
        
        var tags = getSelectedTags( zone[ 0 ] ).filter('p');
        
        if( tags.size() === 1 && tags.text().length === 0 ){
            
            // To Do -> Nodo vacio
            
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
            
            if(parent.is('p')){
                
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
        return reference.closest('p');
    };

    /*
     * (void) renderInput( (string) data)
     * Inserta el código indicado en las páginas
     */
    var renderInput = function( data ){
        $( '.weetext-paper', zone ).first().html( data );
    };

    /*
     * (void) windowTitle( (string) title)
     * Inserta el código indicado en las páginas
     */
    var windowTitle = function( text ){
        title.text( text );
    };

    var extractText = function(){
        return $.trim( $( '.weetext-paper', zone ).first().html() );
    };

    var saveFile = function( callback ){

        wz.structure( openFileID, function( error, structure ){

            // To Do -> Error
            if( error ){
                alert( error );
                return false;
            }

            console.log('save');
            var text = extractText();
            console.log('text', text);

            structure.write( text, function( error ){

                if( error ){
                    alert( 'Error: ' + error );
                }else{

                    console.log('guardado',error);
                    openFileText   = text;
                    openFileLength = openFileText.length;

                    wz.banner()
                        .title( 'weeText - ' + structure.name )
                        .text( 'Archivo guardado' )
                        .append();

                    wz.tool.secureCallback( callback )();

                }

            });

        });

    };

    var createFile = function( callback ){

        var name = prompt( 'Nombre del nuevo documento' );
        var text = extractText();

        wz.createStructure( name, 'text/plain', 'root', text, function( error, structure ){

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
                .append();

            wz.tool.secureCallback( callback )();

        });

    };

    // File Info
    var openFileID     = null;
    var openFileText   = extractText();
    var openFileLength = openFileText.length;

    // Events
    win
    .on( 'app-param', function( e, params ){

        // To Do -> Comprobar que params no va vacio

        wz.structure( params[ 0 ], function( error, structure ){
            
            structure.read( function( error, data ){

                if( data.split('\n')[ 0 ] !== '<!-- weedoc -->' ){
                    alert( 'FILE FORMAT NOT RECOGNIZED' );
                    return false;
                }

                openFileID     = structure.id;
                openFileText   = data;
                openFileLength = openFileText.length;

                renderInput( data );
                windowTitle( structure.name );

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

        if( confirm( '¿Desea guardar los cambios?' ) ){

            if( openFileID ){

                console.log(openFileID);
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

    });

    menu
    .on( 'mousedown', '.weetext-option', function( e ){
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
        
    });

    zone
    .on( 'mouseup', function( e ){
        
        normalizeSelection();
        updateState( getSelectedTags( this ) );
        
    });




    // Insert pointer
    /*
    var firstPaper = $( '.weetext-paper', zone ).first();
    var firstText  = firstPaper.text();

    /*if( firstText.length ){

        console.log( firstText.length );

        firstPaper
            .text( firstText + ' ' );

            console.log( firstPaper.text(), firstPaper.text().length );
        firstPaper
            .selection( firstText.length - 1, firstText.length )
            .text( firstText )
            .focus();

    }else{

        firstPaper
            .text(' ')
            .selection(0,0) // To Do -> Probar con solo 0
            .text('')
            .focus();

    }*/

});
