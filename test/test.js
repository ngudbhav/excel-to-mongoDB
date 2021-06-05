"use strict";

const excelToMongo = require('../src/index.js');

const data = {
	host: "localhost",
	path: "test/test.csv",
	collection: "sample",
	db: "ug",
	user: "",
	pass: "",
	connection: "",
	endConnection: true,
};

const additionalOptions = {
	safeMode:false,
	verbose:true,
	customStartEnd: false,
	startRow:1,
	startCol: 1,
	endRow: 100,
	endCol: 10,
	destination: '',
};

excelToMongo.covertToMongo(data, additionalOptions, function(error, results){
	if(error) throw error;
	else{
		console.log(results);
	}
});