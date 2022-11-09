export function getProvider () {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    if (window.ethereum.isMetaMask) return 'Metamask'
    return 'Undefined'
  }
}

export const chains = {
  goerli: {
    name: 'Görli',
    chain: 'ETH',
    rpc: [
      'http://goerli.prylabs.net/',
      'https://rpc.slock.it/goerli',
      'http://goerli.blockscout.com/'
    ],
    faucets: [
      'https://goerli-faucet.slock.it/'
    ],
    nativeCurrency: {
      name: 'Görli Ether',
      symbol: 'ETH',
      decimals: 18
    },
    infoURL: 'https://goerli.net/#about',
    shortName: 'gor',
    chainId: 5,
    networkId: 5,
    explorers: [{
      name: 'etherscan-goerli',
      url: 'https://goerli.etherscan.io',
      standard: 'EIP3091'
    }]
  }
}
