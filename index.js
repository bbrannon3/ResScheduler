var passport = require('passport');
const express = require('express');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require("crypto")
const app = express();
const port = 3000;
const fs = require("fs");
const bodyParser = require('body-parser');
const mysql = require("mysql")
var session = require('express-session');
const { userInfo } = require('os');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const { ifError } = require('assert');
var MySQLStore = require('express-mysql-session')(session);

const rawData = fs.readFileSync('./dataStores/databaseinfo.txt');
const databaseInfo = JSON.parse(rawData);



//Middleware Setup

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'))
app.set('view engine', 'pug')



var connection = mysql.createConnection({
    host: databaseInfo["Host"],
    port: databaseInfo["Port"],
    user: databaseInfo["User"],
    password: databaseInfo["Password"],
    database: "user",
    multipleStatements: true
});

connection.connect((err)=>{
    if(!err){
        console.log("Connected");
    }else{
       // console.log("Connection Error: ",err);

    }
});

var helpedMiddleware = function(middleware){
    out = function(req,res,next){
        connection.ping(err =>{
            if(err){
            return next()
        } else {
            return middleware(req,res,next);
        }
      })
    }   
    return out;
 }


app.use(helpedMiddleware( session({
                key: 'session_cookie_name',
                secret: 'session_cookie_secret',
                store: new MySQLStore({
                    host: databaseInfo["Host"],
                    port: databaseInfo["Port"],
                    user: databaseInfo["User"],
                    password: databaseInfo["Password"],
                    database:'cookie_user'
                }),
                resave:false,
                saveUninitialized: false,
                cookie:{
                    maxAge:1000*60*60*24
                }
            })))




app.use(helpedMiddleware(passport.initialize()));
app.use(helpedMiddleware(passport.session()));


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
       //console.log(req)
       next();
   }
   else
   {
       res.redirect('/notAuthorized');
   }
}

function isConnected (req, res, next){
    connection.ping(err =>{
        if(err){
            res.render("Admin-Settings", databaseInfo)
        } else {
            next()
        }
    });

}

function redirect(path, req, res, next){
    res.render(path);
}

function isAdmin(req,res,next)
{
   if(req.isAuthenticated() && req.user.isAdmin==0)
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

function deleteUserById(user_id){

    connection.query('Delete from shift_info where Worker_ID=? ', [user_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
        }
       
    });

    connection.query('Delete from user_avalablility where user_id=? ', [user_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
        }
       
    });


    connection.query('Delete from users where id=? ', [user_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
        }
       
    });
}

function deleteShiftById(shift_id){

    connection.query('Delete from shift_info where id=? ', [shift_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
        }
       
    });

}

