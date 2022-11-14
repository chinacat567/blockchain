import CardAddress from '../atoms/CardAddress'

export default function CardAddresses ({ medicine }) {
  const isAvailable = !medicine.sold && !medicine.canceled
  return (
    <>
      <CardAddress title="Creator" address={medicine.creator} />
      <CardAddress title="Owner" address={medicine.owner} />
        <CardAddress title="Barcode" address={medicine.code} />
      {isAvailable && <CardAddress title="Seller" address={medicine.seller} />}
    </>
  )
}
