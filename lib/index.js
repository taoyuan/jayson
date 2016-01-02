/**
 * Namespace available as require('rj')
 * @namespace rj
 */
var rj = module.exports;

/**
 * @static
 * @type Client
 */
rj.Client = rj.client = require(__dirname + '/client');

/**
 * @static
 * @type Server
 */
rj.Server = rj.server = require(__dirname + '/server');

/**
 * @static
 * @type Utils
 */
rj.Utils = rj.utils = require(__dirname + '/utils');

/**
 * @static
 * @type Method
 */
rj.Method = rj.method = require(__dirname + '/method');
