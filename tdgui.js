var persistence = require('./tdpersistence');

persistence.findByDate('2012-FEB-09', function(err, doc){
   if(err) { console.log("ERROR: " + err); return; }
   console.dir(doc);

});