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
    weatherwayz.table('Users').getAll(req.body.email, {index: 'email'}).
    union(weatherwayz.table('Users').getAll(req.body.number, {index: 'number'})).
    run(connection, function(err, result){
        if (result._responses.length == 0) {
            weatherwayz.table('Users').insert(req.body).
            run(connection, function(err, result){
                if (err) res.send(err);
                else res.json(result);
            })
        } else res.json(false)
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
    pluck('username', 'email', 'number', 'image', 'location').
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

//search function, return all users that fit in the search index
//return null if no such user
app.get('/search', (req, res) => {
    weatherwayz.table('Users').getAll(req.query.index).union(
        weatherwayz.table('Users').filter({number: req.query.index})
      ).union(
        weatherwayz.table('Users').filter({email: req.query.index})
      ).pluck('username', 'email', 'number', 'image', 'location').distinct().
      run(connection, function(err, result) {
          if (err) res.send(err);
          else if (result.length == 0){
              res.json(null)
          } else {
              res.json(result)
          }
      })
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

//get the most recent outfit post of a user
app.get('/recentpost/:username', (req, res) => {
    weatherwayz.table('OutlookPosts').getAll(
        req.params.username, {index: 'username'})
    .orderBy(r.desc('date')).limit(1).
    run(connection, function(err, result) {
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

//delete a post with its post_id, working for either outlook or weather post id
app.delete('/allposts/:post_id', (req, res) => {
    weatherwayz.table('WeatherPosts').get(req.params.post_id).delete().
    run(connection, function(err, result){
        if (err) res.send(err);
        else if (result.deleted) res.send(result);
        else {
            weatherwayz.table('OutlookPosts').get(req.params.post_id).delete().
            run(connection, function(err, result){
                if (err) res.send(err);
                else res.send(result);
            })
        }
    })
})

//get all weather and outlook posts from database for a specific username
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

//------api calls for table "FriendRequests"------

app.route('/friendrequests/:username')
//generate a new friend request between two users
//return false if such request already existed, a table with "inserted": 1 means success
.put((req, res) => {
    req.body.user_from_id = req.params.username
    let t = weatherwayz.table('FriendRequests').getAll(req.body.user_from_id, {index: "user_from_id"})
    t('user_to_id').union(
        weatherwayz.table('FriendRequests').getAll(req.body.user_from_id, {index: "user_to_id"})
        ('user_from_id')
    ).contains(req.body.user_to_id).
    run(connection, function(err, result){
        if (!result){
            weatherwayz.table('FriendRequests').insert(req.body).
            run(connection, function(err, result){
                if (err) res.send(err)
                else res.json(result)
            })
        } else res.json(false)
    })
})
//get a list of friend requests waiting to be handled
.get((req, res) => {
    let t = weatherwayz.table('FriendRequests').getAll(false, {index: 'status'})
    t.filter({user_to_id: req.params.username}).distinct().
    run(connection, function(err, result){
        if (err) res.send(err)
        else res.json(result)
    })
})

app.route('/friendrequests/:request_id')
//confirm adding friend from another user
.post((req, res) => {
    weatherwayz.table('FriendRequests').get(req.params.request_id).update(
        {
            "status": true
        }
    ).run(connection, function(err, result){
        if (err) res.send(err)
        else res.json(result)
    })
})
//delete a friend request, meaning rejection
.delete((req, res) => {
    weatherwayz.table('FriendRequests').get(req.params.request_id).delete().
    run(connection, function(err, result){
        if (err) res.send(err);
        else res.json(result)
    })
})

app.route('/friendlist/:username')
//get a list of friends for a specific user
.get((req, res) => {
    let t = weatherwayz.table('FriendRequests').getAll(true, {index: 'status'})
    t.filter({user_from_id: req.params.username})('user_to_id').union(
        t.filter({user_to_id: req.params.username})('user_from_id')
    ).distinct().
    run(connection, function(err, result){
        if (err) res.send(err)
        else res.json(result)
    })
})
//delete a friend from friendlist
.delete((req, res) => {
    let t = weatherwayz.table('FriendRequests').getAll(true, {index: 'status'})
    t.filter(function(doc){
        return doc('user_from_id').eq(req.params.username).and(doc('user_to_id').eq(req.query.user2))
    }).union(
        t.filter(function(doc){
            return doc('user_to_id').eq(req.params.username).and(doc('user_from_id').eq(req.query.user2))
        }
        )
    )('id').distinct()
    .run(connection, function(err, result){
        weatherwayz.table('FriendRequests').get(result[0]).delete().
        run(connection, function(err, result){
            if (err) res.send(err)
            else res.json(result)
        })
    })
})

//check if 2 users are friends
app.get('/checkfriend/:username', (req, res) => {
    let t = weatherwayz.table('FriendRequests')
    t.filter(function(doc){
        return doc('user_from_id').eq(req.params.username).and(doc('user_to_id').eq(req.query.user2))
    }).union(
        t.filter(function(doc){
            return doc('user_to_id').eq(req.params.username).and(doc('user_from_id').eq(req.query.user2))
        }
        )
    ).distinct()
    .run(connection, function(err, result){
        if (err) res.send(err)
        if (result.length == 0) res.json(null)
        else res.send(result[0].status)
    })
})

app.listen(3000, () => console.log('Server running on port 3000'))
