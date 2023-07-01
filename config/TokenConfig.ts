import TokenConfigInterface from '../lib/TokenConfigInterface';
import * as Networks from '../lib/Networks';

const TokenConfig: TokenConfigInterface = {
  testnet: Networks.bscMainnet,
  mainnet: Networks.bscMainnet,
  contractName: 'B8DEX',
  publicName: 'B8DEX',
  symbol: 'B8T',
  decimals: 18,
  maxSupply: 1000000000,
  contractAddress: '0x4dcCa80514c13dAcBd4A00c4E8dB891592a89306',
};

export default TokenConfig;
