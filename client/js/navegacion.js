// Navegacion Flecha Arriba
const btn_scrolltop = document.getElementById("btn_scrolltop")
btn_scrolltop.addEventListener('click', () => {
    window.scrollTo(0, 0)
})
window.onscroll = () => {
    add_btn_scrolltop()
}
const add_btn_scrolltop = () => {
    if (window.scrollY < 300) {
        btn_scrolltop.classList.remove("btn-scrolltop-on")
    } else {
        btn_scrolltop.classList.add("btn-scrolltop-on")
    }
}

// Alerta "No se puede seleccionar lote"
let z;
let alertaLote = document.getElementById("toast3");

function MostrarAlerta() {
    clearTimeout(z);
    alertaLote.style.transform = "translateX(0)";
    z = setTimeout(() => {
        alertaLote.style.transform = "translateX(400px)"
    }, 4000);
}

export { MostrarAlerta };

