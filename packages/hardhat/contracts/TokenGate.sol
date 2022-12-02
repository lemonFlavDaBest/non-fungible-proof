// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenGate is Ownable {

  //the purpose of this contract is to serve your token gating needs. Will check that the signer is either the owner of the underlying nft
  //or is the address of the NFP assigned owner

    uint256 public gatePrice;
    NFProof public nfProof;

    event EnterGate(bytes32 eventName, bytes32 eventHash, address user, uint256 time, address originContractAddress, uint256 originTokenId);

    constructor(address payable proofContract) {
      nfProof = NFProof(proofContract);
    }
   
    function enterGate(bytes32 eventName, uint16 passcode, address originContractAddress, uint256 originTokenId) external payable returns (bytes32) {
      if (nfProof.validateVerifyUser(originContractAddress, originTokenId, msg.sender) == true){
        bytes32 eventHash = keccak256(abi.encode(eventName, passcode));
        emit EnterGate(eventName, eventHash, msg.sender, block.timestamp, originContractAddress, originTokenId);
        return eventHash;
      } else {
        require(IERC721(originContractAddress).ownerOf(originTokenId) == msg.sender, "You do not own this NFT");
        bytes32 eventHash = keccak256(abi.encode(eventName, passcode));
        emit EnterGate(eventName, eventHash, msg.sender, block.timestamp, originContractAddress, originTokenId);
        return  eventHash;
      }
    }

    function tokenGateWithdraw() public onlyOwner {
      address owner = msg.sender;
      (bool succ, )= owner.call{value:address(this).balance}("");
      require(succ, "withdraw failed");
    }

  receive() external payable {}
  fallback() external payable {}
}