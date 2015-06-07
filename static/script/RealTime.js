
var RealTime = function(){

    this.controller = undefined;
    this.status     = USER_VIEWING;
    this.users      = [];

};

RealTime.prototype.addUser = function( user ){

    if( user.id === wz.system.user().id ){
        return this;
    }

    var found = false;

    for( var i = 0; i < this.users.length; i++ ){

        if( this.users[ i ].id === user.id ){
            found = true;
            break;
        }

    }

    if( !found ){

        user.status = USER_VIEWING;

        this.users.push( user );
        this.setUserStatus( user.id, user.status );

    }

    return this;

};

RealTime.prototype.requestUsersStatus = function(){
    this.controller.send( { cmd : 'getStatus' } );
};

RealTime.prototype.setController = function( controller ){

    this.controller = controller;

    var that = this;

    this.controller.connect( function(){

        controller.getUserList( true, function( error, list ){

            that.requestUsersStatus(); // Lo llamamos después de tener el listado de usuarios para evitar problemas de concurrencia

            // To Do -> Error

            for( var i = 0; i < list.length; i++ ){
                that.addUser( list[ i ] );
            }

        });

    });

    this.controller.on( 'message', function( info, message ){

        if( info.selfUser ){
            return;
        }

        if( message.cmd === 'getStatus' ){
            that.controller.send( { cmd : 'setStatus', status : that.status } );
        }else if( message.cmd === 'setStatus' ){
            that.setUserStatus( info.sender, message.status );
        }

    });

    this.controller.on( 'userConnect', function( info ){

        if( info.selfUser ){
            return;
        }

        wz.user( info.sender, function( error, user ){

            // To Do -> Error
            that.addUser( user );

        });

    });

    return this;

};

RealTime.prototype.setStatus = function( status ){

    if( this.status >= status ){
        return this;
    }

    this.status = status;

    this.controller.send( { cmd : 'setStatus', status : status } );

    return this;

};

RealTime.prototype.setUserStatus = function( userId, status ){

    var user;

    for( var i = 0; i < this.users.length; i++ ){

        if( this.users[ i ].id === userId ){
            user = this.users[ i ];
            break;
        }

    }

    if( !user ){
        return this;
    }

    user.status = status;

    var userDom = collaborativeList.find( '.user-' + userId );

    if( !userDom.length ){

        userDom = collaborativeProto.clone().removeClass('wz-prototype').addClass( 'user-' + userId );

        userDom.find('.name').text( user.fullName );
        userDom.find('.profile-pic').attr( 'src', user.avatar.tiny );

    }

    collaborativeList
        .find( '.' + USER_STATUSES[ status ] )
        .addClass('active')
        .append( userDom )
        .siblings('.status.active')
        .each( function(){

            if( !$(this).find('.user').length ){

                $(this).removeClass('active');

            }

        });

    return this;

};
