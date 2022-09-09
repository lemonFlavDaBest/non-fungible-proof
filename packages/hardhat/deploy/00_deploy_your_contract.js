const { ethers } = require("hardhat");

const localChainId = "31337";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  console.log("PREDEPLOY");
  /*await deploy("IERC4907", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  });
  

  const IERC4907 = await ethers.getContract("IERC4907", deployer);
  console.log("DEPLOYED1");
  */

  
  await deploy("ApeSample", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    log: true,
  });

  
  const apeSample = await ethers.getContract("ApeSample", deployer);


  const apeTransfer = await apeSample.transfer(
    "0x13D029DbB5fc28A9D9450B18442879FDb87E901e",
    "" + 100 * 10 ** 18
  );

  const transferResult = await apeTransfer.wait()
  console.log(transferResult)

  console.log('ERC20S DEPLOYED')
  sleep(5000)
  
};
module.exports.tags = ["ApeSample"];