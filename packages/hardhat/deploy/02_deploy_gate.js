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

  await deploy("TokenGate", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args:[nfProof.address],
    log: true,
  });

  sleep(5000)
  

  const tokenGate = await ethers.getContract("TokenGate", deployer);
  sleep(5000)
  
  //are these the ones we wnat to transfer ownship too?
  const tokenGateOwnership = await tokenGate.transferOwnership("0x13D029DbB5fc28A9D9450B18442879FDb87E901e");
  const tokenGateResult = await tokenGateOwnership.wait()
  console.log(tokenGateResult)

  sleep(5000)

console.log("DEPLOYEDgate");

/*
console.log("post deploy")
await deploy("SampleNFT", {
  // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  from: deployer,
  log: true,
});

console.log("post deploy finished")
*/
  
};
module.exports.tags = ["TokenGate"];