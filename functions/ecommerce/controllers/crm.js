const axios = require('axios')
const catalystToken = require('../catalysToken')

const crm = {
    // obtener Producto CRM
    getProducto: async (req, res) => {
    // obtener access token
    const accessToken = await catalystToken(req)

    // Config para axios
    const idProducto = req.params.id
    const config = {
        method: 'get',
        url: `https://www.zohoapis.com/crm/v2/Products/${idProducto}`,
        headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
    }

    // Realizar peticion con Axios
    try {
        const resp = await axios(config)
        res.send(resp.data.data[0])
        // console.log(resp.data)
        } catch (error) {
            console.log(error)
        }
    },

    getDisponibilidad: async (req, res) => {
    // obtener access token
    const accessToken = await catalystToken(req)
    const numManzana = req.params.manzana.replace(/\D+/, '')
    // const disponibilidad = 'Disponible'
    // url: `https://www.zohoapis.com/crm/v2/Products/search?criteria=((Manzana:equals:${req.params.manzana})and(Nombre_Fraccionamiento:equals:${req.params.desarrollo})and(Estado:equals:${disponibilidad}))`,

    const config = {
        method: 'get',
        // url: `https://www.zohoapis.com/crm/v2/Products/search?criteria=((Manzana:equals:${req.params.manzana})and(Nombre_Fraccionamiento:equals:${req.params.desarrollo}))`,
        url: `https://www.zohoapis.com/crm/v2/Products/search?criteria=((Nombre_Fraccionamiento:starts_with:${encodeURI(
        req.params.desarrollo
        )})and(Manzana:equals:${numManzana}))`,
        headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
    }

        try {
            const resp = await axios(config)

            const data = resp.data.data
            const crmJSON = [...data].map((lote) => {
            return {
                id: lote.id,
                Lote: lote.Lote,
                Manzana: lote.Manzana,
                Lote_Letra: lote.Lote_Letra,
                Unit_Price: lote.Unit_Price,
                Nombre_Fraccionamiento: lote.Nombre_Fraccionamiento,
                Costo_por_M2: lote.Costo_por_M2,
                Dimension_del_Terreno_M21: lote.Dimension_del_Terreno_M21,
                Uso_Predio: lote.Uso_Predio,
                Manzana_y_Lote: lote.Manzana_y_Lote,
                Fraccionamiento: lote.Fraccionamiento,
                Product_Name: lote.Product_Name,
                Estado: lote.Estado,
            }
            })
            res.status(200).send({ data: crmJSON, length: crmJSON.length })
            // console.log(resp.data)
        } catch (error) {
            res.status(400).send(error)
        }
    },
    searchLead: async (email, accessToken) => {
        const config = {
            method: 'get',
            url: `https://www.zohoapis.com/crm/v2/Leads/search?email=${email}`,
            headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
        }

        try {
            const resp = await axios(config)
            console.log("----------------- searchLead ")
            console.log("data - ",resp.data)
            console.log("resp - ",resp)
            // Lead not found
            if(resp.data === ''){
                return {
                    code: 404,
                    success: false,
                    message: 'Lead does not exist'
                }
            }

            // Found a matching lead
            return {
                code: 200,
                success: true,
                lead_id : resp.data.data[0].id
            }
            // console.log(resp.data)
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    error
                }
        }
    },
    searchContact: async (email, accessToken) => {
        const config = {
            method: 'get',
            url: `https://www.zohoapis.com/crm/v2/Contacts/search?email=${email}`,
            headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
        }

        try {
            const resp = await axios(config)

            // Contact not found
            if(resp.data === ''){
                return {
                    code: 404,
                    success: false,
                    message: 'Contact does not exist'
                }
            }

            // Found a matching contact
            return {
                code: 200,
                success: true,
                contact_id : resp.data.data[0].id
            }
            // console.log(resp.data)
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    error
                }
        }
    },
    createLead: async (fist_name, last_name, email, phone, accessToken) => {
        const data = {
            data: [
              {
                Last_Name: last_name,
                First_Name: fist_name,
                Email: email,
                Mobile: phone
              },
            ],
        }

        const config = {
            method: 'post',
            url: `https://www.zohoapis.com/crm/v2/Leads`,
            headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
            data: JSON.stringify(data),
        }
        try {
            const resp = await axios(config)
            console.log("----------------- createLead ")
            console.log("data - ",resp.data)
            if(resp.data === ''){
                return {
                    code: 400,
                    success: false,
                    message: 'Lead was not created.'
                }
            }

            // Found a lead
            return {
                code: 201,
                success: true,
                lead_id : resp.data.data[0].id
            }
            } catch (error) {
                return {
                    code: 500,
                    success: false,
                    error
                }
        }
    }
}

module.exports = crm
