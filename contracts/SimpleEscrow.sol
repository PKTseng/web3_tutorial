//SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract SimpleEscrow {
  address public buyer;
  address public seller;
  address public arbiter;

  event FoundDeposited(address indexed buyer, uint256 amount);
  event FundsReleased(address indexed recipient, uint256 amount);
  event DisputeResolves(address indexed arbiter, address indexed recipient, uint256 amount);

  constructor(address _seller, address _arbiter) {
    buyer = msg.sender;
    seller = _seller;
    arbiter = _arbiter;
  }

  modifier onlyBuyer() {
    require(msg.sender == buyer, "only buyer");
    _;
  }

  modifier onlyArbiter() {
    require(msg.sender == arbiter, "Only arbiter can call this function");
    _;
  }

  modifier hasFunds() {
    require(address(this).balance > 0, "Not fund in contract");
    _;
  }

  function deposit() public payable onlyBuyer {
    require(msg.value > 0, "send more eth");
    require(address(this).balance == msg.value, "Contract must be empty before deposit");

    emit FoundDeposited(msg.sender, msg.value);
  }

  function confirmReceived() public onlyBuyer hasFunds {
    uint256 amount = address(this).balance;

    (bool success, ) = payable(seller).call{ value: amount }("");
    require(success, "transfer fail");

    emit FundsReleased(seller, amount);
  }

  function dispute(bool _refundToBuyer) public hasFunds onlyArbiter {
    address recipient = _refundToBuyer ? buyer : seller;
    uint256 amount = address(this).balance;

    (bool success, ) = payable(recipient).call{ value: amount }("");
    require(success, "transfer");
    emit DisputeResolves(msg.sender, recipient, amount);
  }

  function getBalance() external view returns (uint256) {
    return address(this).balance;
  }

  function getParticipants() external view returns (address, address, address) {
    return (buyer, seller, arbiter);
  }
}
