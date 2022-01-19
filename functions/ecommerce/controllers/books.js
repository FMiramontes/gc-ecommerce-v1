const axios = require('axios')
const jwt = require('jsonwebtoken')
const catalyst = require('zcatalyst-sdk-node')
const catalystToken = require('../catalysToken')
const { desk, cliq, cache } = require('../controllers/zoho')
const crm = require('../controllers/crm')

const util = {
  getSeccion(data) {
    let secciones_array = JSON.parse(data.secciones)
    secciones_array.forEach((e) => {

      if (manzana >= e.init && manzana <= e.end) {
        if (e.Lotes != null && manzana == e.end) {
          if (tempLote >= e.Lotes.init && tempLote <= e.Lotes.end) {
            item_name = data.code + ' ' + e.name + ' ' + item
            sku = name_array2[0] + "" + e.symbol + "" + name_array2[1]
            Fraccionamiento = e.id.toString()
            if (e.name) {
              nombre_fracionamiento = data.Fraccionamiento + " " + e.name
            } else {
              nombre_fracionamiento = data.Fraccionamiento
            }
          }
        } else {
          item_name = data.code + ' ' + e.name + ' ' + item
          sku = name_array2[0] + "" + e.symbol + "" + name_array2[1]
          Fraccionamiento = e.id.toString()
          if (e.name) {
            nombre_fracionamiento = data.Fraccionamiento + " " + e.name
          } else {
            nombre_fracionamiento = data.Fraccionamiento
          }

        }
      }
    })
  },
}

