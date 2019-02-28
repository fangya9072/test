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
    next();
});

//connect to our database
var r = require("rethinkdb");
var obj2 = {host: '34.204.183.169', port: 28015, user: 'admin'};
var connection = null;
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

//------api calls for table "Users"------

app.route('/users')
//create a new user in database
.post((req, res)=>{
    var max;
    weatherwayz.table('Users').max("user_id").
    run(connection, function(err, result){
        //generate user_id that is the largest in all existing users
        max = result.user_id
        req.body.user_id = max + 1;
        req.body.number = parseInt(req.body.number);

        weatherwayz.table('Users').insert(req.body).
        run(connection, function(err, result){
            if (err) res.send(err);
            res.json(result)
        })
    })
})
//get ALL users and their information in database
.get((req, res) => {
    weatherwayz.table('Users').
    run(connection, function(err, result) {
        if (err) res.send(err);
        res.json(result._responses[0].r)
    });
})


//get information of a specific user with its user_id
//if the user_id does not exist, it returns null
app.get('/users/:user_id',(req, res) => {
    weatherwayz.table('Users').get(parseInt(req.params.user_id)).
    run(connection, function(err, result) {
        if (err) res.send(err);
        res.json(result);
    });
})


app.listen(3000, () => console.log('Server running on port 3000'))
