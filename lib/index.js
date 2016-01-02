/**
 * Namespace available as require('remjson')
 * @namespace remjson
 */
var remjson = module.exports;

/**
 * @static
 * @type Client
 */
remjson.Client = remjson.client = require(__dirname + '/client');

/**
 * @static
 * @type Server
 */
remjson.Server = remjson.server = require(__dirname + '/server');

/**
 * @static
 * @type Utils
 */
remjson.Utils = remjson.utils = require(__dirname + '/utils');

/**
 * @static
 * @type Method
 */
remjson.Method = remjson.method = require(__dirname + '/method');
