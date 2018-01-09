window.addEventListener("load", function() {

    var BASE_DELAY = 3000;

    var h1  = document.querySelector("h1.main");
    var trs = h1.querySelectorAll("span");
    var idx = -1;

    titreReroll();

    function titreReroll() {
        if (idx >= 0)
            trs[idx].classList.remove("echo");

        trs[++idx].classList.add("echo");

        if (idx < trs.length - 1)
            setTimeout(titreReroll, (idx>0)?(BASE_DELAY/idx):BASE_DELAY);
    }

    Particles.init({
        selector: '.particles',
        color: '#555555',
        maxParticles: 50,
        connectParticles: true,
        speed: 0.6
    });

});