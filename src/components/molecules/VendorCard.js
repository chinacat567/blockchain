import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@mui/styles'
import { Button, Card, CardActions, CardContent, CircularProgress, TextField } from '@mui/material'
import axios from 'axios'
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

export default function VendorCard () {
  const classes = useStyles()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState('No QR Code Found')
  const { register, handleSubmit, reset } = useForm()

  async function onSubmit () {
    try {
      if (isLoading) return
      const formData = new FormData()
      console.log(data)
      formData.append('barcode', data)
      const response  = await axios.post('/api/vendorupload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        if (response) {
        alert('Barcode Registered Successfully')

      }
        reset()

    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
        <Card className={classes.root} component="form" sx={{ maxWidth: 345 }} onSubmit={handleSubmit(onSubmit)}>
            <QrReader
                onScan={(result) => {
                  if (result) {
                    setData(result.text)
                  }
                }}
                onError={(err) => {
                  console.error(err)
                }}
                style={{ width: '100%' }}
            />
            <p>{data}</p>
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
