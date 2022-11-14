
import { useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { Web3Context } from '../providers/Web3Provider'
import NavItem from '../atoms/NavItem'
import ConnectedAccountAddress from '../atoms/ConnectedAccountAddress'
import ConnectButton from '../atoms/ConnectButton'

const pages = [
  {
    title: 'Market',
    href: '/'
  },
  {
    title: 'My Medicines',
    href: '/my-nfts'
  },
  {
    title: 'Registration',
    href: '/registration'
  },
  {
    title: 'Vendor',
    href: '/vendor'
  }

]

const NavBar = () => {
  const { metaMaskAccount } = useContext(Web3Context)
  const logo = 'CSE526'

  return (
    <AppBar position="static">
      <Container maxWidth="100%">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            {pages.map(({ title, href }) => <NavItem title={title} href={href} key={title}/>)}
          </Box>
          <Typography
            variant="h3"
            noWrap
            component="div"
            sx={{ p: '10px', flexGrow: { xs: 1, md: 0 }, display: 'flex' }}
          >
            {logo}
          </Typography>
          {metaMaskAccount ? <ConnectedAccountAddress account={metaMaskAccount}/> : <ConnectButton />}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default NavBar
