var remjson = require(__dirname + '/../..');

// create a server
var server = remjson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

// Bind a http interface to the server and let it listen to localhost:3000
server.http().listen(3000);
