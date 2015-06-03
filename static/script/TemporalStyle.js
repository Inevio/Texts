
var TemporalStyle = function(){
	this.attributes = {};
};

TemporalStyle.prototype.clear = function(){

	this.attributes = {};

	return this;

};

TemporalStyle.prototype.get = function( type ){

	if( type ){
		return this.attributes[ type ];
	}else{
		return this.attributes;
	}

};

TemporalStyle.prototype.set = function( type, value ){


	this.attributes[ type ] = value;
	
	return this;

};
