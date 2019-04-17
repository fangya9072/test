const express = require('express')
const bodyParser = require('body-parser');
const app = express()
//parse application/x-www-form-urlencoded and parse application/json
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "null");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods" , "*");
    next();
});

//connect to our database
var r = require("rethinkdb");
//database server address
var obj2 = {host: '34.204.183.169', port: 28015, user: 'admin'};
var connection = null;
r.connect( obj2, function(err, conn) {
    if (err){
        throw err;
    }
    connection = conn;
});
var weatherwayz = r.db("Weatherwayz");

//initial page for the api
app.get('/', (req, res) => {
    res.send("Welcome to WeatherWayz Realtime API!\n");
})

app.listen(3001, () => console.log('Server running on port 3001'))