import NetworkConfigInterface from '../lib/NetworkConfigInterface';

export default interface TokenConfigInterface {
  testnet: NetworkConfigInterface;
  mainnet: NetworkConfigInterface;
  contractName: string;
  publicName: string;
  symbol: string;
  decimals: number;
  maxSupply: number;
  contractAddress: string|null;
};
