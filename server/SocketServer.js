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

	this.log("Socket connected.");

        // User actions
        socket.on("connectUser", function(cookie) {
            if (cookie !== null) {
                Player.newInstance(socket, cookie);
                self.log("New player connected! (" + Player.players.length + ")");
            } else {
                socket.emit("connectUser", null);
            }
        });

        socket.on("registerUser", function(data) {
            // On regarde si le joueur existe déjà ...
            Player.getCookieByName(data.name, function(err, cookie) {
                // ... s'il existe on retourne juste le cookie lié ...
                if (!err && cookie) {
                    socket.emit("registerUser", {err: err, cookie: cookie});
                    return;
                }

                // ... et sinon on en créé un nouveau ...
                Player.createUser(socket, data.name, data.rfKey, function(err, cookie) {
                    // ... et on retourne les informations générées !
                    socket.emit("registerUser", {err: err, cookie: cookie});
                });
            });
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
            self.log("Socket disconnected. " + Player.players.length + " sockets remaining.");
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
