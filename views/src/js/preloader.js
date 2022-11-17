let prog_width = 0
let disabled = false
document.onreadystatechange = function (e) {
    if (disabled) return
    if (document.readyState === "interactive") {
        var all = document.getElementsByTagName("*")
        for (var i = 0, max = all.length; i < max; i++) {
            checkProgress(all[i])
        }
    }
}

function checkProgress(ele) {
    var all = document.getElementsByTagName("*")
    var per_inc = 100 / all.length
    if (disabled) return

    prog_width = prog_width + per_inc
    $("#progress").width(`${Math.floor(prog_width)}%`)

    if (prog_width >= 100 && !disabled) {
        disabled = true
        $(".preloader").fadeOut("slow")
        $("#scroll").css("overflow", "auto")
    } else {
        checkProgress(ele)
    }
}
