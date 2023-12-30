import { ParseArgsConfig, parseArgs } from "node:util";
import PackageJSON from "@npmcli/package-json"
import parseTarget from "./lib/parseTarget.js";
import { basename, join, resolve } from "node:path";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { glob } from "glob";

const options = {
    out: { type: "string", default: "out" },
    "extra-file": { type: "string", multiple: true, default: [] },
    "extra-package-json": { type: "string", default: "{}" }
} satisfies ParseArgsConfig['options']
const args = process.argv.slice(3)
const { values, positionals } = parseArgs({ options, args, allowPositionals: true })

main: {
    const userPackage = await PackageJSON.load("./")

    assert.equal(typeof userPackage.content.name, "string")
    assert.equal(typeof userPackage.content.version, "string")

    const targets = positionals.length ? positionals.map(x => x === "me" ? `${process.platform}-${process.arch}` : x) : Object.keys(Object(userPackage.content['0oscpu']))
    console.log("Building these targets:", targets)

    const outPath = resolve(values.out!)
    const extraFilePaths = values["extra-file"]!
    const extraPackageJSON = JSON.parse(values["extra-package-json"]!)
    const $0oscpu = Object.setPrototypeOf(Object(userPackage.content['0oscpu']), null)

    for (const target of targets) {
        assert(target in $0oscpu, `${target} not in package.json "0oscpu" object`)

        const { os: targetOS, arch: targetArch } = parseTarget(target)
        const targetRootPath = join(outPath, target)
        await mkdir(targetRootPath, { recursive: true })
        console.log(`Created ${targetRootPath}`)

        for (const path of extraFilePaths) {
            const destPath = join(targetRootPath, basename(path))
            await copyFile(path, destPath)
            console.log(`Copied ${path} to ${destPath}`)
        }

        const targetExports: Record<string, string> = { __proto__: null! }
        if (typeof $0oscpu[target] === "string" || Array.isArray($0oscpu[target])) {
            const paths = await glob($0oscpu[target], { absolute: true, nodir: true })
            assert.notEqual(paths.length, 0, `no files match ${$0oscpu[target]}`)
            const path = paths[0]
            const destPath = join(targetRootPath, basename(path))
            await copyFile(path, destPath)
            console.log(`Copied ${path} to ${destPath}`)
            targetExports["."] = `./${basename(path)}`
        } else if (typeof $0oscpu[target] === "object" && target && !Array.isArray($0oscpu[target])) {
            for (const [exportSpecifier, globOrGlobs] of Object.entries($0oscpu[target]) as any) {
                const paths = await glob(globOrGlobs, { absolute: true, nodir: true })
                assert.notEqual(paths.length, 0, `no files match ${globOrGlobs}`)
                const path = paths[0]
                const destPath = join(targetRootPath, basename(path))
                await copyFile(path, destPath)
                console.log(`Copied ${path} to ${destPath}`)
                targetExports[exportSpecifier] = `./${basename(path)}`
            }
        }
        console.debug(`${target} exports:`, targetExports)

        const targetPackage = await PackageJSON.load(targetRootPath, { create: true })
        targetPackage.update({
            name: userPackage.content.name,
            version: `0.0.0-0oscpu.${userPackage.content.version}.${targetOS}-${targetArch}`,
            type: "module",
            exports: targetExports,
            os: [targetOS],
            arch: [targetArch],
            ...extraPackageJSON,
        })
        await targetPackage.save()
        console.debug(`Saved package.json for ${target}`)
    }
}