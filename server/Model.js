const mysql = require('mysql');
const config = require('../config');

const db = mysql.createPool(config.db);

function Model() {

}

Model.prototype = {

    /*   PLAYERS   */

    getPlayerForCookie: function(cookie, callback) {
        db.query("select * from players where cookie = ?", [cookie], function(err, data) {
            if (err || !data || data.length === 0)
                callback(err, null);
            else
                callback(null, data[0]);
        });
    },

    newPlayer: function(cookie, ip, callback) {
        db.query("INSERT INTO players(cookie, ip) values(?, ?)", [cookie, ip], callback);
    },

    savePlayerInfo: function(id, ip) {
        db.query("UPDATE players SET ip = ?, connection_time = NOW() WHERE id = ?", [ip, id], function(err, data) {
            if (err) console.error(err);
        });
    },

    savePlayerLevel: function(cookie, level) {
        db.query("UPDATE players SET level_id = ? WHERE cookie = ?", [level, cookie], function(err) {
            if (err) console.error(err);
        });
    },

    saveRemainingClicks: function(cookie, clicks) {
        db.query("UPDATE players SET remaining_clicks = ? WHERE cookie = ?", [clicks, cookie], function(err) {
            if (err) console.error(err);
        });
    },


    /*   LEVELS   */

    getLevels: function(callback) {
        db.query("select * from levels", callback);
    }

};

const model = new Model();
module.exports = model;