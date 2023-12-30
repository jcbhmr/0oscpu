import { ParseArgsConfig, parseArgs } from "node:util";
import PackageJSON from "@npmcli/package-json"
import parseTarget from "./lib/parseTarget.js";
import { basename, join, resolve } from "node:path";
import { copyFile, link, mkdir, rm, stat, symlink, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { $ } from "execa";
import { existsSync } from "node:fs";
import getOptionalDependenciesFor from "./lib/getOptionalDependenciesFor.js";

const options = {
} satisfies ParseArgsConfig['options']
const args = process.argv.slice(3)
const { values, positionals } = parseArgs({ options, args, allowPositionals: true })

main: {
    const userPackage = await PackageJSON.load("./")

    const targets = positionals.length ? positionals.map(x => x === "me" ? `${process.platform}-${process.arch}` : x) : Object.keys(Object(userPackage.content['0oscpu']))
    console.log("Updating versions in optionalDependencies!", targets)

    assert.equal(typeof userPackage.content.name, "string")
    assert.equal(typeof userPackage.content.version, "string")
    const $0oscpu = Object.setPrototypeOf(Object(userPackage.content['0oscpu']), null)

    const filtered0oscpu: Record<string, string | string[]> = { __proto__: null! }
    for (const target of targets) {
        assert(target in $0oscpu, `target not in 0oscpu config`)
        parseTarget(target)
        filtered0oscpu[target] = $0oscpu[target]
    }

    console.debug("using this 0oscpu map:", filtered0oscpu)
    console.debug({ name: userPackage.content.name!, version: userPackage.content.version! })

    userPackage.update({
        optionalDependencies: {
            ...userPackage.content.optionalDependencies,
            ...getOptionalDependenciesFor(userPackage.content.name!, userPackage.content.version!, filtered0oscpu)
        }
    })

    console.log("new optionalDependencies map:", userPackage.content.optionalDependencies)

    await userPackage.save()
}