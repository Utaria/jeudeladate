const xmlhttp = new XMLHttpRequest();
const field = document.getElementById("linkfield");
const token = window['Cookies'].get('utaria-game-token');

if (token) {
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
            let value = "Lien inaccessible...";

            if (xmlhttp.status === 200) {
                value = xmlhttp.responseText;

                const clipboard = new window["Clipboard"]('.linkfield', {
                    target: function(trigger) {
                        return document.getElementById("linkfield");
                    }
                });
            }

            field.setAttribute("value", value);
        }
    };

    xmlhttp.open("GET", "/jouer/inviter/lien?token=" + token, true);
    xmlhttp.send();
} else {
    field.setAttribute("value", "Vous n'avez jamais joué");
}