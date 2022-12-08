const { ethers } = require("hardhat");

const localChainId = "31337";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  console.log("PREDEPLOY COMMENT OUT")
  /*
  
  await deploy("ApeSample", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args:["0x13D029DbB5fc28A9D9450B18442879FDb87E901e"],
    log: true,
  });
  
  const apeSample = await ethers.getContract("ApeSample", deployer);
  */
  console.log("predeploy finished")

  //Need to put in the ape eth address not our custom erc
  await deploy("NFProof", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  });

  console.log("DEPLOYED1");
  sleep(5000)
};
module.exports.tags = ["NFProof"];