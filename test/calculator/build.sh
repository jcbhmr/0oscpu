#!/bin/bash
set -e
mkdir -p out
GOOS=linux GOARCH=amd64 go build main.go -o out/add-linux-x64
GOOS=linux GOARCH=amd64 go build main.go -o out/sub-linux-x64
GOOS=darwin GOARCH=amd64 go build main.go -o out/add-darwin-x64
GOOS=darwin GOARCH=amd64 go build main.go -o out/sub-darwin-x64
GOOS=windows GOARCH=amd64 go build main.go -o out/add-win32-x64.exe
GOOS=windows GOARCH=amd64 go build main.go -o out/sub-win32-x64.exe