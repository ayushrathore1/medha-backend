const { AptosClient, AptosAccount, FaucetClient } = require("aptos");

const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
const FAUCET_URL = "https://faucet.testnet.aptoslabs.com";

const client = new AptosClient(NODE_URL);
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

async function createWallet() {
  const account = new AptosAccount();
  await faucetClient.fundAccount(account.address(), 100_000_000); // free test coins
  return account.address().hex();
}

async function getBalance(address) {
  const resources = await client.getAccountResources(address);
  const aptosCoin = resources.find(r => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>");
  return aptosCoin.data.coin.value;
}

module.exports = {
  createWallet,
  getBalance
};
