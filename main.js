#!/usr/bin/env node
import { parseArgs } from "node:util"
import { readFile } from "node:fs/promises"
const package_ = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"))

const helpText = `\
npm-0oscpu v${package_.version}

USAGE
npm-0oscpu <subcommand> [options]

EXAMPLES
npm-0oscpu version
npm-0oscpu generate
npm-0oscpu publish
`
/** @satisfies {import('node:util').ParseArgsConfig['options']} */
const options = {
    version: { type: "boolean" },
    help: { type: "boolean" }
}
const commands = {
    __proto__: null,
    generate: () => import("./generate.js"),
    version: () => import("./version.js"),
    publish: () => import("./publish.js")
}

main: {
    const command = commands[process.argv[2]]
    if (command) {
        await command()
        break main
    }
    const { values, positionals } = parseArgs({ options, strict: false, allowPositionals: true })
    if (values.version) {
        console.log(package_.version)
        break main
    }
    if (values.help) {
        console.log(helpText)
        break main;
    }
    if (process.argv[2]) {
        console.error(`Unknown subcommand: ${process.argv[2]}`)
        console.error(helpText)
        process.exitCode = 1
        break main
    }
    console.error(`No root command. Must use subcommand.`)
    console.error(helpText)
    process.exitCode = 1
}