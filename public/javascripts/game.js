var Game = /** @class */ (function () {
    function Game() {
        this.MIN_DELAY = 120;
        this.SERVER_ENDPOINT = "http://localhost:3000";
        this.clickContainer = document.querySelector(".click-container");
        document.addEventListener("click", this.onClick.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.pickaxe = document.querySelector(".pickaxe");
        this.clicks = 0;
        this.lastClick = null;
        this.sendDataIfNeeded = debounce(this.sendData.bind(this), 1000);
        this.connect();
    }
    Game.prototype.connect = function () {
        var self = this;
        this.socket = window["io"].connect(this.SERVER_ENDPOINT);
        this.socket.on("connect", function () {
            self.socket.emit("doConnection", window['Cookies'].get('utaria-game-token'));
        });
        this.socket.on("registerCookie", function (cookie) {
            console.log("need to register cookie", cookie);
            window['Cookies'].set('utaria-game-token', cookie, { expires: 365 });
        });
        this.socket.on("newBlock", function (block) {
            self.block = block;
            self.clickContainer.querySelector(".meta-block").innerHTML =
                "Encore " + block.clicks + " coup" + ((block.clicks > 1) ? "s" : "") + " !";
            self.block.clicks--;
            document.querySelector("img.block").
                setAttribute("src", "/images/blocs/" + block.name + ".png");
        });
        this.socket.on("levelInfo", function (level) {
            self.level = level;
            self.updateLevelInfo();
        });
        this.socket.on("coinsInfo", function (coins) {
            self.coins = coins;
            self.updateCoinsInfo();
        });
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
        container.querySelector(".meta").innerHTML = "Niveau " + this.level.nb;
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
        var _loop_1 = function (i) {
            var div = document.createElement("div");
            div.className = (i < coins) ? "coin" : "experience";
            div.setAttribute("style", "left:" + origX + "px;top:" + origY + "px;transition:all ease-in-out .1s");
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
        for (var i = 0; i < coins + experience; i++) {
            _loop_1(i);
        }
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
        if (this.block == null)
            return;
        this.clickContainer.classList.remove("clicked");
        this.pickaxe.classList.remove("clicked");
        setTimeout(function () {
            self.clickContainer.classList.add("clicked");
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
        this.lastClick = now;
    };
    Game.prototype.onItemMouseOver = function (element, event) {
        var isCoin = element.classList.contains("coin");
        if (isCoin) {
            this.coins++;
            this.updateCoinsInfo();
        }
        else {
            this.level.currentExperience++;
            this.updateLevelInfo();
        }
        // Print item tooltip
        var tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML = "+1";
        tooltip.style.top = (element.offsetTop - 10) + "px";
        tooltip.style.left = element.offsetLeft + "px";
        tooltip.style.width = element.offsetWidth + "px";
        document.body.appendChild(tooltip);
        // Update data on server!
        this.sendDataIfNeeded();
        element.parentNode.removeChild(element);
    };
    Game.prototype.onMouseMove = function (event) {
        var calcX = event.clientX - (this.clickContainer.offsetLeft + this.clickContainer.offsetWidth / 2);
        var distX = Math.abs(calcX);
        var distY = Math.abs(event.clientY - (this.clickContainer.offsetTop + this.clickContainer.offsetHeight / 2));
        var dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
        if (dist < 150) {
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
