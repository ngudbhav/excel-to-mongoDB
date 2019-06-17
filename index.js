
"use strict";

var readExcel = require('read-excel-file/node');
var fs = require('fs');
var mongoose = require('mongoose');
const csv=require('csvtojson');
var exec = require('child_process').exec;

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
		var sRow = 0;
		var eRow = 0;
		var sCol = 0;
		var eCol = 0;
		var connectionString = 'mongodb://'+data.host+':27017/'+data.db;
		if(options.safeMode){
			if(options.verbose){
				console.log('Backing up Database');
			}
			exec('mongodump --host '+data.host+' --db '+data.db+' --out '+'\"'+path.resolve(process.cwd())+'\"', function(error, stdout, stderr){
				if(error){
					if(options.verbose){
						console.log(error);
					}
					if(process.platform == 'win32'){
						reject('It seems that mongo\'s bin is not in your environment path. Go to https://github.com/ngudbhav/excel-tomongodb to see the steps to rectify this issue.');
						return callback('It seems that mongo\'s bin is not in your environment path. Go to https://github.com/ngudbhav/excel-tomongodb to see the steps to rectify this issue.');
					}
					else{
						reject('There seems to be an issue with your mongodb installation as we are unable to find mongodump file in environment path.');
						return callback('There seems to be an issue with your mongodb installation as we are unable to find mongodump file in environment path.');
					}
				}
				else{
					if(options.verbose){
						console.log(stderr);
						console.log(stdout);
					}
				}
			});
		}
		mongoose.connect(connectionString, function(error){
			if(error){
				reject(error);
				return callback(error);
			}
			else{
				if(options.verbose === true){
					mongoose.connection.on('connected',()=>{
						console.log('connected to database');
					});
				}
				var d = (data.path).toString().slice(data.path.toString().length-3, data.path.toString().length);
				if(d == 'csv' || d == 'CSV'){
					fs.readFile(data.path, 'utf8', function(error, sdata){
						csv({
						    noheader:true,
						    output: "csv"
						})
						.fromString(sdata)
						.then((rows)=>{
							var progress = 1;
							var schema = {};
							if(options.customStartEnd === true){
								if(options.startRow && options.startCol && options.endRow && options.endCol){
									sRow = options.startRow-1;
									eRow = options.endRow;
									sCol = options.startCol-1;
									eCol = options.endCol;
								}
								else{
									reject("Custom Start End requires all 4 points to be declared, i.e., Start Row, Start Column, End Row, End Column. It Seems one or more end points are not declared.");
									return callback("Custom Start End requires all 4 points to be declared, i.e., Start Row, Start Column, End Row, End Column. It Seems one or more end points are not declared.");
								}
							}
							else{
								eCol = rows[0].length;
								eRow = rows.length;
							}
							for(var i=sCol;i<eCol;i++){
								noOfOperations = 0;
								rows[sRow][i] = rows[sRow][i].split(" ").join("_");
								if(typeof(rows[sRow+1][i]) === 'number'){
									schema[rows[sRow][i]] = 'Number';
								}
								else if(typeof(rows[sRow+1][i]) === 'string'){
									schema[rows[sRow][i]] = 'String';
								}
								else if(typeof(rows[sRow+1][i]) === 'object'){
									if(isDate(rows[sRow+1][i])){
										schema[rows[sRow][i]] = 'Date';
										for(var j=sRow+1;j<eRow;j++){
											rows[j][i] = formatDate(rows[j][i]);
										}
									}
									else{
										reject(error);
										return callback(error);
									}
								}
								else if(typeof(rows[sRow+1][i])==='boolean'){
									schema[rows[sRow][i]] = 'Boolean';
								}
							}
							var t = require('./modelCreateApi').createModel(schema, data.collection);
							var colData = [];
							for(var i=sRow+1;i<eRow;i++){
								var obj = {};
								for(var j in rows[i]){
									obj[rows[sRow][j]] = rows[i][j];
								}
								colData.push(obj);
							}
							t.insertMany(colData, function(error, results){
								if(error){
									reject(error);
									return callback(error);
								}
								else{
									delete mongoose.connection.models[t];
									mongoose.connection.close();
									resolve(results);
									return callback(null, results);
								}
							});
						});
					});
				}
				else{
					readExcel(fs.createReadStream(data.path)).then((rows) => {
						var progress = 1;
						var schema = {};
						if(options.customStartEnd === true){
							if(options.startRow && options.startCol && options.endRow && options.endCol){
								sRow = options.startRow-1;
								eRow = options.endRow;
								sCol = options.startCol-1;
								eCol = options.endCol;
							}
							else{
								reject("Custom Start End requires all 4 points to be declared, i.e., Start Row, Start Column, End Row, End Column. It Seems one or more end points are not declared.");
								return callback("Custom Start End requires all 4 points to be declared, i.e., Start Row, Start Column, End Row, End Column. It Seems one or more end points are not declared.");
							}
						}
						else{
							eCol = rows[0].length;
							eRow = rows.length;
						}
						for(var i=sCol;i<eCol;i++){
							noOfOperations = 0;
							rows[sRow][i] = rows[sRow][i].split(" ").join("_");
							if(typeof(rows[sRow+1][i]) === 'number'){
								schema[rows[sRow][i]] = 'Number';
							}
							else if(typeof(rows[sRow+1][i]) === 'string'){
								schema[rows[sRow][i]] = 'String';
							}
							else if(typeof(rows[sRow+1][i]) === 'object'){
								if(isDate(rows[sRow+1][i])){
									schema[rows[sRow][i]] = 'Date';
									for(var j=sRow+1;j<eRow;j++){
										rows[j][i] = formatDate(rows[j][i]);
									}
								}
								else{
									reject(error);
									return callback(error);
								}
							}
							else if(typeof(rows[sRow+1][i])==='boolean'){
								schema[rows[sRow][i]] = 'Boolean';
							}
						}
						var t = require('./modelCreateApi').createModel(schema, data.collection);
						var colData = [];
						for(var i=sRow+1;i<eRow;i++){
							var obj = {};
							for(var j in rows[i]){
								obj[rows[sRow][j]] = rows[i][j];
							}
							colData.push(obj);
						}
						t.insertMany(colData, function(error, results){
							if(error){
								reject(error);
								return callback(error);
							}
							else{
								delete mongoose.connection.models[t];
								mongoose.connection.close();
								resolve(results);
								return callback(null, results);
							}
						});
					});
				}
			}
		});
	});
}