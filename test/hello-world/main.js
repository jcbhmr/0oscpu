#!/usr/bin/env node
const bin = require.resolve(`@0oscpu/${process.platform}-${process.arch}`)
console.log(bin)