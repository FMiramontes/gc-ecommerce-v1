'use strict'

let containerMapa = document.getElementById('mapa-interactivo')
const preloader = document.getElementById('preloader-bg');
let zoom = 1

export function zoomIn (){
  const btnZoom = document.getElementById('zoom')
  btnZoom.addEventListener('click',() =>{
    zoom += 0.1;
    const target = document.querySelector('[id*="Manzana"]')
    console.log("target: " +target)
    target.style.transform = 'scale(' + zoom + ')'
    
  })
 }

 export function zoomOut (){
   const btnZoomOut = document.getElementById('zoom-out')
   btnZoomOut.addEventListener('click', () =>{
    if (zoom != 1){
      zoom -= 0.1
      const target = document.querySelector('[id*="Manzana"]')
      target.style.transform = 'scale(' + zoom + ')'
    }
   })
 }

 export function zoomInit (){
  const btnZoomInit = document.getElementById('zoom-init')
  btnZoomInit.addEventListener('click', () =>{
    zoom = 1
    const target = document.querySelector('[id*="Manzana"]')
    target.style.transform = 'scale(' + zoom + ')'
   
  })
}

const mapa = {
  loadManzana: async (desarrollo, manzana, fracc) => {
    fetch(`./desarrollos/${desarrollo}/Manzanas/${manzana}.svg`)
      .then((svg) => svg.text())
      .then((html) => {
        containerMapa.innerHTML = html
        mapa.bloquearManzana(fracc)
        const target = document.querySelector('[id*="Manzana"]');
        target.style.transform = 'scale(' + zoom + ')'
        zoomIn()
        zoomOut()
        zoomInit()
      })
  },
  // Obtener disponibilidad
  async getDisponiblidad(fraccionamiento, manzana){
    preloader.style.display = 'flex'
    containerMapa.style.display = 'none'
    try {
      const request = await fetch(`/server/ecommerce/crm/getDisponibilidad/${fraccionamiento}/${manzana}`)

      this.pintarDisponibles()
      if(request.ok) {

        const data = await request.json()

        if(data.length > 0) this.poblarLotificacion( await data.data)
      }
    } catch (error) {
      console.log( error )
    }
  },
  pintarDisponibles(){
    const tempLotes = document.querySelectorAll(".cls-2")
    const lostes2 = Array.from(tempLotes)
  
    lostes2.forEach((lote) => {
      try{
        if (lote.id.includes("L")) {
          lote.style.fill = '#de9f27'
          lote.style.stroke = '#000'
          lote.setAttribute("stroke-width", "1")
          lote.dataset.lote = ""
          lote.dataset.crm = false
          lote.classList = "login"
          lote.dataset.disponible = true
        }
      } catch (err) {
        console.log(err)
      }
    })
    preloader.style.display = 'none'
    containerMapa.style.display = 'flex'
  },
  poblarLotificacion(disponibilidad){  
    disponibilidad.forEach((product) => {
      try {
        let lote = ''
        if( product.Lote_Letra == null){
          lote = document.getElementById(`M${product.Manzana}-L${product.Lote}`)
        }else{
          lote = document.getElementById(`M${product.Manzana}-L${product.Lote + product.Lote_Letra}`)
        }

        
        
        if( lote !== null) {
          lote.dataset.crm_id = product.id
          lote.dataset.trato = product.Product_Name
          lote.dataset.crm = true
          lote.dataset.costototal = product.Unit_Price
          lote.dataset.dimension = product.Dimension_del_Terreno_M21
          lote.dataset.costom2 = product.Costo_por_M2
    
          if (product.Estado != "Disponible") {
            lote.style.fill = '#2e2e2e'
            lote.style.stroke = '#000'
            lote.removeAttribute('onclick')
            lote.dataset.disponible = false
          } else if (product.Estado == "Disponible") {
            lote.style.fill = '#de9f27'
            lote.style.stroke = '#000'
            lote.dataset.disponible = true
          }
        }
      } catch (err) {
        console.log(err)
      }     
    })
  
  
  },
  showPopup(e, x, y) {
    //   let mapaSvg = mapa.querySelector('#map')
    //   let map = mapaSvg.getBoundingClientRect()
    e.style.left = x + 'px'
    e.style.top = y + 'px'
    e.style.display = 'block'
  },
  hidePopup(e) {
    e.style.display = 'none'
  },
  async bloquearManzana(fracc){
    const Manzanas = document.querySelectorAll('[data-manzana]')

    // const request = await Zoho.getFraccionamiento( Name_frac )
    let secciones = JSON.parse ( fracc.secciones )
    
    Manzanas.forEach(async (m) => {
      let Manzana = m.dataset.manzana.replace('M', '');
      const seccion = secciones.find((e) => Manzana >= e.init && Manzana <= e.end)
      if(seccion === undefined) this.bloquear(m) 
    })
  },
  bloquear(e){
    delete e.dataset.manzana
    delete e.classList
    e.classList.add('disabled')
  },
}

export default mapa