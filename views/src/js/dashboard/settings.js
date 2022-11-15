function info() {
    if ($("li.info").hasClass("pillactive")) {
        $("li.info").removeClass("pillactive")
        $("#info").collapse("hide")
        $("#app").collapse("hide")
    } else {
        $("li.info").addClass("pillactive")
        $("li.app").removeClass("pillactive")
        $("#app").collapse("hide")
        $("#info").collapse("toggle")
    }
}

function app() {
    if ($("li.app").hasClass("pillactive")) {
        $("li.app").removeClass("pillactive")
        $("#info").collapse("hide")
        $("#app").collapse("hide")
    } else {
        $("li.app").addClass("pillactive")
        $("li.info").removeClass("pillactive")
        $("#info").collapse("hide")
        $("#app").collapse("toggle")
    }
}

//Will simplify and make more efficient
function switchCategory(id, name, desc, img, enabled, info) {
    if ($(`#${id}div`).is(":visible")) return
    if (id === "home") {
        $(".active").removeClass("active")
        $("#home").addClass("active")
        $(`.settings`).hide("slow")
        $(`#title`).html(`${name}`)
        $(`#desc`).html(`${desc}`)
        $("#img").attr("src", `${img}`)
        $("#serverdesc").show("slow")
        // $('li.info').addClass('pillactive');
        // $('li.app').removeClass('pillactive');
        // $('#app').collapse('hide')
        // $('#info').collapse('show')

        window.history.pushState("page2", name, `/guildnew/<%-req.params.id%>/`)
    } else {
        window.history.pushState(
            "page2",
            name,
            `/guildnew/<%-req.params.id%>/${id}/`
        )
        $("#serverdesc").hide()

        $(`.settings`).hide(100)
        $(".active").removeClass("active")
        $(`#${id}`).addClass("active")
        $(`#title`).html(`${name}`)
        $(`#desc`).html(`${desc}`)
        $("#img").attr("src", `${img}`)

        $(`#${id}div`).show("slow")
        $("li.info").removeClass("pillactive")
        $("#info").collapse("hide")
        $("#app").collapse("hide")
    }
}

function refresh(id, name, desc, img) {
    if (id === "home") {
        $(".active").removeClass("active")
        $("#home").addClass("active")
        $(`.settings`).hide()
        $(`#title`).html(`${name}`)
        $(`#desc`).html(`${desc}`)
        $("#img").attr("src", `${img}`)
        $("#serverdesc").show()
        window.history.pushState("page2", name, `/guildnew/<%-req.params.id%>/`)
    } else {
        window.history.pushState(
            "page2",
            name,
            `/guildnew/<%-req.params.id%>/${id}/`
        )
        $("#serverdesc").show()
        $("#serverdesc").hide()
        $(`.settings`).hide()
        $(".active").removeClass("active")
        $(`#${id}`).addClass("active")
        $(`#title`).html(`${name}`)
        $(`#desc`).html(`${desc}`)
        $("#img").attr("src", `${img}`)
        $(`#${id}div`).show()
    }
}
