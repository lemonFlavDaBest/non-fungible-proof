// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TheBurn is Ownable {

    uint256 public burnPrice;
    NFProof public nfProof;

    constructor(address proofContract) {
      burnPrice = 1000000000000000; //.001 ether
      nfProof = NFProof(proofContract);
    }

   function setburnPrice(uint256 newPrice) public onlyOwner {
      burnPrice = newPrice;
    }

    //virtual override and function name just burn
    function burner(address originContractAddress, uint256 originTokenId, uint256 proofTokenId) public payable {
      require(msg.value>=burnPrice, "you didnt pay enough to the burn troll");
      require(IERC721(originContractAddress).ownerOf(originTokenId) == msg.sender, "You do not own this NFT");
      nfProof.burn(originContractAddress, originTokenId, proofTokenId);
    }

  function burnWithdraw() public onlyOwner {
      address owner = msg.sender;
      (bool succ, )= owner.call{value:address(this).balance}("");
      require(succ, "withdraw failed");
    }
}