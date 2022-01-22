const catalyst = require('zcatalyst-sdk-node')
const axios = require('axios').default;
const catalystToken = require('../catalysToken')
const {encrypt, tokens} = require('../functions')

const jwt = require('jsonwebtoken')


const auth = {
    signIn: (req, res) => {
        const app = catalyst.initialize(req)
        console.log('work !!')
        // console.log(req)
        // res.json({req})
        const email = req.body.email
        const password = req.body.password

        let query = `SELECT * FROM users WHERE users.email = '${email}'`;
        console.log(query)

        let zcql = app.zcql();
        let zcqlPromise = zcql.executeZCQLQuery(query);
        zcqlPromise.then(async queryResult => {
            if (queryResult.length === 0) {
                res.status(409).send({ code: 409, type: 'danger', message: 'Unregistered user.' })
                
            } else {
                console.log('no vacio')
                let dataUser = queryResult[0].users
                let IDUser = dataUser.ROWID
                // email ya utilizado
                const passwordHash = await encrypt.comparePasword(password, dataUser.password)
                console.log('password: '+ passwordHash)
                if(!passwordHash) return res.send({ message: "No Login !", code: 2 })
                    const token = await tokens.createToken(IDUser, req, res)
                    console.log(req.session)
                    // console.log(req.session)
                    res.status(201).send({ code: 201, type: 'success',message: "Login !!", user_name: dataUser.name })
            }
        });
    },
    signOut: async (req, res) =>{
        req.session.login = false
        delete req.session.token
        console.log(req.session)
        res.status(201).send({code: 201, type: "success", message: "Logout !!"})
    },
    signOn: async (req, res) => {
        const app = catalyst.initialize(req)
        console.log('work !!')
        // console.log(req)
        // res.json({req})
        const name = req.body.name
        const first_name = req.body.first_name
        const last_name = req.body.last_name
        const email = req.body.email
        const password = req.body.password
        const phone = req.body.phone

        let query = `SELECT * FROM users WHERE users.email = '${email}'`;
        console.log(query)

        let zcql = app.zcql();
        let zcqlPromise = zcql.executeZCQLQuery(query);
        zcqlPromise.then(async queryResult => {
            if (queryResult.length === 0) {
                console.log('vacio')
                // crear contacto en tabla
                // const accessToken = await catalystToken(req)
                const passwordHash = await encrypt.encryptPassword(password)

                let rowData =
                {
                    name,
                    first_name,
                    last_name,
                    password: passwordHash,
                    phone,
                    email
                }

                //Use the table meta object to insert the row which returns a promise
                console.log(rowData)
                let datastore = app.datastore();
                let table = datastore.table('users');
                let insertPromise = table.insertRow(rowData);
                insertPromise.then( async (row) => {
                    let IDUser = row.ROWID
                    console.log("created row !!");
                    console.log(IDUser);
                    const token = await tokens.createToken(IDUser, req, res)
                    console.log(req.session)
                    // console.log(req.session)
                    res.status(201).send({code: 201, type: "success",  message: "created user !!"})
                    // console.log(resp)

                })
                .catch(err => console.log(err))
            } else {
                console.log('no vacio')
                // email ya utilizado
                res.status(409).send({code: 409, type: "warning", message: 'This email already has a registered account.' })
            }
        });




        // try {
        //     console.log('work !!')
        // const accessToken = await catalystToken(req)
        // let rowData =
        // {
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: req.body.password,
        //     phone: req.body.phone
        // }
        // const config = {
        //     method: 'put',
        //     url: `https://api.catalyst.zoho.com/baas/v1/project/${process.env.PDI}/table/${process.env.IDTABLE}/row`,
        //     headers: {
        //         Authorization: `Zoho-oauthtoken ${accessToken}`,
        //         // 'Content-Type': 'application/json'
        //     },
        //     data: JSON.stringify(rowData),
        // }
        // const resp = await axios(config)
        // console.log(resp)
        // res.send({message: "creed row !!"})

        // } catch (error) {
        //     res.end()
        //     console.log("no creed row !!")
        //     console.log(error)
        // }



    },
    session: async (req, res) => {
        res.send({message: "Login !!",code: 0})
        // res.send({message: "Login !!",code: 0, data: req.session})
    }, 
    test: async (req, res) => {
        try {
            console.log('work !!')
            const accessToken = await catalystToken(req)
            let manzana = 'M1'
            let fracc = 'Villa Prueba'
            let disponibilidad = 'Disponible'

            const config = {
                method: 'get',
                url: `https://www.zohoapis.com/crm/v2/Products/search?criteria=((Manzana:equals:${manzana})and(Nombre_Fraccionamiento:equals:${fracc})and(Estado:equals:${disponibilidad}))`,
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    // 'Content-Type': 'application/json'
                },

            }
            axios(config)
                .then(function (response) {
                    // console.log(JSON.stringify(response.data));
                    // res.json(response.data);
                    const lotes = response.data;
                    const lotificaciones = []
                    lotes.data.forEach(lote => {

                        lotificaciones.push(
                            { id: lote.id, estado: lote.Estado, nombre: lote.Product_Name, lote: lote.Lote })
                    })

                    res.send(lotificaciones)

                })
                .catch(function (error) {
                    console.log(error);
                    res.json(error)
                });

        } catch (error) {
            res.end()
            console.log("no work !!")
            console.log(error)
        }
    },
    register: async(req, res) => {
        const body = req.body
        console.log(body)
        res.status(200).send(body)
    }

}

module.exports = auth