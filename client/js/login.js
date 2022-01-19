'use strict'

import Zoho from './zoho.js'
import Loader from './loader.js'
import { loteSeleccionado } from './loader.js'
import { showAlert } from './alertas.js'

// add login
const modal = document.getElementById('modal')
const nombreUsuario = document.getElementById('nombre-usuario')
const body = document.getElementsByTagName('body')
let type = body[0].dataset.type
let loginForms, c
export let sesionPago = false

const login = {
  innerLogin(pay) {
    modal.innerHTML = ' '
    modal.innerHTML = `
        <div class="button-box">
            <div id="btn" id="btn-active-login"></div>
            <button id="btn-iniciar" type="button" class="toggle-btn">Iniciar Sesión</button>
            <button id="btn-registrar" type="button" class="toggle-btn">Registrar</button>
        </div>
        <div id="login-forms" class="login-forms-login">
            <form id="login" class="input-group">
                <input id="correo" type="email" class="input-field" placeholder="Correo electrónico" required>
                <input id="contrase_a" type="password" class="input-field" placeholder="Contraseña" required>
                <div class="checkbox">
                    
                    <input type="checkbox"/>
                    <label>Recordar Contraseña</label>
                </div>
                <button type="button" class="submit-btn" id="iniciar-sesion">Iniciar Sesión</button>
                <span id="error"></span>
            </form>
            <form id="registro" class="input-group" >
                <input name="fist-name" type="text" class="input-field" placeholder="Nombre(s)" required>
                <input name="last-name" type="text" class="input-field" placeholder="Apellidos" required>
                <input name="phone" type="tel" class="input-field" placeholder="Telefono" required>
                <input name="email" type="email" class="input-field" placeholder="Correo Electrónico" required>
                <input name="password" type="password" class="input-field" placeholder="Contraseña" required>
                <input name="re-password" type="password" class="input-field" placeholder="Confirmar Contraseña" required>
                <button type="submit" class="submit-btn" id="registrar-usuario">Registrar</button>
            </form>
        </div>
        `
    c = document.getElementById('btn')
    loginForms = document.getElementById('login-forms')
    // open login
    let btnLogin = document.getElementById('btn-login')

    btnLogin.addEventListener('click', () => {
      this.viewModal(true)
      sesionPago = true;
    })

    // inicio de sesion
    let iniciarSesion = document.getElementById('iniciar-sesion')
    iniciarSesion.addEventListener('click', () => {
      this.login(pay)
    })

    let registrarUsuario = document.getElementById('registrar-usuario')
    registrarUsuario.addEventListener('click', async (e) => {
      e.preventDefault()

      const logOn = await this.logOn(pay, e.target.form)
      console.log(logOn)
    })

    // evento login/registro
    let btnIniciar = document.getElementById('btn-iniciar') // iniciar sesion formulario (arriba)
    let btnRegistrar = document.getElementById('btn-registrar') // registrar formulario

    btnIniciar.addEventListener('click', () => {
      this.inicio()
    })
    btnRegistrar.addEventListener('click', () => {
      this.registro()
    })

    return true
  },
  innerPay(){
    modal.innerHTML = ' '
    modal.innerHTML = `
        <form class="pay-form">
            <div class="pay-header">
                Introduzca Datos del Contacto
                <div class="pay-division-modal"></div>
            </div>
            <div class="element" id="info-apartado">
                <div class="info-title">INFORMACIÓN DE PRODUCTO</div>
                <div id="info-product" class="info-product">
            
                </div>
            </div>
            <div class="element" id="input-mensualidad">
                <input type="text" id="mensualidad" disabled>
            </div>
            <div class="element">
                <label>¿Desea dar un enganche?</label>
                <input type="checkbox" id="checkEnganche">
            </div>
            <div class="element" id="mostrarEnganche" style="display: none;">
                <select name="monto-enganche" id="monto-enganche">
                </select>
            </div>            
                <div class="element">                          
                    <button type="submit" id="btn-enviar" class="enviar" >Enviar</button>
                </div>
                <div class="element">
                    <button type="submit" id="btn-cancelar" class="cancelar">Cancelar</button>
                </div>
        </form>
        `
      // Check enganche
      const checkEn = document.getElementById('checkEnganche')
      checkEn.addEventListener('click', (e) =>{
        login.MostrarDiv(e.target)
      })
    //Obtener boton send
    const send = document.getElementById('btn-enviar')
    send.addEventListener('click', async (e) => {
      e.preventDefault()

      // Obtener ID de Producto
      let productID = null
      let montoEnganche = null
      const item = e.target.closest('[data-item]').dataset.item
      const producto = document.getElementById(item)
      const estaCRM = producto.dataset.crm
      if (estaCRM == 'true') {
        // productID = producto.dataset.id
        productID = item
      } else {
        productID = item
      }
      console.log(productID)

      // Obtener fraccionamiento index
      const urlSearchParams = new URLSearchParams(window.location.search)
      const params = Object.fromEntries(urlSearchParams.entries())
      const fraccIndex = params.index
      console.log(fraccIndex)

      const modal = e.target.closest('#modal')

      // esEnganche
      const esEnganche = modal.querySelector('#checkEnganche').checked
      if (esEnganche) {
        montoEnganche = modal.querySelector('#monto-enganche').value
        console.log(montoEnganche)
      }
      const request = await Zoho.createLead(
        productID,
        fraccIndex,
        esEnganche
      )
      
      // Alerta
      if ( request.success == true )
      {
        console.log("message", request.message )
        this.viewModal(false)
        showAlert('success', 'Envio Exitoso')
      } 
    
    })

    const cancel = document.getElementById('btn-cancelar')
    cancel.addEventListener('click', async (e) => {
      e.preventDefault()
      login.viewModal(false)
      login.innerPay()
    })
    return true
  },
  MostrarDiv(checkEnganche) {
    // const checkPrueba = document.getElementById('checkEnganche');
    console.log(checkEnganche)
    let dvEnganche = document.getElementById("mostrarEnganche");
    let mensualidad = document.getElementById('mensualidad')

    dvEnganche.style.display = checkEnganche.checked ? "block" : "none";
    mensualidad.style.display = checkEnganche.checked ? "none" : "block"
  },

  mostrarInfoLote : (loteSeleccionado) =>{
    const info = document.getElementById('info-product')
    const trato = document.createElement('P');
    const dimension = document.createElement('P');
    const costo = document.createElement('P');
    const total = document.createElement('P');
    trato.textContent = "Producto: " + loteSeleccionado.target.dataset.trato;
    info.appendChild(trato);
    dimension.textContent = "Dimensión m2: " + loteSeleccionado.target.dataset.dimension;
    info.appendChild(dimension);
    costo.textContent = 'Costo M2 : $' + loteSeleccionado.target.dataset.costom2;
    info.appendChild(costo);
    total.textContent = 'Total: $' + loteSeleccionado.target.dataset.costototal;
    info.appendChild(total);
    
  },
  viewModal: (view, id) => {
    let container_modal = document.getElementById('container-modal')
    let modal = document.getElementById('modal')

    if (view) {
      container_modal.style.display = 'flex'
      modal.dataset.item = id
    } else {
      container_modal.style.display = 'none'
      modal.dataset.item = ''
    }
  },
  registro: () => {
    c.style.left = '140px'
    loginForms.classList = 'login-forms-register'
  },
  inicio: () => {
    c.style.left = '0px'
    loginForms.classList = 'login-forms-login'
  },
  validPassword(password, re_password){
    if( re_password === password) {
      if ( password.length < 8 ) return true
    }

    return false
  },
  login(pay) {
    console.log('Login: ' + pay)
    let email = document.getElementById('correo')
    let password = document.getElementById('contrase_a')
    const Msg = document.getElementById('error')

    let body = {
      email: email.value,
      password: password.value,
    }

    fetch('/server/ecommerce/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((data) => data.json())
      .then((res) => {
        if (res.code != 0) {
          console.log('No Login !!')
          email.value = ' '
          password.value = ' '
          Msg.innerText = 'Usuario y/o contraseña incorrectos'
          Msg.style.display = 'block'
          this.ocultarError()
          return false
        } else {
          this.iniciar(pay, res.name, email)
          document.getElementById('')
          return true
        }
      })
  },
  async logOn(pay, form) {
    console.log('LogOn: ' + pay)
    const first_name = form[0].value
    const last_name = form[1].value
    const phone = parseInt( form[2].value )
    const email = form[3].value
    const password = form[4].value
    const re_password = form[5].value

    const name = first_name + " " +last_name

    const valid_password = this.validPassword(password, re_password)

    if( !valid_password ) return "Invalid password"

    let body = { name, first_name, last_name, email, password,  phone, }

    console.log("body - ",body)

    fetch('/server/ecommerce/auth/sign-on', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((data) => data.json())
      .then((res) => {
        if (res.code != 0) {
          console.log('No LogOn !!')
          first_name.value = ' '
          last_name.value = ' '
          email.value = ' '
          phone.value = ' '
          password.value = ' '
          re_password.value = ' '
          return false
        } else {
          this.iniciar(pay, name, email)
          document.getElementById('')
          return true
        }
      })
    
  },
  logout() {
    const loagout = fetch('/server/ecommerce/auth/sign-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    sessionStorage.removeItem('usuario')
    sessionStorage.removeItem('correo')
    sessionStorage.removeItem('sesion')
    this.innerLogin(type)
    this.mostrarBoton()
  },
  iniciar(pay, name, email) {
    sessionStorage.setItem('usuario', name)
    sessionStorage.setItem('correo', email)
    sessionStorage.setItem('sesion', true)
    this.mostrarBoton()
    this.viewModal(false)
    if(sesionPago == false)
        {
            this.viewModal(true)
            if(pay) this.innerPay()
            Loader.loadOpciones()
            this.mostrarInfoLote(loteSeleccionado) 
        }
  },
  mostrarBoton: () => {
    let btnLogin = document.getElementById('btn-login')
    let btnLogout = document.getElementById('btn-logout')
    if (sessionStorage.getItem('sesion') == null) {
      btnLogout.style.display = 'none'
      btnLogin.style.display = 'block'
      nombreUsuario.innerText = ' '
    }

    if (sessionStorage.getItem('sesion')) {
      btnLogout.style.display = 'block'
      btnLogin.style.display = 'none'
      nombreUsuario.innerText =
        'Bienvenido(a): ' + sessionStorage.getItem('usuario')
    }
  },
  // Mensaje error login 
  ocultarError(){
    const msgError = document.getElementById('error')
    setTimeout(() => {      
        msgError.remove();  
    }, 3500);
  },
}

export default login
