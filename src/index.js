
"use strict";

const readExcel = require('read-excel-file/node');
const fs = require('fs');
const mongoose = require('mongoose');
const csv = require('csvtojson');
const exec = require('child_process').exec;
const path = require('path');

var noOfOperations = 0;

//format the date to mongodb format
const formatDate = function (date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

//Check if the object is date
const isDate = function (d){
  return d instanceof Date && !isNaN(d);
};

const rowsFromFile = async function(filePath, callback) {
  const extension = filePath.toString().slice(filePath.toString().length-3, filePath.toString().length);
  if(extension === 'csv' || extension === 'CSV'){
    fs.readFile(filePath, 'utf8', function(error, fileContent){
      if (error) {
        return callback(error);
      }
      else {
        csv({
          noheader: true,
          output: "csv"
        }).fromString(fileContent)
          .then(function(rows) {
            callback(null, rows);
          });
      }
    });
  } else {
    readExcel(fs.createReadStream(filePath)).then(function(rows) {
      callback(null, rows);
    });
  }
};

const createModel = function(connection, schema, modelName){
  const mongooseSchema = new mongoose.Schema(schema);
  try{
    return connection.model(modelName, mongooseSchema);
  }
  catch(_error) {
    //In case of the model already exists in the memory
    //This is added so that this package can be used with loops.
    return connection.model(modelName);
  }
}

/**
 * Dumps data directly into collection
 * @param data {object}
 * @param options {object}
 * @param callback {function}
 */
exports.covertToMongo = function(data, options, callback){
  //optional parameter 'options'
  if(typeof options === 'function'){
    callback = options;
    options = {};
  }
  noOfOperations = 0;
  return new Promise(function(resolve, reject) {
    if (!data.db || !data.collection) {
      reject('Undefined database or collection found. If this intentional, please paas them as string');
      return callback('Undefined database or collection found. If this intentional, please paas them as string');
    }

    var sRow = 0;
    var eRow = 0;
    var sCol = 0;
    var eCol = 0;
    const port = data.port || 27017;
    const connectionString = 'mongodb://'+data.host+':'+port+'/'+data.db;

    //Try to connect with the provided credentials
    const connection = data.connection
      || mongoose.createConnection(connectionString, {
        user: data.user, pass: data.pass,
      });

    connection.on('error', function(error) {
      reject(error);
      return callback(error);
    });

    if(options.safeMode){
      if(options.verbose){
        console.log('Backing up Database');
      }
      //Dump the database in case safe mode is set
      const destination = options.destination ? options.destination : path.resolve(process.cwd())
      exec('mongodump -u ' + data.user + ' -p ' + data.pass + ' --host ' + data.host + ' --db ' + data.db + ' --out ' + '\"' + destination + '\"', function(error, stdout, stderr){
        if(error){
          if(process.platform === 'win32'){
            reject('It seems that mongo\'s bin is not in your environment path. Go to https://github.com/ngudbhav/excel-to-mongodb to see the steps to rectify this issue.');
            return callback('It seems that mongo\'s bin is not in your environment path. Go to https://github.com/ngudbhav/excel-to-mongodb to see the steps to rectify this issue.');
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

    connection.on('connected', function() {
      rowsFromFile(data.path, function(error, rows) {
        if (error) {
          reject(error);
          return callback(error);
        } else {
          var schema = {};
          if(options.customStartEnd === true){
            //No need to parse the all the rows
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
          //Scan the second row to check for the datatypes.
          for(var i = sCol; i < eCol; i++){
            noOfOperations = 0;
            rows[sRow][i] = rows[sRow][i].split(" ").join("_");
            if(typeof(rows[sRow+1][i]) === 'number'){
              schema[rows[sRow][i]] = 'Number';
            }
            else if(typeof(rows[sRow+1][i]) === 'string'){
              schema[rows[sRow][i]] = 'String';
            }
            //MS Excel date is object in javascript.
            else if(typeof(rows[sRow+1][i]) === 'object'){
              if(isDate(rows[sRow+1][i])){
                schema[rows[sRow][i]] = 'Date';
                for(var j=sRow+1;j<eRow;j++){
                  rows[j][i] = formatDate(rows[j][i]);
                }
              }
              else{
                //In case of unsupported datatype
                reject("Datatype unrecognized");
                return callback("Datatype unrecognized");
              }
            }
            //0 or 1 also corresponds to bool
            else if(typeof(rows[sRow+1][i])==='boolean'){
              schema[rows[sRow][i]] = 'Boolean';
            }
          }

          var colData = [];
          //Create insertion object to send to insertMany API of mongoose
          for(var i = sRow+1; i < eRow; i++){
            var obj = {};
            for(var j in rows[i]){
              obj[rows[sRow][j]] = rows[i][j];
            }
            colData.push(obj);
          }

          //Create and compile the model to enable mongoose API.
          const model = createModel(connection, schema, data.collection);
          //Send the data to database
          model.insertMany(colData, function(error, results){
            if(error){
              reject(error);
              return callback(error);
            }
            else{
              //Clear memory and delete the model to enable concurrent insertions
              delete connection.models[model];
              if (data.endConnection !== false) {
                connection.close();
              }
              resolve(results);
              return callback(null, results);
            }
          });
        }
      });
    });
  });
}