function deleteRoleById(role_id){

    connection.query('Delete from shift_info where Shift_Role=? ', [role_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
        }
       
    });

    connection.query('Delete from shift_roles where ID=? ', [role_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
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

async function getAllTradeShifts(){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from shift_trades', function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {

                    out[element["idshift_trades"]] = {
                        "Requester": element["requester_id"],
                        "Requestee": element["requestee_id"],
                        "RequesterShift": element["shift_1"],
                        "RequesteeShift": element["shift_2"]

                    }     
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

async function getAllTimeOffRequest(){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from request_off', function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {

                    out[element["idrequest_off"]] = {
                        "Requester": element["user_id"],
                        "RequesterShift": element["shift_id"],
                        "RequesterReason": element["reason"]

                    }     
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

async function getAllCoverRequest(){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from cover_shift', function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {

                    out[element["idcover_shift"]] = {
                        "Requester": element["requester_id"],
                        "Coveree": element["coveree"],
                        "RequesterShift": element["shift_id"],

                    }     
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

async function getDayByShift(shift_id){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from schedule_days where idSchedule_Days in (Select Day_Id from schedule_hours where idSchedule_Hours in (Select Hour_ID from shift_info where id = ?))', [shift_id], function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {
                    out = { 
                        "Day_Id":element["idSchedule_Days"], 
                        "Day":element["Day"],
                        "Week_Id":element["Week_Id"]
                                            
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

async function getHourByShift(shift_id){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from schedule_hours where idSchedule_Hours in (Select Hour_ID from shift_info where id = ?)', [shift_id], function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {
                    out = { 
                        "Hour_Id": element["idSchedule_Hours"], 
                        "Hour":element["Hour"],
                        "Day_Id":element["Day_Id"]
                                            
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

async function getWeekById(week_id){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from schedule_weeks where idSchedule_Weeks = ?', [week_id], function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {
                    out = {  
                        "Month_Id":element["Month_Id"],
                        "Place": element["Place"]
                                            
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

async function getMonthById(month_id){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from schedule_months where idSchedule_Months = ?', [month_id], function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {
                    out = {  
                        "Month":element["Month"],
                        "Year": element["Year"]
                                            
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

async function getHourInfo(hour_id){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from schedule_hours where idSchedule_Hours = ?', [hour_id], function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {
                    out = {  
                        "Hour_Id":element["idSchedule_Hours"],
                        "Hour_Place": element["Hour"],
                        "Hour_Day": element["Day_Id"]
                                            
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

async function getDayByHour(hour_id){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from schedule_days where idSchedule_Days in (Select Day_Id from schedule_hours where idSchedule_Hours = ?)', [hour_id], function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {
                    out = {  
                        "Day_Id": element["idSchedule_Days"],
                        "Placement":element["Day"],
                        "Week_Id": element["Week_Id"]
                                            
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


async function getUserShiftsForWeek(worker_id, week_id){
    return new Promise(resolve =>{
        out = {};
        connection.query('Select * from shift_info where Worker_ID = ? AND Hour_ID in (Select idSchedule_Hours from schedule_hours where Day_Id in (Select idSchedule_Days from schedule_days where Week_Id = ?))', [worker_id, week_id], function(error, results, fields){
            if (error) 
               {
                   console.log(error);
               }
          else if(results.length>0)
            {
                
                results.forEach(element => {
                    out[element["id"]] = {  
                            "Hour_Id": element["Hour_ID"]
                                            
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



async function getDOTM(day_id, month_name, year){
    return new Promise(resolve =>{
        out = {};
    connection.query('Select count(idSchedule_Days) as Days from user.schedule_days Where (idSchedule_Days < ? and Week_Id in (Select idSchedule_Weeks from user.schedule_weeks where Month_Id in (Select idSchedule_Months from user.schedule_months where Month = ? and Year = ?)))', [day_id, month_name, year], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out = { 
                                       "DOTM": element["Days"]+2
                                    }
            });
            console.log("Dotm:",out.DOTM)
            resolve(out);        
       }
       else
       {
           console.log("Couldnt Find DOTM")
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
                                        "WorkerName" : element["Worker_ID"],
                                        "Shift_Id" : element["id"]
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


async function changeShiftWorker(shift_id, worker_id){
    connection.query('UPDATE `shift_info` SET Worker_ID=? WHERE id=? ', [worker_id, shift_id], function(error, results, fields) {
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

}

async function deleteTradeById(trade_id){

    connection.query('Delete from shift_trades where idshift_trades=? ', [trade_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
        }
       
    });

}

async function deleteTimeOffById(request_id){

    connection.query('Delete from request_off where idrequest_off=? ', [request_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
        }
       
    });

}

async function deleteCoverById(request_id){

    connection.query('Delete from cover_shift where idcover_shift=? ', [request_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Delete Error: ", error);
            }
       else if(results.length>0)
         {
            console.log(results)
        }
       
    });

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

function createAvalability(hour, day, user_id){

    currentAvalability = null;

    connection.query('SELECT avalability from user_avalablility WHERE hour = ? AND day = ? AND user_id =?', [hour, day, user_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else if(results.length>0){
            results.forEach(element => {
                currentAvalability = element["avalability"]
            })

        }
        });
    
    connection.query('Delete from user_avalablility WHERE hour = ? AND day = ? AND user_id =?', [hour, day, user_id], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else if(results.affectedRows == 0)
        {
            connection.query('Insert into user_avalablility(hour,day,user_id) values(?,?,?)', [hour, day, user_id], function(error, results, fields) {
                if (error) 
                    {
                        console.log("Error Inserting");
                        console.log(error)
                    }
                
            });
            

        } else if (currentAvalability === 0) {
            connection.query('Insert into user_avalablility(hour,day,user_id,avalability) values(?,?,?,1)', [hour, day, user_id], function(error, results, fields) {
                if (error) 
                    {
                        console.log("Error Inserting");
                        console.log(error)
                    }
                
            });

        }
        
    });


    
}


async function getUserInfoById(user_id){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select id, username, fname, lname, email, phone, birthday, isAdmin from users where id = ?', [user_id], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out = { 
                                        "id":element["id"],
                                        "username":element["username"],
                                        "fname":element["fname"],
                                        "lname":element["lname"],
                                        "email":element["email"],
                                        "phone":element["phone"],
                                        "birthday":element["birthday"],
                                        "role" : element["isAdmin"]
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

async function getUserInfoByUserName(userName){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select id from users where username = ?', [userName], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out = element["id"]
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


async function getUserRoleInfoById(role_id){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select role_name from user_roles where iduser_roles = ?', [role_id], function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out = { 
                                        "Name":element["role_name"]
                        }
            });
            resolve(out);        
       }
       else
       {
          
           resolve([])
       }
    })
  })
}


async function getAllUserRoles(){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select iduser_roles, role_name from user_roles ', function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out[element["iduser_roles"]] = {     
                    "Name":element["role_name"]
                        }
            });
            resolve(out);        
       }
       else
       {
          
           resolve([])
       }
    })
  })
}

async function getAllShiftRoles(){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select ID, Name, Color from shift_roles', function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            
            results.forEach(element => {
                out[element["ID"]] = {     
                    "Name":element["Name"],
                    "Color":element["Color"],
                    "Id": element["ID"]
                        }
            });
            resolve(out);        
       }
       else
       {
          
           resolve([])
       }
    })
  })
}

async function getAvalabilityById(user_id){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select iduser_avalablility, day, hour, avalability from user_avalablility where user_id = ?',[user_id] ,function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            var i = 0;
            results.forEach(element => {
                out[i] = {
                    "Ava_Id": element["iduser_avalablility"],
                    "Day": element["day"],     
                    "Hour":element["hour"],
                    "Avalability":element["avalability"]
                        }
                i+=1;
            });
            console.log(out)
            resolve(out);        
       }
       else
       {
          
           resolve([])
       }
    })
  })
}

async function getAllAvalability(){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select iduser_avalablility, day, hour, avalability, user_id from user_avalablility', function(error, results, fields){
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            var i = 0;
            results.forEach(element => {
                out[i] = {
                    "Ava_Id": element["iduser_avalablility"],
                    "Day": element["day"],     
                    "Hour":element["hour"],
                    "Avalability":element["avalability"],
                    "User": element["user_id"]
                        }
                i+=1;
            });
            console.log(out)
            resolve(out);        
       }
       else
       {
          
           resolve([])
       }
    })
  })
}

