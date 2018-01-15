const Player = require('./Player');
const Level = require('./Level');
const Block = require('./Block');

function SocketServer(io) {
    this.io = io;
    this.init();
}

SocketServer.prototype = {

    init: function() {
        this.io.on("connection", this.newSocket.bind(this));

        // Load levels & blocks
        Level.load();
        Block.load();
    },

    newSocket: function(socket) {
        socket.on("doConnection", function(cookie) {
            const address = socket.handshake.headers["x-real-ip"] || socket.request.connection.remoteAddress;
            Player.newInstance(socket, cookie, address);
        });

        socket.on("updateData", function(data) {
            Player.getWithSocket(socket).update(data);
        });

        socket.on("newBlock", function() {
            const player = Player.getWithSocket(socket);
            player.newBlock();
        });

        socket.on("disconnect", function() {
            Player.removeInstance(socket);
        });
    }

};

module.exports = SocketServer;