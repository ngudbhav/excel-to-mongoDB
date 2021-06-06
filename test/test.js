"use strict";

const excelToMongo = require('../src/index.js');

function generateOutput(error, resultIsError, results) {
	if(error) {
		if (resultIsError) {
			console.log(error);
			console.log('\x1b[36m%s\x1b[0m', 'Passed!');
		} else {
			throw error;
		}
	}
	else{
		if (resultIsError) {
			throw new Error('Failure! No error detected');
		} else {
			// console.log(results);
			console.log('\x1b[36m%s\x1b[0m', 'Passed!');
		}
	}
}

const initialData = {
	host: "localhost",
	path: "test/sample1.xlsx",
	collection: "sample",
	db: "ug",
	user: "",
	pass: "",
	connection: "",
	endConnection: true,
};

const initialOptions = {
	safeMode:false,
	verbose:true,
	customStartEnd: false,
	startRow:1,
	startCol: 1,
	endRow: 100,
	endCol: 10,
	destination: '',
};

async function convert(data, additionalOptions, resultIsError= false) {
	await excelToMongo.covertToMongo(data, additionalOptions, function(error, results){
		generateOutput(error, resultIsError, results);
	});
};

(async function beginTest() {
	// Sanity test for the end result
	console.log('\x1b[36m%s\x1b[0m', 'Sanity test started');
	// await convert(initialData, initialOptions);

	// Authentication Error Test
	initialData["user"] = 'ngudbhav';
	console.log('\x1b[36m%s\x1b[0m', 'Authentication test started');
	await convert(initialData, initialOptions, true);

	initialData["pass"] = 'ngudbhav';
	console.log('\x1b[36m%s\x1b[0m', 'Authentication test started');
	// await convert(initialData, initialOptions, false);

	// Invalid Database
	initialData["db"] = undefined;
	console.log('\x1b[36m%s\x1b[0m', 'Invalid DB test started');
	// await convert(initialData, initialOptions, true);
})();
