import nextConnect from 'next-connect'
import middleware from './middleware/middleware'
import { connectToDatabase } from './mongodb'

const handler = nextConnect()
handler.use(middleware)

export const config = {
  api: {
    bodyParser: false
  }
}

handler.post(async function handlePost ({ body, files }, response) {
  try {
    const { db } = await connectToDatabase()
    const data = {
      barcode: body.barcode[0]
    }
    db.collection('barcodes').findOneAndUpdate({ barcode: body.barcode[0] }, { $set: data }, { upsert: true })
    return response.status(200).json({
      success: 'okay'
    })
  } catch (error) {
    console.log('Error saving doc to db: ', error)
  }
})

export default handler
