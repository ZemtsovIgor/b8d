import chai, { expect, assert } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import TokenConfig from '../config/TokenConfig';
import ContractArguments from '../config/ContractArguments';
import { TokenContractType } from '../lib/ContractProvider';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(ChaiAsPromised);

const totalAmount = BigNumber.from(TokenConfig.maxSupply).mul(BigNumber.from(10).pow(18)).toString();
const firstTransactionAmount = BigNumber.from(1).mul(BigNumber.from(10).pow(18)).toString();
const secondTransactionAmount = BigNumber.from(4).mul(BigNumber.from(10).pow(18)).toString();

describe(TokenConfig.contractName, function () {
  let owner!: SignerWithAddress;
  let holder!: SignerWithAddress;
  let externalUser!: SignerWithAddress;
  let contract!: TokenContractType;

  before(async function () {
    [owner, holder, externalUser] = await ethers.getSigners();
  });

  it('Contract deployment', async function () {
    const Contract = await ethers.getContractFactory(TokenConfig.contractName);
    contract = await Contract.deploy(...ContractArguments) as TokenContractType;

    await contract.deployed();
  });

  it('Check initial data', async function () {
    expect(await contract.name()).to.equal(TokenConfig.contractName);
    expect(await contract.symbol()).to.equal(TokenConfig.symbol);
    expect(await contract.decimals()).to.equal(TokenConfig.decimals);
    const totalSupply = BigNumber.from(TokenConfig.maxSupply).mul(BigNumber.from(10).pow(18)).toString();
    expect(await contract.totalSupply()).to.equal(totalSupply);
  });

  it('Before any transactions', async function () {
    // Check balances
    const ownerBalance = BigNumber.from(TokenConfig.maxSupply).mul(BigNumber.from(10).pow(18)).toString();
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(ownerBalance);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(0);
    expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(0);
  });

  it('Transactions', async function () {
    const ownerBalance = BigNumber.from(totalAmount).sub(firstTransactionAmount).sub(secondTransactionAmount).toString();
    const holderBalance = BigNumber.from(firstTransactionAmount).add(firstTransactionAmount).toString();
    const externalUserBalance = BigNumber.from(secondTransactionAmount).sub(firstTransactionAmount).toString();

    await contract.connect(owner).transfer(await holder.getAddress(), firstTransactionAmount);
    await contract.connect(owner).transfer(await externalUser.getAddress(), secondTransactionAmount);
    await contract.connect(externalUser).transfer(await holder.getAddress(), firstTransactionAmount);

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(ownerBalance);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(holderBalance);
    expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(externalUserBalance);
  });

  it('Multi Transactions', async function () {
    const to = [await holder.getAddress(), await externalUser.getAddress()];
    const values = [secondTransactionAmount, secondTransactionAmount];

    const ownerBalance = BigNumber.from(totalAmount)
      .sub(firstTransactionAmount)
      .sub(secondTransactionAmount)
      .sub(secondTransactionAmount)
      .sub(secondTransactionAmount)
      .toString();
    const holderBalance = BigNumber.from(firstTransactionAmount)
      .add(firstTransactionAmount)
      .add(secondTransactionAmount)
      .toString();
    const externalUserBalance = BigNumber.from(secondTransactionAmount)
      .sub(firstTransactionAmount)
      .add(secondTransactionAmount)
      .toString();

    await contract.connect(owner).multiTransfer(to, values);

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(ownerBalance);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(holderBalance);
    expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(externalUserBalance);
  });

  it('Stop Contract', async function () {
    // Stop Contract by User
    await expect(contract.connect(holder).startStop()).to.be.revertedWith('Ownable: caller is not the owner');

    // Stop Contract by Owner
    await contract.connect(owner).startStop();
  });

  it('Transactions with not running Contract', async function () {
    const to = [await holder.getAddress(), await externalUser.getAddress()];
    const values = [secondTransactionAmount, secondTransactionAmount];

    const ownerBalance = BigNumber.from(totalAmount)
      .sub(firstTransactionAmount)
      .sub(secondTransactionAmount)
      .sub(secondTransactionAmount)
      .sub(secondTransactionAmount)
      .toString();
    const holderBalance = BigNumber.from(firstTransactionAmount)
      .add(firstTransactionAmount)
      .add(secondTransactionAmount)
      .toString();
    const externalUserBalance = BigNumber.from(secondTransactionAmount)
      .sub(firstTransactionAmount)
      .add(secondTransactionAmount)
      .toString();

    // transactions
    await expect(contract.connect(owner).transfer(await holder.getAddress(), firstTransactionAmount)).to.be.revertedWith('Contract not running');
    await expect(contract.connect(holder).transfer(await externalUser.getAddress(), firstTransactionAmount)).to.be.revertedWith('Contract not running');
    await expect(contract.connect(externalUser).transfer(await holder.getAddress(), firstTransactionAmount)).to.be.revertedWith('Contract not running');

    // multi transactions
    await expect(contract.connect(owner).multiTransfer(to, values)).to.be.revertedWith('Contract not running');
    await expect(contract.connect(holder).multiTransfer(to, values)).to.be.revertedWith('Contract not running');
    await expect(contract.connect(externalUser).multiTransfer(to, values)).to.be.revertedWith('Contract not running');

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(ownerBalance);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(holderBalance);
    expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(externalUserBalance);
  });

  it('Run Contract', async function () {
    // Stop Contract by User
    await expect(contract.connect(holder).startStop()).to.be.revertedWith('Ownable: caller is not the owner');

    // Stop Contract by Owner
    await contract.connect(owner).startStop();
  });

  it('Mint Tokens', async function () {
    const ownerBalance = BigNumber.from(totalAmount)
      .sub(firstTransactionAmount)
      .sub(secondTransactionAmount)
      .sub(secondTransactionAmount)
      .sub(secondTransactionAmount)
      .add(firstTransactionAmount)
      .toString();
    const holderBalance = BigNumber.from(firstTransactionAmount)
      .add(firstTransactionAmount)
      .add(secondTransactionAmount)
      .toString();

    // Stop Contract by User
    await expect(contract.connect(holder).mint(firstTransactionAmount)).to.be.revertedWith('Ownable: caller is not the owner');

    // Stop Contract by Owner
    await contract.connect(owner).mint(firstTransactionAmount);

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(ownerBalance);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(holderBalance);
  });

  it('Burn Tokens', async function () {
    const ownerBalance = BigNumber.from(totalAmount)
      .sub(firstTransactionAmount)
      .sub(secondTransactionAmount)
      .sub(secondTransactionAmount)
      .sub(secondTransactionAmount)
      .add(firstTransactionAmount)
      .sub(firstTransactionAmount)
      .toString();
    const holderBalance = BigNumber.from(firstTransactionAmount)
      .add(firstTransactionAmount)
      .add(secondTransactionAmount)
      .sub(firstTransactionAmount)
      .toString();

    // Stop Contract by User
    await contract.connect(holder).burn(firstTransactionAmount)

    // Stop Contract by Owner
    await contract.connect(owner).burn(firstTransactionAmount);

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(ownerBalance);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(holderBalance);
  });
});
