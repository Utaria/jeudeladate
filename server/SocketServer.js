const Player = require('./Player');
const Level = require('./Level');
const Block = require('./Block');
const Product = require('./Product');

function SocketServer(io) {
    this.io = io;
    this.init();
}

SocketServer.prototype = {

    init: function() {
        this.io.on("connection", this.newSocket.bind(this));

        // Load levels, blocks & products
        Level.load();
        Block.load();
        Product.load();
    },

    newSocket: function(socket) {
        const self = this;

        // Global
        socket.on("doConnection", function(cookie) {
            if (cookie !== null) {
                Player.newInstance(socket, cookie);
                self.log("New player connected! (" + Player.players.length + ")");
            } else {
                self.log("New player wants to register! Sending cookie and waiting...");
                socket.emit("registerCookie", Player.generateCookieToken());
            }
        });

        socket.on("doRegistration", function(data) {
            let player = Player.getWithSocket(socket);

            if (!player) {
                player = Player.newInstance(socket, data.cookie, data);

                if (player)
                    self.log("Player " + data.name + " registered! (" + Player.players.length + ")");

                socket.emit("doRegistration", player != null);
            } else {
                socket.emit("doRegistration", player.getCookie());
            }
        });

        // Game
        socket.on("updateData", function(data) {
            const player = Player.getWithSocket(socket);
            if (player) player.update(data);
        });

        socket.on("newBlock", function() {
            const player = Player.getWithSocket(socket);
            player.newBlock();
        });

        // Shop page
        socket.on("getShopProducts", function() {
            const player = Player.getWithSocket(socket);
            if (player)
                socket.emit("getShopProducts", Product.getAvailableProductsOfPlayer(player));
        });

        socket.on("buyProduct", function(productLevelId) {
            const player = Player.getWithSocket(socket);
            const res = {};

            if (player) {
                if (!player.hasPurchased(productLevelId)) {
                    let productToBuy = null;

                    for (let product of Product.getAvailableProductsOfPlayer(player))
                        if (product.availableLevel && product.availableLevel[0] == productLevelId) {
                            productToBuy = product;
                            break;
                        }

                    if (productToBuy) {
                        if (productToBuy.availableLevel[4] <= player.getCoins()) {
                            player.removeCoins(productToBuy.availableLevel[4]);
                            player.buyProduct(productToBuy.availableLevel[0]);

                            res.success = true;
                            res.message = "Produit acheté !";
                        } else {
                            res.error = true;
                            res.message = "Vous n'avez pas assez de pièces !";
                        }
                    } else {
                        res.error = true;
                        res.message = "Vous ne pouvez pas acheter ce produit !";
                    }
                } else {
                    res.error = true;
                    res.message = "Vous avez déjà acheté ce produit !";
                }
            } else {
                res.error = true;
                res.message = "Impossible de récupérer le profil";
            }

            socket.emit("buyProduct", res);
        });

        // Global
        socket.on("disconnect", function() {
            Player.removeInstance(socket);
            self.log("A player disconnects! (" + Player.players.length + ")");
        });
    },

    /** Functions to format printed dates in log **/
    log: function(message) {
        const date = new Date();
        const prefix = "[" + this.pad(date.getDate(), 2) + "-" +
                             this.pad(date.getMonth() + 1, 2) + "-" +
                             date.getFullYear() + " " +
                             this.pad(date.getHours(), 2) + ":" +
                             this.pad(date.getMinutes(), 2) + ":" +
                             this.pad(date.getSeconds(), 2) +
                             " INFO]";

        console.log(prefix + " " + message);
    },

    pad: function(number, length) {
        let str = String(number);

        while (str.length < length)
            str = "0" + str;

        return str;
    }

};

module.exports = SocketServer;