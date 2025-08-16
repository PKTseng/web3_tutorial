//SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract ReadWriteTransfer {
  mapping(address => uint256) public balances;

  function getBalance(address _address) public view returns (uint256) {
    return balances[_address];
  }

  function deposit() public payable {
    require(msg.value > 0, "Need more ETH");

    balances[msg.sender] += msg.value;
  }

  function transfer(address payable _to, uint256 _amount) public {
    require(_to != address(0), "Invalid recipient address");
    require(balances[_to] > 0, "No balance");

    balances[msg.sender] -= _amount;
    balances[_to] += _amount;
  }

  function checkBalanceAndTransfer(
    address payable _to,
    uint256 _amount
  ) public {
    uint256 currentBalance = getBalance(msg.sender);
    require(currentBalance > _amount, "Insufficient amount");

    transfer(_to, currentBalance);
  }

  function withdraw(uint256 _amount) public {
    require(balances[msg.sender] >= _amount, "In");
    balances[msg.sender] -= _amount;

    (bool success, ) = payable(msg.sender).call{ value: _amount }("");
    require(success, "Transfer fail");
  }
}
