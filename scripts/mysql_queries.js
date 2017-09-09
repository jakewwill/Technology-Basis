var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);
connection.query('use ' + dbconfig.database);

// Put your queries here

connection.end();