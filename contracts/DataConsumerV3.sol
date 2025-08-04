// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract DataConsumerV3 {
  AggregatorV3Interface internal dataFeed;

  mapping(address => uint256) public foundersWithAmount;

  constructor() {
    dataFeed = AggregatorV3Interface(0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43);
  }

  function fund() external payable {
    foundersWithAmount[msg.sender] = msg.value;
  }

  function getChainlinkDataFeedLatestAnswer() public view returns (int) {
    // prettier-ignore
    (
        /* uint80 roundId */,
        int256 answer,
        /*uint256 startedAt*/,
        /* uint256 updatedAt */,
        /* uint80 answeredInRound */
    ) = dataFeed.latestRoundData();
    return answer;
  }
}
