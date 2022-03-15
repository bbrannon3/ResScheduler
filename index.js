var passport = require('passport');
const express = require('express');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require("crypto")
const app = express()
const port = 3000;
const bodyParser = require('body-parser');
const mysql = require("mysql")
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);






app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: new MySQLStore({
        host: 'localhost',
        port:3306,
        user:'root',
        password:'Dogdog12',
        database:'cookie_user'
    }),
    resave:false,
    saveUninitialized: false,
    cookie:{
        maxAge:1000*60*60*24
    }
}));







//Middleware Setup
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'))
app.set('view engine', 'pug')

var connection = mysql.createConnection({
    host: "localhost",
    port:3306,
    user: "root",
    password:'Dogdog12',
    database: "user",
    multipleStatements: true
});
connection.connect((err)=>{
    if(!err){
        console.log("Connected");
    }else{
        console.log(err);
    }
});


const customFields={
    usernameField: 'uname',
    passwordField: 'pw',
};
const verifyCallback=(username,password,done)=>{
   
    connection.query('SELECT * FROM users WHERE username = ? ', [username], function(error, results, fields) {
       if (error) 
           return done(error);

       if(results.length==0)
       {
           return done(null,false);
       }
       const isValid=validPassword(password,results[0].hash,results[0].salt);
       user={id:results[0].id,username:results[0].username,hash:results[0].hash,salt:results[0].salt};
       if(isValid)
       {
           return done(null,user);
       }
       else{
           return done(null,false);
       }
   });
}
const strategy=new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);


passport.serializeUser((user,done)=>{
   console.log("inside serialize");
   done(null,user.id)
});

passport.deserializeUser(function(userId,done){
   console.log('deserializeUser'+ userId);
   connection.query('SELECT * FROM users where id = ?',[userId], function(error, results) {
           done(null, results[0]);    
   });
});



/*middleware*/
function validPassword(password,hash,salt)
{
   var hashVerify=crypto.pbkdf2Sync(password,salt,10000,60,'sha512').toString('hex');
   return hash === hashVerify;
}

function genPassword(password)
{
   var salt=crypto.randomBytes(32).toString('hex');
   var genhash=crypto.pbkdf2Sync(password,salt,10000,60,'sha512').toString('hex');
   return {salt:salt,hash:genhash};
}

function isAuth(req,res,next)
{
   if(req.isAuthenticated())
   {
       next();
   }
   else
   {
       res.redirect('/notAuthorized');
   }
}


function isAdmin(req,res,next)
{
   if(req.isAuthenticated() && req.user.isAdmin==1)
   {
       next();
   }
   else
   {
       res.redirect('/notAuthorizedAdmin');
   }   
}

function userExists(req,res,next)
{
   connection.query('Select * from users where username=? ', [req.body.uname], function(error, results, fields) {
       if (error) 
           {
               console.log("Error");
           }
      else if(results.length>0)
        {
           res.redirect('/userAlreadyExists')
       }
       else
       {
           next();
       }
      
   });
}

function createMonth(month, year){
    connection.query('Insert into schedule_months(Month,Year) values(?,?)', [month,year], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            console.log("Successfully added " + month);
            for (i =1; i < 6; i++){
                if((new Date(year,month, (i*7)+1)).getWeekOfMonth()== 0){
                    end = i-1
                    break
                }
                end = i
            }
            for( i = 0; i<end; i++){
                
                createWeek(results["insertId"], i, year)
            }
        }
        
    });

}

function createWeek(month, placement, year){
    connection.query('Insert into schedule_weeks(Month_Id,Place) values(?,?)', [month,placement], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            console.log("Successfully added week " + placement);
            //TO-DO Add offset for weeks at the beginning and end of the month that dont have 7 days or start on Sunday or end on Saturday
            if (placement == 0){
                start = calculateFirstDay(year, month);
            } else {
                start = 0;
            }
            end = 7;
            if (placement > 3){
                for(i = 0; i < 7; i++){
                    if(isLastDay(year, month, ((placement-1)*7)+(7-calculateFirstDay(year, month))+i)){
                        end = i;
                    }
                }
            }
            for( i = start; i<end; i++){
                
                createDay(results["insertId"], i)
            }
        }
        
    });
}

