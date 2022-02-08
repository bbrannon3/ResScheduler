const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

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


//Below is code for the Serving of files and such

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/',(req, res) => {
    res.render('index')
})


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