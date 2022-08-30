var saveVisible = false;

let jsonToSend = {};

let categoryId = document.getElementById("helper").getAttribute("category")
if (!categoryId) categoryId = "home"

const guildId = document.getElementById("helper").getAttribute("gid")

window.onbeforeunload = function () {
    if (saveVisible) {
        return "Dude, are you sure you want to leave? Think of the kittens!";
    }
}

$(".settings").on("change keyup paste", function (event) {
    optionEdited(event.target)
})

$(document).ready(function () {
    $(document.body).on("change", ".tags", function (e) {
        optionEdited(e.currentTarget)
    });
    $(document.body).on("change", ".multiSelect", function (e) {
        optionEdited(e.currentTarget)
    });
});

$(".form-check-input").change(function (e) {
    if (e.target.getAttribute("switch") == "true") {
        const categoryName = e.target.getAttribute("category");

        if (!jsonToSend.categoryToggle) jsonToSend.categoryToggle = []
        let exists = jsonToSend.categoryToggle.find(c => c?.id == e.target.name);

        const items = $(`[name="${e.target.name}"]`).toArray();

        for (item of items) {
            if (item.checked === e.target.checked) continue;
            item.checked = e.target.checked;
        }

        if (exists) {
            exists.value = e.target.checked;

            saveVisible = true;
            $("#saveChanges").attr('style', 'bottom: 15px !important');
        } else if (!exists) {
            jsonToSend.categoryToggle.push({
                id: e.target.name,
                name: categoryName,
                value: e.target.checked
            })
            saveVisible = true;
            $("#saveChanges").attr('style', 'bottom: 15px !important');
        }
    }
});

$(".categories").click(function (e) {
    const target = e.currentTarget.id;

    if (e.target.getAttribute("switch") == "true") return;

    if (saveVisible) {
        $("#saveChanges").attr('style', 'box-shadow: red 0px 0px 15px 2px !important; bottom: 15px !important');
        $("#saveChanges").effect("shake", 15);

    } else {
        if (target == categoryId) return;
        window.location.href = `/settings/${guildId}/${target}/`;
    }
});

function optionEdited(element) {
    if (!jsonToSend.options) jsonToSend.options = []
    const formType = element.getAttribute("formType");

    let option = jsonToSend.options.find(c => c?.id == element.id);
    if (!option) {
        jsonToSend.options.push({id: element.id, value: null, defaultValue: element.defaultValue});
        option = jsonToSend.options.find(c => c?.id == element.id);
    }

    if (!option) return;

    if (formType === "visualEmbed") {
        option.value = element.value;
    } else if (formType === "tagInput" || formType == "channelMultiSelect") {
        if (formType == "channelMultiSelect") option.value = $(`#${element.id}.multiSelect`).val();
        if (formType == "tagInput") option.value = $(`#${element.id}.tags`).val();
    } else if (formType === "switch") {
        option.value = element.checked;
    } else if (formType === "upload") {
        var reader = new FileReader();
        reader.readAsDataURL(element.files[0]);

        reader.onload = function () {
            let compressedImg = reader.result.split('').reduce((o, c) => {
                if (o[o.length - 2] === c && o[o.length - 1] < 35) o[o.length - 1]++;
                else o.push(c, 0);
                return o;
            }, []).map(_ => typeof _ === 'number' ? _.toString(36) : _).join('');
            option.value = compressedImg; // Base64 Encoded String
        };
        reader.onerror = function (error) {};
    } else {
        option.value = element.value;
    }

    saveVisible = true;

    $("#saveChanges").attr('style', 'bottom: 15px !important');
}

function discardChanges() {
    // TODO: [US-99] Discard changes
    for (const option of jsonToSend.options) {
        $(`#${option.id}`).val(option.defaultValue || "")
    }
    saveVisible = false;
    jsonToSend = {};
    $("#saveChanges").attr('style', 'bottom: -250px !important');
}

async function saveChanges() {
    if (Object.keys(jsonToSend).size <= 0) return;

    try {
        let category
        if (categoryId) category = `?categoryId=${categoryId}`


        let required = 0;

        for (const e of $("input").toArray()) {
            if (e.required && !e.value) {
                required++;
                e.style.border = "1px solid red";
                e.style.boxShadow = "0px 0px 15px 2px red";
                e.title = "This field is required";
                e.datatoggle = "tooltip";
                $(e).tooltip('enable')
                $(e).tooltip('show')
            }
        }

        if (required > 0) {
            $("#saveChanges").attr('style', 'box-shadow: red 0px 0px 15px 2px !important; bottom: 15px !important');
            $("#saveChanges").effect("shake", 15);
            return;
        }

        const response = await fetch(`/settingss/update/${guildId}/${category}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonToSend)
        })
        const content = await response.json();
        if (content.success) {
            saveVisible = false;
            jsonToSend = {};
            $("#saveChanges").attr('style', 'bottom: -250px !important');
            $('.modal:visible').modal('hide');
        }
    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

let active = 'defaultSection';
let disable = false;

function info() {
    if ($("li.info").hasClass("pillactive")) {
        $('li.info').removeClass('pillactive');
        $('#info').collapse('hide')
        $('#app').collapse('hide')
    } else {
        $('li.info').addClass('pillactive');
        $('li.app').removeClass('pillactive');
        $('#app').collapse('hide')
        $('#info').collapse('toggle')
    }
}

function app() {
    if ($("li.app").hasClass("pillactive")) {
        $('li.app').removeClass('pillactive');
        $('#info').collapse('hide')
        $('#app').collapse('hide')
    } else {
        $('li.app').addClass('pillactive');
        $('li.info').removeClass('pillactive');
        $('#info').collapse('hide')
        $('#app').collapse('toggle')
    }
}