//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 業務邏輯
// 這個合約實現了一個有時間限制的眾籌系統：

// 眾籌目標：募集價值 1000 美元的 ETH
// 最低投資額：每次投資至少價值 100 美元的 ETH
// 時間窗口：有一個鎖定期（lockTime），在此期間可以投資

// 成功條件：
// 如果在鎖定期內達到目標金額，項目方（owner）可以提取所有資金
// 如果在鎖定期內未達到目標，投資人可在鎖定期結束後申請退款

contract FundMe {
  AggregatorV3Interface internal dataFeed;
  mapping(address => uint256) public foundersToAmount;
  uint256 constant MINIMUM_VALUE = 100 * 10 ** 18;
  uint256 constant TARGET = 1000 * 10 ** 18;
  address owner;
  uint256 deployedTimestamp;
  uint256 lockTime;

  constructor(uint256 _lockTime) {
    owner = msg.sender;
    dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    deployedTimestamp = block.timestamp;
    lockTime = _lockTime;
  }

  function transformOwnerShip(address _owner) public onlyOwner {
    owner = _owner;
  }

  function fund() external payable {
    require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
    require(block.timestamp < deployedTimestamp + lockTime, "window is closed");

    foundersToAmount[msg.sender] = msg.value;
  }

  function getChainlinkDataFeedLatestAnswer() public view returns (int) {
    // prettier-ignore
    (
      /* uint80 roundId */,
      int256 answer,
      /*uint256 startedAt*/,
      /*uint256 updatedAt*/,
      /*uint80 answeredInRound*/
    ) = dataFeed.latestRoundData();
    return answer;
  }

  function convertEthToUsd(uint256 ethAmount) internal view returns (uint256) {
    uint256 price = uint256(getChainlinkDataFeedLatestAnswer());
    return (ethAmount * price) / (10 ** 8);
  }

  function getFund() public onlyOwner windowClosed {
    require(convertEthToUsd(address(this).balance) >= TARGET, "Target not reached");

    (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(success, "Transfer failed.");
    foundersToAmount[msg.sender] = 0;
  }

  function reFund() public onlyOwner windowClosed {
    require(foundersToAmount[msg.sender] != 0, "No funds to refund");

    (bool success, ) = payable(msg.sender).call{value: foundersToAmount[msg.sender]}("");
    require(success, "Transfer failed.");
    foundersToAmount[msg.sender] = 0;
  }

  modifier windowClosed() {
    require(block.timestamp > deployedTimestamp + lockTime, "window is not closed");
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "this function can only be called by owner");
    _;
  }
}