const books = {
  // createTicket: async (req, res) => {
  //   // console.log("Work !!")
  //   try {


  //     const accessToken = await catalystToken(req)

  //     const subject = "Mensaje de prueba web"

  //     const message = "Esto es una prueb de GC-Ecommerce"

  //     const resp = await desk.createTicket( subject, message ,accessToken)

  //     if( resp.code == 500 ) console.log("error - ", resp.error )

  //     console.log("message - ", resp.message )

  //     res.status(resp.code).send({ message: resp.message, success: resp.success})

  //   } catch (error) {
  //       console.log(error)
  //   }

  // },
  createLead: async (req, res) => {
    try {
      const accessToken = await catalystToken(req)
      const app = catalyst.initialize(req)
      //Check for session
      if (!req.session.login) return res.status(401).send({ code: 401, message: 'Invalid user' })

      // Decode jwt
      const decoded = jwt.verify(req.session.token, process.env.JWT_SECRET)

      // Search for user in DB
      let query_user = `SELECT * FROM users WHERE users.ROWID = '${decoded.idUser}'`;

      let zcql = app.zcql()
      let user = await zcql.executeZCQLQuery(query_user);
      if (user.length == 0) return res.status(401).send({ code: 401, message: "User not found !!" })



      // User
      let first_name = user[0].users.first_name
      let last_name = user[0].users.last_name
      let phone = user[0].users.phone
      let email = user[0].users.email

      let name = first_name + " " + last_name

      // Start of proccess
      const { item, position, esEnganche } = req.body

      let query = `SELECT * FROM fraccionamientos`
      let query_fraccionamiento = await zcql.executeZCQLQuery(query)

      if (query_fraccionamiento.length == 0) return res.status(404).send({ code: 404, message: "Block not found !!" })

      data = query_fraccionamiento[position].fraccionamientos

      let Product_Name = data.Fraccionamiento + " " + item

      const tipoDePolitica = esEnganche ? 'Enganche' : 'Primer Mensualidad'
      let leadCreated = false
      let isContact = true
      let message = ''

      // If Contact
      const searchContact = await crm.searchContact(email, accessToken)
      if (!searchContact.success) {
        // Contact not found
        isContact = false
        // If Lead
        const searchLead = await crm.searchLead(email, accessToken)
        console.log("searchLead - ", searchLead)
        if (!searchLead.success) {
          // Create Lead
          console.log("Creando Lead")
          const createLead = await crm.createLead(first_name, last_name, email, phone, accessToken)
          console.log("createLead - ", createLead)
          if (createLead.success) {
            leadCreated = true
          }

          // throw new Error('Lead not created')
        }
      }

      if (isContact) {
        message = `El contacto ${name} esta interesado en adquirir el terreno ${Product_Name}, con una politica de ${tipoDePolitica}. 
            
          Datos adicionales: 
          ${email},
          ${phone}
          `;
      } else {
        message = `El Posible Cliente ${name} esta interesado en adquirir el terreno ${Product_Name}, con una politica de ${tipoDePolitica}. 
            
          Datos adicionales: 
          ${email},
          ${phone}
          `;
      }

      console.log('isContact', isContact)
      console.log('leadCreated', leadCreated)
      console.log('message', message)


      const userCache = await cache.getCache(email, app)

      console.log(userCache)



      if (userCache !== null) {
        // verifica si son menos de 5 
        let lotes = JSON.parse(userCache)

        if ( lotes.length >= 5 ) return res.status(400).send({message: 'You have reached the limit amount of tickets. Plese try again later.', success: false})
    
        const validCache = lotes.find((name) => name == Product_Name)

        if ( validCache ) return res.status(403).send( { message: "Ticket already created", success: false } )

      }
      
      // Create ticket
      const resp = await desk.createTicket(`${name} interesado en adquirir ${Product_Name}`, message, accessToken)

      if (resp.code == 500) console.log("error - ", resp.error)

      console.log("message - ", resp.message)

      if (userCache === null) {
        // No tickets created yet
        // create 
        const createCache = await cache.createCache(email, Product_Name, app)
        console.log('Creating cache', createCache)
      }else{
        // User has tickets created
        // update
        let lotes = JSON.parse(userCache)
        lotes.push(Product_Name)

        const updateCache = await cache.updateCache(email, JSON.stringify(lotes), app)
        console.log('Updating cache', updateCache)
      }

      res.status(resp.code).send({ message: resp.message, success: resp.success })

    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = books

/*
const crm = {
  createProductCRM: async (Product_Name, Manzana_y_Lote, Unit_Price, Nombre_Fraccionamiento, Fraccionamiento, M, L, accessToken) => {

    // const data = { Product_Name, Unit_Price, Manzana_y_Lote, Nombre_Fraccionamiento, Fraccionamiento }
    const Lote = L.replace(/\D+/g, '')
    const Lote_letra = L.replace(/\d+/g, '')

    const data = {
      data: [
        {
          Product_Name,
          Unit_Price: Unit_Price,
          Manzana_y_Lote,
          Manzana: M,
          Lote: Lote,
          Lote_Letra: Lote_letra,
          Nombre_Fraccionamiento,
          Fraccionamiento: { "id": Fraccionamiento },
          Uso_Predio: "Habitacional",
          Uso_Habitacional: "Terreno",
          Estado: "Disponible",
          Costo_por_M2: 200,
          Dimension_del_Terreno_M21: 100,
        }
      ],
    }


    const config = {
      method: 'post',
      url: `https://www.zohoapis.com/crm/v2/Products`,
      headers: {
        "Authorization": `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(data)
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ crm.createProductCRM -----")
      console.log(resp.data)
      let error = resp.data?.data[0]?.code != 'SUCCESS' ? true : false
      if (error) {
        console.log("------ Error en crm.createProductCRM -----")
        console.log(resp.data.data[0]?.message)
        console.log("------ Error en crm.createProductCRM -----")
        throw Error(resp.data.data[0]?.message)
      }
      return resp.data?.data ? resp.data.data[0]?.details?.id ?? false : false
    } catch (error) {
      return error
    }
  },
  createContactCRM: async (fist_name, last_name, email, movil, accessToken) => {

    // const data = { fist_name, last_name, email, phone }

    const data = {
      data: [
        {
          Last_Name: last_name,
          First_Name: fist_name,
          Email: email,
          Mobile: movil
        },
      ],
    }

    const config = {
      method: 'post',
      url: `https://www.zohoapis.com/crm/v2/Contacts`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      data: JSON.stringify(data),
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ books.createContact -----")
      console.log(resp.data)
      let error = resp.data?.data[0]?.code != 'SUCCESS' ? true : false
      if (error) {
        console.log("------ Error en crm.createProductCRM -----")
        console.log(resp.data.data[0]?.message)
        console.log("------ Error en crm.createProductCRM -----")
        throw Error(resp.data.data[0]?.message)
      }
      return resp.data?.data ? resp.data.data[0]?.details?.id ?? false : false
    } catch (error) {
      return error
    }
  },
  getContactByEmail: async (email, accessToken) => {

    const config = {
      method: 'get',
      url: `https://www.zohoapis.com/crm/v2/Contacts/search?email=${email}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ books.getContactByEmail -----")
      console.log(resp.data)
      return resp.data?.data ? resp.data.data[0]?.id ?? false : false
    } catch (error) {
      return error
    }

  },
  getItemBySku: async (sku, accessToken) => {
    const config = {
      method: 'get',
      url: `https://www.zohoapis.com/crm/v2/Products/search?criteria=(Manzana_y_Lote:equals:${sku})`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ crm.getItemBySku -----")
      console.log(resp.data)
      // let error = resp.data?.data ? true : false 
      // if(!error){
      //   console.log(resp.data?.message)
      //   throw Error(resp.data?.message)
      // }
      return resp.data?.data ? resp.data.data[0]?.id ?? false : false
    } catch (error) {
      return error
    }
  },
  productAvailable: async (id, accessToken) => {
    const config = {
      method: 'get',
      url: `https://www.zohoapis.com/crm/v2/Products/${id}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ crm.productAvailable -----")
      console.log(resp.data)

      return resp.data?.data[0]?.Estado == "Disponible" ? true : false 
    } catch (error) {
      return error
    }
  }
}

const books = {
  async getIdItem(item, accessToken) {
    // obtener access token
    // const accessToken = await catalystToken(req)

    //Config Axios
    const idProductoBooks = item

    const config = {
      method: 'get',
      url: `https://books.zoho.com/api/v3/items?zcrm_product_id=${idProductoBooks}&organization_id=${process.env.ORGANIZATION_BOOKS}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ books.getIdItem -----")
      console.log(resp.data)
      return resp.data?.item ? resp.data.item[0]?.item_id ?? false : false
    } catch (error) {
      return error
    }
  },
  async createProductBooks(name, sku, rate, accessToken) {

    const data = { name, rate, sku }
    // const data = {  rate, sku }

    const config = {
      method: 'post',
      url: `https://books.zoho.com/api/v3/items?organization_id=${process.env.ORGANIZATION_BOOKS}`,
      headers: {
        "Authorization": `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(data)
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ books.createProductBooks -----")
      console.log(resp.data)
      return resp.data?.item ? resp.data.item?.item_id ?? false : false
    } catch (error) {
      console.log(error.response.data.message)
      return error
    }
  },
  async getContactByEmail(email, accessToken) {
    const config = {
      method: 'get',
      url: `https://books.zoho.com/api/v3/contacts?email=${email}&organization_id=${process.env.ORGANIZATION_BOOKS}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ books.getContactByEmail -----")
      console.log(resp.data)
      return resp.data?.contacts ? resp.data.contacts[0]?.contact_id ?? false : false
    } catch (error) {
      return error
    }
  },
  async syncContactoBooks(contactID, accessToken) {

    const config = {
      method: 'post',
      url: `https://books.zoho.com/api/v3/crm/contact/${contactID}/import?organization_id=${process.env.ORGANIZATION_BOOKS}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ books.syncContactoBooks -----")
      console.log(resp.data)
      return resp.data?.data ? resp.data.data?.customer_id ?? false : false
    } catch (error) {
      return error
    }
  },
  async getItemByName(name, accessToken) {
    const config = {
      method: 'get',
      url: `https://books.zoho.com/api/v3/items?name=${name}&organization_id=${process.env.ORGANIZATION_BOOKS}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ books.getItemByName -----")
      console.log(resp.data)
      return resp.data?.items ? resp.data.items[0]?.item_id ?? false : false
    } catch (error) {
      return error
    }
  },
  async createInvoice(data, accessToken) {
    const config = {
      method: 'post',
      url: `https://books.zoho.com/api/v3/invoices?organization_id=${process.env.ORGANIZATION_BOOKS}`,
      headers: {
        "Authorization": `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json"
      },
      data: JSON.stringify(data)
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log("------ books.createInvoice -----")
      console.log(resp.data.message)
      return resp.data?.invoice ? resp.data.invoice?.invoice_id ?? false : false
      // return resp.data
    } catch (error) {
      console.log(error.response.data.message)
      return error
    }
  },
  async sendInvoice(invoice_id, accessToken) {

    const config = {
      method: 'post',
      url: `https://books.zoho.com/api/v3/invoices/${invoice_id}/status/sent?organization_id=${process.env.ORGANIZATION_BOOKS}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }

    // Realizar peticion con Axios
    try {
      const resp = await axios(config)
      console.log('--------------- books.sendInvoice -----------------')
      console.log(resp.data.message)
      return resp.data
    } catch (error) {
      return error
    }
  },
}


const books2 = {
  convertirFecha(fecha) {
    console.log("fecha")
    console.log(fecha)
    var dd = String(fecha.getDate()).padStart(2, '0')
    var mm = String(fecha.getMonth() + 1).padStart(2, '0')
    var yyyy = fecha.getFullYear()
    fecha = yyyy + '-' + mm + '-' + dd
    return fecha
  },
  async createFactura(req, res) {

    let listaTrue = {
      getItemBySku: false,
      createProductCRM: false,
      getItemByName: false,
      createProductBooks: false,
      getIdItem: false,
      crm_getContactByEmail: false,
      createContactCRM: false,
      syncContactoBooks: false,
      books_getContactByEmail: false,
      createInvoice: false,
      sendInvoice: false,
      productAvailable: false,
    }

    try {
      if (!req.session.login) res.status(401).send({ code: 401, message: 'Invalid user' })
      console.log('Creando Factura...')

      const { item, position, esEnganche, select } = req.body

      const accessToken = await catalystToken(req)
      const app = catalyst.initialize(req)

      let contact_crm_id, item_crm_id
      let contact_books_id, item_books_id
      let data = new Array

      let query = `SELECT * FROM fraccionamientos`

      let zcql = app.zcql()
      let query_fraccionamiento = await zcql.executeZCQLQuery(query)

      if (query_fraccionamiento.length == 0) res.status(404).send({ code: 404, message: "Block not found !!" })

      data = query_fraccionamiento[position].fraccionamientos
      // --------------------
      if (item.includes('-')) {
        let nombre_fracionamiento, Fraccionamiento, item_name, sku
        let rate = 200000
        let name_array2 = item.split('-')
        let tempManzana = name_array2[0].replace('M', '');
        let tempLote = name_array2[1].replace('L', '');

        let manzana = parseInt(tempManzana)

        if (data.esSecciones) {

          let secciones_array = JSON.parse(data.secciones)
          secciones_array.forEach((e) => {

            if (manzana >= e.init && manzana <= e.end) {
              if (e.Lotes != null && manzana == e.end) {
                if (tempLote >= e.Lotes.init && tempLote <= e.Lotes.end) {
                  item_name = data.code + ' ' + e.name + ' ' + item
                  sku = name_array2[0] + "" + e.symbol + "" + name_array2[1]
                  Fraccionamiento = e.id.toString()
                  if (e.name) {
                    nombre_fracionamiento = data.Fraccionamiento + " " + e.name
                  } else {
                    nombre_fracionamiento = data.Fraccionamiento
                  }
                }
              } else {
                item_name = data.code + ' ' + e.name + ' ' + item
                sku = name_array2[0] + "" + e.symbol + "" + name_array2[1]
                Fraccionamiento = e.id.toString()
                if (e.name) {
                  nombre_fracionamiento = data.Fraccionamiento + " " + e.name
                } else {
                  nombre_fracionamiento = data.Fraccionamiento
                }

              }
            }
          })

        }

        item_crm_id = await crm.getItemBySku(sku, accessToken)
        if (item_crm_id) {
          // Producto encontrdo en CRM
          listaTrue.getItemBySku = true
        } else {
          // Producto no encontrado en CRM
          item_crm_id = await crm.createProductCRM(item_name, sku, rate, nombre_fracionamiento, Fraccionamiento, tempManzana, tempLote, accessToken)

          if (item_crm_id instanceof Error) throw Error(item_crm_id.message)

          if (item_crm_id) listaTrue.createProductCRM = true // Producto creado en CRM
        }

        item_books_id = await books.getItemByName(item_name, accessToken)
        if (item_books_id) {
          // Producto encontrado en Books
          listaTrue.getItemByName = true
        } else {
          // Producto no encontrado en Books
          item_books_id = await books.createProductBooks(item_name, sku, rate, accessToken)

          if (item_books_id instanceof Error) throw Error(item_books_id.message)

          if (item_books_id) listaTrue.createProductBooks = true // Producto creado en Books
        }
      } else {
        item_books_id = await books.getIdItem(item, accessToken)
        if (item_books_id) listaTrue.getIdItem = true // Producto encontrado en Books
      }

      // Verifica el JWT
      const decoded = jwt.verify(req.session.token, process.env.JWT_SECRET)
      let query_user = `SELECT * FROM users WHERE users.ROWID = '${decoded.idUser}'`;
      let user = await zcql.executeZCQLQuery(query_user);

      // busca al contacto, si no lo encuentra lo crea en CRM y lo sincroniza

      if (user.length == 0) res.status(401).send({ code: 401, message: "User not found !!" })

      let email = user[0].users.email
      if (email) {
        contact_crm_id = await crm.getContactByEmail(email, accessToken)
        contact_crm_id = false
        if (!contact_crm_id) {
          let first_name = user[0].users.first_name
          
          let last_name = user[0].users.last_name
          
          let phone = user[0].users.phone
          
          contact_crm_id = await crm.createContactCRM(first_name, last_name, email, phone, accessToken)

          if (contact_crm_id instanceof Error) {

            if (contact_crm_id.message != "duplicate data") throw Error(contact_crm_id.message)
            
            contact_crm_id = await crm.getContactByEmail(email, accessToken)
           
            if (contact_crm_id) listaTrue.crm_getContactByEmail = true
            
            contact_books_id = await books.getContactByEmail(email, accessToken)
           
            if (contact_books_id) listaTrue.books_getContactByEmail = true

          } else {

            if (contact_crm_id) listaTrue.createContactCRM = true // Constacto creado en CRM

            contact_books_id = await books.syncContactoBooks(contact_crm_id, accessToken)

            if (contact_books_id instanceof Error) throw Error(contact_books_id.message)

            if (contact_books_id) listaTrue.syncContactoBooks = true // Constacto creado en Books
          
          }
        } else {
          contact_books_id = await books.getContactByEmail(email, accessToken)

          if (contact_books_id) listaTrue.syncContactoBooks = true // Constacto creado en Books
        }
      }

      console.log('---------------------------------------------------------')
      console.log('item_crm_id', item_crm_id)
      console.log('item_books_id', item_books_id)

      console.log("contact_crm_id", contact_crm_id)
      console.log("contact_books_id", contact_books_id)
      console.log('---------------------------------------------------------')

      if (!item_crm_id) throw Error("Error al conseguir item_crm_id")
      if (!item_books_id) throw Error("Error al conseguir item_books_id")
      if (!contact_crm_id) throw Error("Error al conseguir contact_crm_id")
      if (!contact_books_id) throw Error("Error al conseguir contact_books_id")

      const disponibilidad = await crm.productAvailable(item_crm_id, accessToken)

      if (!disponibilidad) throw Error("El producto ya se encuentra vendido")

      if (disponibilidad) listaTrue.productAvailable = true

      let today = new Date()
      console.log("today")
      console.log(today)
      today = books2.convertirFecha(today)
      let fecha_vencimiento = new Date(
        new Date().setDate(new Date().getDate() + 7)
      )
      console.log(today)

      fecha_vencimiento = books2.convertirFecha(fecha_vencimiento)

      // Consular que Tipo de Politica envio el usuario
      const tipoDePolitica = esEnganche ? 'Enganche' : 'Primer Mensualidad'
      let pagoEnganche = JSON.parse(data.pagoEnganche)
      const rateInvoice = esEnganche ? pagoEnganche[select] : data.pagoPM

      const invoice = {
        customer_id: contact_books_id,
        reference_number: 'Pago de Pagina Web',
        date: today,
        due_date: fecha_vencimiento,
        custom_fields: [
          {
            label: 'Commerce',
            value: true,
          },
        ],
        line_items: [
          {
            item_id: item_books_id,
            description: `Pago por Concepto de ${tipoDePolitica}`,
            quantity: 1,
            rate: rateInvoice,
          },
        ],
      }

      // ******************************

      const invoice_id = await books.createInvoice(invoice, accessToken)

      if (invoice_id instanceof Error) throw Error(invoice_id.message)

      if(invoice_id) listaTrue.createInvoice = true

      console.log('----------------- books.createInvoice -----')
      console.log(invoice_id)
      const resSent = await books.sendInvoice(invoice_id, accessToken)
      if (resSent instanceof Error) // Mensaje Cliq
      if(resSent) listaTrue.sendInvoice = true
      console.log('-------------------------------------------')

      // ******************************

      res.status(201).send({ code: 201, message: 'Invoice created' })

    } catch (error) {
      console.log("---------------------- Error Crear Factura ---------------")
      console.log(listaTrue)
      console.log(error.message)
      console.log("---------------------- Error Crear Factura ---------------")
      res.status(400).json({ code: 400, message: "Error in the request", error: error.message })
    }
  }
}


module.exports = books2
*/

/* 
 data = [
      //oro
      { "id": "2234337000054406057", "name": "ORO", "symbol": "'", "Unit_Price": 20000, "Costo_x_M2":495, "Dimensiones":200, "init": 4, "end": 22, "Lotes": {"init": 1, "end": 19} }, 
      { "id": "2234337000054406057", "name": "ORO", "symbol": "'", "Unit_Price": 20000, "Costo_x_M2":495, "Dimensiones":200, "init": 23, "end": 35, "Lotes": {"init": 1, "end": 26} },
      { "id": "2234337000054406057", "name": "ORO", "symbol": "'", "Unit_Price": 20000, "Costo_x_M2":495, "Dimensiones":200, "init": 36, "end": 37, "Lotes": null }, 
      { "id": "2234337000054406057", "name": "ORO", "symbol": "'", "Unit_Price": 20000, "Costo_x_M2":495, "Dimensiones":200, "init": 129, "end": 133, "Lotes": null }, 
      { "id": "2234337000054406057", "name": "ORO", "symbol": "'", "Unit_Price": 20000, "Costo_x_M2":495, "Dimensiones":200, "init": 139, "end": 144, "Lotes": null },
      // perla 
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 22, "end": 22, "Lotes": {"init": 20, "end": 44} }, 
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 35, "end": 35, "Lotes": {"init": 27, "end": 53} },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 41, "end": 53, "Lotes": null },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 60, "end": 100, "Lotes": null },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 127, "end": 128, "Lotes": null },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 134, "end": 138, "Lotes": null },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 150, "end": 162, "Lotes": null },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 164, "end": 170, "Lotes": null },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 172, "end": 186, "Lotes": null },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 188, "end": 188, "Lotes": null },
      { "id": "2234337000054406063", "name": "PERLA", "symbol": "}", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 192, "end": 194, "Lotes": null },
      //ELITE
      { "id": "2234337000054406069", "name": "ELITE", "symbol": ":", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 101, "end": 105, "Lotes": null },
      { "id": "2234337000054406069", "name": "ELITE", "symbol": ":", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 107, "end": 109, "Lotes": null },
      { "id": "2234337000054406069", "name": "ELITE", "symbol": ":", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 111, "end": 112, "Lotes": null },
      { "id": "2234337000054406069", "name": "ELITE", "symbol": ":", "Unit_Price": 20000, "Costo_x_M2":200, "Dimensiones":200, "init": 196, "end": 199, "Lotes": null }
      
    ]
*/
