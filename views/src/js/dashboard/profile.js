var saveVisible = false;

let jsonToSend = {};

const userId = document.getElementById("helper").getAttribute("userid")

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

$("li .categories").click(function () {
    console.log("clicked")
});

$(".form-check-input").change(function (e) {
    console.log(e.target)
    if (e.target.getAttribute("switch") == "true") {
        const categoryName = e.target.getAttribute("category");

        if (!jsonToSend.categoryToggle) jsonToSend.categoryToggle = []
        let exists = jsonToSend.categoryToggle.find(c => c?.id == e.target.name);

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

        console.log(jsonToSend)
    }
});

$(".categories").click(function (e) {
    const target = e.currentTarget.id;

    if (e.target.getAttribute("switch") == "true") return;

    if (saveVisible) {
        $("#saveChanges").attr('style', 'box-shadow: red 0px 0px 15px 2px !important; bottom: 15px !important');
        $("#saveChanges").effect("shake", 15);
        return;
    } else {
        if (target == categoryId) return;
        window.location.href = `/settings/${guildId}/${target}/`;
    }
});

function optionEdited(element) {
    if (!element.id) return console.log("NO id found");
    console.log(element)
    console.log("element")
    if (!jsonToSend.options) jsonToSend.options = []
    const formType = element.getAttribute("formType");

    if (!element.getAttribute("formType")) return console.log('NFT');
    let option = jsonToSend.options.find(c => c?.id == element.id);
    if (!option) {
        jsonToSend.options.push({id: element.id, value: null, defaultValue: element.defaultValue});
        option = jsonToSend.options.find(c => c?.id == element.id);
    }
    
    // if (!option) return;

    if (formType === "tagInput") {
        if (formType == "channelMultiSelect") option.value = $(`#${element.id}.multiSelect`).val();
        if (formType == "tagInput") option.value = $(`#${element.id}.tags`).val();
    } else if (formType === "switch") {
        console.log(element.checked)
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
            console.log(compressedImg)
        };
        reader.onerror = function (error) {
            console.log('Image Upload Error: ', error);
        };
    } else {
        option.value = element.value;
    }

    saveVisible = true;

    $("#saveChanges").attr('style', 'bottom: 15px !important');
    console.log(jsonToSend)
}

function discardChanges() {
    // problem with this, it doesn't reset the fields changed on the site: only the backend variable
    // well crap i forgot about that
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
        console.log(jsonToSend)
        const response = await fetch(`/profile/update/${userId}`, {
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
        }
    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

let active = 'defaultSection';
let disable = false;