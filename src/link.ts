import { ParseArgsConfig, parseArgs } from "node:util";
import PackageJSON from "@npmcli/package-json"
import parseTarget from "./lib/parseTarget.js";
import { basename, join, resolve } from "node:path";
import { copyFile, link, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const options = {
    out: { type: "string", default: "out" },
} satisfies ParseArgsConfig['options']
const args = process.argv.slice(3)
const { values, positionals } = parseArgs({ options, args, allowPositionals: true })

main: {
    const userPackage = await PackageJSON.load("./")

    const targets = positionals.length ? positionals.map(x => x === "me" ? `${process.platform}-${process.arch}` : x) : Object.keys(Object(userPackage.content['0oscpu']))
    console.log("Linking these targets:", targets)

    const outPath = resolve(values.out!)
    const $0oscpu = Object.setPrototypeOf(Object(userPackage.content['0oscpu']), null)
    
    for (const target of targets) {
        assert(target in $0oscpu, `${target} not in package.json "0oscpu" object`)
        const { os, arch } = parseTarget(target)

        const targetRootPath = join(outPath, target)

        const softLinkPath = resolve("node_modules", "@0oscpu", target)
        await mkdir(resolve(softLinkPath, ".."), { recursive: true })
        await rm(softLinkPath).catch(() => {})
        await symlink(targetRootPath, softLinkPath, "dir")
    }
}