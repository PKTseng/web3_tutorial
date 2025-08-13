// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract MilestoneBasedCrowdfunding {
  address public immutable manager;

  uint256 fundingGoal;
  uint256 totalRaised;
  uint256 deadline;

  mapping(address => uint256) public contributor;

  struct Milestone {
    string descript;
    uint256 unlockAmount;
    bool isPaid;
    uint256 voteCount;
  }

  Milestone[] public milestoneList;
  mapping(address => mapping(address => bool)) public milestoneHasVoted;

  constructor(uint256 _fundingGoal, uint256 _deadline) {
    manager = msg.sender;
    fundingGoal = _fundingGoal;
    deadline = _deadline;
  }

  function addMilestone() public {
    require(msg.sender == manager, "Only manager");
  }

  function contribute() public payable {
    require(block.timestamp < deadline, "Time is end");
    contributor[msg.sender] = msg.value;
  }

  function requestWithdrawal() public {
    require(msg.sender == manager, "Only manager");
  }

  function voteForMilestone(uint256 _milestoneId) public {
    require(_milestoneId > milestoneList.length, "Invalid milestone ID");
    require(contributor[msg.sender] > 0, "You not have vote");
  }

  function executeWithdrawal(uint _milestone) public {
    require(msg.sender == manager, "Only manager");
    require(totalRaised > fundingGoal, "Crowdfunding: Funding goal not reached.");
    require(_milestone < milestoneList.length, "Crowdfunding is not exist");
  }

  function claimRefund() public {
    require(block.timestamp > deadline, unicode"時間未到");
    require(totalRaised < fundingGoal, unicode"資金已達標");

    uint256 amountToRefund = contributor[msg.sender];

    contributor[msg.sender] = 0;

    (bool success, ) = payable(msg.sender).call{ value: amountToRefund }("");
    require(success, "Transfer is fail");
  }
}
