const express = require('express');
const path = require('path')

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



//Below is code for the Seving of files and such

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/',(req, res) => {
    res.render('index')
})

app.listen(port, () =>{
    console.log('ResScheduler app listening on port ' + port)
})