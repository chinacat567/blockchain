// import { connectToDatabase } from './mongodb'
//
// export default async (req, res) => {
//   const { db } = await connectToDatabase()
//   const account = req.query.account
//   const query = { account }
//   let exists = false
//
//   const users = await db
//     .collection('users')
//     .findOne(query)
//
//   if (users) // if exists
//   {
//     console.log('user found') // print out what it sends back
//     exists = true
//   } else // if it does not
//   {
//     console.log('not found')
//   }
//   res.json({
//     exists
//   })
// }
