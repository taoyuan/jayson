"use strict";

var should = require('should');
var _ = require('lodash');
var remjson = require(__dirname + '/../');
var support = require(__dirname + '/support');
var common = support.common;
var net = require('net');
var url = require('url');

var Counter = require('./support/counter');
var coder = {
  code: 0x42,
  type: Counter,
  encode: function (obj) {
    var buf = new Buffer(4);
    buf.writeInt32BE(obj.count, 0);
    return buf;
  },
  decode: function (data) {
    return new Counter(data.readInt32BE(0));
  }
};

describe('RemJson.Mqtt', function () {

  describe('integration', function () {

    var options = {
      topic: '$foo',
      coder: coder
    };

    var mqttserver = buildMqttServer();
    var server = remjson.server(support.server.methods, support.server.options).mqtt(mqttserver.url, options);
    var client = remjson.client.mqtt(mqttserver.url, options);

    before(function (done) {
      server.ready(function () {
        client.ready(done);
      });
    });

    after(function (done) {
      client.close(function () {
        server.close(function () {
          mqttserver.close(done);
        });
      });
    });

    describe('common tests', common(client));
  });

});

function buildMqttServer(port, cb) {
  if (typeof port === 'function') {
    cb = port;
    port = undefined;
  }

  port = port || 43210;

  var Server = require('mosca').Server;
  var server = new Server({port: port}, cb);
  server.url = 'mqtt://localhost:' + port;
  server.port = port;
  return server;
}

