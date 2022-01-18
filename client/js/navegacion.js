// Navegacion Flecha Arriba
$(document).ready(function () {
    $('.arriba').click(function () {
        
        $('body, html').animate({
            scrollTop: '0px'
        }, 300);
    });

    $(window).scroll(function () {
        if ($(this).scrollTop() > 0) {
            $('.arriba').slideDown(300);
        } else {
            $('.arriba').slideUp(300);
        }
    });

});

// Alerta "No se puede seleccionar lote"
let z;
let alertaLote = document.getElementById("toast3");

 function MostrarAlerta(){
     clearTimeout(z);
     alertaLote.style.transform = "translateX(0)";
     z = setTimeout(()=>{
         alertaLote.style.transform = "translateX(400px)"
        }, 4000);
    }

export {MostrarAlerta};

