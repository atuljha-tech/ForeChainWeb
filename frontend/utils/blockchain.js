import { ethers } from 'ethers';

// Contract address - USE EXACT ADDRESS FROM DEPLOYMENT
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Contract ABI
const CONTRACT_ABI = [
    "function addReport(string memory filename, string memory uploader, string memory hash) public",
    "function getAllReports() public view returns (tuple(string filename, string uploader, string hash, address uploaderAddress)[])",
    "function reportCount() public view returns (uint256)",
    "function getReports() public view returns (string[] memory, string[] memory, string[] memory, address[] memory)"
];

let contract = null;
let signer = null;

// Safe blockchain initialization
export const initializeBlockchain = async () => {
    try {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('MetaMask not detected. Please install MetaMask.');
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        
        // Get network info
        const network = await provider.getNetwork();
        console.log('🔗 Connected to network:', network);
        
        // Create contract instance
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        console.log('✅ Blockchain initialized successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Blockchain initialization failed:', error);
        throw error;
    }
};

// Add report to blockchain
export const addReportOnChain = async (filename, uploader, hash) => {
    try {
        if (!contract) {
            await initializeBlockchain();
        }

        console.log('📝 Adding report to blockchain:', { filename, uploader, hash });
        console.log('Contract instance:', contract);
        console.log('Contract address:', CONTRACT_ADDRESS);
        console.log('Signer:', signer);
        
        // Debug: Check if the function exists
        console.log('addReport function exists:', typeof contract.addReport);
        
        // Send transaction
        const transaction = await contract.addReport(filename, uploader, hash, {
            gasLimit: 300000,
        });

        console.log('📤 Transaction submitted:', transaction.hash);
        
        // Wait for confirmation
        const receipt = await transaction.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

        return {
            success: true,
            transactionHash: transaction.hash,
            blockNumber: receipt.blockNumber,
            message: "Report successfully stored on blockchain!"
        };

    } catch (error) {
        console.error('❌ Add report failed:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        
        // User-friendly error messages
        if (error.code === 4001) {
            throw new Error('Transaction was cancelled. Please click "Confirm" to proceed.');
        } else if (error.message.includes('insufficient funds')) {
            throw new Error('Insufficient test ETH. Please import Hardhat accounts to MetaMask.');
        } else if (error.message.includes('reverted')) {
            throw new Error('Contract execution failed. Please check contract state.');
        } else {
            throw new Error(`Blockchain error: ${error.message}`);
        }
    }
};

// Get all reports from blockchain
export const getAllReportsFromChain = async () => {
    try {
        if (!contract) {
            await initializeBlockchain();
        }

        console.log('📋 Fetching reports from blockchain...');
        const reports = await contract.getAllReports();
        
        console.log(`✅ Found ${reports.length} reports on blockchain`);
        
        return reports.map((report, index) => ({
            id: index,
            filename: report.filename,
            uploader: report.uploader,
            hash: report.hash,
            uploaderAddress: report.uploaderAddress,
            isOnChain: true,
            timestamp: Date.now()
        }));

    } catch (error) {
        console.error('❌ Get reports failed:', error);
        return []; // Safe empty fallback
    }
};

// Get report count
export const getReportCount = async () => {
    try {
        if (!contract) {
            await initializeBlockchain();
        }
        
        const count = await contract.reportCount();
        return parseInt(count);
    } catch (error) {
        console.error('Get report count failed:', error);
        return 0;
    }
};

// Check wallet connection
export const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            return accounts.length > 0;
        } catch (error) {
            console.error('Check wallet connection failed:', error);
            return false;
        }
    }
    return false;
};

// Get current account
export const getCurrentAccount = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            return accounts[0] || null;
        } catch (error) {
            console.error('Get current account failed:', error);
            return null;
        }
    }
    return null;
};

// Switch to local network
export const switchToLocalNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }],
        });
        return true;
    } catch (error) {
        // If network doesn't exist, add it
        if (error.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x7A69',
                        chainName: 'Hardhat Local',
                        rpcUrls: ['http://localhost:8545'],
                        nativeCurrency: {
                            name: 'Ethereum',
                            symbol: 'ETH',
                            decimals: 18
                        }
                    }]
                });
                return true;
            } catch (addError) {
                console.error('Failed to add local network:', addError);
                return false;
            }
        }
        console.error('Failed to switch network:', error);
        return false;
    }
};

// Get contract info
export const getContractInfo = () => {
    return {
        address: CONTRACT_ADDRESS,
        isInitialized: contract !== null,
        network: 'localhost'
    };
};