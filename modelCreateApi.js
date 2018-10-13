exports.createModel = function(schema, t){
	var mongoose = require('mongoose');
	var colf = new mongoose.Schema(schema);
	return mongoose.model(t, colf);
}