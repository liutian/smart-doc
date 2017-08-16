const config = require('../config');
const esClient = require('./es-factory')();

_mapping();

function _mapping() {
  esClient.indices.putMapping({
    index: 'man',
    type: 'article',
    body: {
      properties: {
        content: {
          type: 'text',
          analyzer: 'ik_max_word',
          search_analyzer: 'ik_max_word'
        },
        des: {
          type: 'text',
          analyzer: 'ik_max_word',
          search_analyzer: 'ik_max_word'
        },
        title: {
          type: 'text',
          analyzer: 'ik_max_word',
          search_analyzer: 'ik_max_word'
        },
        state: {
          type: 'text',
          index: 'not_analyzed'
        },
        createBy: {
          type: 'text',
          index: 'not_analyzed'
        },
        manId: {
          type: 'text',
          index: 'not_analyzed'
        },
        siteId: {
          type: 'text',
          index: 'not_analyzed'
        }
      }
    }
  }, function (err) {
    if (err) console.error(err);
  })
}