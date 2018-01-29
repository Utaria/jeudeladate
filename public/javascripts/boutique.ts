class Boutique {

    private SERVER_ENDPOINT: string;

    private buying: boolean;
    private coins: number;
    private socket: any;

    public constructor() {
        this.coins = 0;

        // Getting socket endpoint...
        const input = document.getElementById("apiendpoint");
        this.SERVER_ENDPOINT = input.getAttribute("value");
        input.parentNode.removeChild(input);

        this.connect();
    }

    private connect() {
        const self = this;
        this.socket = window["io"].connect(this.SERVER_ENDPOINT, {secure: this.SERVER_ENDPOINT.startsWith('https://')});

        this.socket.on("connect", function() {
            self.socket.emit("doConnection", window['Cookies'].get('utaria-game-token'));
        });

        this.socket.on("connect_error", function() {
            window.location.href = "/jouer/erreur";
        });
        this.socket.on("connect_timeout", function() {
            window.location.href = "/jouer/erreur";
        });
        this.socket.on("reconnect_error", function() {
            window.location.href = "/jouer/erreur";
        });

        this.socket.on("registerCookie", function(cookie) {
            // console.log("need to register cookie", cookie);
            window['Cookies'].set('utaria-game-token', cookie, { expires: 365 });
        });

        this.socket.on("newBlock", function() {
            self.loadProducts();
        });

        this.socket.on("buyProduct", function(data) {
           self.buying = false;

           if (data.error)
               alert(data.message);
           else
               window.location.reload();
        });

        this.socket.on("coinsInfo", function(coins) {
            self.updateCoins(coins);
        });
    }

    private loadProducts() {
        const self = this;

        this.socket.on("getShopProducts", function(products) {
            self.applyproducts.call(self, products);
        });

        this.socket.emit("getShopProducts");
    }

    private applyproducts(products) {
        const self = this;
        const template = document.querySelector(".products .product.template");
        let element;

        // Remove old products
        for (let oldProduct of Array.prototype.slice.call(document.querySelectorAll(".products .product")))
            if (!oldProduct.classList.contains("template"))
                oldProduct.parentNode.removeChild(oldProduct);

        for (let product of products) {
            element = template.cloneNode(true);
            element.classList.remove("template");

            let lvlInfo = "";

            if (product.currentLevel && product.currentLevel[1] != 0)
                lvlInfo = " <small style=\"font-size:0.6em\">nv. " + product.currentLevel[1] + "</small>";

            element.querySelector(".icon img").src = product.image;
            element.querySelector(".title").innerHTML = product.name + lvlInfo;
            element.querySelector(".description").innerHTML = product.description;

            if (product.availableLevel != null) {
                element.querySelector(".price").innerHTML = product.availableLevel[4];

                // Not enough money
                if (this.coins !== null && this.coins < parseInt(product.availableLevel[4])) {
                    element.querySelector(".btn-buy").style.display = "none";
                    element.querySelector(".price").classList.add("error");
                } else {
                    element.querySelector(".btn-buy").dataset.productId = product.availableLevel[0];
                    element.querySelector(".btn-buy").addEventListener("click", function () {
                        self.buying = true;
                        self.socket.emit("buyProduct", this.dataset.productId);
                    });
                }

                if (product.nbLevels > 1)
                    element.querySelector(".exp").innerHTML = "Niv. " + product.currentLevel[1] + " >> Niv. " + product.availableLevel[1];
                else
                    element.querySelector(".exp").style.display = "none";

                // Max level
                if (product.availableLevel[1] === "max") {
                    element.querySelector(".price").style.display = "none";
                    element.querySelector(".exp").style.display = "none";
                    element.querySelector(".btn-buy").style.display = "none";
                    element.querySelector(".ok").classList.add("show");
                }
            } else {
                element.querySelector(".btn-buy").innerHTML = "Niveau insuffisant";
                element.querySelector(".btn-buy").classList.add("error");
                element.classList.add("disabled");

                if (product.nextLevel)
                    element.querySelector(".btn-buy").innerHTML = "Niveau " + product.nextLevel[3] + " requis";
            }

            template.parentNode.appendChild(element);
        }
    }

    private updateCoins(coins) {
        this.coins = coins;
        document.querySelector(".coins-number").innerHTML = coins.toString();
    }

}

window.addEventListener("load", function() {
    new Boutique();
});