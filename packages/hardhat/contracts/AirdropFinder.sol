// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AirdropFinder is Ownable {

    //the purpose of this contract is for developers to use it find valid wallet addresses for airdrops and similar things.
    //if a valid NFP token is assigned, then it will return that address, otherwise it will return the underlying owner of the nft

    NFProof public nfProof;

    constructor(address payable proofContract) {
      nfProof = NFProof(proofContract);
    }

    // this function returns an address. you can use this address to send airdrops to. It will check if there is a valid NFP token owner assigned
    // and if there isnt, it defaults to the underlying nft owner. You can use it for things other than airdrops, any time you need to get a valid wallet address.
    function airdropFinder(address originContractAddress, uint256 originTokenId) external view virtual returns (address airdropAddress) {
      uint256 proofToken = nfProof.tokenToToken(originContractAddress, originTokenId);
      if (nfProof.isValidUserToken(proofToken) == true) {
        return nfProof.userOf(proofToken);
      } else {
        return IERC721(originContractAddress).ownerOf(originTokenId);
      }
    }

    function walletFinderWithdraw() public onlyOwner {
      address owner = msg.sender;
      (bool succ, )= owner.call{value:address(this).balance}("");
      require(succ, "withdraw failed");
    }

  receive() external payable {}
  fallback() external payable {}
}