async function getAllUsersWithRole(){
    return new Promise(resolve =>{
    out = {};
    connection.query('Select id, username, phone, isAdmin, email from users',  async(error, results, fields)=>{
        if (error) 
           {
               console.log(error);
           }
      else if(results.length>0)
        {
            var i = 0;
            results.forEach(element => {
                //role = await getUserRoleInfoById(element["isAdmin"])["Name"]
                out[i] = { 
                          "id":element["id"],
                          "UserName":element["username"],
                          "Email": element["email"],
                          "Phone": element["phone"],
                          "Role": element["isAdmin"]
                        }
                i += 1;
            
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
                                            "WorkerName" : element["Worker_ID"],
                                            "Shift_Id" : element["id"]
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
            "ShiftRoleId": temp["Shift_Role"] || "",
            "WorkerName": (await getUserInfoById(temp["WorkerName"]))["username"] || "",
            "Shift_Id" : temp["Shift_Id"]
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
    workerInfo = await getUserInfoById(temp["WorkerName"])
     hours[x] = {
        "HourId": HourAndPlace[i][x],
        "WO_Count": temp["WO_Count"]  || "",
        "ShiftRoleName": shiftRoleInfo["ShiftName"] || "",
        "ShiftRoleColor": shiftRoleInfo["Color"] || "",
        "ShiftRoleId": temp["Shift_Role"] || "",
        "WorkerName": workerInfo["username"] || "",
        "WorkerId" : temp["WorkerName"] || "",
        "Shift_Id" : temp["Shift_Id"]

        }
        //console.log(temp["WorkerName"])
    }
    ByHours[i] = hours; 
}
return(ByHours)
}

function setUserRole(user_id, role_id){
    
    connection.query('UPDATE `users` SET isAdmin=? WHERE id=? ', [role_id, user_id], function(error, results, fields) {
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
}

function editScheduleHour(Shift_Id, selectname, selectrole, workordercount){
    
    connection.query('UPDATE `shift_info` SET Worker_ID=?, Shift_Role=?, WO_Count=? WHERE id=? ', [selectname, selectrole, workordercount, Shift_Id], function(error, results, fields) {
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
                
                createWeek(results["insertId"], i, year, month)
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


function createWeek(month, placement, year, month_name){
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
                start = calculateFirstDay(year, getMonthValue(month_name));
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

function addShiftTradeRequest(requester, requestee, requester_shift, requestee_shift){
    connection.query('Insert into shift_trades(requester_id, requestee_id, shift_1, shift_2) values(?,?,?,?)', [requester, requestee, requester_shift, requestee_shift], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            
        }
        
    });
}

function addTimeOffRequest(Reason, Shift, User){
    connection.query('Insert into request_off(reason, shift_id, user_id) values(?,?,?)', [Reason, Shift, User], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            
        }
        
    });
}

function addCoverRequest(Shift, Coverer, Coveree){
    connection.query('Insert into cover_shift(requester_id, coveree, shift_id) values(?,?,?)', [Coverer, Coveree, Shift], function(error, results, fields) {
        if (error) 
            {
                console.log("Error Inserting");
                console.log(error)
            }
        else
        {
            
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

function getTimeFromPlace(place){
    var time = ""
    switch(place.toString()){
        case("0"):
            time = "12:00 AM"
            break;
        case("1"):
            time = "1:00 AM"
            break;
        case("2"):
            time = "2:00 AM"
            break;
        case("3"):
            time = "3:00 AM"
            break;
        case('4'):
            time = "4:00 AM"
            break;
        case('5'):
            time = "5:00 AM"
            break;
        case('6'):
            time = "6:00 AM"
            break;
        case('7'):
            time = "7:00 AM"
            break;
        case('8'):
            time = "8:00 AM"
            break;
        case('9'):
            time = "9:00 AM"
            break;
        case('10'):
            time = "10:00 AM"
            break;
        case('11'):
            time = "11:00 AM"
            break;
        case('12'):
            time = "12:00 PM"
            break;
        case('13'):
            time = "1:00 PM"
            break;
        case('14'):
            time = "2:00 PM"
            break;
        case('15'):
            time = "3:00 PM"
            break;
        case('16'):
            time = "4:00 PM"
            break;
        case('17'):
            time = "5:00 PM"
            break;
        case('18'):
            time = "6:00 PM"
            break;
        case('19'):
            time = "7:00 PM"
            break;
        case('20'):
            time = "8:00 PM"
            break;
        case('21'):
            time = "9:00 PM"
            break;
        case('22'):
            time = "10:00 PM"
            break;
        case('23'):
            time = "11:00 PM"
            break;
    }
    return time
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

function getRelativeMonthandWeek(offSet){
    d = new Date
    n = d.getDate() + (7 * offSet)
    d.setDate(n);
    month = d.getMonth();
    week = d.getWeekOfMonth();
    console.log("Week:" + week)
    day = d.getDate();
    year = d.getFullYear();
    return {"week":week,
            "month":month,
            "day": day,
            "year": year
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
app.get('/', isConnected, async(req, res, next) => {
    var info = {"Authenticated" : false,
        "isAdmin" : false
    };
   
    if(req.user){
        info["Authenticated"] = true;
        if(req.user.isAdmin === 0){
            info.isAdmin = true
        }
    }

    //console.log(info.isAdmin)
    
    res.render('index',{"User":{"Authenticated":info["Authenticated"], "isAdmin":info.isAdmin}})
});

app.get('/index', (req, res, next) => {
  
    res.redirect('/')
});

app.get('/Trade-Shift',isConnected,isAuth, async(req, res, next) => {

    res.render('Trade-Shift')

});

app.post('/Trade-Shift',isConnected,isAuth, async(req, res, next) => {
    console.log("Trade-Shift",req.body)
    workerInfo = await getUserInfoById(req.body.worker_id);
    dateInfo = await getDayByShift(req.body.shift_id);
    console.log(dateInfo)
    weekInfo = await getWeekById(dateInfo.Week_Id);
    RequesterShifts = await getUserShiftsForWeek(req.user.id, dateInfo.Week_Id);
    for(key in RequesterShifts){
        day = await getDayByShift(key);
        hour = await getHourInfo(RequesterShifts[key]["Hour_Id"]);
        RequesterShifts[key]["Day"] = (await getDOTM(day["Day_Id"], req.body.month, req.body.year)).DOTM;
        RequesterShifts[key]["Time"] = getTimeFromPlace(hour["Hour_Place"]);
    }
    CurrentDotm = (await getDOTM(dateInfo["Day_Id"], req.body.month, req.body.year)).DOTM;

    info = {
        "RequesterUser" : req.user.id,
        "RequesteeUser" : req.body.worker_id,
        "RequesterShifts": RequesterShifts,
        "Fname": workerInfo.fname,
        "Lname": workerInfo.lname,
        "ShiftId" : req.body.shift_id,
        "ShiftRole" : req.body.role_name,
        "Time" : req.body.time,
        "Month": req.body.month,
        "Day" : CurrentDotm,
        "Year" : req.body.year
    }
    console.log(info)
    res.render('Trade-Shift', info)

});

app.post('/Submit-Trade', isConnected, isAuth, (req, res, next)=>{
    addShiftTradeRequest(req.body.RequesterId,req.body.RequesteeId, req.body.RequesterShift, req.body.RequesteeShift);
    res.redirect('/')
})

app.get('/User-Management',isConnected,isAuth,isAdmin, async(req, res, next) => {
    var users = await getAllUsersWithRole()
    var roles = await getAllUserRoles();
    for(var key in users){
        users[key]["Role"] = roles[users[key]["Role"]]["Name"];
    }
    res.render('User-Management', {"Users":users})

});

app.post('/User-Management', isAuth,isAdmin, async(req,res, next)=>{
    
    if(req.body.Action === "Edit"){
        var user = await getUserInfoById(req.body.userId)
        var userInfo = {
            "UserId": user.id,
            "FName": user.fname,
            "LName": user.lname,
            "Email": user.email,
            "Birthday": user.birthday,
            "Phone": user.phone,
            "Avalability" : await getAvalabilityById(user.id),
            "isAdmin": req.user.isAdmin === 0
        }
        res.render('User-Settings', userInfo)
    } else if(req.body.Action === "Toggle"){
        var user = await getUserInfoById(req.body.userId)
        
        if(user.role === 1){
            setUserRole(user.id, 0)
        } else{
            setUserRole(user.id, 1)
        }
        res.sendStatus(200)

    } else {
        deleteUserById(req.body.userId);
        res.sendStatus(200)
    }
    
})

app.post('/Delete-Role', isAuth, async(req,res, next)=>{
    
        deleteRoleById(req.body.Id);
        res.sendStatus(200);
    
})

app.get('/New-Password', isConnected,(req, res, next) => {
    res.render('New-Password', {"Username": req.user.username})

});

app.get('/User-Settings', isConnected, isAuth, async(req, res, next) => {
    var userInfo = {
        "UserId": req.user.id,
        "FName": req.user.fname,
        "LName": req.user.lname,
        "Email": req.user.email,
        "Birthday": req.user.birthday,
        "Phone": req.user.phone,
        "Avalability" : await getAvalabilityById(req.user.id),
        "isAdmin": req.user.isAdmin === 0
    }
   
    res.render('User-Settings', userInfo)

});

app.post('/User-Settings', (req, res, next)=>{
    user = req.body
    connection.query('UPDATE `users` SET fname=?, lname=?, email=?, birthday=?, phone=? WHERE id=? ', [user.First_Name, user.Last_Name, user.Email, user.Birthday, user.Phone, user.UserId], function(error, results, fields) {
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
})



app.get('/Full-Schedule',isConnected,isAuth, async(req, res, next) => {
    fullInfo = {}
    currDate = getCurrentMonthandWeek()
    fullInfo["DateInfo"] = {
        "Day": currDate["day"],
        "Week": currDate["week"],
        "Month": getMonthFromValue(currDate["month"]),
        "Year": currentYear(),
        "OffSet": 0
    }
    fullInfo["user"] = {
        "userId" : req.user.id,
        "userName" : req.user.username,
        "isAdmin" : req.user.isAdmin
    }
    fullInfo["Users"] = await getAllUsersWithRole();
    fullInfo["Roles"] = await getAllShiftRoles();
    fullInfo["info"] = await compileWeekSchedulingObjAllUsers(await createMonthIfNotExist(currDate["month"], fullInfo["DateInfo"]["Year"]),currDate["week"]);
    //console.log(fullInfo["info"])
    res.render('Full-Schedule', fullInfo);
});

app.post('/Full-Schedule',isConnected,isAuth, async(req, res, next) => {
    fullInfo = {}
    currDate = getRelativeMonthandWeek(req.body.OffSet)
    fullInfo["DateInfo"] = {
        "Day": currDate["day"],
        "Week": currDate["week"],
        "Month": getMonthFromValue(currDate["month"]),
        "Year": currDate["year"],
        "OffSet": req.body.OffSet
    }
    fullInfo["user"] = {
        "userId" : req.user.id,
        "userName" : req.user.username,
        "isAdmin" : req.user.isAdmin
    }
    fullInfo["Users"] = await getAllUsersWithRole();
    fullInfo["Roles"] = await getAllShiftRoles();
    fullInfo["info"] = await compileWeekSchedulingObjAllUsers(await createMonthIfNotExist(currDate["month"], fullInfo["DateInfo"]["Year"]),currDate["week"]);
    //console.log(fullInfo["info"])
    res.render('Full-Schedule', fullInfo);
});

app.get('/My-Schedule',isConnected,isAuth, async(req, res, next) => {
    fullInfo = {}
    currDate = getCurrentMonthandWeek()
    fullInfo["DateInfo"] = {
        "Day": currDate["day"],
        "Week": currDate["week"],
        "Month": getMonthFromValue(currDate["month"]),
        "Year": currentYear(),
        "OffSet": 0
    }

    fullInfo["user"] = {
        "userId" : req.user.id,
        "userName" : req.user.username,
        "isAdmin" : req.user.isAdmin
    }

    fullInfo["Users"] = await getAllUsersWithRole();
    fullInfo["Roles"] = await getAllShiftRoles();
    fullInfo["info"] = await compileWeekSchedulingObj(req.user.id, await createMonthIfNotExist(currDate["month"], fullInfo["DateInfo"]["Year"]),currDate["week"]);
    res.render('my-Schedule', fullInfo);
});

app.post('/My-Schedule',isConnected,isAuth, async(req, res, next) => {
    fullInfo = {}
    currDate = getRelativeMonthandWeek(req.body.OffSet)
    fullInfo["DateInfo"] = {
        "Day": currDate["day"],
        "Week": currDate["week"],
        "Month": getMonthFromValue(currDate["month"]),
        "Year": currDate["year"],
        "OffSet": req.body.OffSet
    }

    fullInfo["user"] = {
        "userId" : req.user.id,
        "userName" : req.user.username,
        "isAdmin" : req.user.isAdmin
    }

    fullInfo["Users"] = await getAllUsersWithRole();
    fullInfo["Roles"] = await getAllShiftRoles();
    fullInfo["info"] = await compileWeekSchedulingObj(req.user.id, await createMonthIfNotExist(currDate["month"], fullInfo["DateInfo"]["Year"]),currDate["week"]);
    res.render('my-Schedule', fullInfo);
});


app.get('/Forgot-Password',isConnected, (req, res, next)=>{
    res.render('Forgot-Password');
})

app.post('/Forgot-Password', isConnected, async (req, res, next)=>{
    var username = req.body.username
    
    if(!username){
        getUserInfoById(req.body.userId).then(result=>{
            res.render('New-Password', {"Username": result["username"]})
        })
    }else{
        res.render('New-Password', {"Username": username })
    }
    
})


app.get('/login', isConnected,(req, res, next) => {
        res.render('login');
});
app.get('/logout', isConnected,(req, res, next) => {
    req.logout(); //delets the user from the session
    res.redirect('/login');
});
app.get('/login-success', isConnected,(req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

app.get('/login-failure', isConnected,(req, res, next) => {
    res.send('You entered the wrong password.');
});


app.get('/register', isConnected,(req, res, next) => {
    
    var info = {"Authenticated" : false};
    console.log(req.user)
    if(req.user){
        info["Authenticated"] = true;
    }

    res.render('register',{"User":{"Authenticated":info["Authenticated"]}})
    
});

app.post('/New-Password', async (req,res, next)=>{
    const userId = await getUserInfoByUserName(req.body.Username) || await getUserInfoById(req.body.userId);
    const saltHash=genPassword(req.body.password);
    const salt=saltHash.salt;
    const hash=saltHash.hash;

    connection.query('UPDATE `users` SET hash=?, salt=? WHERE id=? ', [hash, salt, userId], function(error, results, fields) {
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

    res.redirect('/logout');

});


app.post('/register', userExists,(req,res,next)=>{
    console.log("Inside post");
    //console.log(req.body);
    const saltHash=genPassword(req.body.password);
    const salt=saltHash.salt;
    const hash=saltHash.hash;

    connection.query('INSERT INTO users(username,hash,salt,isAdmin, fname, lname) values(?,?,?,1,?,?) ', [req.body.username,hash,salt,req.body.fname, req.body.lname], function(error, results, fields) {
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

app.post('/PlaceWorker', isAdmin,(req, res, next)=>{
    console.log(req.body)
    if(req.body["Shift_Id"]==='undefined'){
        createScheduleHour(req.body["Hour_Id"], req.body["selectname"], req.body["selectrole"], req.body['workordercount'])
    } else {
        editScheduleHour(req.body["Shift_Id"], req.body["selectname"], req.body["selectrole"], req.body['workordercount'])
    }
    res.sendStatus("200")
})

app.post('/DeleteShift', isAdmin,(req, res, next)=>{
    console.log(req.body)
    deleteShiftById(req.body["Shift_Id"])
    res.sendStatus("200")
})

app.post('/PlaceAvalability', (req, res, next)=>{
    console.log(req.body)
    createAvalability(req.body["Hour"], req.body["Day"], req.body["UserId"])
    res.sendStatus(200)
})

app.post('/login',passport.authenticate('local',{failureRedirect:'/login-failure',successRedirect:'/'}));

app.get('/protected-route',isConnected,isAuth,(req, res, next) => {
 
    res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
});

app.get('/admin-route',isAdmin,(req, res, next) => {
 
    res.send('<h1>You are admin</h1><p><a href="/logout">Logout and reload</a></p>');

});

app.get('/notAuthorized', (req, res, next) => {
    var info = {"Authenticated" : false};
    if(req.user){
        info["Authenticated"] = true;
    }
   
    res.render("Access-Denied",{"User":{"Authenticated":info["Authenticated"]}})
    
});
app.get('/notAuthorizedAdmin', (req, res, next) => {
    var info = {"Authenticated" : false};
    if(req.user){
        info["Authenticated"] = true;
    }
   
    res.render("Access-Denied",{"User":{"Authenticated":info["Authenticated"]}})
    
});
app.get('/userAlreadyExists', (req, res, next) => {
    console.log("Inside get");
    res.send('<h1>Sorry This username is taken </h1><p><a href="/register">Register with different username</a></p>');
    
});

app.get('/Admin-Settings', isConnected, (req, res, next)=>{
    res.render("Admin-Settings", databaseInfo)
})

app.post('/Admin-Settings', (req, res, next) =>{
    fs.writeFileSync('./dataStores/databaseinfo.txt', JSON.stringify(req.body))
    res.sendStatus(200)
})

app.get('/Notifications', isConnected, isAuth,(req,res,next)=>{
    res.render("Notifications")
})

app.get('/Role-Management', isConnected, isAuth, isAdmin, async(req, res, next)=>{
    var roles = await getAllShiftRoles();
    res.render("Role-Management", {"Roles":roles})
})

app.post('/Role-Management', isAuth, isAdmin, async(req, res, next)=>{
    console.log(req.body)
    if(req.body["role-id"] != -1){
    connection.query('UPDATE `shift_roles` SET name=?, color=? WHERE id=? ', [req.body.name, req.body.color_picker.substring(1), req.body['role-id']], function(error, results, fields) {
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
 } else {
    connection.query('Insert into `shift_roles` SET name=?, color=? ', [req.body.name, req.body.color_picker.substring(1)], function(error, results, fields) {
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
 }

 res.sendStatus(200);
})


app.get('/Role-Popup', isConnected, isAuth, (req, res, next)=>{
    res.render("Role-Popup")
})

app.get('/Trade-Shift-Approval', isConnected, isAuth, isAdmin, async(req, res, next)=>{
    TradeShifts = await getAllTradeShifts()
    
    for(key in TradeShifts){
        requester_info = await getUserInfoById(TradeShifts[key]["Requester"])
        requestee_info = await getUserInfoById(TradeShifts[key]["Requestee"])

        requester_hour = await getHourByShift(TradeShifts[key]["RequesterShift"])
        requestee_hour = await getHourByShift(TradeShifts[key]["RequesteeShift"])

        requester_time = await getTimeFromPlace(requester_hour["Hour"])
        requestee_time = await getTimeFromPlace(requestee_hour["Hour"])

        requester_day = await getDayByShift(TradeShifts[key]["RequesterShift"])
        requestee_day = await getDayByShift(TradeShifts[key]["RequesteeShift"])

        requester_week = await getWeekById(requester_day["Week_Id"])
        requestee_week = await getWeekById(requestee_day["Week_Id"])

        requester_month = await getMonthById(requester_week["Month_Id"])
        requestee_month = await getMonthById(requestee_week["Month_Id"])

        TradeShifts[key]["RequesterName"] = requester_info.fname + " " + requester_info.lname;
        TradeShifts[key]["RequesteeName"] = requestee_info.fname + " " + requestee_info.lname;

        TradeShifts[key]["RequesterTime"] = requester_month.Month + " " + (await getDOTM(requester_day["Day_Id"], requester_month.Month, requester_month.Year)).DOTM + ", " + requester_time
        TradeShifts[key]["RequesteeTime"] = requestee_month.Month + " " + (await getDOTM(requestee_day["Day_Id"], requestee_month.Month, requestee_month.Year)).DOTM + ", " + requestee_time

        TradeShifts[key]["TradeId"] = key
        
    }
   
    res.render("Trade-Shift-Approval", {"Shifts": TradeShifts})
})

app.post('/Trade-Shift-Approval', isConnected, isAuth, isAdmin,  async(req, res, next)=>{
    console.log(req.body)

    if(req.body.approval === 'Approved'){
        changeShiftWorker(req.body.shift_1, req.body.requestee_id);
        changeShiftWorker(req.body.shift_2, req.body.requester_id);
        deleteTradeById(req.body.request_id)

    } else {
        deleteTradeById(req.body.request_id)
    }

    res.sendStatus(200)
})

app.post('/Submit-Time-Off', isConnected, isAuth, (req, res, next)=>{
    addTimeOffRequest(req.body.Reason, req.body.Shift_Id, req.body.User_Id);
    res.redirect('/')
})

app.post('/Submit-Cover', isConnected, isAuth, (req, res, next)=>{
    addCoverRequest(req.body.ShiftId, req.body.RequesterUser, req.body.RequesteeUser);
    res.redirect('/')
})

app.get('/Request-Off-Approval', isConnected, isAuth,isAdmin,  async(req, res, next)=>{
    Requests = await getAllTimeOffRequest();

    for(key in Requests){
        requester_info = await getUserInfoById(Requests[key]["Requester"])
        requester_hour = await getHourByShift(Requests[key]["RequesterShift"])
        requester_time = await getTimeFromPlace(requester_hour["Hour"])
        requester_day = await getDayByShift(Requests[key]["RequesterShift"])
        requester_week = await getWeekById(requester_day["Week_Id"])        
        requester_month = await getMonthById(requester_week["Month_Id"])      
        Requests[key]["RequesterName"] = requester_info.fname + " " + requester_info.lname;
        Requests[key]["RequesterTime"] = requester_month.Month + " " + (await getDOTM(requester_day["Day_Id"], requester_month.Month, requester_month.Year)).DOTM + ", " + requester_time
        Requests[key]["RequestId"] = key
        
    }
    res.render("Request-Off-Approval", {"Requests": Requests})
})

app.post('/Request-Off-Approval', isConnected, isAuth,isAdmin, async(req, res, next)=>{
    if(req.body.approval === 'Approved'){
        deleteTimeOffById(req.body.request_id)
        deleteShiftById(req.body.shift_1)
    } else {
        deleteTimeOffById(req.body.request_id)
    }

    res.sendStatus(200)
})

app.get('/Cover-shift-Approval', isConnected, isAuth,isAdmin, async (req, res, next)=>{
    Requests = await getAllCoverRequest();
    console.log("IN Covers")
    for(key in Requests){
        requester_info = await getUserInfoById(Requests[key]["Requester"])
        coveree_info = await getUserInfoById(Requests[key]["Coveree"])
        requester_hour = await getHourByShift(Requests[key]["RequesterShift"])
        requester_time = await getTimeFromPlace(requester_hour["Hour"])
        requester_day = await getDayByShift(Requests[key]["RequesterShift"])
        requester_week = await getWeekById(requester_day["Week_Id"])        
        requester_month = await getMonthById(requester_week["Month_Id"])      
        Requests[key]["RequesterName"] = requester_info.fname + " " + requester_info.lname;
        Requests[key]["CovereeName"] = coveree_info.fname + " " + coveree_info.lname;
        Requests[key]["RequesterTime"] = requester_month.Month + " " + (await getDOTM(requester_day["Day_Id"], requester_month.Month, requester_month.Year)).DOTM + ", " + requester_time
        Requests[key]["RequestId"] = key
        
    }
    res.render("Cover-shift-Approval", {"Requests": Requests})
})

app.post('/Cover-shift-Approval', isConnected, isAuth,isAdmin, async(req, res, next)=>{
    if(req.body.approval === 'Approved'){
        deleteCoverById(req.body.request_id)
        changeShiftWorker(req.body.shift_1, req.body.requester_id)
    } else {
        deleteCoverById(req.body.request_id)
    }

    res.sendStatus(200)
})

app.post('/All-User-Avalability', async(req,res, next)=>{
    out = await getAllAvalability();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(out));
})

app.post('/All-Users', async(req,res, next)=>{
    out = await getAllUsersWithRole();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(out));
})

app.get('/Pop-Up', isConnected, isAuth, (req, res, next)=>{
    res.render("Pop-Up")
})


//Start App
app.listen(port, async function() {
    date = getCurrentMonthandWeek();
    confirmation = await createMonthIfNotExist(date["month"], currentYear())
    console.log('App listening on port %d!',port)
  });