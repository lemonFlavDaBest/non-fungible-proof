const { ethers } = require("hardhat");

const localChainId = "31337";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();


  console.log("deployer is:", deployer)

  console.log('deploying additional contracts')
  const nfProof = await ethers.getContract("NFProof", deployer);
  console.log("nfProof", nfProof)

  sleep(5000)

  await deploy("AirdropFinder", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args:[nfProof.address],
    log: true,
  });

  sleep(5000)
  

  const airdropFinder = await ethers.getContract("AirdropFinder", deployer);
  sleep(5000)
  
  //are these the ones we wnat to transfer ownship too?
  const airdropFinderOwnership = await airdropFinder.transferOwnership("0x13D029DbB5fc28A9D9450B18442879FDb87E901e");
  const airdropFinderResult = await airdropFinderOwnership.wait()
  console.log(airdropFinderResult)

  sleep(5000)


console.log("DEPLOYEDADDall");


};
module.exports.tags = ["Finder"];