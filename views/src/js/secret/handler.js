function simulateKeyup(code) {
    var e = jQuery.Event("keyup");
    e.keyCode = code;
    jQuery('body').trigger(e);
}

function simulateKeydown(code) {
    var e = jQuery.Event("keydown");
    e.keyCode = code;
    jQuery('body').trigger(e);
}

//$.mobile.loading().hide();
loadAllSound();

HELP_TIMER = setInterval('blinkHelp()', HELP_DELAY);

initHome();

$(".sound").click(function (e) {
    e.stopPropagation();

    var sound = $(this).attr("data-sound");
    if (sound === "on") {
        $(".sound").attr("data-sound", "off");
        $(".sound").find("img").attr("src", "../../img/secret/sound-off.png");
        GROUP_SOUND.mute();
    } else {
        $(".sound").attr("data-sound", "on");
        $(".sound").find("img").attr("src", "../../img/secret/sound-on.png");
        GROUP_SOUND.unmute();
    }
});

$(".help-button, #help").click(function (e) {
    e.stopPropagation();
    if (!PACMAN_DEAD && !LOCK && !GAMEOVER) {
        if ($('#help').css("display") === "none") {
            $('#help').fadeIn("slow");
            $(".help-button").hide();
            if ($("#panel").css("display") !== "none") {
                pauseGame();
            }
        } else {
            $('#help').fadeOut("slow");
            $(".help-button").show();
        }
    }
});

$("#home").on("click touchstart", function (e) {
    if ($('#help').css("display") === "none") {
        e.preventDefault();
        simulateKeydown(13);
    }
});
$("#control-up, #control-up-second, #control-up-big").on("mousedown touchstart", function (e) {
    e.preventDefault();
    simulateKeydown(38);
    simulateKeyup(13);
});
$("#control-down, #control-down-second, #control-down-big").on("mousedown touchstart", function (e) {
    e.preventDefault();
    simulateKeydown(40);
    simulateKeyup(13);
});
$("#control-left, #control-left-big").on("mousedown touchstart", function (e) {
    e.preventDefault();
    simulateKeydown(37);
    simulateKeyup(13);
});
$("#control-right, #control-right-big").on("mousedown touchstart", function (e) {
    e.preventDefault();
    simulateKeydown(39);
    simulateKeyup(13);
});


$("body").keyup(function (e) {
    KEYDOWN = false;
});

$("body").keydown(function (e) {

    if (HOME) {

        initGame(true);

    } else {
        //if (!KEYDOWN) {
        KEYDOWN = true;
        if (PACMAN_DEAD && !LOCK) {
            erasePacman();
            resetPacman();
            drawPacman();

            eraseGhosts();
            resetGhosts();
            drawGhosts();
            moveGhosts();

            blinkSuperBubbles();

        } else if (e.keyCode >= 37 && e.keyCode <= 40 && !PAUSE && !PACMAN_DEAD && !LOCK) {
            if (e.keyCode === 39) {
                movePacman(1);
            } else if (e.keyCode === 40) {
                movePacman(2);
            } else if (e.keyCode === 37) {
                movePacman(3);
            } else if (e.keyCode === 38) {
                movePacman(4);
            }
        } else if (e.keyCode === 68 && !PAUSE) {
            /*if ( $("#canvas-paths").css("display") === "none" ) {
                $("#canvas-paths").show();
            } else {
                $("#canvas-paths").hide();
            }*/
        } else if (e.keyCode === 80 && !PACMAN_DEAD && !LOCK) {
            if (PAUSE) {
                resumeGame();
            } else {
                pauseGame();
            }
        } else if (GAMEOVER) {
            initHome();
        }
        //}
    }
});