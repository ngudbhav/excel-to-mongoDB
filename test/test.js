"use strict";

var excelToMYSQL = require('../index.js');

var data = {
	host: "localhost",
	path: "test/sample1.xlsx",
	collection: "sample",
	db: "ug"
};

excelToMYSQL.covertToMongo(data, {verbose:true, customStartEnd: true, startRow:1, startCol: 1, endRow: 100, endCol: 10}, function(error, results){
	if(error) throw error;
	else{
		console.log(results);
	}
});