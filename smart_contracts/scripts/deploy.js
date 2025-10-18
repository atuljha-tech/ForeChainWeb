import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const ReportLedger = await ethers.getContractFactory("ReportLedger");
  const ledger = await ReportLedger.deploy(); // deploy contract
  await ledger.waitForDeployment(); // v6+ syntax

  console.log("ReportLedger deployed to:", ledger.target); // v6+ target property
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
