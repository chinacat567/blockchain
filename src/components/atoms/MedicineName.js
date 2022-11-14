import { Typography } from '@mui/material'

export default function MedicineName ({ name }) {
  return (
    <Typography
      gutterBottom
      variant="h5"
      component="div"
      >
        {name}
    </Typography>
  )
}
