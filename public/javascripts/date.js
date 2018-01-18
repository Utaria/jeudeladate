// Define all counters
const dayCounter = new FlipClock($('.day'), -1, { clockFace: 'Counter', minimumDigits: 2 });
const mthCounter = new FlipClock($('.month'), -1, { clockFace: 'Counter', minimumDigits: 2 });
new FlipClock($('.year'), 2018, { clockFace: 'Counter', minimumDigits: 4 });

// Hide numbers by default
function revealDate() {
    $.ajax({
        url : '/date/openingdate',
        type : 'GET',
        dataType : 'json',

        success : function(data, statut) {
            let i = 0;
            let number = 0;

            $('.opening-date .inn').each(function() {
                if (i > data.date.length * 4 - 1) return;

                $(this).text(data.date[number]);

                if (++i % 4 === 0) number++;
            });
        }
    });

}


// Refresh with json
let lastPointId = -1;

function refresh() {
    $.ajax({
        url : '/date/data',
        type : 'GET',
        dataType : 'json',

        success : function(data, statut) {
            // Update progress bar
            $('div.progress-bar span').css("width", data.percent + '%');
            $('div.percent-container span').text(Math.round(data.percent) + '%');

            // Update description bar
            const descContainer = $('div.desc-container');
            descContainer.find('span.number').text(data.exp_remaining.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "));

            // Level finished!
            if (data.exp_remaining === 0) {
                descContainer.addClass("finished");
                descContainer.find("span").html("Vous avez débloqué la date d'ouverture en entier ! Alors, content ? <i class=\"em em-clap\"></i><i class=\"em em-stuck_out_tongue\"></i>");
            }

            // Reveal date if needed!
            if (lastPointId < 0 || lastPointId !== data.point_id)
                revealDate();

            lastPointId = data.point_id;
        }
    });
}

setInterval(refresh, 5000);
refresh();