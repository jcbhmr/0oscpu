import { ParseArgsConfig, parseArgs } from "node:util";
import PackageJSON from "@npmcli/package-json"
import parseTarget from "./lib/parseTarget.js";
import { basename, join, resolve } from "node:path";
import { copyFile, link, mkdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { $ } from "execa";
import { existsSync } from "node:fs";

const options = {
    out: { type: "string", default: "out" },
    otp: { type: "string" },
    "dry-run": { type: "boolean" },
} satisfies ParseArgsConfig['options']
const args = process.argv.slice(3)
const { values, positionals } = parseArgs({ options, args, allowPositionals: true })

main: {
    const userPackage = await PackageJSON.load("./")

    const targets = positionals.length ? positionals.map(x => x === "me" ? `${process.platform}-${process.arch}` : x) : Object.keys(Object(userPackage.content['0oscpu']))
    console.log("Publishing these targets:", targets)

    const outPath = resolve(values.out!)
    const dryRun = values['dry-run'] ?? (process.env.npm_config_dry_run ? JSON.parse(process.env.npm_config_dry_run) : null) ?? false
    const otp = values.otp
    const $0oscpu = Object.setPrototypeOf(Object(userPackage.content['0oscpu']), null)

    async function publish(target: string, signal: AbortSignal) {
        assert(target in $0oscpu, `${target} not in package.json "0oscpu" object`)

        const { os, arch } = parseTarget(target)

        const cwd = join(outPath, target)
        assert((await stat(cwd)).isDirectory(), `${cwd} is not a directory`)

        const targetPackage = await PackageJSON.load(cwd)

        const opts: string[] = []
        if (otp != null) opts.push("--otp", otp)
        if (dryRun) opts.push("--dry-run")

        const { stdout } = await $({ cwd })`npm publish --tag 0oscpu ${opts}`

        console.log(`Did 'npm publish' for ${target} ${targetPackage.content.name} ${targetPackage.content.version}`)
    }
    
    const controller = new AbortController()
    const {signal} = controller
    const promises = targets.map(target => publish(target, signal))
    const all = await Promise.allSettled(promises)
    const fulfilled = all.filter(x => x.status === "fulfilled") as {value:any}[]
    const rejected = all.filter(x => x.status === "rejected") as {reason:any}[]
    if (rejected.length) {
        throw new AggregateError(rejected.map(x => x.reason), `some 'npm publish' operations failed`)
    }
}