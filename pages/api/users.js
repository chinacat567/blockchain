import { connectToDatabase } from './mongodb'

export default async function handler (req, res) {
  const { db } = await connectToDatabase()
  console.log('here' + db)
  const account = req.query.account
  const query = { account }
  let exists = false

  const users = await db
    .collection('users')
    .findOne(query)

  if (users) {
    console.log('user found')
    exists = true
  } else {
    console.log('not found')
  }
  res.json({
    exists
  })
}
