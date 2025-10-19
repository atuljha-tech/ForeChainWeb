import { ethers } from 'ethers';

// Contract address - USE EXACT ADDRESS FROM DEPLOYMENT
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// CORRECT ABI - matches your working contract
// CORRECT ABI - matches your working contract EXACTLY
const CONTRACT_ABI = [
    "function addReport(string memory filename, string memory uploader, string memory hash) public",
    "function getAllReports() public view returns (tuple(string filename, string uploader, string hash, address uploaderAddress)[])",
    "function reportCount() public view returns (uint256)"
];

let contract = null;
let signer = null;

// ✅ FIXED: Compute SHA-256 hash of file content
export const computeFileHash = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                console.log('🔍 File reading completed, arrayBuffer length:', e.target.result.byteLength);
                
                // Use the ArrayBuffer directly - DON'T convert to Uint8Array first
                const hashBuffer = await crypto.subtle.digest('SHA-256', e.target.result);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                
                console.log('✅ Correctly computed hash:', `0x${hashHex}`);
                resolve(`0x${hashHex}`);
                
            } catch (error) {
                console.error('❌ Hash computation failed:', error);
                reject(error);
            }
        };
        
        reader.onerror = (error) => {
            console.error('❌ File reading failed:', error);
            reject(error);
        };
        
        // Read as ArrayBuffer, not text
        reader.readAsArrayBuffer(file);
    });
};
// ✅ ADD THIS FUNCTION TOO (for string content)
export const computeStringHash = async (content) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
};

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

// ✅ FIXED: Get REAL blockchain data
export const getAllReportsFromChain = async () => {
    try {
        if (!contract) {
            await initializeBlockchain();
        }

        console.log('📋 Fetching REAL reports from blockchain...');
        
        const rawReports = await contract.getAllReports();
        console.log('🔍 Raw blockchain data received, processing', rawReports.length, 'reports');
        
        const validReports = [];
        
        // Process each report - access by INDEX
        for (let i = 0; i < rawReports.length; i++) {
            const report = rawReports[i];
            
            // Tuple structure: [filename, uploader, hash, uploaderAddress]
            const filename = String(report[0]);
            const uploader = String(report[1]);
            const hash = String(report[2]);
            const uploaderAddress = String(report[3]);
            
            validReports.push({
                id: i.toString(),
                filename: filename,
                uploader: uploader,
                hash: hash,
                uploaderAddress: uploaderAddress,
                timestamp: new Date().toISOString(),
                isOnChain: true
            });
            
            console.log(`✅ Real report ${i}:`, { 
                filename: filename,
                hash: hash.substring(0, 20) + '...'
            });
        }
        
        console.log(`🎉 SUCCESS: Loaded ${validReports.length} REAL reports from blockchain`);
        return validReports;
        
    } catch (error) {
        console.error('❌ Get REAL reports failed:', error);
        return []; // Return empty instead of fake data
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
// Update your contract info to reflect the real structure
export const getContractInfo = () => {
    return {
        address: CONTRACT_ADDRESS,
        isInitialized: contract !== null,
        network: 'localhost',
        structure: 'Report(filename, uploader, hash, uploaderAddress)'
    };
};