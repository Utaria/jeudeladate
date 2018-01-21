const db = require('./db');

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