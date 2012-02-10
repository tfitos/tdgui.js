var Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

var HOST = 'localhost';
var PORT = Connection.DEFAULT_PORT;

module.exports = (function(){
    var db = new Db('td', new Server(HOST, PORT, {}), {});

    return {
        findByDate: function (datestr, cb){
            db.open(function(err, db) {
                if(err){ cb(err); }
                db.collection('tdlist', function(err, collection) {
                    if(err){ cb(err); }
                    collection.find({'date': datestr}, function(err, cursor) {
                        if(err){ cb(err); }
                        cursor.toArray(function(err, docs) {
                            if(err){ cb(err); }
                            if(docs.length > 0){
                                cb(null, docs[0]);
                            }else{
                                cb(null, null);
                            }
                        });
                    });
                });
            });
        }
    }
}());
