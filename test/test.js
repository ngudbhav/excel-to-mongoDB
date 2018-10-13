"use strict";

var excelToMYSQL = require('../index.js');

var data = {
	host: "localhost",
	path: "test/sample1.xlsx",
	collection: "sample",
	db: "ug"
};

excelToMYSQL.covertToMongo(data, {verbose:true}, function(error, results){
	if(error) throw error;
	else{
		console.log(results);
	}
});