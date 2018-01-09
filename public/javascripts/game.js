var Game = /** @class */ (function () {
    function Game() {
        this.MIN_DELAY = 120;
        this.SERVER_ENDPOINT = "http://localhost:3000";
        this.clickContainer = document.querySelector(".click-container");
        this.clickContainer.addEventListener("click", this.onClick.bind(this));
        this.clicks = 0;
        this.lastClick = null;
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
            document.querySelector("img.block").
                setAttribute("src", "/images/blocs/" + block.name + ".png");
        });
        this.socket.on("levelInfo", function (level) {
            self.level = level;
            document.querySelector(".level-info").innerHTML = "Niveau " + level.nb + " (" + level.currentExperience + "/" + level.experienceNeeded + ")";
        });
        this.socket.on("coinsInfo", function (coins) {
            self.coins = coins;
            document.querySelector(".coins-info").innerHTML = coins + " pièces";
        });
    };
    Game.prototype.onClick = function () {
        var self = this;
        var now = Date.now();
        if (this.lastClick != null && now - this.lastClick < this.MIN_DELAY)
            return;
        this.clickContainer.classList.remove("clicked");
        setTimeout(function () {
            self.clickContainer.classList.add("clicked");
        }, 50);
        this.clicks++;
        this.lastClick = now;
    };
    return Game;
}());
window.addEventListener("load", function () {
    new Game();
});
