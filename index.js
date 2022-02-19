const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var db = require('../db');

var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');

var SQLiteStore = require('connect-sqlite3')(session);

const app = express()
const port = 3000



const Datastore = require('@yetzt/nedb');

const UsersDatabase = new Datastore('dataStores/UsersDatabase.db');
UsersDatabase.loadDatabase();





function allFromDatabase(database){
    return new Promise(resolve =>{
    database.find({}, function (err, docs){
    var count = 0;
    const test = [];
    if(err) {
        console.log("loadDB Error")
        response.end();
        return;
    }
    
    docs.forEach( element => {
        count = (test.push(element));
    });
    resolve(test);
});
    });
};



//
// for parsing application/json
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
  }));
  app.use(passport.authenticate('session'));


passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.get('SELECT rowid AS id, * FROM users WHERE username = ?', [ username ], function(err, row) {
      if (err) { return cb(err); }
      if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }
  
      crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return cb(err); }
        if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
          return cb(null, false, { message: 'Incorrect username or password.' });
        }
        return cb(null, row);
      });
    });
  }));





passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});




//Below is code for the Serving of files and such

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/',(req, res) => {
    res.render('index')
})

app.get('/login', function(req, res, next) {
    res.render('login');
  });

app.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
 }));


//
app.post('/addUser', async(req, res) =>{
    console.log(req.body);
    //console.log("Student Added!");
    UsersDatabase.insert(req.body);
    const users = await allFromDatabase(UsersDatabase);
    console.log(users);
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('')
 });

 app.post('/deleteUser', function(req, res){
    console.log("Attempting to Remove User!");
    console.log(req.body)
    UsersDatabase.remove(req.body, {}, function (err, numRemoved) {
      });
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('')
    UsersDatabase.loadDatabase();
 });


app.listen(port, () =>{
    console.log('ResScheduler app listening on port ' + port)
})