import TokenConfig from './TokenConfig';

// Update the following array if you change the constructor arguments...
const ContractArguments = [
  TokenConfig.contractName,
  TokenConfig.symbol,
  TokenConfig.decimals,
  TokenConfig.maxSupply,
] as const;

export default ContractArguments;
