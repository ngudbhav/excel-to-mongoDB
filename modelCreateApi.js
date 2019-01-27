exports.createModel = function(schema, t){
	var mongoose = require('mongoose');
	var colf = new mongoose.Schema(schema);
	try{
		return mongoose.model(t, colf);
	}
	catch(e) {
		return mongoose.model(t);	
	}
}