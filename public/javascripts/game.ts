class Game {

    private MIN_DELAY: number = 120;

    private SERVER_ENDPOINT: string = "http://localhost:3000";

    private clickContainer : Element;

    private clicks : number;

    private lastClick : number;

    private socket: any;

    private level: any;

    public constructor() {
        this.clickContainer = document.querySelector(".click-container");
        this.clickContainer.addEventListener("click", this.onClick.bind(this));

        this.clicks = 0;
        this.lastClick = null;

        setInterval(this.updateClicks.bind(this), 5000);
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

        this.socket.on("nextLevel", function(level) {
            self.level = level;
            self.level.clicksNeeded = self.level.clicks;

            document.querySelector("h2.title").innerHTML = "Niveau " + self.level.nb;
        });
    }

    private updateClicks() {
        this.socket.emit("saveRemainingClicks", this.level.clicksNeeded);
        this.clicks = 0;
    }

    private onClick() {
        const now = Date.now();

        if (this.lastClick != null && now - this.lastClick < this.MIN_DELAY)
            return;

        if (--this.level.clicksNeeded <= 0) {
            this.socket.emit("GetNextLevel");
            return;
        }

        this.clicks++;
        this.lastClick = now;
    }

}

window.addEventListener("load", function() {
    new Game();
});