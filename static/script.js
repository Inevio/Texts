
wz.app.addScript( 7, 'common', function( win ){
    
    // Cache Elements
    var zone = $( '.weetext-paper-zone', win );
    var menu = $( '.stupid-container', win );

    // Local Info
    var list = {

        'font-weight' : {

             lighter : '100',
             normal  : '400',
             bold    : '700',
             bolder  : '800'

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
            $('.button-align-'+align,menu).addClass('active').siblings().removeClass('active');
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

    // Events
    zone
    .on('mouseup',function(e){
        
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
