var remjson = require(__dirname + '/../..');

var server = remjson.server({
  ping: function(callback) {
    // do something
    callback();
  }
});

server.http().listen(3000);
