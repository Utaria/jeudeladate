var xmlhttp = new XMLHttpRequest();
var field = document.getElementById("linkfield");
var token = window['Cookies'].get('utaria-game-token');
if (token) {
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            var value = "Lien inaccessible...";
            if (xmlhttp.status === 200) {
                value = xmlhttp.responseText;
                var clipboard = new window["Clipboard"]('.linkfield', {
                    target: function (trigger) {
                        return document.getElementById("linkfield");
                    }
                });
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
