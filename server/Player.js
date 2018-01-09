const Model = require('./Model');
const Level = require('./Level');
const uuidv4 = require('uuid/v4');

function Player(socket, cookie, ip) {
    this._socket = socket;
    this._name = null;
    this._cookie = cookie;
    this._ip = ip;
    this._level = null;
    this._clicks = 0;

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
                    self._name = data.name;
                    self.setLevel(data.level_id, data.remaining_clicks);

                    // ... and save current IP and last connection time!
                    Model.savePlayerInfo(data.id, self._ip);
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

    getCookie: function() {
        return this._cookie;
    },

    getIp: function() {
        return this._ip;
    },

    setLevel: function(levelId, remainingClicks) {
        const update = this._level != null;
        this._level = Level.getById(levelId);

        // Send data to the client!
        const level = this._level.toJSON();

        if (remainingClicks != null)
            level.clicks = remainingClicks;

        this._socket.emit("nextLevel", level);

        // And update the database!
        if (update)
            Model.savePlayerLevel(this._cookie, levelId);
    },

    saveRemainingClicks: function(clicks) {
        Model.saveRemainingClicks(this._cookie, clicks);
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