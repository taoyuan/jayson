"use strict";

var should = require('should');
var mqttr = require('mqttr');
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

  var mqttserver = support.buildMqttServer();

  after(function (done) {
    mqttserver.close(done);
  });

  describe('server', function () {

    it('should support mqtt client and not owned the client', function (done) {
      var mqttclient = mqttr.connect(mqttserver.url);
      mqttclient.ready(function () {
        var server = remjson.server(support.server.methods, support.server.options).mqtt(mqttclient, '$foo');
        server.client.should.equal(mqttclient);
        server.topic.should.equal('$foo');
        server.ready(function () {
          server.close(function () {
            mqttclient.connected.should.ok();
            mqttclient.end(done);
          });
        });
      });
    });

    it('should support mqtt url and owned the mqtt client', function (done) {
      var server = remjson.server(support.server.methods, support.server.options).mqtt(mqttserver.url, '$foo');
      server.topic.should.equal('$foo');
      server.ready(function () {
        server.close(function () {
          server.client.connected.should.not.ok();
          done();
        });
      });
    });

  });

  describe('integration', function () {

    var options = {
      topic: '$foo',
      coder: coder
    };

    var server = remjson.server(support.server.methods, support.server.options).mqtt(mqttserver.url, options);
    var client = remjson.client.mqtt(mqttserver.url, options);

    before(function (done) {
      server.ready(function () {
        client.ready(done);
      });
    });

    after(function (done) {
      client.close(function () {
        server.close(done);
      });
    });

    describe('common tests', common(client));

    describe('request', function () {
      it('should return immediately with timeout is 0', function (done) {
        var a = 11, b = 12;
        client.request('add', [a, b], {timeout: 0}, function (err, error, result) {
          should.not.exist(err);
          should.not.exist(error);
          should.not.exist(result);
          done();
        });
      });

      it('should callback with timeout error when request is timeout', function (done) {
        var a = 11, b = 12;
        client.request('add', [a, b], {timeout: 1}, function (err, error, result) {
          should.exist(err);
          err.name.should.equal('TimeoutError');
          should.not.exist(error);
          should.not.exist(result);
          done();
        });
      });
    })
  });
});
