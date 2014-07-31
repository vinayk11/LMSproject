
var express = require('express'),
   routes = require('./routes'),
   User = require('./routes/user'),
   employeeInfo = require('./routes/employeeRecords'),
   http = require('http'),
   path = require('path'),
   nodemailer = require("nodemailer"),
   cookieParser = require( "cookie-parser" ),
   session = require('express-session'),
   RedisStore = require('connect-redis')(session),
   //redisStore = require('connect-redis')(express),
   passport = require('passport'),
   googleStrategy = require('passport-google-oauth').OAuth2Strategy,
   clientID = '888479721397-aeuk0osmgfe92998srsevoo9ies6rese.apps.googleusercontent.com',
   clientSecret	='u0RtLkq0HYrDiyp2mmIlfjVo',
   app = express(),
   userProfile={};
	var accessToken;
	var smtpTransport= nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
    	
        user: "vinaykumar.korupolu@atmecs.com",
        pass: "password"
    }
});
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.session({ store: new RedisStore({
	  host:'127.0.0.1',
	  port:6380,
	  prefix:'sess'
	}), secret: 'SEKR37' }));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


var mailOptions = {
	    from: 'Fred Foo ✔ <foo@blurdybloop.com>', // sender address
	    to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
	    subject: 'Hello ✔', // Subject line
	    text: 'Hello world ✔', // plaintext body
	    html: '<b>Hello world ✔</b>' // html body
	};
//transporter.sendMail(data, callback);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
passport.use(new googleStrategy({
		    clientID        : clientID,
		    clientSecret    : clientSecret,
		    callbackURL     : 'http://localhost:3000/oauth2callback',
		
		},
		function(accessToken, refreshToken, profile, done) {
			console.log("is loggedin1");
			// make the code asynchronous
			// User.findOne won't fire until we have all our data back from Google
			if(profile._json.hd === "atmecs.com"){
			process.nextTick(function() {
				
				userProfile.email= profile.emails[0].value;
				accessToken=accessToken;
				done(null, profile);
		        // try to find the user based on their google id
		    });
			}
			else
				{
				
			        // fail        
			        done(new Error("Invalid host domain"));
			    
				}
		}));

passport.serializeUser(function(user, done) {
    	done(null, user.id);
	});

passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
        done(err, user);
		});
	});

app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
	
app.get('/oauth2callback',
        passport.authenticate('google', {
                successRedirect : '/home',
                failureRedirect : '/'
        }));
app.get('/', routes.index);

app.get('/home', function(req, res, next) {
	
		var user_id= userProfile.email;
		//employeeInfo.getLeaveDetails(user_id,function(err,leaveStatus){
			//console.log("levestatus"+JSON.Stringfy(leaveStatus));
			res.render('home.ejs',{userId :user_id });
		//});
	});

app.post('/getLeaveDetails',function(req,res){
	console.log("userEmail"+req.body.userId);
	employeeInfo.getLeaveDetails(req.body.userId,function(err,leaveDetails){
		res.json(leaveDetails);
		
	});
	/*var hello={};
	hello.name="hello";
	res.json(hello);*/
});
app.get('/holidayList',function(req,res){
	employeeInfo.holidayList(req,function(err,items){
		res.json(items);
		
	});
});

app.post('/submitLeave', function(req,res) {
	employeeInfo.submitLeave(req.body,function( error, docs){
		res.json(docs);
	});
});

app.post('/cancelLeave', function(req,res) {
	
	employeeInfo.cancelLeave(req.body,function( error, docs){
		res.json(docs);
	});
});

app.get('/emp-leaves', function(req, res) {
	employeeInfo.findEmployeesLeave(req,function(err,result){
		res.json(result);
		
	});
});

app.post('/emp-leaves/approve', function(req,res) {
	employeeInfo.leaveAction(req.body,function( error, status){
		res.json(status);
	});

});

app.post('/addemployee', function(req, res,next){
	employeeInfo.addEmployee(req.body, function( error, docs) {
        res.json(docs); // return user json if ok	
    });
});

app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		{
		return next();
		}
	else
		{
		console.log("is loggedin");
		return next();
		}
	
	
	}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
