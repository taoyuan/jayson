"use strict";

var assert = require('assert');
var _ = require('lodash');
var util = require('util');
var utils = require('../utils');
var Client = require('../client');

/**
 *  Constructor for a RJ HTTPS Client
 *  @class MqttClient
 *  @constructor
 *  @extends Client
 *  @param {Object|String} client The mqtt client or mqtt url
 *  @param {Object|String} options The options or topic string
 *  @param {String} options.topic The topic string
 *  @param {Object} [options.log] The log object
 *  @param {Object} [log] The log object
 *  @return {MqttClient}
 *  @api public
 */
function MqttClient(client, options, log) {
  if (!(this instanceof MqttClient)) return new MqttClient(client, options, log);

  Client.call(this);

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

  this.subscriptions = {};
  this.pendings = {};
  this.idmap = {};
}

util.inherits(MqttClient, Client);

MqttClient.prototype._request = function (request, options, callback) {
  var that = this;
  var client = this.client;

  options = options || {};
  var topic = options.topic || this.topic;
  var timeout = options.timeout;
  if (timeout === undefined) timeout = 100;

  // topic is required
  if (!topic) throw new Error('"topic" is required');

  //if (Array.isArray(request)) throw new Error('Array request not supported now');

  var ids = request.id ? [request.id] : [];
  if (Array.isArray(request)) {
    _.forEach(request, function (req) {
      if (req.id) ids.push(req.id);
    })
  }

  this.ready(function () {
    // subscribe reply if timeout is provided
    if (timeout && ids.length) {
      var replyTopic = topic + "/reply";

      if (!that.subscriptions[replyTopic]) {
        that.log.debug("Subscribing to", replyTopic);

        that.subscriptions[replyTopic] = client.subscribe(replyTopic, function (topic, payload) {
          // handle response
          that.handleResponse(topic, payload);
        });
      }
    }

    that.log.debug("< Outgoing to %s : %j", topic, request);

    // publish request
    client.publish(topic, request, function () {
      if (timeout && ids.length) {
        var timer = setTimeout(function () {

          if (that.pendings[ids]) {
            callback(new Error(util.format('Timeout in %d second for request %s: %j', timeout / 1000, topic, request)));
          }

          that.removePending(ids, true);

          if (that.log.isDebugEnabled()) {
            that.log.debug("id:%j - Call to service %s - timed out after %d seconds", ids, topic, timeout / 1000);
          }
        }, timeout);

        // map id -> ids
        _.forEach(ids, function (id) {
          that.idmap[id] = ids;
        });

        that.pendings[ids] = {
          done: callback,
          timer: timer
        };
      } else {
        callback();
      }
    });
  });
};

MqttClient.prototype.handleResponse = function (topic, payload) {
  this.log.debug("< Incoming to %s : %j", topic, payload);

  var res = payload;
  if (Array.isArray(payload)) {
    res = _.find(payload, 'id');
  }
  var id = res && res.id;

  if (!id) {
    return this.log.debug("Failed to decode reply: %j", payload);
  }

  var ids = this.idmap[id];
  var pending = this.removePending(ids);
  if (pending) {
    pending.done(null, payload);
  }
};

MqttClient.prototype.removePending = function (ids, isTimeout) {
  if (!ids) return;

  var that = this;
  var pending = this.pendings[ids];
  if (pending) {
    if (!isTimeout) clearTimeout(pending.timer);

    delete this.pendings[ids];
    _.forEach(ids, function (id) {
      delete that.idmap[id];
    });
  }
  return pending;
};

MqttClient.prototype.ready = function (cb) {
  this.client.ready(cb);
  return this;
};


MqttClient.prototype.close = function (done) {
  if (this.owned) {
    this.log.debug('close mqtt connection');
    this.client.end(done);
  } else {
    done();
  }
};

module.exports = MqttClient;
