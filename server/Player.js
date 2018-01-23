const Model = require('./Model');
const Level = require('./Level');
const Block = require('./Block');
const Product = require('./Product');
const uuidv4 = require('uuid/v4');

function Player(socket, cookie, ip) {
    this._id = null;
    this._socket = socket;
    this._name = null;
    this._cookie = cookie;
    this._ip = ip;
    this._level = null;
    this._coins = 0;

    this._purchases = [];

    this._load();
}

Player.prototype = {

    _load: function() {
        const self = this;

        // Create a new player!
        if (this._cookie === null) {
            this._initialize();
        }
        // Use an exisiting cookie!
        else {
            Model.getPlayerForCookie(this._cookie, function(err, data) {
                if (err || data == null) {
                    // Or create a new one if does not exists in database!
                    self._initialize();
                } else {
                    // Load all attributes ...
                    self._id = data.id;
                    self._name = data.name;
                    self._coins = data.coins;

                    // ... load also purchased products ...
                    Model.getProductsOf(self._cookie, function(err, products) {
                        if (!err && products != null && products.length > 0)
                            for (let product of products)
                                self._purchases.push(product.product_level_id);


                        // ... and send info to the client!
                        self.setLevel(data.level_id, data.experience);
                        self._socket.emit("coinsInfo", data.coins);
                        self._socket.emit("productsInfo", Product.getProductsOf(self));
                        self.newBlock();

                        // Also ave current IP and last connection time!
                        Model.savePlayerInfo(data.id, self._ip);
                    });
                }
            });
        }
    },

    _initialize: function() {
        const self = this;

        this._cookie = Player.generateCookieToken();

        Model.newPlayer(this._cookie, this._ip, function(err, data) {
            if (err) {
                console.error("Impossible d'enregistrer l'utilisateur (ip=" + self._ip + ") !");
                console.error(err);
            } else {
                self._socket.emit("registerCookie", self._cookie);
            }
        });
    },

    getSocketId: function() {
        return this._socket.id;
    },

    getLevel: function() {
        return this._level;
    },

    getCoins: function() {
        return this._coins;
    },

    getPurchases: function() {
        return this._purchases;
    },

    hasPurchased: function(productId) {
        for (let purchaseId of this._purchases)
            if (purchaseId == productId)
                return true;

        return false;
    },

    buyProduct: function(productId) {
        this._purchases.push(parseInt(productId));
        Model.buyProduct(this._id, parseInt(productId));
    },

    removeCoins: function(coins) {
        this._coins = Math.max(this._coins - coins, 0);
        Model.savePlayerCoins(this._cookie, this._coins);
    },

    getCookie: function() {
        return this._cookie;
    },

    getIp: function() {
        return this._ip;
    },

    setLevel: function(levelId, experience) {
        const update = this._level != null;
        this._level = Level.getById(levelId);

        // Send data to the client!
        const level = this._level.toJSON();
        level.currentExperience = experience || 0;

        this._socket.emit("levelInfo", level);

        // And update the database!
        if (update)
            Model.savePlayerLevel(this._cookie, levelId);
    },

    newBlock: function() {
        this._socket.emit("newBlock", Block.randomForLevel(this._level).toJSON());
    },

    update: function(data) {
        this._coins = data.coins;

        // Recalculate the total experience of the user ...
        data.totalExperience = Level.getExperienceAfterLevel(this._level.getNb() - 1)
                               + data.level.currentExperience;

        // ... and save its data!
        Model.savePlayerData(this._cookie, data);

        // Check for a new level!
        if (data.level.currentExperience >= this._level.getNeededExperience())
            this.setLevel(this._level.getId() + 1);
    },

    updateName: function(name) {
        for (let player of Player.players)
            if (player._name == name)
                return false;

        this._name = name;
        Model.savePlayerName(this._cookie, name);
        return true;
    }

};

// Static getters!

Player.players = [];
Player.newInstance = function(socket, cookie, ip) {
    for (let player of Player.players)
        if (player.getCookie() === cookie && player.getIp() === ip)
            return player;

    let player = new Player(socket, cookie, ip);
    Player.players.push(player);
    return player;
};
Player.getWithSocket = function(socket) {
    for (let player of Player.players)
        if (player.getSocketId() === socket.id)
            return player;

    return null;
};
Player.removeInstance = function(socket) {
    for (let i = 0; i < Player.players.length; i++)
        if (Player.players[i].getSocketId() === socket.id)
            Player.players.splice(i, 1);
};

Player.generateCookieToken = function() {
    return uuidv4();
};

module.exports = Player;