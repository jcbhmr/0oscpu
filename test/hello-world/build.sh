#!/bin/bash
set -e
mkdir -p out
GOOS=linux GOARCH=amd64 go build main.go -o out/hello-world-linux-x64
GOOS=darwin GOARCH=amd64 go build main.go -o out/hello-world-darwin-x64
GOOS=windows GOARCH=amd64 go build main.go -o out/hello-world-win32-x64.exe