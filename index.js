var passport = require('passport');
const express = require('express');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require("crypto")
const app = express()
const port = 3000;
const bodyParser = require('body-parser');
const mysql = require("mysql")
var session = require('express-session');
const { waitForDebugger } = require('inspector');
const { resolve } = require('path');
const { type } = require('os');
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
   console.log('deserializeUser '+ userId);
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
       console.log(req)
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

async function getScheduleWeeksIDsForMonth(month_id){
    return new Promise(resolve =>{
    out = [];
    connection.query('Select idSchedule_Weeks from schedule_weeks where Month_Id=?', [month_id], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
                   
            results.forEach(element => {
                
                out.push(element["idSchedule_Weeks"])     
            });
            resolve(out);        
       }
       else
       {
           console.log("Week Not found")
           resolve([])
       }
    })
    

    

})

}



async function getScheduleWeekIdbyPlacement(placement, month_id){
    return new Promise(resolve =>{
    out = [];
    connection.query('Select idSchedule_Weeks from schedule_weeks where (Month_Id, Place) = (?,?)', [month_id, placement], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
                   
            results.forEach(element => {
                
                out.push(element["idSchedule_Weeks"])     
            });
            resolve(out);        
       }
       else
       {
           console.log("Week Not found")
           resolve([])
       }
    })
    

    

})

}




async function getScheduleDaysPlaceandIdsByWeek(week_id){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select idSchedule_Days, Day from schedule_days where Week_Id = ?', [week_id], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                
                out[element["Day"]]=element["idSchedule_Days"]     
            });
            resolve(out);        
       }
       else
       {
           console.log("Days Not found")
           resolve([])
       }
    })
  })
}


async function getScheduleHoursPlacmentandIdsByDay(day_id){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select idSchedule_Hours, Hour from schedule_hours where Day_Id = ?', [day_id], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out[element["Hour"]] = element["idSchedule_Hours"]     
            });
            resolve(out);        
       }
       else
       {
           console.log("Hours Not found")
           resolve([])
       }
    })
  })
}


async function getScheduledHoursForUser(user_id){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select * from shift_info where Worker_ID = ?', [user_id], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out[element["id"]] = {  "Hour_ID":element["Hour_ID"],
                                        "WO_Count" : element["WO_Count"], 
                                        "Shift_Role" : element["Shift_Role"]
                                    }
            });
            resolve(out);        
       }
       else
       {
           //console.log("No Hours found")
           resolve([])
       }
    })
  })
}


async function getScheduledHoursForUserByHour(user_id, hourId){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select * from shift_info where Worker_ID = ? and Hour_ID = ?', [user_id, hourId], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out = { 
                                        "WO_Count" : element["WO_Count"], 
                                        "Shift_Role" : element["Shift_Role"],
                                        "WorkerName" : element["Worker_ID"]
                                    }
            });
            resolve(out);        
       }
       else
       {
           //console.log("No Hours found")
           resolve([])
       }
    })
  })
}


function createScheduleHour(hourId, workerId, shiftRole, woCount = 0){
    connection.query('Insert into shift_info(Hour_ID,Worker_ID,WO_Count,Shift_Role) values(?,?,?,?)', [hourId,workerId, woCount, shiftRole], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            
            console.log("Suceccfully Added shift")

        }
        
    });
}


async function getUserInfoById(user_id){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select id, username from users where id = ?', [user_id], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out = { 
                                        "id":element["id"],
                                        "username":element["username"]
                        }
            });
            resolve(out);        
       }
       else
       {
           //console.log("No Hours found")
           resolve([])
       }
    })
  })
}

async function getShiftRoleInfoById(role_id){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select Name, Color from shift_roles where ID = ?', [role_id], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out = { 
                                        "ShiftName":element["Name"],
                                        "Color":element["Color"]
                        }
            });
            resolve(out);        
       }
       else
       {
           //console.log("No Hours found")
           resolve([])
       }
    })
  })
}


