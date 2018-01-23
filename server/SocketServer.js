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
        // Global
        socket.on("doConnection", function(cookie) {
            const address = socket.handshake.headers["x-real-ip"] || socket.request.connection.remoteAddress;
            Player.newInstance(socket, cookie, address);
        });

        // Game
        socket.on("updateName", function(name) {
            const player = Player.getWithSocket(socket);
            if (player) socket.emit("updateName", player.updateName(name));
        });

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
        });
    }

};

module.exports = SocketServer;