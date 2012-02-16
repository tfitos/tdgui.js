
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , crypto = require('crypto');
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.session({
        secret: 'randomstring',
  }));
  app.use(app.router);
});

app.dynamicHelpers({
  message: function(req){
    var err = req.session.error
      , msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    if (err) return '<div class="alert alert-error">' + err + '</div>';
    if (msg) return '<div class="alert alert-success">' + msg + '</div>';
  }
});

var users = {
  tamas: {
    name: 'tamas'
    , salt: 'randomly-generated-salt'
    , pass: hash('tamas', 'randomly-generated-salt')
  }
};

function hash(msg, key) {
  return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

function authenticate(name, pass, fn) {
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  if (user.pass == hash(pass, user.salt)) return fn(null, user);
  // Otherwise password is invalid
  fn(new Error('invalid password'));
}


function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

function accessLogger(req, res, next) {
  console.log('restricted accessed by %s', req.session.user.name);
  next();
}


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res){
  res.redirect('/login');
});
app.get('/restricted', restrict, accessLogger, function(req, res){
  res.send('Wahoo! restricted area');
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/login');
  });
});

app.get('/login', function(req, res){
  if (req.session.user) {
    req.session.success = 'Authenticated as ' + req.session.user.name
      + ' click to <a href="/logout">logout</a>. '
      + ' You may now access <a href="/restricted">/restricted</a>.';
  }
  res.render('login', {title: "Login"});
});

app.post('/login', function(req, res){
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation 
      req.session.regenerate(function(){
        // Store the user's primary key 
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        res.redirect('/dashboard');
      });
    } else {
      req.session.error = 'Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tamas" and "tamas")';
      res.redirect('back');
    }
  });
});



//app.get('/', routes.index);
app.get('/tdlist/:date', restrict, accessLogger, routes.tdlist);
app.get('/dashboard', restrict, accessLogger, routes.dashboard);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
