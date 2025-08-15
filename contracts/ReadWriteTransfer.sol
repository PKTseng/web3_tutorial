//SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract ReadWriteTransfer {
  address public owner;
  uint256 public number;

  bool private _lock;

  constructor(uint256 _number) {
    owner = msg.sender;
    number = _number;
  }

  function getNumber() external view returns (uint256) {
    return number;
  }

  function setNumber(uint256 _number) external {
    number = _number;
  }
}
