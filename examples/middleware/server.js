var remjson = require(__dirname + '/../..');
var connect = require('connect');
var app = connect();

var server = remjson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  }
});

// parse request body before the remjson middleware
app.use(connect.bodyParser());
app.use(server.middleware());

app.listen(3000);
