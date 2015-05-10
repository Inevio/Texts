
var TemporalStyle = function(){
	this.attributes = {};	
};

TemporalStyle.prototype.clear = function(){
	
	this.attributes = {};

	return this;

};

TemporalStyle.prototype.get = function( type ){
	return this.attributes[ type ];
};

TemporalStyle.prototype.set = function( type, value ){

	if( value ){
		this.attributes[ type ] = value;
	}else{
		delete this.attributes[ type ];
	}

	console.log( this.attributes );

	return this;

};
