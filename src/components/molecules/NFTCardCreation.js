import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@mui/styles'
import { Button, Card, CardActions, CardContent, CircularProgress, TextField } from '@mui/material'
import axios from 'axios'
import { Web3Context } from '../providers/Web3Provider'
import QrReader from 'react-qr-scanner'

const useStyles = makeStyles({
  root: {
    flexDirection: 'column',
    display: 'flex',
    margin: '15px 15px',
    flexGrow: 1
  },
  cardActions: {
    marginTop: 'auto'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    cursor: 'pointer'
  }
})

const defaultFileUrl = 'https://miro.medium.com/max/250/1*DSNfSDcOe33E2Aup1Sww2w.jpeg'

export default function NFTCardCreation ({ addNFTToList }) {
  const [file, setFile] = useState(null)
  const [, setFileUrl] = useState(defaultFileUrl)
  const classes = useStyles()
  const { register, handleSubmit, reset } = useForm()
  const { nftContract } = useContext(Web3Context)
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState('No QR Code Found')
  const [isVerifiedBarcode, setIsVerifiedBarcode] = useState(false)

  async function createNft (metadataUrl) {
    const transaction = await nftContract.createNewMedicine(metadataUrl)
    const tx = await transaction.wait()
    console.log(tx.events[0])
    const event = tx.events[0]
    console.log(event.args[2])
    return event.args[2]
  }

  function dataURLtoFile (dataurl, filename) {
    const arr = dataurl.split(','); const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  function createNFTFormDataFile (name, description, code, file) {
    // const metadata = {
    //   name: name,
    //   description: body.description,
    //   image: body.file
    // }
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('code', code)
    formData.append('file', dataURLtoFile(file, name))
    return formData
  }

  async function uploadFileToIPFS (formData) {
    // for (const pair of formData.entries()) {
    //   console.log(pair[0] + ', ' + pair[1])
    // }
    const { data } = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    console.log("d" + data)
    return data.url
  }

  async function onSubmit ({ name, description }) {
    try {
      if (!file || isLoading) return
      const valid = await validateBarcode(data)
      if (!valid) {
        alert('Invalid Barcode')
        return
      }
      setIsLoading(true)
      const formData = createNFTFormDataFile(name, description, data, file)
      const metadataUrl = await uploadFileToIPFS(formData)
      const tokenId = await createNft(metadataUrl)
      addNFTToList(tokenId)
      setFileUrl(defaultFileUrl)
      reset()
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function validateBarcode (code) {
    console.log('code = ' + code)
    const { data } = await axios(`/api/barcodes?barcode=${code}`)
    return data.exists
  }

  return (
    <Card className={classes.root} component="form" sx={{ maxWidth: 345 }} onSubmit={handleSubmit(onSubmit)}>
      <QrReader
          onScan={(result) => {
            if (result) {
              setData(result.text)
              setFile(result.canvas.toDataURL())
              setFileUrl(result.text)
            }
          }}
          onError={(err) => {
            console.error(err)
          }}
          style={{ width: '100%' }}
      />
      <p>{data}</p>
      <CardContent sx={{ paddingBottom: 0 }}>
        <TextField
          id="name-input"
          label="Name"
          name="name"
          size="small"
          fullWidth
          required
          margin="dense"
          disabled={isLoading}
          {...register('name')}
        />
         <TextField
          id="description-input"
          label="description"
          name="description"
          size="small"
          multiline
          rows={2}
          fullWidth
          required
          margin="dense"
          disabled={isLoading}
          {...register('description')}
        />
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button size="small" type="submit">
          {isLoading
            ? <CircularProgress size="20px" />
            : 'Create'
          }
        </Button>
      </CardActions>
    </Card>
  )
}
