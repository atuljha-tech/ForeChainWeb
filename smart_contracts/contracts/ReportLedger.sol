// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ReportLedger {
    struct Report {
        string filename;
        string uploader;
        string hash;
        address uploaderAddress;
    }

    Report[] public reports;

    // Add a new report - MATCHES FRONTEND EXPECTATION
    function addReport(string memory filename, string memory uploader, string memory hash) public {
        reports.push(Report(filename, uploader, hash, msg.sender));
    }

    // Get all reports - SIMPLIFIED FOR FRONTEND
    function getAllReports() public view returns (Report[] memory) {
        return reports;
    }

    // Get report count
    function reportCount() public view returns (uint256) {
        return reports.length;
    }

    // Get reports as arrays (backward compatibility)
    function getReports() public view returns (string[] memory, string[] memory, string[] memory, address[] memory) {
        uint length = reports.length;
        string[] memory filenames = new string[](length);
        string[] memory uploaders = new string[](length);
        string[] memory hashes = new string[](length);
        address[] memory uploaderAddresses = new address[](length);

        for (uint i = 0; i < length; i++) {
            filenames[i] = reports[i].filename;
            uploaders[i] = reports[i].uploader;
            hashes[i] = reports[i].hash;
            uploaderAddresses[i] = reports[i].uploaderAddress;
        }

        return (filenames, uploaders, hashes, uploaderAddresses);
    }
}