function createDay(week, day){
    connection.query('Insert into schedule_days(Week_Id,Day) values(?,?)', [week,day], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            console.log("Successfully added Day " + day);
            for( i = 0; i<24; i++){
                createHour(results["insertId"], i)
            }
        }
        
    });
}

function createHour(day, hour){
    connection.query('Insert into schedule_hours(Day_Id, Hour) values(?,?)', [day, hour], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            console.log("Successfully added hour: " +  hour);
        }
        
    });
}

Date.prototype.getWeekOfMonth = function() {
    var firstWeekday = new Date(this.getFullYear(), this.getMonth(), 1).getDay();
    var offsetDate = this.getDate() + firstWeekday - 1;
    return Math.floor(offsetDate / 7);
}

function getMonthValue(month){
    var out = 0
    switch(month.toLowerCase()){
        case("january"):
            out = 0;
            break;
        case("february"):
            out = 1;
            break;
        case("march"):
            out = 2;
            break;
        case("april"):
            out = 3;
            break;
        case("may"):
            out = 4;
            break;
        case("june"):
            out = 5;
            break;
        case("july"):
            out = 6;
            break;
        case("august"):
            out = 7;
            break;
        case("september"):
            out = 8;
            break;
        case("october"):
            out = 9;
            break;
        case("november"):
            out = 10;
            break;
        case("december"):
            out = 11;
            break;
    }
    return out;
}

function calculateFirstDay(year, month){
    result = (new Date (year, month)).getDay()
    return result
}

function isLastDay(year, month, day){
    init = (new Date (year, month)).getMonth()
    second = (new Date (year, month, day+1)).getMonth()
    return init != second

}
function currentYear(){
    const today = new Date();
    return today.getFullYear();
}


app.use((req,res,next)=>{
   console.log(req.session);
   console.log(req.user);
   next();
});


// Routes
app.get('/', (req, res, next) => {
    //createMonth("March", 2022)
    res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>');
});

app.get('/login', (req, res, next) => {
        res.render('login')
});
app.get('/logout', (req, res, next) => {
    req.logout(); //delets the user from the session
    res.redirect('/protected-route');
});
app.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

app.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});


app.get('/register', (req, res, next) => {
    console.log("Inside get");
    res.render('register')
    
});

app.post('/register', userExists,(req,res,next)=>{
    console.log("Inside post");
    console.log(req.body.pw);
    const saltHash=genPassword(req.body.pw);
    console.log(saltHash);
    const salt=saltHash.salt;
    const hash=saltHash.hash;

    connection.query('INSERT INTO users(username,hash,salt,isAdmin) values(?,?,?,0) ', [req.body.uname,hash,salt], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            console.log("Successfully Entered");
        }
       
    });

    res.redirect('/login');
});

app.post('/login',passport.authenticate('local',{failureRedirect:'/login-failure',successRedirect:'/login-success'}));

app.get('/protected-route',isAuth,(req, res, next) => {
 
    res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
});

app.get('/admin-route',isAdmin,(req, res, next) => {
 
    res.send('<h1>You are admin</h1><p><a href="/logout">Logout and reload</a></p>');

});

app.get('/notAuthorized', (req, res, next) => {
    console.log("Inside get");
    res.send('<h1>You are not authorized to view the resource </h1><p><a href="/login">Retry Login</a></p>');
    
});
app.get('/notAuthorizedAdmin', (req, res, next) => {
    console.log("Inside get");
    res.send('<h1>You are not authorized to view the resource as you are not the admin of the page  </h1><p><a href="/login">Retry to Login as admin</a></p>');
    
});
app.get('/userAlreadyExists', (req, res, next) => {
    console.log("Inside get");
    res.send('<h1>Sorry This username is taken </h1><p><a href="/register">Register with different username</a></p>');
    
});


//Start App

app.listen(port, function() {
    console.log('App listening on port %d!',port)
  });