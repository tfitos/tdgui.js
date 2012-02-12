var persistence = require('../tdpersistence');
var async = require('async');

// e.g. 2012-FEB-05
var DATEEXP = /^\d{4}-\w{3}-\d{2}$/;

/*
    Connect to database.
 */
persistence.connect(function(err){
    if(err) throw err;
    console.log("Connected to db.");
});

/*
    Handling index request.
 */
exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

/*
    Handling date requests.
 */
exports.tdlist = function(req, res){
    console.log("Request: " + req.params.date);
    var valid = DATEEXP.exec(req.params.date);
    var doc, nextDate, prevDate;
    if(valid){
        async.series([
            function(callback){
                persistence.findByDate(req.params.date, function(err, docu){
                    if(err) throw err;

                    var prevDate, nextDate;
                    console.dir(docu);
                    if(docu){
                        doc = docu;
                        callback(null);
                    }else{
                        res.render('missing', {title: "Missing TD list", d: req.params.date});
                    }
                });
            },
            function(callback){
                persistence.findPrevByRealDate(doc.realdate, function(err1, prev){
                    if(err1) throw err1;
                    if(prev){
                        console.dir("Prev date:" + prev.date);
                        prevDate = prev.date;
                    }
                    callback(null);
                });
            },
            function(callback){
                persistence.findNextByRealDate(doc.realdate, function(err2, next){
                    if(err2) throw err2;
                    if(next){
                        console.dir("Next date:" + next.date);
                        nextDate = next.date;
                    }
                    callback(null);

                });
            },
            function(callback){
                res.render('tdlist', {tdlist : doc,
                    title: doc.date,
                    nextDate: nextDate,
                    prevDate: prevDate});
                callback(null);
            }
        ]);

    }else{
        res.render('invalid', {title: "Invalid request"});
    }
};