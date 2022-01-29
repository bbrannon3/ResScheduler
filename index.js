const express = require('express');
const path = require('path')

const app = express()
const port = 3000

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/',(req, res) => {
    res.render('index')
})

app.listen(port, () =>{
    console.log('ResScheduler app listening on port ' + port)
})