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


    /*   LEVELS   */

    getLevels: function(callback) {
        db.query("select * from levels", callback);
    },


    /*   BLOCS   */

    getBlocks: function(callback) {
        db.query(
            "select level_id, block_id, name, clicks, " +
            "experience_min, experience_max, coin_min, coin_max, chance " +
            "from blocks join levels_blocks " +
            "on levels_blocks.block_id = blocks.id",
            callback
        );
    }

};

const model = new Model();
module.exports = model;