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

}

export default zoho
