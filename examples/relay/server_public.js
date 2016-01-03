var remjson = require(__dirname + '/../..');

// create a server where "add" will relay a localhost-only server
var server = remjson.server({
  add: remjson.client.http({
    hostname: 'localhost',
    port: 3001
  })
});

// let the server listen to *:3000
server.http().listen(3000, function() {
  console.log('Listening on *:3000');
});
