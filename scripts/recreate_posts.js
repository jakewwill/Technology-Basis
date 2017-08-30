var mysql = require('mysql');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);
connection.query('use ' + dbconfig.database);

// Posts
var insertQuery = "INSERT INTO posts ( username, title, description, tags, folder_name, slug ) values (?,?,?,?,?,?)";
connection.query(insertQuery, ["jwill18@punahou.edu", 'NodeJS & Express "esc is not a function"', 'When developing your website, did you come across the error message "esc is not a function"? Well...', "NodeJS, Website Development, Javascript", "nodejs-express-esc-is-not-a-function", "nodejs-express-esc-is-not-a-function"]);

connection.query(insertQuery, ["jwill18@punahou.edu", 'Error! MySQL server PID file could not be found!', 'Setting up MySQL should be simple, but errors like these can make the task much more complicated than it has to be. Solutions...', "MySQL, Website Development, MacOS", "error-mysql-server-pid-file-could-not-be-found", "error-mysql-server-pid-file-could-not-be-found"]);

connection.query(insertQuery, ["jwill18@punahou.edu", 'MySql ERROR! The server quit without updating PID file', 'Setting up MySQL should be simple, but errors like these can make the task much more complicated than it has to be. Solutions...', "MySQL, Website Development, MacOS", "error-mysql-the-server-quit-without-updating-pid-file", "error-mysql-the-server-quit-without-updating-pid-file"]);

connection.query(insertQuery, ["jwill18@punahou.edu", 'Pagination in NodeJS/Express using EJS', 'Pagination may seem like a simple thing in most languages, but the exact syntax can sometimes be a little tricky. In...', "Pagination, NodeJS, EJS, Express", "pagination-in-nodejs-express-using-ejs", "pagination-in-nodejs-express-using-ejs"]);

// Games
var insertQuery = "INSERT INTO games ( username, title, description, folder_name, slug ) values (?,?,?,?,?)";
connection.query(insertQuery, ["jwill18@punahou.edu", 'Tic-tac-toe', 'When developing your website, did you come across the error message "esc is not a function"? Well...', "NodeJS, Website Development, Javascript", "nodejs-express-esc-is-not-a-function", "nodejs-express-esc-is-not-a-function"]);

connection.end();