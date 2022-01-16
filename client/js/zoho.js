const zoho = {
  createInvoice: async (item, position, esEnganche, select) => {
    try {
      const parsePos = Number(position)
      const parseSel = Number(select)
      const data = {
        item,
        position: parsePos,
        esEnganche,
        select: parseSel,
      }
      console.log(JSON.stringify(data))
      const comprobar = await fetch(`/server/ecommerce/books/createFactura`, {
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
  getFraccionamiento: async (desarrollo) => {
    try {
      const Fraccionamento = await fetch(`/server/ecommerce/catalyst/getFraccionamiento/${desarrollo}`)
      let aux = await Fraccionamento.json()
      return aux
    } catch (error) {
      return error
    }
  },

}

export default zoho
