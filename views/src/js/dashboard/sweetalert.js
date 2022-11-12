function sweetalert(icons, text, timer) {
    var is_mobile =
        !!navigator.userAgent.match(/iphone|android|blackberry/gi) || false
    let pos = "top-end"
    if (is_mobile) pos = "bottom-end"
    const Toast = Swal.mixin({
        toast: true,
        position: pos,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer)
            toast.addEventListener("mouseleave", Swal.resumeTimer)
        },
    })

    Toast.fire({
        icon: icons,
        title: text,
    })
}
