const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'belanj_pic',
    timezone: '+00:00'
  }
});

const { attachPaginate } = require('knex-paginate');
attachPaginate();

module.exports = knex;