# excel-to-mongoDB 
This module converts your correctly formatted Excel spreadsheet to a collection in specified database in MongoDB.

# Excel Formats Supported
Supported Excel formats are XLS/XLSX

# Spreadsheet Format
Please have a look at the sample Excel sheets provided to have a clear view of the File. <a href="https://go.microsoft.com/fwlink/?LinkID=521962">Microsoft Sample Sheet</a>

# Installation
```sh
npm install excel-to-mongoDB --save
```

# Testing

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
# Using
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
	verbose: false //Console.log the row number as per the excel file, if true.
}
```
The third argument is the callback function which should be executed.

```sh
excelMongo.covertToMongo(credentials, options, callback);
```

# Want to covert to MYSQL instead?
We have got you covered! <a href="https://github.com/ngudbhav/excel-to-mysql">Github Link</a>.

# Want to use the GUI instead?
We have got you covered! <a href="https://github.com/ngudbhav/excel-to-mysql-electron-app">Github Link</a>.