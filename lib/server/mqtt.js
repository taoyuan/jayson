"use strict";

var assert = require('assert');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

function MqttServer(server, client, options, log) {
  if (!(this instanceof MqttServer)) return new MqttServer(server, client, options, log);

  EventEmitter.call(this);

  if (typeof options === 'string') {
    options = {topic: options};
  }

  assert(options, '"options" is required');
  assert(options.topic, '"options.topic" is required');

  if (typeof client === 'string') {
    this.client = require('mqttr').connect(client, options);
    this.owned = true;
  } else {
    this.client = client;
  }

  this.log = log = log || options.log || require('logs').get('mqtt-server-transport');
  this.topic = options.topic;

  var that = this;
  this.subscription = this.client.subscribe(options.topic, function (topic, payload) {
    server.call(payload, function (error, success) {
      var response = error || success;
      if (!that.client.connected || !response) return;

      var shouldReply = false;
      if (Array.isArray(response)) {
        shouldReply = _.find(response, function (item) {
          return !!item.id
        })
      } else {
        shouldReply = response.id;
      }

      if (shouldReply) {
        var replyTopic = topic + "/reply";
        log.debug('< Outgoing to ("%s": %j)', replyTopic, response);
        that.client.publish(replyTopic, response);
      }
    });
  });
}

util.inherits(MqttServer, EventEmitter);

MqttServer.prototype.ready = function (cb) {
  this.client.ready(cb);
  return this;
};

MqttServer.prototype.close = function (done) {
  this.subscription.cancel();
  if (this.owned) {
    this.log.debug('close mqtt connection');
    this.client.end(done);
  } else {
    done();
  }
};

module.exports = MqttServer;
