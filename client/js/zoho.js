const zoho = {
  getFraccionamiento: async (desarrollo) => {
    try {
      const Fraccionamento = await fetch(`/server/ecommerce/catalyst/getFraccionamiento/${desarrollo}`)
      let aux = await Fraccionamento.json()
      return aux
    } catch (error) {
      return error
    }
  },
  createLead: async (item, position, esEnganche) => {
    try {
      const parsePos = Number(position)
      const data = {
        item,
        position: parsePos,
        esEnganche
      }
      console.log(JSON.stringify(data))
      const comprobar = await fetch(`/server/ecommerce/books/createLead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const res = await comprobar.json()
      console.log(res)

      return res
    } catch (error) {
      return error
    }
  },

}

export default zoho
