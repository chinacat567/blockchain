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
      firstName: body.firstName[0],
      lastName: body.firstName[0],
      governmentId: body.governmentId[0],
      account: body.account[0]
    }
    db.collection('users').updateOne({ }, { $set: data }, { upsert: true })
    return response.status(200).json({
      success: 'okay'
    })
  } catch (error) {
    console.log('Error saving doc to db: ', error)
  }
})

export default handler
