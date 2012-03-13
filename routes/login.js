var crypto = require('crypto');

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


exports.restrict = function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/td/login');
    }
}

exports.accessLogger = function (req, res, next) {
    console.log('restricted accessed by %s', req.session.user.name);
    next();
}


exports.logout = function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
        res.redirect('/td/login');
    });
};

exports.loginGet = function(req, res){
    if (req.session.user) {
        req.session.success = 'Authenticated as ' + req.session.user.name
            + ' click to <a href="/td/logout">logout</a>. ';
    }
    res.render('login', {title: "Login", layout: "layout-outside"});
};

exports.loginPost = function(req, res){
    authenticate(req.body.username, req.body.password, function(err, user){
        if (user) {
            // Regenerate session when signing in
            // to prevent fixation
            req.session.regenerate(function(){
                // Store the user's primary key
                // in the session store to be retrieved,
                // or in this case the entire user object
                req.session.user = user;
                res.redirect('/td/dashboard');
            });
        } else {
            req.session.error = 'Authentication failed, please check your '
                + ' username and password.';
            res.redirect('back');
        }
    });
};
