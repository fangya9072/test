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
    res.send("Welcome to WeatherWayz API!\n");
})

//------api calls for table "Users"------

app.route('/users')
//create a new user in database
.put((req, res) => {
    weatherwayz.table('Users').insert(req.body).
    run(connection, function(err, result){
        if (err) res.send(err);
        else res.json(result);
    })
})
//get ALL users and their information in database, for test only
.get((req, res) => {
    weatherwayz.table('Users').
    run(connection, function(err, result) {
        if (err) res.send(err);
        else res.json(result._responses[0].r)
    });
})

//functions for a specific user
app.route('/users/:username')
//get information of a specific user with its username
//if the username does not exist, it returns null
.get((req, res) => {
    weatherwayz.table('Users').get(req.params.username).
    run(connection, function(err, result) {
        if (err) res.send(err);
        else res.json(result);
    })
})
//update users location coordinate or other information(not username)
.post((req, res) => {
    weatherwayz.table('Users').get(req.params.username).update(
        req.body
    ).run(connection, function(err, result) {
        if(err) res.send(err);
        else res.json(result);
    })
})

//login as a user with username and password
//return null if username not found, false if password wrong and true if password correct
app.get('/login',(req, res) => {
    weatherwayz.table('Users').get(req.query.username).
    run(connection, function(err, result) {
        if (err) res.send(err);
        if (result == null) {
            res.json(null)
        } else {
            if (req.query.password === result.password){
                res.json(true)
            } else {
                res.json(false)
            }
	    }
    });
})

//------api calls for table "OutlookPosts"------

app.route('/outlookposts')
//get ALL outlook posts
.get((req, res) => {
    weatherwayz.table('OutlookPosts').
    run(connection, function(err, result) {
        if (err) res.send(err);
        else res.json(result._responses[0].r)
    });
})

//functions for a specific user
app.route('/outlookposts/:username')
//get outfit posts for a specific user
.get((req, res) => {
    weatherwayz.table('OutlookPosts').getAll(
        req.params.username, {index: 'username'}).orderBy('date').
    run(connection, function(err, result) {
        if (err) res.send(err);
        else res.json(result);
    })
})
//create a new outlook post in table
.put((req, res) => {
    req.body.username = req.params.username;
    weatherwayz.table('OutlookPosts').insert(req.body).
    run(connection, function(err, result){
        if (err) res.send(err);
        else res.json(result);
    })
})

//------api calls for table "WeatherPosts"------

//functions for a specific user
app.route('/weatherposts/:username')
//get weather posts of a specific user
.get((req, res) => {
    weatherwayz.table('WeatherPosts').getAll(
        req.params.username, {index: 'username'}).orderBy('date').
    run(connection, function(err, result) {
        if (err) res.send(err);
        else res.json(result);
    })
})
//create a new weather post in table
.put((req, res) => {
    req.body.username = req.params.username;
    weatherwayz.table('WeatherPosts').insert(req.body).
    run(connection, function(err, result){
        if (err) res.send(err);
        else res.json(result);
    })
})

app.get('/allposts/:username', (req, res) => {
    weatherwayz.table('WeatherPosts').getAll(
        req.params.username, {index: 'username'}).union(
            weatherwayz.table('OutlookPosts').getAll(
            req.params.username, {index: 'username'})
        ).orderBy('date').
    run(connection, function(err, result){
        if (err) res.send(err)
        else res.json(result)
    })
})


app.listen(3000, () => console.log('Server running on port 3000'))
