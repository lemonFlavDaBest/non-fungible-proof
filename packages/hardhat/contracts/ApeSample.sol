pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ApeSample is ERC20 {
    constructor() ERC20("ApeSamp", "Sape") {
        _mint(msg.sender, 1000 ether); // mints 1000 ApeSample tokens!
    }
}