const { ethers } = require("hardhat");

const localChainId = "31337";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  console.log("predeploy")

  //Need to put in the ape eth address
  await deploy("NFProof", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args:[apeSample.address],
    log: true,
  });

  console.log("DEPLOYED1");
  sleep(5000)
};
module.exports.tags = ["NFProof"];