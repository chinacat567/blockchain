import { Button } from '@mui/material'
import PageMessageBox from './PageMessageBox'

export default function AuthenticatedUser () {
    return (
        <PageMessageBox
            text="This account is already Registered."
        >
            {/*<Button*/}
            {/*    variant='outlined'*/}
            {/*    color='primary'*/}
            {/*    onClick={ () => window.open('register', '_blank') }*/}
            {/*    sx={{*/}
            {/*      maxWidth: 600,*/}
            {/*      margin: 'auto',*/}
            {/*      display: 'flex',*/}
            {/*      justifyContent: 'center'*/}
            {/*    }}*/}
            {/*>*/}
            {/*    { 'Register Account' }*/}
            {/*</Button>*/}
        </PageMessageBox>
    )
}