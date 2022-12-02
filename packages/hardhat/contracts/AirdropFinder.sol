// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WalletFinder is Ownable {

    //the purpose of this contract is for developers to use it find valid wallet addresses for airdrops and similar things.
    //if a valid NFP token is assigned, then it will return that address, otherwise it will return the underlying owner of the nft

    uint256 public burnPrice;
    NFProof public nfProof;

    constructor(address payable proofContract) {
      burnPrice = 1000000000; //.000000001 ether
      nfProof = NFProof(proofContract);
    }

   function setburnPrice(uint256 newPrice) public onlyOwner {
      burnPrice = newPrice;
    }
 
    // this function returns an address. you can use this address to send airdrops to. It will check if there is a valid NFP token owner assigned
    // and if there isnt, it defaults to the underlying nft owner. You can use it for things other than airdrops, any time you need to get a valid wallet address.
    function airdropFinder(address originContractAddress, uint256 originTokenId, uint256 proofTokenId) external payable virtual {
      require(msg.value>=burnPrice, "you didnt pay enough to the burn troll");
      require(IERC721(originContractAddress).ownerOf(originTokenId) == msg.sender, "You do not own this NFT");
      nfProof.burn(originContractAddress, originTokenId, proofTokenId);
    }

    function walletFinderWithdraw() public onlyOwner {
      address owner = msg.sender;
      (bool succ, )= owner.call{value:address(this).balance}("");
      require(succ, "withdraw failed");
    }

  receive() external payable {}
  fallback() external payable {}
}