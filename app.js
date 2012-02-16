
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , login = require('./routes/login');
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
        secret: 'randomstring'
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




app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.root);
app.get('/logout', login.logout);
app.get('/login', login.loginGet);
app.post('/login', login.loginPost);
app.get('/tdlist/:date', login.restrict, login.accessLogger, routes.tdlist);
app.get('/dashboard', login.restrict, login.accessLogger, routes.dashboard);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
