//var mkdirp = require('mkdirp');
var crypto = require('crypto');
var mysql = require('mysql');


//mkdirp.sync('var/db');

var db = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword"
  });

function runQuery(db, sql_code){
    db.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        con.query(sql_code, function (err, result) {
          if (err) throw err;
          console.log("Code Executed!");
        });
      });
}

function runModQuery(db, sql_code, obj){
    db.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        con.query(sql_code,obj, function (err, result) {
          if (err) throw err;
          console.log("Code Executed!");
        });
      });
}

function dbInit() {
  // create the database schema for the todos app
  runQuery(db,"CREATE TABLE IF NOT EXISTS users ( \
    username TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB \
  )");
  
  runQuery(db,"CREATE TABLE IF NOT EXISTS todos ( \
    owner_id INTEGER NOT NULL, \
    title TEXT NOT NULL, \
    completed INTEGER \
  )");
  
  // create an initial user (username: alice, password: letmein)
  var salt = crypto.randomBytes(16);
  runModQuery(db,'INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    'alice',
    crypto.pbkdf2Sync('letmein', salt, 310000, 32, 'sha256'),
    salt
  ]);
};


exports.db = db;
exports.dbInit = dbInit();
exports.runQuery = runQuery();
exports.runModQuery = runModQuery();
