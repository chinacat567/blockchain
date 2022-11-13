import { connectToDatabase } from './mongodb'

export default async function handler (req, res) {
  const { db } = await connectToDatabase()
  const barcode = req.query.barcode
  const query = { barcode }
  let exists = false

  const users = await db
    .collection('barcodes')
    .findOne(query)

  if (users) {
    console.log('barcode found') // print out what it sends back
    exists = true
  } else {
    console.log('barcode not found')
  }
  res.json({
    exists
  })
}
