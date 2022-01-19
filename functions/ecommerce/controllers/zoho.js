const axios = require('axios')
const catalyst = require('zcatalyst-sdk-node')

const cliq = {
    postToChannel: async (text, accessToken) => {

        const data = JSON.stringify({
            "text": text
        })

        const config = {
            method: 'POST',
            url: 'https://cliq.zoho.com/api/v2/channelsbyname/commerce/message',
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
            data: data
        }

        try {
            const resp = await axios(config)
            console.log(resp)
        } catch (error) {
            console.log(error)
        }
    },
}

const desk = {
    createTicket: async (subject, description, accessToken) => {
        const data = JSON.stringify({
            subject,
            description,
            contactId: "173356000022103272",
            departmentId: "173356000022067055"
        })

        const config = {
            method: 'POST',
            url: 'https://desk.zoho.com/api/v1/tickets',
            headers: {
                "orgId": "642368618",
                "Content-Type": "application/json",
                "Authorization": `Zoho-oauthtoken ${accessToken}`,
            },
            data: data
        }

        console.log("----------------------- config")
        console.log( config ) 

        try {
            const resp = await axios(config)
            if(resp.data === ''){
                return {
                    code: 400,
                    success: false,
                    message: 'Ticket not created'
                }
            }

            return {
                code: 201,
                success: true,
                message: 'Ticket created',
            }
        } catch (error) {
            return {
                code: 500,
                success: false,
                message: error.message,
                error
            }
        }
    }
}

module.exports = { cliq, desk }
