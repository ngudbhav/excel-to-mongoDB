# excel-to-mongoDB

[![Build Status](https://travis-ci.com/ngudbhav/excel-to-mongoDB.svg?branch=master)](https://travis-ci.com/ngudbhav/excel-to-mongoDB)
[![CircleCI](https://circleci.com/gh/ngudbhav/excel-to-mongoDB.svg?style=svg)](https://circleci.com/gh/ngudbhav/excel-to-mongoDB)

This module converts your correctly formatted Excel spreadsheet to a collection in specified database in MongoDB.

## Excel Formats Supported

Supported Excel formats are XLS/XLSX/CSV

## Spreadsheet Format

Please have a look at the sample Excel sheets provided to have a clear view of the File. <a href="https://go.microsoft.com/fwlink/?LinkID=521962">Microsoft Sample Sheet</a>

## Installation

```sh
npm install excel-to-mongoDB --save
```

## Testing

```sh
git clone https://github.com/ngudbhav/excel-to-mongoDB.git
cd excel-to-mongoDB/
```

Navigate to the folder.

```sh
cd test/
nano test.js
```

Now this file needs the MongoDB credentials. Provide those credentials in String format and save by pressing the following keys.

```sh
'CTRL+X'
'Y'
'Return'
```

Get back and test the module.

```sh
cd ..
npm test
```

## Using

Note: Please correctly format the excel sheet else this won't work.

```sh
var excelMongo = require('excel-to-mongoDB');
```

This module needs 3 arguments.
The first one is the object with your credentials.

```sh
var credentials = {
	host: host,
	path: path for the excel file,
	collection: Collection name for creation,
	db: Your Database name
};
```

The second one is an optional argument of options with default values as follows.

```sh
var options = {
	safeMode: false //Backup the db to the current working directory in dump/<db> folder.
	verbose: false //Console.log the current step processing.
	customStartEnd: false //Custom insert the row and columns rather than full excel-file. Do take care! Specifying endRow or endCol may result in insertion of redundant data.
	startRow: <required> //Valid only if customStartEnd is true. Defines the start Row of the data.
	endRow: <required> //Valid only if customStartEnd is true. Defines the end Row of the data.
	startCol: <required> //Valid only if customStartEnd is true. Defines the start Column of the data.
	endCol: <required> //Valid only if customStartEnd is true. Defines the end Column of the data.
}
```

The third argument is the callback function which should be executed.

```sh
excelMongo.covertToMongo(credentials, options, callback); //returns documents inserted in the database.
```

## Error in safeMode option

```sh
Windows users need to add the following path to the environment path variable.
C:\Program Files\MongoDB\Server\<version>\bin

Right click 'This PC', head to 'properties' and 'Advanced System Settings'. From there, Click on 'Environment Variables'. Under System Variables, Search for 'PATH'. Double click the entry, click on new and add the above path.
Restart your console and you should be good to go.

Linux/Unix Users please check your installation or .bashrc.
```

## Want to covert to MYSQL instead?

We have got you covered! <a href="https://github.com/ngudbhav/excel-to-mysql">Github Link</a>.

## Want to use the GUI instead?

We have got you covered! <a href="https://github.com/ngudbhav/TriCo-electron-app">Github Link</a>.
