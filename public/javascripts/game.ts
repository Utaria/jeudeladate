class Game {

    private MIN_DELAY: number = 120;

    private SERVER_ENDPOINT: string = "http://localhost:3000";

    private clickContainer: Element;

    private clicks: number;

    private lastClick: number;

    private socket: any;

    private level: any;

    private coins: number;

    public constructor() {
        this.clickContainer = document.querySelector(".click-container");
        this.clickContainer.addEventListener("click", this.onClick.bind(this));

        this.clicks = 0;
        this.lastClick = null;

        this.connect();
    }

    private connect() {
        const self = this;
        this.socket = window["io"].connect(this.SERVER_ENDPOINT);

        this.socket.on("connect", function() {
            self.socket.emit("doConnection", window['Cookies'].get('utaria-game-token'));
        });

        this.socket.on("registerCookie", function(cookie) {
            console.log("need to register cookie", cookie);
            window['Cookies'].set('utaria-game-token', cookie, { expires: 365 });
        });

        this.socket.on("newBlock", function(block) {
            document.querySelector("img.block").
                setAttribute("src", "/images/blocs/" + block.name + ".png");
        });

        this.socket.on("levelInfo", function(level) {
            self.level = level;
            document.querySelector(".level-info").innerHTML = "Niveau " + level.nb + " (" + level.currentExperience + "/" + level.experienceNeeded + ")";
        });

        this.socket.on("coinsInfo", function(coins) {
            self.coins = coins;
            document.querySelector(".coins-info").innerHTML = coins + " pièces";
        });
    }

    private onClick() {
        const self = this;
        const now = Date.now();

        if (this.lastClick != null && now - this.lastClick < this.MIN_DELAY)
            return;

        this.clickContainer.classList.remove("clicked");
        setTimeout(function() {
            self.clickContainer.classList.add("clicked");
        }, 50);

        this.clicks++;
        this.lastClick = now;
    }

}

window.addEventListener("load", function() {
    new Game();
});