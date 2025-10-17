#!/usr/bin/env bash
# scan-demo.sh
# Simple script to simulate a Kali scan: creates a timestamped report file.

TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
REPORT_DIR="$(dirname "$0")/reports"
REPORT_FILE="$REPORT_DIR/scan_report_$TIMESTAMP.txt"

# Demo metadata (randomized / static)
TARGET="127.0.0.1"
TOOL="nmap-demo"
OPEN_PORTS="22, 80, 443"
NOTES="This is a simulated scan for demo purposes only."

# Ensure reports dir exists
mkdir -p "$REPORT_DIR"

# Create report content
cat > "$REPORT_FILE" <<EOF
ForenChain Demo Scan Report
Timestamp : $TIMESTAMP
Tool      : $TOOL
Target    : $TARGET

Results:
- Open ports: $OPEN_PORTS

Notes:
$NOTES

EOF

echo "Demo scan complete."
echo "Report saved to: $REPORT_FILE"
