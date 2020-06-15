var xmlhttp = new XMLHttpRequest();
var field = document.getElementById("linkfield");
var token = window['Cookies'].get('utaria-game-token');
if (token) {
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
            var value = "Lien inaccessible...";
            if (xmlhttp.status === 200) {
                value = xmlhttp.responseText;
                /*const clipboard = new Clipboard('.linkfield', {
                    target: function(trigger) {
                        return document.getElementById("linkfield");
                    }
                });*/
            }
            field.setAttribute("value", value);
        }
    };
    xmlhttp.open("GET", "/jouer/inviter/lien?token=" + token, true);
    xmlhttp.send();
}
else {
    field.setAttribute("value", "Vous n'avez jamais joué");
}