async function getScheduledHoursbyHour(Hour_Id){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from shift_info where Hour_ID = ?', [Hour_Id], function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {
                    out = { 
                                            "WO_Count" : element["WO_Count"], 
                                            "Shift_Role" : element["Shift_Role"],
                                            "WorkerName" : element["Worker_ID"]
                                        }
                });
                resolve(out);        
           }
           else
           {
               //console.log("No Hours found")
               resolve([])
           }
        })
      })
}



async function compileWeekSchedulingObj(Worker_ID, Month_Id, WeekPlacement){

        UserInfo = await getUserInfoById(Worker_ID);
        WeekByMonth =  await getScheduleWeekIdbyPlacement(WeekPlacement, Month_Id);
        DayAndPlace = await getScheduleDaysPlaceandIdsByWeek(WeekByMonth[0]); //Returns Dictionary of
        HourAndPlace = {}
        for (i = 0; i < 7; i++){
            const temp = await getScheduleHoursPlacmentandIdsByDay(DayAndPlace[i]); //Returns dictionary of 24 Hours
            HourAndPlace[i]= temp;                                            //Has keys of the placement
        }
    ByHours = {}
    for(i=0; i<7; i++){
        hours = {}
        for(x=0; x < 24; x++){
        temp = await getScheduledHoursForUserByHour(Worker_ID, HourAndPlace[i][x])
        shiftRoleInfo = await getShiftRoleInfoById(temp["Shift_Role"]);
         hours[x] = {
            "HourId": HourAndPlace[i][x],
            "WO_Count": temp["WO_Count"]  || "",
            "ShiftRoleName": shiftRoleInfo["ShiftName"] || "",
            "ShiftRoleColor": shiftRoleInfo["Color"] || "",
            "WorkerName": (await getUserInfoById(temp["WorkerName"]))["username"] || ""

            }
        }
        ByHours[i] = hours; 
    }
    return(ByHours)
}

async function compileWeekSchedulingObjAllUsers(Month_Id, WeekPlacement){

    WeekByMonth =  await getScheduleWeekIdbyPlacement(WeekPlacement, Month_Id);
    DayAndPlace = await getScheduleDaysPlaceandIdsByWeek(WeekByMonth[0]); //Returns Dictionary of
    HourAndPlace = {}
    for (i = 0; i < 7; i++){
        const temp = await getScheduleHoursPlacmentandIdsByDay(DayAndPlace[i]); //Returns dictionary of 24 Hours
        HourAndPlace[i]= temp;                                            //Has keys of the placement
    }
ByHours = {}
for(i=0; i<7; i++){
    hours = {}
    for(x=0; x < 24; x++){
    temp = await getScheduledHoursbyHour(HourAndPlace[i][x])
    shiftRoleInfo = await getShiftRoleInfoById(temp["Shift_Role"]);
     hours[x] = {
        "HourId": HourAndPlace[i][x],
        "WO_Count": temp["WO_Count"]  || "",
        "ShiftRoleName": shiftRoleInfo["ShiftName"] || "",
        "ShiftRoleColor": shiftRoleInfo["Color"] || "",
        "WorkerName": (await getUserInfoById(temp["WorkerName"]))["username"] || ""

        }
    }
    ByHours[i] = hours; 
}
return(ByHours)
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


async function createMonthIfNotExist(month, year){
    console.log(month+ " "+ year)
    return new Promise(resolve =>{
    connection.query('Select * from schedule_months where Month = ? and Year = ?', [getMonthFromValue(month),year], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
            else if(results.length>0){
                
                resolve(results[0]["idSchedule_Months"])    
            }
        else
        {
            console.log(results)
            if(month != null){
                createMonth(getMonthFromValue(month), year)
                resolve(createMonthIfNotExist(month, year))
            }
            else{
                console.log("Borked")
                resolve("")
            }
            
        }
        
    });
})

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

function getMonthFromValue(month){
    
        months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]
        console.log(months[month])
        return months[month]
    
}

function getCurrentMonthandWeek(){
    d = new Date
    month = d.getMonth();
    week = d.getWeekOfMonth();
    console.log("Week:" + week)
    day = d.getDate();
    return {"week":week,
            "month":month,
            "day": day
}
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
   //console.log(req.session);
   //console.log(req.user);
   next();
});


