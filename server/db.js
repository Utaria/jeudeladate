const mysql = require('mysql');
const config = require('../config');

const db = mysql.createPool(config.db);

module.exports = db;