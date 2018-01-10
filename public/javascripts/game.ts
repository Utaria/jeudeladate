class Game {

    private MIN_DELAY: number = 120;
    private SERVER_ENDPOINT: string = "http://localhost:3000";

    private clickContainer: HTMLElement;
    private pickaxe: HTMLElement;

    private socket: any;

    private clicks: number;
    private lastClick: number;
    private canClick: boolean;

    private level: any;
    private block: any;
    private coins: number;

    public constructor() {
        this.clickContainer = document.querySelector(".click-container");

        document.addEventListener("click", this.onClick.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));

        this.pickaxe = document.querySelector(".pickaxe");

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
            self.block = block;
            document.querySelector("img.block").
                setAttribute("src", "/images/blocs/" + block.name + ".png");
        });

        this.socket.on("levelInfo", function(level) {
            self.level = level;
            self.updateLevelInfo();
        });

        this.socket.on("coinsInfo", function(coins) {
            self.coins = coins;
            self.updateCoinsInfo();
        });
    }

    private updateLevelInfo() {
        let container = document.querySelector(".level-info");

        // Update progressbar
        let bar = container.querySelector(".progressbar");
        let perc = this.level.currentExperience / this.level.experienceNeeded;
        let nbPane = Math.min(Math.floor(perc * 10), 10);

        bar.innerHTML = "";
        for (let i = 0; i < nbPane; i++)
            bar.innerHTML += "<span></span>";

        // Update the meta title
        container.querySelector(".meta").innerHTML = "Niveau " + this.level.nb;
    }

    private updateCoinsInfo() {
        document.querySelector(".coins-info span").innerHTML = this.coins.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    private dropItems() {
        let self = this;
        let container = document.querySelector(".items");

        // Prepare some variables
        let experience = this.block.win.experience;
        let coins = this.block.win.coin;

        let DIST = 200;

        let origX = this.clickContainer.offsetLeft + this.clickContainer.offsetWidth/2;
        let origY = this.clickContainer.offsetTop + this.clickContainer.offsetHeight/2;

        // Prepare elements
        container.innerHTML = "";

        for (let i = 0; i < coins + experience; i++) {
            let div = document.createElement("div");
            div.className = (i < coins) ? "coin" : "experience";
            div.setAttribute("style", "left:" + origX + "px;top:" + origY + "px;transition:all ease-in-out .1s");

            let angle = Math.random() * Math.PI * 2;
            let x = Math.cos(angle) * DIST;
            let y = Math.sin(angle) * DIST;

            setTimeout(function() {
                div.style.left = (origX + x) + "px";
                div.style.top = (origY + y) + "px";
            }, 50);

            container.appendChild(div);

            div.addEventListener("mouseover", function(event) {
                self.onItemMouseOver(this, event);
            });
        }
    }


    /*   EVENTS   */

    private onClick() {
        const self = this;
        const now = Date.now();

        if (!this.canClick)
            return;

        if (this.lastClick != null && now - this.lastClick < this.MIN_DELAY)
            return;
        if (this.block == null)
            return;

        this.clickContainer.classList.remove("clicked");
        this.pickaxe.classList.remove("clicked");

        setTimeout(function() {
            self.clickContainer.classList.add("clicked");
            self.pickaxe.classList.add("clicked");
        }, 50);

        // Block break checking ...
        if (this.block.clicks <= 0) {
            this.dropItems();

            this.clickContainer.style.display = "none";
            this.block = null;

            setTimeout(function() {
                self.clickContainer.style.display = "block";
                self.socket.emit("newBlock");
            }, 1000);
            return;
        }

        this.block.clicks--;
        this.lastClick = now;
    }

    private onItemMouseOver(element, event) {
        let isCoin = element.classList.contains("coin");

        if (isCoin) {
            this.coins++;
            this.updateCoinsInfo();
        } else {
            this.level.currentExperience++;
            this.updateLevelInfo();
        }

        element.parentNode.removeChild(element);
    }

    private onMouseMove(event) {
        let calcX = event.clientX - (this.clickContainer.offsetLeft + this.clickContainer.offsetWidth/2);
        let distX = Math.abs(calcX);
        let distY = Math.abs(event.clientY - (this.clickContainer.offsetTop + this.clickContainer.offsetHeight/2));
        let dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

        if (dist < 150) {
            if (calcX < 0)
                this.pickaxe.classList.add("inverted");
            else
                this.pickaxe.classList.remove("inverted");

            this.pickaxe.style.display = "block";
            document.body.style.cursor = "none";
            this.pickaxe.style.left = (event.clientX - this.pickaxe.offsetWidth/2) + "px";
            this.pickaxe.style.top = (event.clientY - this.pickaxe.offsetHeight/2) + "px";
            this.canClick = true;
        } else {
            this.pickaxe.style.display = "none";
            document.body.style.cursor = "initial";
            this.canClick = false;
        }
    }

}

window.addEventListener("load", function() {
    new Game();
});