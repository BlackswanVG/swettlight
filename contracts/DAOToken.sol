// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DAOToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 10000 * 10**18; // 10,000 tokens

    constructor() ERC20("Marine DAO Token", "MDT") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    function snapshot() external onlyOwner {
        _snapshot();
    }

    // Additional governance functionality can be added here
}
