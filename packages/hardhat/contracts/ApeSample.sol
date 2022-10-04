pragma solidity ^0.8.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ApeSample is ERC20 {
    constructor(address my_addr) ERC20("ApeSamp", "Sape") {
        _mint(my_addr, 1000 ether); // mints 1000 ApeSample tokens!
    }
}