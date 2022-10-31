const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My Dapp", function () {
  let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("YourContract", function () {
    it("Should deploy YourContract", async function () {
      const YourContract = await ethers.getContractFactory("YourContract");

      myContract = await YourContract.deploy();
    });

    describe("setPurpose()", function () {
      it("Should be able to set a new purpose", async function () {
        const newPurpose = "Test Purpose";

        await myContract.setPurpose(newPurpose);
        expect(await myContract.purpose()).to.equal(newPurpose);
      });

      it("Should emit a SetPurpose event ", async function () {
        const [owner] = await ethers.getSigners();

        const newPurpose = "Another Test Purpose";

        expect(await myContract.setPurpose(newPurpose))
          .to.emit(myContract, "SetPurpose")
          .withArgs(owner.address, newPurpose);
      });
    });
  });
});

describe("My Dapp", function () {
  let proofContract;
  let burnContract;
  let nftContract;
  let ercContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("deploy all contracts", function () {
    
    it("Should deploy all contracts", async function () {
      const NFProof = await ethers.getContractFactory("NFProof");
      proofContract = await NFProof.deploy();
      const TheBurn = await ethers.getContractFactory("TheBurn");
      burnContract = await TheBurn.deploy(proofContract.address)
      const SampleNFT = await ethers.getContractFactory("SampleNFT");
      nftContract = await SampleNFT.deploy()
      const ApeSample = await ethers.getContractFactory("ApeSample")
      ercContract = await ApeSample.deploy("0x13D029DbB5fc28A9D9450B18442879FDb87E901e")
    });

    describe("mint()", function () {
      it("Should be able to mint from token you own", async function () {
        const newPurpose = "Test Purpose";

        await myContract.setPurpose(newPurpose);
        expect(await myContract.purpose()).to.equal(newPurpose);
      });

      it("Should emit a SetPurpose event ", async function () {
        const [owner] = await ethers.getSigners();

        const newPurpose = "Another Test Purpose";

        expect(await myContract.setPurpose(newPurpose))
          .to.emit(myContract, "SetPurpose")
          .withArgs(owner.address, newPurpose);
      });
    });
  });
});