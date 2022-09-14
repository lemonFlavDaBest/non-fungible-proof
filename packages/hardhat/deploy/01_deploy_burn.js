const { ethers } = require("hardhat");

const localChainId = "31337";

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const nfProof = await ethers.getContract("NFProof", deployer);


  await deploy("TheBurn", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [nfProof.address],
    log: true,
  });

  sleep(5000)
  

  const theBurn = await ethers.getContract("TheBurn", deployer);
  sleep(5000)
  const initTransaction = await nfProof.init(theBurn.address);
  const initResult = await initTransaction.wait();
  console.log(initResult)
  
  //are these the ones we wnat to transfer ownship too?
  const proofOwnership = await nfProof.transferOwnership("0x13D029DbB5fc28A9D9450B18442879FDb87E901e");
  const proofResult = await proofOwnership.wait()
  console.log(proofResult)

  sleep(5000)
  const burnOwnership = await theBurn.transferOwnership("0x13D029DbB5fc28A9D9450B18442879FDb87E901e");
  const burnResult = await burnOwnership.wait()
  console.log(burnResult)
  

  console.log("DEPLOYED2");

};
module.exports.tags = ["TheBurn"];