var should = require('should');
var rj = require(__dirname + '/..');
var support = require('./support');
var common = support.common;

describe('RJ.Relay', function () {

  describe('server', function () {

    it('should be created with a client as a method', function () {
      var server = rj.server(support.methods, support.server.options);
      rj.server({add: rj.client(server)}, support.server.options);
    });

  });

  describe('client', function () {

    var options = support.server.options;

    var front_server = rj.server({}, options);
    var back_server = rj.server(support.server.methods, options);
    var relay_client = rj.client(back_server, options);
    var front_client = rj.client(front_server, options);

    // replace all methods in front server with the client
    Object.keys(back_server._methods).forEach(function (name) {
      front_server.method(name, relay_client);
    });

    describe('common tests', common(front_client));

  });

});
