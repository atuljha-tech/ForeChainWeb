import { ethers } from "ethers";
import ReportLedgerABI from "./ReportLedger.json"; // compiled ABI from Hardhat

const REPORT_LEDGER_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
 // replace after deploy

// Connect to contract
export const getContract = async () => {
  if (!window.ethereum) {
    alert("Metamask not detected!");
    return null;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(REPORT_LEDGER_ADDRESS, ReportLedgerABI.abi, signer);
};

// Add report to blockchain
export const addReportOnChain = async (filename, hash) => {
  const contract = await getContract();
  if (!contract) return;

  const tx = await contract.addReport(filename, hash);
  await tx.wait();
  console.log("Report added on blockchain:", filename);
};

// Get all reports from blockchain
export const getAllReportsFromChain = async () => {
  const contract = await getContract();
  if (!contract) return [];

  try {
    const [filenames, hashes, uploaders] = await contract.getReports();

    return filenames.map((filename, i) => ({
      filename,
      hash: hashes[i],
      uploader: uploaders[i],
    }));
  } catch (err) {
    console.error("Error fetching reports:", err);
    return [];
  }
};
