// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ReportLedger {
    struct Report {
        string filename;
        string hash;
        address uploader;
    }

    Report[] public reports;

    // Add a new report
    function addReport(string memory filename, string memory hash) public {
        reports.push(Report(filename, hash, msg.sender));
    }

    // Return reports as separate arrays for Ethers.js decoding
    function getReports() public view returns (string[] memory, string[] memory, address[] memory) {
        uint length = reports.length;
        string[] memory filenames = new string[](length);
        string[] memory hashes = new string[](length);
        address[] memory uploaders = new address[](length);

        for (uint i = 0; i < length; i++) {
            filenames[i] = reports[i].filename;
            hashes[i] = reports[i].hash;
            uploaders[i] = reports[i].uploader;
        }

        return (filenames, hashes, uploaders);
    }

    // Optional: get total count
    function totalReports() public view returns (uint) {
        return reports.length;
    }
}
