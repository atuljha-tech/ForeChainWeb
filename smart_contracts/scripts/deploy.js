const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  const ReportLedger = await ethers.getContractFactory("ReportLedger");
  const ledger = await ReportLedger.deploy();
  
  // Wait for deployment - Ethers v6 syntax
  await ledger.waitForDeployment();
  
  const address = await ledger.getAddress();
  console.log("✅ ReportLedger deployed to:", address);
  console.log("📋 COPY THIS ADDRESS to your frontend:", address);

  // Verify contract functions work
  console.log("Testing contract...");
  const tx = await ledger.addReport("test.txt", "Test User", "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
  await tx.wait();
  console.log("✅ Test report added successfully!");
  console.log("📊 Total reports:", (await ledger.reportCount()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });