const {ethers} = require("hardhat");

const main = async () => {
  const FundMeFactory = await ethers.getContractFactory("FundMe");
  const FundMe = await FundMeFactory.deploy(10);
  console.log("FundMe deployed to:", FundMe.address);

  await FundMe.waitForDeployment();
  console.log("FundMe deployed at:", await FundMe.getAddress());
};

main()
  .then()
  .catch((err) => {
    console.error(err);
  });
