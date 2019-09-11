exports.createModel = function(schema, t){
	var mongoose = require('mongoose');
	var colf = new mongoose.Schema(schema);
	try{
		return mongoose.model(t, colf);
	}
	catch(e) {
		//In case of the model already exists in the memory
		//This is added so that this package can be used with loops.
		return mongoose.model(t);	
	}
}