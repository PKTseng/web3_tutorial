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
  mapping(address => uint256) public fundersToAmount;

  uint256 constant MINIMUM_VALUE = 100 * 10 ** 18; //USD

  AggregatorV3Interface internal dataFeed;

  uint256 constant TARGET = 1000 * 10 ** 18;

  address public owner;

  uint256 deploymentTimestamp;
  uint256 lockTime;

  address erc20Addr;

  bool public getFundSuccess = false;

  constructor(uint256 _lockTime) {
    // sepolia testnet
    dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    owner = msg.sender;
    deploymentTimestamp = block.timestamp;
    lockTime = _lockTime;
  }

  function fund() external payable {
    require(convertEthToUsd(msg.value) >= MINIMUM_VALUE, "Send more ETH");
    require(block.timestamp < deploymentTimestamp + lockTime, "window is closed");
    fundersToAmount[msg.sender] = msg.value;
  }

  function getChainlinkDataFeedLatestAnswer() public view returns (int) {
    // prettier-ignore
    (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
    return answer;
  }

  function convertEthToUsd(uint256 ethAmount) internal view returns (uint256) {
    uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
    return (ethAmount * ethPrice) / (10 ** 8);
  }

  function transferOwnership(address newOwner) public onlyOwner {
    owner = newOwner;
  }

  function getFund() external windowClosed onlyOwner {
    require(convertEthToUsd(address(this).balance) >= TARGET, "Target is not reached");
    // transfer: transfer ETH and revert if tx failed
    // payable(msg.sender).transfer(address(this).balance);

    // send: transfer ETH and return false if failed
    // bool success = payable(msg.sender).send(address(this).balance);
    // require(success, "tx failed");

    // call: transfer ETH with data return value of function and bool
    bool success;
    (success, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(success, "transfer tx failed");
    fundersToAmount[msg.sender] = 0;
    getFundSuccess = true; // flag
  }

  function refund() external windowClosed {
    require(convertEthToUsd(address(this).balance) < TARGET, "Target is reached");
    require(fundersToAmount[msg.sender] != 0, "there is no fund for you");
    bool success;
    (success, ) = payable(msg.sender).call{value: fundersToAmount[msg.sender]}("");
    require(success, "transfer tx failed");
    fundersToAmount[msg.sender] = 0;
  }

  function setFunderToAmount(address funder, uint256 amountToUpdate) external {
    require(msg.sender == erc20Addr, "you do not have permission to call this funtion");
    fundersToAmount[funder] = amountToUpdate;
  }

  function setErc20Addr(address _erc20Addr) public onlyOwner {
    erc20Addr = _erc20Addr;
  }

  modifier windowClosed() {
    require(block.timestamp >= deploymentTimestamp + lockTime, "window is not closed");
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "this function can only be called by owner");
    _;
  }
}
