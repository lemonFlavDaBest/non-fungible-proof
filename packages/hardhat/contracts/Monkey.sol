pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Monkey is ERC20 {
    constructor() ERC20("Monkey", "MON") {
        _mint(msg.sender, 10000 ether); // mints 10000 Monkes!
    }
}