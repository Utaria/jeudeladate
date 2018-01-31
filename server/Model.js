const db = require('./db');
const rs = require('randomstring');

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

    getCookieForName: function(playername, callback) {
        db.query("select cookie from players where name = ?", [playername], function(err, data) {
            if (err || !data || data.length === 0)
                callback(err, null);
            else
                callback(null, data[0].cookie);
        });
    },

    newPlayer: function(cookie, ip, callback) {
        const refererKey = rs.generate(10);

        db.query("INSERT INTO players(cookie, ip, refererkey) values(?, ?, ?)", [cookie, ip, refererKey], callback);
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

    savePlayerData: function(cookie, data) {
        db.query("UPDATE players SET experience = ?, total_experience = ?, coins = ? WHERE cookie = ?", [data.level.currentExperience, data.totalExperience, data.coins, cookie], function(err) {
            if (err) console.error(err);
        })
    },

    savePlayerCoins: function(cookie, coins) {
        db.query("UPDATE players SET coins = ? WHERE cookie = ?", [coins, cookie], function(err) {
            if (err) console.error(err);
        })
    },

    addStatsToPlayer: function(id, coins, experience) {
        db.query("UPDATE players SET coins = coins + ?, experience = experience + ?, total_experience = total_experience + ? WHERE id = ?", [coins, experience, experience, id], function(err) {
            if (err) console.error(err);
        })
    },

    savePlayerName: function(cookie, name) {
        db.query("UPDATE players SET name = ? WHERE cookie = ?", [name, cookie], function(err) {
            if (err) console.error(err);
        })
    },

    saveReferer: function(cookie, referantIp, refererKey) {
        db.query("SELECT id, ip from players WHERE refererkey = ?", [refererKey], function(err, rows) {
            if (!err && rows && rows.length === 1) {
                const id = rows[0].id;
                const ip = rows[0].ip;

                // Not the same IP to apply the refers_to key!
                // (anti-abuse solution)
                if (ip === referantIp)
                    return;

                db.query("UPDATE players SET refers_to = ? WHERE cookie = ?", [id, cookie], function(err) {
                    if (err) console.error(err);
                });
            } else {
                callback(null);
            }
        })
    },

    getRefererKey: function(cookie, callback) {
        db.query("SELECT refererkey FROM players where cookie = ?", [cookie], function(err, rows) {
            if (!err && rows && rows.length === 1)
                callback(rows[0].refererkey);
            else
                callback(null);
        });
    },


    /*   LEVELS   */
    getLevels: function(callback) {
        db.query("select * from levels", callback);
    },


    /*   BLOCS   */
    getBlocks: function(callback) {
        db.query(
            "select level_id, block_id, name, clicks, usekeys_chance, " +
            "experience_min, experience_max, coin_min, coin_max, chance " +
            "from blocks join levels_blocks " +
            "on levels_blocks.block_id = blocks.id",
            callback
        );
    },


    /*   BOUTIQUE   */
    getProducts: function(callback) {
        db.query(
            "SELECT *, products_levels.id as level_id, products.id as id " +
            "from products join products_levels " +
            "ON products_levels.product_id = products.id " +
            "ORDER BY products_levels.price ASC",
            callback
        );
    },

    getProductsOf: function(playerCookie, callback) {
        db.query(
            "SELECT players_products.* from players_products " +
            "JOIN players ON players.id = players_products.player_id " +
            "WHERE players.cookie = ?",
            [playerCookie],
            callback
        );
    },

    buyProduct: function(playerId, productLevelId) {
        db.query("INSERT INTO players_products(player_id, product_level_id) values(?, ?)", [playerId, productLevelId], function(err, data) {
            if (err) console.error(err);
        });
    }

};

const model = new Model();
module.exports = model;