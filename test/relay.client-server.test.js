var should = require('should');
var remjson = require(__dirname + '/..');
var support = require('./support');
var common = support.common;

describe('RemJson.Relay', function () {

  describe('server', function () {

    it('should be created with a client as a method', function () {
      var server = remjson.server(support.methods, support.server.options);
      remjson.server({add: remjson.client(server)}, support.server.options);
    });

  });

  describe('client', function () {

    var options = support.server.options;

    var front_server = remjson.server({}, options);
    var back_server = remjson.server(support.server.methods, options);
    var relay_client = remjson.client(back_server, options);
    var front_client = remjson.client(front_server, options);

    // replace all methods in front server with the client
    Object.keys(back_server._methods).forEach(function (name) {
      front_server.method(name, relay_client);
    });

    describe('common tests', common(front_client));

  });

});
