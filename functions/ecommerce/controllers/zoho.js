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
    createTicket: async (subject, message, accessToken) => {
        const data = JSON.stringify({
            subject,
            message,
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
    }
}

module.exports = { cliq, desk }
