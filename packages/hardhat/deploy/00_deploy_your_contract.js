const { ethers } = require("hardhat");

const localChainId = "31337";

// const sleep = (ms) =>
//   new Promise((r) =>
//     setTimeout(() => {
//       console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
//       r();
//     }, ms)
//   );

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
    waitConfirmations: 5,
  });

  const apeSample = await ethers.getContract("ApeSample", deployer);
  await apeSample.transfer(
    "0x34F5b4ED395209Ae2BA9B80c519F7270c1e0C7b4",
    "" + 100 * 10 ** 18
  );

  
  await deploy("NFProof", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args:[apeSample.address],
    log: true,
    waitConfirmations: 5,
  });

  console.log("DEPLOYED2");
  const nfProof = await ethers.getContract("NFProof", deployer);

  // paste in your front-end address here to get 10 balloons on deploy:
  /*await balloons.transfer(
    "0x23191818B5dE05b191A20B1F8F2BacF05331f98F",
    "" + 10 * 10 ** 18
  );*/

  // // uncomment to init DEX on deploy:
 
  // // If you are going to the testnet make sure your deployer account has enough ETH
  //await balloons.approve(dex.address, ethers.utils.parseEther("100"));
  //console.log("INIT exchange...");
  //await dex.init(ethers.utils.parseEther("5"), {value: ethers.utils.parseEther("5"),gasLimit: 200000,});

  await deploy("TheBurn", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [nfProof.address],
    log: true,
    waitConfirmations: 5,
  });

  const theBurn = await ethers.getContract("TheBurn", deployer);
  console.log("DEPLOYED3");

  await nfProof.init(theBurn.address);

  console.log("DEPLOYED4");

  //theBurn.transferOwnership(YOUR_ADDRESS_HERE);
  //nfProof.transferOwnership(YOUR_ADDRESS_HERE);
  await deploy("SampleNFT", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    //args: [nfProof.address],
    log: true,
    waitConfirmations: 5,
  });
};
module.exports.tags = ["SampleNFT", "NFProof", "TheBurn"];