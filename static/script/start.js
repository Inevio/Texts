
if( !params || params.command !== 'openFile' ){
    return start();
}

var views = api.app.getViews().not( this );
var found = false;

views.each( function(){

    if( $(this).data('getOpenedId')() === params.data ){

        api.app.viewToFront( this );

        found = true;

        return false;

    }

});

if( found ){
    api.app.removeView( this );
}else{
    start();
}
