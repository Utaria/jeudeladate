const Model = require('./Model');
const Level = require('./Level');
const Block = require('./Block');
const Product = require('./Product');
const { v4: uuidv4 } = require('uuid');

function Player(socket, cookie) {
    this._id = null;
    this._socket = socket;
    this._name = null;
    this._cookie = cookie;
    this._ip = socket.handshake.headers["x-real-ip"] || socket.request.connection.remoteAddress;
    this._level = null;
    this._coins = 0;
    this._refersTo = null;
    this._experience = 0;
    this._totalExperience = 0;

    this._purchases = [];

    this._load();
}

Player.prototype = {

    _load: function () {
        const self = this;

        Model.getPlayerForCookie(this._cookie, function (err, data) {
            if (err || data == null) {
                console.error("Impossible de trouver l'utilisateur avec le cookie \"" + self._cookie + "\"!");
                self._socket.emit("connectUser", null);
            } else {
                // Load all attributes ...
                self._id = data.id;
                self._name = data.name;
                self._coins = data.coins;
                self._refersTo = data.refers_to;
                self._totalExperience = data.total_experience;

                // ... load also purchased products ...
                Model.getProductsOf(self._cookie, function (err, products) {
                    if (!err && products != null && products.length > 0)
                        for (let product of products)
                            self._purchases.push(product.product_level_id);


                    // ... and send info to the client!
                    self.setLevel(data.level_id, data.experience);
                    self._socket.emit("connectUser", true);
                    self._socket.emit("coinsInfo", data.coins);
                    self._socket.emit("productsInfo", Product.getProductsOf(self));

                    self.newBlock();

                    // Also ave current IP and last connection time!
                    Model.savePlayerInfo(data.id, self._ip);
                });
            }
        });
    },

    getSocketId: function () {
        return this._socket.id;
    },

    getId: function () {
        return this._id;
    },

    getLevel: function () {
        return this._level;
    },

    getCoins: function () {
        return this._coins;
    },

    getCookie: function () {
        return this._cookie;
    },

    getIp: function () {
        return this._ip;
    },

    getExperience: function () {
        return this._experience;
    },

    getTotalExperience: function () {
        return this._totalExperience;
    },

    getSocket: function () {
        return this._socket;
    },

    getPurchases: function () {
        return this._purchases;
    },

    hasPurchased: function (productId) {
        for (let purchaseId of this._purchases)
            if (purchaseId == productId)
                return true;

        return false;
    },

    buyProduct: function (productId) {
        this._purchases.push(parseInt(productId));
        Model.buyProduct(this._id, parseInt(productId));
    },

    removeCoins: function (coins) {
        this._coins = Math.max(this._coins - coins, 0);
        Model.savePlayerCoins(this._cookie, this._coins);
    },

    setLevel: function (levelId, experience) {
        const update = this._level != null;
        this._level = Level.getById(levelId);

        // Send data to the client!
        const level = this._level.toJSON();
        level.currentExperience = experience || 0;
        level.totalExperience = this._totalExperience;
        this._experience = level.currentExperience;

        this._socket.emit("levelInfo", level);

        // And update the database!
        if (update) {
            Model.savePlayerLevel(this._cookie, levelId);

            // Check for level 3 and give rewards to the referer!
            if (this._level.getNb() === 3 && this._refersTo != null) {
                const referer = Player.getWithId(this._refersTo);

                // Connected!
                if (referer) {
                    referer.update({
                        coins: referer.getCoins() + 1000,
                        level: {
                            currentExperience: referer.getExperience() + 5000.0
                        }
                    });

                    const level2 = referer.getLevel().toJSON();
                    level2.currentExperience = referer.getExperience();
                    level2.totalExperience = referer.getTotalExperience();

                    referer.getSocket().emit("coinsInfo", referer.getCoins());
                    referer.getSocket().emit("levelInfo", level2);
                } else {
                    Model.addStatsToPlayer(this._refersTo, 1000, 5000.0);
                }
            }
        }
    },

    newBlock: function () {
        this._socket.emit("newBlock", Block.randomForLevel(this._level).toJSON());
    },

    update: function (data) {
        this._coins = data.coins;

        // Recalculate the total experience of the user ...
        data.totalExperience = Level.getExperienceAfterLevel(this._level.getNb() - 1)
            + data.level.currentExperience;

        this._experience = data.level.currentExperience;

        // ... check for a new level ...
        if (!this._level.isMax() && data.level.currentExperience >= this._level.getNeededExperience()) {
            this.setLevel(this._level.getId() + 1);
            data.level.currentExperience = 0;
        }

        // ... and save player's data!
        Model.savePlayerData(this._cookie, data);
    }

};

// Static getters!

Player.players = [];
Player.newInstance = function (socket, cookie, objName) {
    for (let player of Player.players)
        if (player.getCookie() === cookie)
            return player;

    let player = new Player(socket, cookie, objName);
    Player.players.push(player);
    return player;
};
Player.getWithId = function (id) {
    for (let player of Player.players)
        if (player.getId() === id)
            return player;

    return null;
};
Player.getWithSocket = function (socket) {
    for (let player of Player.players)
        if (player.getSocketId() === socket.id)
            return player;

    return null;
};
Player.removeInstance = function (socket) {
    for (let i = 0; i < Player.players.length; i++)
        if (Player.players[i].getSocketId() === socket.id)
            Player.players.splice(i, 1);
};

Player.createUser = function(socket, playername, rfKey, callback) {
    const cookie = uuidv4();
    const ip = socket.handshake.headers["x-real-ip"] || socket.request.connection.remoteAddress;

    Model.newPlayer(cookie, ip, function (err, data) {
        if (err) {
            console.error("Impossible d'enregistrer l'utilisateur (ip=" + ip + ") !");
            console.error(err);
            callback("Impossible de s'enregistrer !", null);
        } else {
            Model.savePlayerName(cookie, playername);
            if (rfKey) Model.saveReferer(cookie, ip, rfKey);

            callback(null, cookie);
        }
    });
};
Player.getCookieByName = function(playername, callback) {
    Model.getCookieForName(playername, callback);
};

module.exports = Player;
