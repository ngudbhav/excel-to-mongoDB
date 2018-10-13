
"use strict";

var readExcel = require('read-excel-file/node');
var fs = require('fs');
var mongoose = require('mongoose');

function formatDate(date) {
	var d = new Date(date),
	month = '' + (d.getMonth() + 1),
	day = '' + d.getDate(),
	year = d.getFullYear();
	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;
	return [year, month, day].join('-');
}

var noOfOperations = 0;

function isDate(d){
	return d instanceof Date && !isNaN(d);
}

exports.covertToMongo = function(data, options, callback){
	if(typeof options === 'function'){
		callback = options;
		options = {};
	}
	noOfOperations = 0;
	return new Promise((resolve, reject) => {
		console.log(data);
		var connectionString = 'mongodb://'+data.host+':27017/'+data.db;
		mongoose.connect(connectionString);
		if(options.verbose === true){
			mongoose.connection.on('connected',()=>{
				console.log('connected to database');
			});
		}
		readExcel(fs.createReadStream(data.path)).then((rows) => {
			var progress = 1;
			var schema = {};
			for(var i in rows[0]){
				noOfOperations = 0;
				rows[0][i] = rows[0][i].split(" ").join("_");
				if(typeof(rows[1][i]) === 'number'){
					schema[rows[0][i]] = 'Number';
				}
				else if(typeof(rows[1][i]) === 'string'){
					schema[rows[0][i]] = 'String';
				}
				else if(typeof(rows[1][i]) === 'object'){
					if(isDate(rows[1][i])){
						schema[rows[0][i]] = 'Date';
						for(var j=1;j<rows.length;j++){
							rows[j][i] = formatDate(rows[j][i]);
						}
					}
					else{
						reject(error);
						return callback(error);
					}
				}
				else if(typeof(rows[1][i])==='boolean'){
					schema[rows[0][i]] = 'Boolean';
				}
			}
			console.log(schema);
			var t = require('./modelCreateApi').createModel(schema, data.collection);
			var colData = [];
			for(var i=1;i<rows.length;i++){
				var obj = {};
				for(var j in rows[i]){
					obj[rows[0][j]] = rows[i][j];
				}
				colData.push(obj);
			}
			console.log(colData);
			t.insertMany(colData, function(error, results){
				if(error){
					resolve(error);
					return callback(error);
				}
			});
		});
	});
}