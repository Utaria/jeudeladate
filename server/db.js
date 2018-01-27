const mysql = require('mysql');
const config = require('../storage/config');

const db = mysql.createPool(config.db);

module.exports = db;