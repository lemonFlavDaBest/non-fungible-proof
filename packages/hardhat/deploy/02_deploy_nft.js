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
  /*
  const [contractSigner] = await ethers.getSigners()
  //console.log("contractSigner:", contractSigner)

  const tx = await contractSigner.sendTransaction({
    to: "0x34F5b4ED395209Ae2BA9B80c519F7270c1e0C7b4",
    value: ethers.utils.parseEther("1")})
  //Transfer all the accounts ether just saying
  console.log("tx:", tx)
*/

//console.log("ethers", ethers)
console.log("post deploy")
await deploy("SampleNFT", {
  // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  from: deployer,
  log: true,
});

console.log("post deploy finished")
  
};
module.exports.tags = ["NFProof", "TheBurn", "SampleNFT", "ApeSample"];