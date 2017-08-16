const elasticsearch = require('elasticsearch');
const config = require('../config');

let client;

module.exports = function () {
  if (!client) {
    client = new elasticsearch.Client({
      hosts: config.es_hosts
    });
  }

  return client;
}