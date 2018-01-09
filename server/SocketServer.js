const Player = require('./Player');
const Level = require('./Level');

function SocketServer(io) {
    this.io = io;
    this.init();
}

SocketServer.prototype = {

    init: function() {
        this.io.on("connection", this.newSocket.bind(this));

        // Load levels
        Level.load();
    },

    newSocket: function(socket) {
        socket.on("doConnection", function(cookie) {
            const address = socket.handshake.headers["x-real-ip"] || socket.request.connection.remoteAddress;
            Player.newInstance(socket, cookie, address);
        });

        socket.on("GetNextLevel", function() {
            const player = Player.getWithSocket(socket);
            player.setLevel(player.getLevel().getNb() + 1);
        });

        socket.on("saveRemainingClicks", function(clicks) {
            const player = Player.getWithSocket(socket);
            player.saveRemainingClicks(clicks);
        });

        socket.on("disconnect", function() {
            Player.removeInstance(socket);
        });
    }

};

module.exports = SocketServer;