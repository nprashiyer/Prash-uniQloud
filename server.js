//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const request = require('request');
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODBCONNECTION, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const orderSchema = new mongoose.Schema ({
  platform: String,
  name: String,
  location: String,
  os: String
});

const Order = new mongoose.model("Order", orderSchema, "orders");

const User = new mongoose.model("User", userSchema, "users");

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    res.sendFile(__dirname + "/index.html");
});

app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log("Not authroized");
      console.log(err);
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/home");
      })
    }
  });
});



app.get("/home", function(req, res){
  if (req.isAuthenticated()){
    res.render("home");
  } else {
    res.redirect("/");
  }

});


app.get("/userguide", function(req, res){
  if (req.isAuthenticated()){
    res.render("userguide");
  } else {
    res.redirect("/");
  }
});


app.get("/myservers", function(req, res){
  if(req.isAuthenticated()){
    Order.find({}, function(err, foundOrders){
      if(err) {
        console.log(err);
      } else if (foundOrders) {
        res.render("myservers", {orderList: foundOrders});
          }
    });
  } else {
    res.redirect("/");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


app.post("/", function(req,res){

  const vmname = req.body.vmname.toLowerCase();
  const platform = req.body.platform;
  const loc = req.body.vmlocation;
  const os =  req.body.vmos;
  const size = req.body.usage + req.body.vmsize;

  const username = process.env.TOWER_USER ,
  password = process.env.TOWER_PASS ;
  var x = "\{\"name\": \""+    vmname  +"\",\"region\": \""+    loc  +"\", \"os\": \""+    os  +"\",\"size\": \""+    size  +"\" }";
  var data = {"extra_vars" : x};
  var l = JSON.stringify(data);

  if (platform == "AWS"){
    var myurl = 'http://' + username + ':' + password + process.env.TOWER + '15/launch/';
  } else if (platform == "Azure") {
  var myurl = 'http://' + username + ':' + password + process.env.TOWER + '16/launch/';
} else if (platform == "GCP") {
  var myurl = 'http://' + username + ':' + password + process.env.TOWER + '17/launch/';
} else{
  console.log("Error");
}

request.post({
      headers: {'Content-Type': 'application/json'},
      url: myurl,
      body: l
  }, function(error, response, body){
    console.log(body);
  });

res.render("submit",{vmname: vmname});

// if ends here

    const newOrder = new Order({
    platform: platform,
    name: vmname,
    location: loc.toUpperCase(),
    os: os.toUpperCase()
    });

    newOrder.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.render("/submit");
    }
  });
});


app.post("/del", function(req,res){
    const vmname = req.body.servername;
    Order.findOne({name: vmname}, function(err, foundOrder){
      if(err){
        console.log(err);
      } else {
        foundOrder.remove();
      }
      res.redirect("/myservers");
    });
});



app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000.");
});
