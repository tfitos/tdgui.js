var Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

var HOST = 'localhost';
var PORT = Connection.DEFAULT_PORT;

module.exports = (function(){
    var db = new Db('td', new Server(HOST, PORT, {}), {});
    var tdlist;

    return {
        connect: function(cb){
            db.open(function(err, db) {
                db.collection('tdlist', function(err, collection) {
                  tdlist = collection;
                  cb(err);
                });
            });
        },
        findByDate: function (datestr, cb){
            tdlist.find({'date': datestr}, function(err, cursor) {
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
        },
        findPrevByRealDate: function (realdate, cb){
            tdlist.find({'realdate': {'$lt': realdate }}, {'sort':{'realdate': -1}, 'limit':1}, function(err,cursor){
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
        },
        findNextByRealDate: function (realdate, cb){
            tdlist.find({'realdate': {'$gt': realdate }}, {'sort':{'realdate': 1}, 'limit':1}, function(err,cursor){
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
        }
    }
}());
