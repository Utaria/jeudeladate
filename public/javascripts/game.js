var Game = /** @class */ (function () {
    function Game() {
        this.MIN_DELAY = 120;
        this.SERVER_ENDPOINT = "http://localhost:3000";
        this.clickContainer = document.querySelector(".click-container");
        this.keyContainer = document.querySelector(".key-container");
        this.keys = [];
        var i = 0;
        for (var code = 65; code < 91; code++) {
            this.keys[i] = [code, String.fromCharCode(code)];
            i++;
        }
        document.addEventListener("click", this.onClick.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
        this.pickaxe = document.querySelector(".pickaxe");
        this.clicks = 0;
        this.lastClick = null;
        this.sendDataIfNeeded = debounce(this.sendData.bind(this), 300);
        Game.loadTooltips();
        this.connect();
    }
    Game.prototype.connect = function () {
        var self = this;
        this.socket = window["io"].connect(this.SERVER_ENDPOINT);
        this.socket.on("connect", function () {
            self.socket.emit("doConnection", window['Cookies'].get('utaria-game-token'));
        });
        this.socket.on("disconnect", function () {
            window.location.href = "/jouer/erreur";
        });
        this.socket.on("registerCookie", function (cookie) {
            self.cookie = cookie;
            // New cookie! Ask for a playername!
            self.chooseName();
        });
        this.socket.on("updateName", function (ok) {
            if (ok) {
                window['Cookies'].set('utaria-game-token', self.cookie, { expires: 365 });
                window.location.reload();
            }
            else {
                alert("Ce pseudonyme est déjà utilisé !");
                self.chooseName();
            }
        });
        this.socket.on("newBlock", function (block) {
            self.block = block;
            self.clickContainer.querySelector(".meta-block").innerHTML =
                "Encore " + block.clicks + " coup" + ((block.clicks > 1) ? "s" : "") + " !";
            self.block.clicks--;
            document.querySelector("img.block").
                setAttribute("src", "/images/blocs/" + block.name + ".png");
            self.loadMagicPickaxe();
            self.newBlockKey();
        });
        this.socket.on("levelInfo", function (level) {
            self.level = level;
            self.updateLevelInfo();
        });
        this.socket.on("coinsInfo", function (coins) {
            self.coins = coins;
            self.updateCoinsInfo();
        });
        this.socket.on("productsInfo", function (products) {
            for (var _i = 0, products_1 = products; _i < products_1.length; _i++) {
                var product = products_1[_i];
                switch (product[0]) {
                    case 1:
                    case 2:
                        self.magicPickaxeForce = product[2];
                        break;
                    case 5:
                        self.doubleCkick = true;
                        break;
                }
            }
        });
    };
    Game.prototype.chooseName = function () {
        var playername = null;
        do {
            playername = prompt("Saisissez votre pseudo: ");
        } while (playername == null || !playername);
        this.socket.emit("updateName", playername);
    };
    Game.prototype.updateLevelInfo = function () {
        var container = document.querySelector(".level-info");
        // Update progressbar
        var bar = container.querySelector(".progressbar");
        var perc = this.level.currentExperience / this.level.experienceNeeded;
        var nbPane = Math.min(Math.floor(perc * 10), 10);
        bar.innerHTML = "";
        for (var i = 0; i < nbPane; i++)
            bar.innerHTML += "<span></span>";
        // Update the meta title
        if (perc > 1)
            perc = 1;
        container.querySelector(".meta").innerHTML = "Niveau " + this.level.nb + " (" + Math.round(perc * 100) + "%)";
    };
    Game.prototype.updateCoinsInfo = function () {
        document.querySelector(".coins-info span").innerHTML = this.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };
    Game.prototype.dropItems = function () {
        var self = this;
        var container = document.querySelector(".items");
        // Prepare some variables
        var experience = this.block.win.experience;
        var coins = this.block.win.coin;
        var DIST = 200;
        var origX = this.clickContainer.offsetLeft + this.clickContainer.offsetWidth / 2;
        var origY = this.clickContainer.offsetTop + this.clickContainer.offsetHeight / 2;
        // Clear unused tooltips
        var tooltips = document.querySelectorAll(".tooltip");
        for (var i = 0; i < tooltips.length; i++)
            tooltips[i].parentElement.removeChild(tooltips[i]);
        // Clear old items
        var nodes = [].slice.call(container.childNodes);
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            this.onItemMouseOver(node, null);
        }
        // Prepare elements
        container.innerHTML = "";
        var expPad = experience / 50 > 0 ? Math.ceil(experience / 50) : 1;
        var coinPad = coins / 50 > 0 ? Math.ceil(coins / 50) : 1;
        var _loop_1 = function () {
            var div = document.createElement("div");
            div.className = "experience";
            div.setAttribute("style", "left:" + origX + "px;top:" + origY + "px;transition:all ease-in-out .1s");
            if (experience >= expPad)
                div.dataset.value = expPad.toString();
            else
                div.dataset.value = experience;
            experience -= expPad;
            var angle = Math.random() * Math.PI * 2;
            var x = Math.cos(angle) * DIST;
            var y = Math.sin(angle) * DIST;
            setTimeout(function () {
                div.style.left = (origX + x) + "px";
                div.style.top = (origY + y) + "px";
            }, 50);
            container.appendChild(div);
            div.addEventListener("mouseover", function (event) {
                self.onItemMouseOver(this, event);
            });
        };
        do {
            _loop_1();
        } while (experience > 0);
        var _loop_2 = function () {
            var div = document.createElement("div");
            div.className = "coin";
            div.setAttribute("style", "left:" + origX + "px;top:" + origY + "px;transition:all ease-in-out .1s");
            if (coins >= coinPad)
                div.dataset.value = coinPad.toString();
            else
                div.dataset.value = coins;
            coins -= coinPad;
            var angle = Math.random() * Math.PI * 2;
            var x = Math.cos(angle) * DIST;
            var y = Math.sin(angle) * DIST;
            setTimeout(function () {
                div.style.left = (origX + x) + "px";
                div.style.top = (origY + y) + "px";
            }, 50);
            container.appendChild(div);
            div.addEventListener("mouseover", function (event) {
                self.onItemMouseOver(this, event);
            });
        };
        do {
            _loop_2();
        } while (coins > 0);
    };
    Game.prototype.interactBlock = function (magicPickaxe) {
        var self = this;
        this.clickContainer.classList.remove("clicked");
        if (magicPickaxe)
            magicPickaxe.classList.remove("clicked");
        else
            this.pickaxe.classList.remove("clicked");
        setTimeout(function () {
            self.clickContainer.classList.add("clicked");
            if (magicPickaxe)
                magicPickaxe.classList.add("clicked");
            else
                self.pickaxe.classList.add("clicked");
        }, 50);
        // Block break checking ...
        if (this.block.clicks <= 0) {
            this.dropItems();
            this.clickContainer.style.display = "none";
            this.block = null;
            setTimeout(function () {
                self.clickContainer.style.display = "block";
                self.socket.emit("newBlock");
            }, 1000);
            return;
        }
        this.clickContainer.querySelector(".meta-block").innerHTML =
            "Encore " + this.block.clicks + " coup" + ((this.block.clicks > 1) ? "s" : "") + " !";
        this.block.clicks--;
    };
    Game.prototype.newBlockKey = function () {
        if (this.block == null || !this.block.useKeys) {
            this.keyContainer.style.display = "none";
            return;
        }
        var nbKeys = Object.keys(this.keys).length;
        do {
            this.block.nextKey = this.keys[Math.round(Math.random() * nbKeys)];
        } while (this.block.nextKey == null);
        this.keyContainer.innerHTML = this.block.nextKey[1];
        this.keyContainer.setAttribute("style", "display:block");
    };
    Game.prototype.loadMagicPickaxe = function () {
        if (!this.magicPickaxeForce)
            return;
        var self = this;
        var magicPickaxe = document.querySelector(".pickaxe.magical");
        magicPickaxe.style.left = (this.clickContainer.offsetLeft + this.clickContainer.offsetWidth - 20) + "px";
        magicPickaxe.style.top = (this.clickContainer.offsetTop) + "px";
        if (this.magicPickaxeInterval)
            clearInterval(this.magicPickaxeInterval);
        this.magicPickaxeInterval = setInterval(function () {
            if (self.block && !self.block.useKeys && self.block.clicks >= 0) {
                magicPickaxe.style.display = "block";
                self.interactBlock(magicPickaxe);
            }
            else {
                magicPickaxe.style.display = "none";
            }
        }, 1000 / this.magicPickaxeForce);
    };
    Game.prototype.sendData = function () {
        this.socket.emit("updateData", {
            level: this.level,
            coins: this.coins
        });
    };
    /*   EVENTS   */
    Game.prototype.onClick = function () {
        var self = this;
        var now = Date.now();
        if (!this.canClick)
            return;
        if (this.lastClick != null && now - this.lastClick < this.MIN_DELAY)
            return;
        // Prevent clicking with no block or a key-based block
        if (this.block == null || this.block.useKeys)
            return;
        this.interactBlock(null);
        // Double click bonus!
        if (this.doubleCkick)
            this.interactBlock(null);
        this.lastClick = now;
    };
    Game.prototype.onItemMouseOver = function (element, event) {
        var isCoin = element.classList.contains("coin");
        var value = parseInt(element.dataset.value);
        if (isCoin) {
            this.coins += value;
            this.updateCoinsInfo();
        }
        else {
            this.level.currentExperience += value;
            this.updateLevelInfo();
        }
        // Print item tooltip
        var tooltip = document.createElement("div");
        tooltip.className = "game-tooltip";
        tooltip.innerHTML = "+" + value;
        tooltip.style.top = (element.offsetTop - 10) + "px";
        tooltip.style.left = element.offsetLeft + "px";
        tooltip.style.width = element.offsetWidth + "px";
        document.body.appendChild(tooltip);
        // Update data on server!
        this.sendDataIfNeeded();
        element.parentNode.removeChild(element);
    };
    Game.prototype.onKeyDown = function (event) {
        if (this.block != null && this.block.useKeys && this.block.nextKey[0] == event.keyCode)
            this.keyContainer.style.background = "orange";
    };
    Game.prototype.onKeyUp = function (event) {
        if (this.block != null && this.block.useKeys && this.block.nextKey[0] == event.keyCode) {
            this.interactBlock(null);
            this.newBlockKey();
        }
    };
    Game.prototype.onMouseMove = function (event) {
        var calcX = event.clientX - (this.clickContainer.offsetLeft + this.clickContainer.offsetWidth / 2);
        var distX = Math.abs(calcX);
        var distY = Math.abs(event.clientY - (this.clickContainer.offsetTop + this.clickContainer.offsetHeight / 2));
        var dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
        if (dist < 150 && this.block != null && !this.block.useKeys) {
            if (calcX < 0)
                this.pickaxe.classList.add("inverted");
            else
                this.pickaxe.classList.remove("inverted");
            this.pickaxe.style.display = "block";
            document.body.style.cursor = "none";
            this.pickaxe.style.left = (event.clientX - this.pickaxe.offsetWidth / 2) + "px";
            this.pickaxe.style.top = (event.clientY - this.pickaxe.offsetHeight / 2) + "px";
            this.canClick = true;
        }
        else {
            this.pickaxe.style.display = "none";
            document.body.style.cursor = "initial";
            this.canClick = false;
        }
    };
    Game.loadTooltips = function () {
        new window["Tooltip"](document.querySelector(".menu .boutique"), {
            placement: 'left',
            offset: '0, 20',
            title: "Boutique"
        });
        new window["Tooltip"](document.querySelector(".menu .classement"), {
            placement: 'left',
            offset: '0, 20',
            title: "Classement"
        });
    };
    return Game;
}());
window.addEventListener("load", function () {
    new Game();
});
function debounce(callback, delay) {
    var timer;
    return function () {
        var args = arguments;
        var context = this;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, delay);
    };
}
