export default function handler (req, res) {
  res.status(200).json({
    marketplaceAddress: process.env[`MARKET_CONTRACT_ADDRESS_${req.query.network}`],
    medicineContractAddress: process.env[`MEDICINE_CONTRACT_ADDRESS_${req.query.network}`]
  })
}
