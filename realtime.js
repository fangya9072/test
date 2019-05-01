const express = require('express')
const bodyParser = require('body-parser');
const app = express();
const sockio = require('socket.io');
const io = sockio.listen(app.listen(3001, () => console.log('Server running on port 3001')))
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
    //use socket to send realtime location of users who change location
    r.db('Weatherwayz').table('Users').changes().run(connection, function(err, cursor){
        if (err) throw err;
        else {
            cursor.each(function(err, data){
                //protect users privacy, don't send their password to front-end
                let position = {
                    'new_val': {
                        'username': data.new_val.username, 
                        'location': data.new_val.location
                    }
                }
                io.sockets.emit('friendPositions', position);
            })
        }
    })
});

//initial page for the api
app.get('/', (req, res) => {
    res.send("Welcome to WeatherWayz Realtime API!\n");
})
