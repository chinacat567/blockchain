import axios from 'axios'
import fs from 'fs'
import middleware from './middleware/middleware'
import nextConnect from 'next-connect'
import FormData from 'form-data'

const pinataPin = process.env.PINATA_PIN
const pinataGateway = process.env.PINATA_GATEWAY

export const config = {
  api: {
    bodyParser: false
  }
}

const handler = nextConnect()
handler.use(middleware)

handler.post(async function handlePost ({ body, files }, response) {
  try {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(files.file[0].path), files.file[0].originalFileName)
    const { data: responseData } = await axios.post(`${pinataPin}/pinning/pinFileToIPFS`, formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY
      }
    })
    const url = `${pinataGateway}/ipfs/${responseData.IpfsHash}`

    const metadata = {
      name: body.name[0],
      description: body.description[0],
      code: body.code[0],
      image: url
    }

    const metadaUrl = await uploadJsonToIPFS(metadata, body.name[0])
    return response.status(200).json({
      url: metadaUrl
    })
  } catch (error) {
    console.log('Error in uploading to Pinata: ', error)
  }
})

async function uploadJsonToIPFS (json, fileName) {
  try {
    const { data: responseData } = await axios.post(`${pinataPin}/pinning/pinJSONToIPFS`, json, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY
      }
    })
    const url = `${pinataGateway}/ipfs/${responseData.IpfsHash}`
    return url
  } catch (error) {
    console.log(error.response.data)
  }
}

export default handler
