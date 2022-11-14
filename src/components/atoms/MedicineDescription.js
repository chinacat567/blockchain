import { Typography } from '@mui/material'

export default function MedicineDescription ({ description }) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      gutterBottom
      >
        {description}
    </Typography>
  )
}
