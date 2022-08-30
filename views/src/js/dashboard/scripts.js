function ShowDiv(set) {
    var div = document.getElementById("server_info");
    if (set === "settings") div.style.display = "none";
    else div.style.display = "block";
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0'
}