// Routes
app.get('/', async(req, res, next) => {
    //createMonth("March", 2022)
    //const ids = await compileWeekSchedulingObj(4,4,0);
    //console.log(ids)
    //createScheduleHour(44, 4, 1, 2)
    //console.log(req.user.username.toString())
    var info = {"username" : req.user.username || "Log In"};
    date = getCurrentMonthandWeek();
    confirmation = await createMonthIfNotExist(date["month"], currentYear())
    res.render('index', info)
});

app.get('/index', (req, res, next) => {
  
    res.redirect('/')
});

app.get('/Trade-Shift',isAuth, async(req, res, next) => {

    res.render('Trade-Shift')

});

app.get('/User-Management',isAuth, async(req, res, next) => {

    res.render('User-Management')

});

app.get('/New-Password', isAuth, (req, res, next) => {

    res.render('New-Password')

});

app.get('/User-Settings', isAuth, (req, res, next) => {

    res.render('User-Settings')

});



app.get('/Full-Schedule',isAuth, async(req, res, next) => {
    fullInfo = {}
    currDate = getCurrentMonthandWeek()
    fullInfo["DateInfo"] = {
        "Day": currDate["day"],
        "Week": currDate["week"],
        "Month": getMonthFromValue(currDate["month"]),
        "Year": currentYear()
    }
    fullInfo["user"] = {
        "userId" : req.user.id,
        "userName" : req.user.username
    }
    console.log("Sched: " + currDate["week"])
    fullInfo["info"] = await compileWeekSchedulingObjAllUsers(await createMonthIfNotExist(currDate["month"], fullInfo["DateInfo"]["Year"]),currDate["week"]);
    //console.log(fullInfo["info"])
    res.render('Full-Schedule', fullInfo);
});

app.get('/My-Schedule',isAuth, async(req, res, next) => {
    fullInfo = {}
    currDate = getCurrentMonthandWeek()
    fullInfo["DateInfo"] = {
        "Day": currDate["day"],
        "Week": currDate["week"],
        "Month": getMonthFromValue(currDate["month"]),
        "Year": currentYear()
    }
    fullInfo["user"] = {
        "userId" : req.user.id,
        "userName" : req.user.username
    }
    console.log("Sched: " + currDate["week"])
    fullInfo["info"] = await compileWeekSchedulingObj(req.user.id, await createMonthIfNotExist(currDate["month"], fullInfo["DateInfo"]["Year"]),currDate["week"]);
    res.render('my-Schedule', fullInfo);
});




app.get('/login', (req, res, next) => {
        res.render('login');
});
app.get('/logout', (req, res, next) => {
    req.logout(); //delets the user from the session
    res.redirect('/login');
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

app.post('/New-Password', (req,res, next)=>{

    const saltHash=genPassword(req.body.password);
    const salt=saltHash.salt;
    const hash=saltHash.hash;

    connection.query('UPDATE `users` SET hash=?, salt=? WHERE id=? ', [hash, salt, req.user.id], function(error, results, fields) {
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


app.post('/register', userExists,(req,res,next)=>{
    console.log("Inside post");
    console.log(req.body);
    const saltHash=genPassword(req.body.password);
    console.log(saltHash);
    const salt=saltHash.salt;
    const hash=saltHash.hash;

    connection.query('INSERT INTO users(username,hash,salt,isAdmin, fname, lname) values(?,?,?,0,?,?) ', [req.body.username,hash,salt,req.body.fname, req.body.lname], function(error, results, fields) {
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

app.post('/PlaceWorker', (req, res, next)=>{
    createScheduleHour(req.body["Hour_Id"], req.body["User_Id"], 1, 1)
   //res.sendStatus("200")
    res.redirect("/Full-Schedule")
})

app.post('/login',passport.authenticate('local',{failureRedirect:'/login-failure',successRedirect:'/'}));

app.get('/protected-route',isAuth,(req, res, next) => {
 
    res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
});

app.get('/admin-route',isAdmin,(req, res, next) => {
 
    res.send('<h1>You are admin</h1><p><a href="/logout">Logout and reload</a></p>');

});

app.get('/notAuthorized', (req, res, next) => {
    console.log("Inside get");
    res.render("Access-Denied")
    
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