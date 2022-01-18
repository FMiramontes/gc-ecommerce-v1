'use strict'

import Login from './login.js'
import Loader from './loader.js'

// carga de Cards/Detaills
const body = document.getElementsByTagName('body')
let type = body[0].dataset.type
Loader.getDesarollos(type)

// agrega login/pay dinamicamente
export function validarSesion(){
  if (sessionStorage.getItem("sesion")) {
      if(type == "true"){
        if(type) Login.innerPay()
        Loader.loadOpciones()
        Login.mostrarBoton()
      }else if(type == "false"){
        Login.innerLogin(type)
        Login.mostrarBoton()
      }
      
  } else {
      Login.innerLogin(type)
      Login.mostrarBoton()
  }
}

// cerrar sesion
let logout = document.getElementById('btn-logout')
logout.addEventListener('click', () => {
  Login.logout()
})

// cerrar modal
const containerModal = document.getElementById('container-modal')
containerModal.addEventListener('click', (e) => {
  if (e.target.id == 'container-modal') {
    Login.viewModal(false)
  }
})

Loader.toggleLoader()
validarSesion()
