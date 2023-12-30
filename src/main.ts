#!/usr/bin/env node
import { ParseArgsConfig, parseArgs } from "node:util"
import { readFile } from "node:fs/promises"
const package_ = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"))

const helpText = `\
TODO: Write help text`
const subcommands = {
    __proto__: null!,
    init: () => import('./init.js'),
    build: () => import('./build.js'),
    link: () => import('./link.js'),
    version: () => import("./version.js"),
    publish: () => import("./publish.js")
}
const options = {
    version: { type: "boolean" },
    help: { type: "boolean" }
} satisfies ParseArgsConfig['options']

main: {
    const command = subcommands[process.argv[2]]
    if (command) {
        await command()
        break main
    }
    const { values, positionals } = parseArgs({ options })
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