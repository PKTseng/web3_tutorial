// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 1. 通证的名字
// 2. 通证的简称
// 3. 通证的发行数量
// 4. owner地址
// 5. balance address => uint256

// mint: 获取通证
// transfer: transfer 通证
// balanceOf: 查看某一个地址的通证数量

// 業務邏輯
// 這個合約實現了一個基本的代幣系統，具有以下功能：
// 代幣基本資訊：每個代幣都有名稱、符號和總供應量
// 鑄造功能：任何人都可以憑空創造新的代幣給自己
// 轉帳功能：持有者可以將代幣轉給其他地址
// 餘額查詢：可以查看任何地址的代幣餘額

contract FundToken {
  string tokenName;
  string tokenSymbol;
  uint256 totalSupply;
  address owner;
  mapping(address => uint256) public balance;

  constructor(string memory _tokenName, string memory _tokenSymbol) {
    tokenName = _tokenName;
    tokenSymbol = _tokenSymbol;
    owner = msg.sender;
  }

  function mint(uint256 _amountToMint) public {
    balance[msg.sender] += _amountToMint;
  }
}
