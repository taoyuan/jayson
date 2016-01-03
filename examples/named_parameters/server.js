var remjson = require(__dirname + '/../..');

var server = remjson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

server.http().listen(3000);
