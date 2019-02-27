const express = require('express')
const app = express()

var r = require("rethinkdb");
var obj2 = {host: '34.204.183.169', port: 28015, user: 'admin'};
var connection = null;

//connect to our database
r.connect( obj2, function(err, conn) {
    if (err){
	console.log("cannot connect");
        console.log(err);
        throw err;
    }

    connection = conn;

});

var weatherwayz = r.db("Weatherwayz");

//initial page for the api
app.get('/', (req, res) => {
    res.send("Welcome to WeatherWayz API!\n");
})

//api calls for table "Users"

//get the ALL users and their information in database
app.get('/users',(req, res) => {
    weatherwayz.table('Users').
    run(connection, function(err, result) {
        if (err) res.send(err);
        res.send(JSON.stringify(result._responses[0].r, null, 2));
    });

})

//get information of a specific user with its user_id
//if the user_id does not exist, it returns null
app.get('/users/:user_id',(req, res) => {
    weatherwayz.table('Users').get(parseInt(req.params.user_id)).
    run(connection, function(err, result) {
        if (err) res.send(err);
        res.send(JSON.stringify(result, null, 2));
    });
})

app.listen(3000, () => console.log('Server running on port 3000'))
