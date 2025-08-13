// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract MilestoneBasedCrowdfunding {
  address public immutable manager;

  uint256 fundingGoal;
  uint256 totalRaised;
  uint256 deadline;

  mapping(address => uint256) public contributor;

  struct Milestone {
    string description;
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

  function addMilestone(string memory _description, uint256 _amount) public {
    require(msg.sender == manager, "Only manager");
    require(block.timestamp < deadline, "Time is no yet");

    milestoneList.push(
      Milestone({
        description: _description,
        unlockAmount: _amount,
        isPaid: true,
        voteCount: 0
      })
    );
  }

  function contribute() public payable {
    require(block.timestamp < deadline, "Time is end");
    require(msg.value > 0, "Need more ETH");

    contributor[msg.sender] += msg.value;
    totalRaised += msg.value;
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
    require(
      totalRaised > fundingGoal,
      "Crowdfunding: Funding goal not reached."
    );
    require(_milestone < milestoneList.length, "Crowdfunding is not exist");
  }

  function claimRefund() public {
    require(block.timestamp > deadline, "Time is not yet");
    require(totalRaised < fundingGoal, "no Eth");

    uint256 amount = contributor[msg.sender];

    contributor[msg.sender] = 0;
    (bool success, ) = payable(msg.sender).call{ value: amount }("");
    require(success, "Transfer is fail");
  }
}
