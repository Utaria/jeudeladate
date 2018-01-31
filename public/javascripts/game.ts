class Game {

    private MIN_DELAY: number = 120;
    private SERVER_ENDPOINT: string;

    private clickContainer: HTMLElement;
    private keyContainer: HTMLElement;
    private pickaxe: HTMLElement;
    private tooltipXp: any;
    private totalExp: number;
    private modal: any;
    private forceCloseModal: boolean;

    private socket: any;
    private cookie: string;

    private clicks: number;
    private lastClick: number;
    private canClick: boolean;

    private level: any;
    private block: any;
    private coins: number;

    // Magic pickaxe
    private magicPickaxeForce: number;
    private magicPickaxeInterval: number;
    private nbClick: number;

    private mobile: boolean;
    private keys: any[][];

    // Debounce methods
    private sendDataIfNeeded : Function;

    public constructor() {
        this.clickContainer = document.querySelector(".click-container");
        this.keyContainer = document.querySelector(".key-container");

        // Getting socket endpoint...
        const input = document.getElementById("apiendpoint");
        this.SERVER_ENDPOINT = input.getAttribute("value");
        input.parentNode.removeChild(input);

        this.keys = [];
        let i = 0;

        for (let code = 65; code < 91; code++) {
            this.keys[i] = [code, String.fromCharCode(code)];
            i++;
        }

        document.addEventListener("touchstart", this.onTouch.bind(this));
        document.addEventListener("click", this.onClick.bind(this));
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));

        this.mobile = isTouchableDevice();
        this.pickaxe = document.querySelector(".pickaxe");

        this.clicks = 0;
        this.nbClick = 1;
        this.lastClick = null;

        this.sendDataIfNeeded = debounce(this.sendData.bind(this), 300);

        this.loadTooltips();
        this.connect();

        const message1 = [
            '%c %c %c Jeu de la date v1.0.0 | UTARIA %c %c %c https://utaria.fr/',
            'background: #cbd0d3',
            'background: #3498db',
            'color: #ffffff; background: #2980b9;',
            'background: #3498db',
            'background: #cbd0d3',
            'background: #ffffff'
        ];
        const message2 = [
            '%c %c %c Attention, en cas de tentative de hack, vous serez banni du jeu ! %c %c %c',
            'background: #cbd0d3',
            'background: #f39c12',
            'color: #ffffff; background: #e67e22;',
            'background: #f39c12',
            'background: #cbd0d3',
            'background: #ffffff'
        ];

        console.log.apply(console, message1);
        console.log.apply(console, message2);
    }

    private connect() {
        const self = this;
        this.socket = window["io"].connect(this.SERVER_ENDPOINT, {secure: this.SERVER_ENDPOINT["startsWith"]('https://')});

        this.socket.on("connect", function() {
            let cookie = window['Cookies'].get('utaria-game-token');

            if (cookie != null)        // Existing account on PC!
                self.socket.emit("connectUser", cookie);
            else
                self.newAccount();     // New account!
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

        this.socket.on("connectUser", function(data) {
            if (!data) {
                window["Cookies"].remove("utaria-game-token");
                self.newAccount();
            }
        });

        this.socket.on("registerUser", function(data) {
            if (data.err) {
                alert(data.err);
                return;
            }

            self.cookie = data.cookie;
            window['Cookies'].set('utaria-game-token', self.cookie, { expires: 365 });
            self.socket.emit("connectUser", self.cookie);

            self.forceCloseModal = true;
            self.modal.close();
        });

        this.socket.on("newBlock", function(block) {
            self.block = block;

            // Force no-key with mobile devices
            if (self.mobile) self.block.useKeys = false;

            self.clickContainer.querySelector(".meta-block").innerHTML =
                "Encore " + block.clicks + " coup" + ((block.clicks > 1) ? "s" : "") + " !";
            self.block.clicks--;

            document.querySelector("img.block").
                setAttribute("src", "/images/blocs/" + block.name + ".png");

            self.loadMagicPickaxe();
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
                    case 2:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        self.magicPickaxeForce = product[2];
                        break;
                    case 5:
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                        self.nbClick = product[2];
                        break;
                }
        });
    }

    private newAccount() {
        const self = this;

        // Create a modal to get the wanted username!
        this.modal = new window["tingle"].modal({
            footer: true,
            closeLabel: "",
            cssClass: [ "name-modal" ],
            onOpen: function() {
                const cont = this.modalBoxContent;
                const input = cont.querySelector("input");

                input.addEventListener("keyup", function(event) {
                    if (event.keyCode === 13)
                        self.modal.close();
                });

                input.focus();
            },
            onClose: function () {
                console.log('modal closed');
            },
            beforeClose: function () {
                if (self.forceCloseModal) {
                    self.forceCloseModal = false;
                    return true;
                }

                const ctn = this.modalBoxContent;
                const input = ctn.querySelector("input");

                if (!input.value) return false;

                self.socket.emit("registerUser", {
                    name: input.value,
                    rfKey: get('rfKey')
                });
                return false;
            }
        });

        this.modal.setContent(
            '<h1>Bienvenue ! Choisissez votre pseudo :</h1>' +
            '<input type="text" placeholder="Votre pseudo" />' +
            '<p>Il sera <b>uniquement</b> utilisé pour vous identifier dans le jeu.</p>'
        );

        this.modal.addFooterBtn('Je joue !', 'tingle-btn tingle-btn--default tingle-btn--pull-right', function() {
            // here goes some logic
            self.modal.close();
        });

        // open modal
        this.modal.open();
    }

    private updateLevelInfo() {
        let container = document.querySelector(".level-info");

        // Update progressbar
        let bar = container.querySelector(".progressbar");
        let perc = this.level.currentExperience / this.level.experienceNeeded;
        if (this.level.max) perc = 1;

        let nbPane = Math.min(Math.floor(perc * 10), 10);

        bar.innerHTML = "";
        for (let i = 0; i < nbPane; i++)
            bar.innerHTML += "<span></span>";

        // Update the meta title
        if (perc > 1) perc = 1;

        let meta = Math.round(perc * 10000) / 100 + "%";
        if (this.level.max) meta = "max";

        container.querySelector(".meta").innerHTML = "Niveau " + this.level.nb + " (" + meta + ")";

        if (!this.totalExp)
            this.totalExp = this.level.totalExperience;
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

        if (this.mobile)
            DIST = 100;

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

        const expPad = experience / 30 > 0 ? Math.ceil(experience / 30) : 1;
        const coinPad = coins / 30 > 0 ? Math.ceil(coins / 30) : 1;

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

            this.clickContainer.style.opacity = "0";
            this.block = null;

            setTimeout(function() {
                self.clickContainer.style.opacity = "1";
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
            if (!document.hasFocus()) return;

            if (self.block && !self.block.useKeys && self.block.clicks >= 0) {
                magicPickaxe.style.display = "block";
                self.interactBlock(magicPickaxe);
            } else {
                magicPickaxe.style.display = "none";
            }
        }, 1000 / this.magicPickaxeForce);
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

        for (let i = 0; i < self.nbClick; i++)
            this.interactBlock(null);

        this.lastClick = now;
    }

    private onTouch(event) {
        this.canClick = true;

        // Verify that the player clicked on the block before!
        if (event.target != this.clickContainer.querySelector("img"))
            return;

        event.preventDefault();
        this.onClick();
        return false;
    }

    private onItemMouseOver(element, event) {
        let isCoin = element.classList.contains("coin");
        let value = parseInt(element.dataset.value);

        if (isCoin) {
            this.coins += value;
            this.updateCoinsInfo();
        } else {
            this.level.currentExperience += value;
            this.totalExp += value;

            this.updateLevelInfo();
        }

        // Print item tooltip
        const tooltip = document.createElement("div");
        tooltip.className = "game-tooltip";
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

    private loadTooltips() {
        const self = this;

        window['tippy'](document.querySelectorAll('.menu .item'), {
            placement: 'left',
            inertia: true,
            animation: 'perspective',
            arrow: true,
            size: 'large',
            offset: '0, 10'
        });

        this.tooltipXp = window['tippy'](document.querySelector(".level-info"), {
            placement: 'left',
            inertia: true,
            animation: 'scale',
            size: 'large',
            offset: '0, 10',
            html: document.getElementById("xptt-template"),

            onShown: function() {
                const template = document.getElementById("xptt-template");
                const level = self.level;

                let xpNiv, curExp;

                curExp = level.currentExperience;
                if (curExp > level.experienceNeeded)
                    curExp = level.experienceNeeded;

                xpNiv = formatMil(curExp) + " / " + formatMil(level.experienceNeeded);
                if (level.max) xpNiv = "<b>MAX</b>";

                template.querySelector(".xpniv").innerHTML = xpNiv;
                template.querySelector(".xptot").innerHTML = formatMil(self.totalExp);
                template.querySelector(".xpdat").innerHTML = formatMil(Math.min(2000000, self.totalExp)) + " / 2 000 000";
            }
        });

        // Load also the link to change account
        document.getElementById("changeaccount").addEventListener("click", function() {
            window["Cookies"].remove("utaria-game-token");
            window.location.reload();
        });

        document.addEventListener("keyup", function(event) {
            if (event.keyCode == 75 && event.ctrlKey && event.altKey)
                document.getElementById("changeaccount").style.display = "block";
        });
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

function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);

    return null;
}

function isTouchableDevice() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window['opera']);
    return check;
}

function formatMil(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}