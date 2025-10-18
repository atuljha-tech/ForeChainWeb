#!/usr/bin/env bash
# run-all-scans.sh
# Master script to execute all security scans

echo "🚀 ForenChain Comprehensive Security Assessment"
echo "=============================================="
echo "Starting all security scans..."
echo

# Run Nmap scan
echo "🔍 Starting Network Discovery (Nmap)..."
cd nmap && ./scan.sh 192.168.1.0/24
cd ..

# Run Nikto scan  
echo "🌐 Starting Web Application Scan (Nikto)..."
cd nikto && ./scan.sh http://192.168.1.100
cd ..

# Run Wireshark analysis
echo "📡 Starting Traffic Analysis (Wireshark)..."
cd wireshark && ./scan.sh 120
cd ..

# Run DVWA assessment
echo "🎯 Starting DVWA Vulnerability Assessment..."
cd dvwa && ./scan.sh http://192.168.1.150/dvwa
cd ..

echo
echo "✅ All security scans completed successfully!"
echo "📊 Reports generated in respective tool directories"
echo "🔗 Ready for blockchain verification"