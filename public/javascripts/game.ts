class Game {

    private MIN_DELAY: number = 120;
    private SERVER_ENDPOINT: string = "http://localhost:3000";

    private clickContainer: HTMLElement;
    private keyContainer: HTMLElement;
    private pickaxe: HTMLElement;

    private socket: any;

    private clicks: number;
    private lastClick: number;
    private canClick: boolean;

    private level: any;
    private block: any;
    private coins: number;

    // Magic pickaxe
    private magicPickaxeForce: number;
    private magicPickaxeInterval: number;

    private keys: any[][];

    // Debounce methods
    private sendDataIfNeeded : Function;

    public constructor() {
        this.clickContainer = document.querySelector(".click-container");
        this.keyContainer = document.querySelector(".key-container");

        this.keys = [];
        let i = 0;

        for (let code = 65; code < 91; code++) {
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

        this.sendDataIfNeeded = debounce(this.sendData.bind(this), 1000);

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
            self.clickContainer.querySelector(".meta-block").innerHTML =
                "Encore " + block.clicks + " coup" + ((block.clicks > 1) ? "s" : "") + " !";
            self.block.clicks--;

            document.querySelector("img.block").
                setAttribute("src", "/images/blocs/" + block.name + ".png");

            self.loadMagicPickaxe()
            self.newBlockKey();
        });

        this.socket.on("levelInfo", function(level) {
            self.level = level;
            self.updateLevelInfo();
        });

        this.socket.on("coinsInfo", function(coins) {
            self.coins = coins;
            self.updateCoinsInfo();
        });

        this.socket.on("productsInfo", function(products) {
            for (let product of products)
                switch (product[0]) {
                    case 1:
                        self.magicPickaxeForce = product[2];
                        break;
                }
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
        if (perc > 1) perc = 1;
        container.querySelector(".meta").innerHTML = "Niveau " + this.level.nb + " (" + Math.round(perc * 100) + "%)";
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

        // Clear unused tooltips
        const tooltips = document.querySelectorAll(".tooltip");
        for (let i = 0; i < tooltips.length; i++)
            tooltips[i].parentElement.removeChild(tooltips[i]);


        // Clear old items
        let nodes = [].slice.call(container.childNodes);
        for (let node of nodes)
            this.onItemMouseOver(node, null);

        // Prepare elements
        container.innerHTML = "";

        const expPad = experience / 50 > 0 ? Math.ceil(experience / 50) : 1;
        const coinPad = coins / 50 > 0 ? Math.ceil(coins / 50) : 1;

        do {
            let div = document.createElement("div");
            div.className = "experience";
            div.setAttribute("style", "left:" + origX + "px;top:" + origY + "px;transition:all ease-in-out .1s");

            if (experience >= expPad)
                div.dataset.value = expPad.toString();
            else
                div.dataset.value = experience;

            experience -= expPad;

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
        } while (experience > 0);

        do {
            let div = document.createElement("div");
            div.className = "coin";
            div.setAttribute("style", "left:" + origX + "px;top:" + origY + "px;transition:all ease-in-out .1s");

            if (coins >= coinPad)
                div.dataset.value = coinPad.toString();
            else
                div.dataset.value = coins;

            coins -= coinPad;

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
        } while (coins > 0);
    }

    private interactBlock(magicPickaxe) {
        const self = this;

        this.clickContainer.classList.remove("clicked");

        if (magicPickaxe) magicPickaxe.classList.remove("clicked");
        else              this.pickaxe.classList.remove("clicked");

        setTimeout(function() {
            self.clickContainer.classList.add("clicked");

            if (magicPickaxe) magicPickaxe.classList.add("clicked");
            else              self.pickaxe.classList.add("clicked");
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

        this.clickContainer.querySelector(".meta-block").innerHTML =
            "Encore " + this.block.clicks + " coup" + ((this.block.clicks > 1) ? "s" : "") + " !";

        this.block.clicks--;
    }

    private newBlockKey() {
        if (this.block == null || !this.block.useKeys) {
            this.keyContainer.style.display = "none";
            return;
        }

        const nbKeys = Object.keys(this.keys).length;

        do {
            this.block.nextKey = this.keys[Math.round(Math.random() * nbKeys)];
        } while (this.block.nextKey == null);

        this.keyContainer.innerHTML = this.block.nextKey[1];
        this.keyContainer.setAttribute("style", "display:block");
    }

    private loadMagicPickaxe() {
        if (!this.magicPickaxeForce) return;
        const self = this;

        const magicPickaxe: HTMLElement = document.querySelector(".pickaxe.magical");

        magicPickaxe.style.left = (this.clickContainer.offsetLeft + this.clickContainer.offsetWidth - 20) + "px";
        magicPickaxe.style.top = (this.clickContainer.offsetTop) + "px";

        if (this.magicPickaxeInterval)
            clearInterval(this.magicPickaxeInterval);

        this.magicPickaxeInterval = setInterval(function() {
            if (self.block && !self.block.useKeys && self.block.clicks >= 0) {
                magicPickaxe.style.display = "block";
                self.interactBlock(magicPickaxe);
            } else {
                magicPickaxe.style.display = "none";
            }
        }, 1000);
    }

    private sendData() {
        this.socket.emit("updateData", {
            level: this.level,
            coins: this.coins
        });
    }


    /*   EVENTS   */

    private onClick() {
        const self = this;
        const now = Date.now();

        if (!this.canClick)
            return;

        if (this.lastClick != null && now - this.lastClick < this.MIN_DELAY)
            return;
        // Prevent clicking with no block or a key-based block
        if (this.block == null || this.block.useKeys)
            return;

        this.interactBlock(null);

        this.lastClick = now;
    }

    private onItemMouseOver(element, event) {
        let isCoin = element.classList.contains("coin");
        let value = parseInt(element.dataset.value);

        if (isCoin) {
            this.coins += value;
            this.updateCoinsInfo();
        } else {
            this.level.currentExperience += value;
            this.updateLevelInfo();
        }

        // Print item tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerHTML = "+" + value;
        tooltip.style.top = (element.offsetTop - 10) + "px";
        tooltip.style.left = element.offsetLeft + "px";
        tooltip.style.width = element.offsetWidth + "px";
        document.body.appendChild(tooltip);

        // Update data on server!
        this.sendDataIfNeeded();

        element.parentNode.removeChild(element);
    }

    private onKeyDown(event) {
        if (this.block != null && this.block.useKeys && this.block.nextKey[0] == event.keyCode)
            this.keyContainer.style.background = "orange";
    }

    private onKeyUp(event) {
        if (this.block != null && this.block.useKeys && this.block.nextKey[0] == event.keyCode) {
            this.interactBlock(null);
            this.newBlockKey();
        }
    }

    private onMouseMove(event) {
        let calcX = event.clientX - (this.clickContainer.offsetLeft + this.clickContainer.offsetWidth/2);
        let distX = Math.abs(calcX);
        let distY = Math.abs(event.clientY - (this.clickContainer.offsetTop + this.clickContainer.offsetHeight/2));
        let dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

        if (dist < 150 && this.block != null && !this.block.useKeys) {
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

function debounce(callback, delay) {
    let timer;
    return function(){
        const args = arguments;
        const context = this;

        clearTimeout(timer);
        timer = setTimeout(function(){
            callback.apply(context, args);
        }, delay)
    }
}