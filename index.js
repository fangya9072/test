const express = require('express')
const app = express()

var r = require("rethinkdb");
var obj2 = {host: '34.204.183.169', port: 28015, user: 'admin'};
var connection = null;
r.connect( obj2, function(err, conn) {//connect to the database
    if (err){
	console.log("cannot connect");
        console.log(err);
        throw err;
    }

    connection = conn;

});

//the function below is just for test, will be replaced later by more specific api calls and functions
//once the code is running, the address http://3.93.183.130:3000/ will return:
//'[ { "email": "piyue@live.unc.edu", "number": 9195993474, "password": "lalala", "user_id": 1, "username": "piyue" } ]'
app.get('/', (req, res) => {
    r.db("Weatherwayz").table('Users').
    run(connection, function(err, result) {
        if (err) throw err;
        res.send(JSON.stringify(result._responses[0].r, null, 2));
    });
})

app.listen(3000, () => console.log('Server running on port 3000'))

