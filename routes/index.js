var persistence = require('../tdpersistence');

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
    if(valid){
        persistence.findByDate(req.params.date, function(err, doc){
            if(err) throw err;

            var prevDate, nextDate;

            console.dir(doc);
            if(doc){
                persistence.findPrevByRealDate(doc.realdate, function(err1, prev){
                    if(err1) throw err1;
                    if(prev){
                        console.dir("Prev date:" + prev.date);
                        prevDate = prev.date;
                    }
                    persistence.findNextByRealDate(doc.realdate, function(err2, next){
                        if(err2) throw err2;
                        if(next){
                            console.dir("Next date:" + next.date);
                            nextDate = next.date;
                        }
                        res.render('tdlist', {tdlist : doc,
                                                title: doc.date,
                                                nextDate: nextDate,
                                                prevDate: prevDate});
                    });

                });

            }else{
                res.render('missing', {title: "Missing TD list", d: req.params.date});
            }
        });
    }else{
        res.render('invalid', {title: "Invalid request"});
    }
};