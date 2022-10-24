import { Button } from '@mui/material'
import PageMessageBox from './PageMessageBox'

export default function UnsupportedChain () {
  return (
        <PageMessageBox
            text="This account is not registered."
        >
            <Button
                variant='outlined'
                color='primary'
                onClick={ () => window.open('register', '_blank') }
                sx={{
                  maxWidth: 600,
                  margin: 'auto',
                  display: 'flex',
                  justifyContent: 'center'
                }}
            >
                { 'Register Account' }
            </Button>
        </PageMessageBox>
  )
}