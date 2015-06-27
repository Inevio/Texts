
if( !params || params.command !== 'openFile' ){
    start();
}

var views = wz.app.getViews().not( this );
var found = false;

views.each( function(){

    if( $(this).data('getOpenedId')() === params.data ){

        wz.app.viewToFront( this );

        found = true;

        return false;

    }

});

if( found ){
    wz.app.removeView( this );
}else{
    start();
}
