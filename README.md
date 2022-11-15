# CSE 526 README
## How to Run on LocalHost
- Navigate to project directory (cse526) and run "npm install"
- Run "npm run node" to start Hardhat and Nodejs
- NOTE : Upon running this command, you will see a list of accounts with their private keys. These accounts can be imported in MetaMask to interact with the EVM running on localhost
- Deploy the smart contracts to localhost using "npm run deploy:localhost". This command will deploy both the contracts on localhost
- Run "npm run dev" and navigate to http://localhost:3000/

## How to Run on Goerli
- NOTE : You need sufficient Goerli in muiltiple accounts to be able to run this Dapp on Goerli
- Navigate to project directory (cse526) and run "npm install"
- Run "npm run node" to start Hardhat and Nodejs
- Deploy the smart contracts to localhost using "npm run deploy:goerli". This command will deploy both the contracts to the Goerli test network
- Run "npm run dev" and navigate to http://localhost:3000/