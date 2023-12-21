import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { parseArgs } from "node:util"
import { $ } from "execa"
const package_ = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"))

const helpText = `\
npm-0oscpu v${package_.version}

USAGE
  npm-0oscpu publish [tuple] [options]
  
EXAMPLES
  npm-0oscpu publish
  npm-0oscpu publish linux-arm

OPTIONS
  --help:       show help text
  --out:        where the package out folder is [default: out]
  --otp:        --otp for 'npm publish'
  --dry-run:    --dry-run for 'npm publish'
`
/** @satisfies {import('node:util').ParseArgsConfig['options']} */
const options = {
    help: { type: "boolean" },
    out: { type: "string", default: "out" },
    otp: { type: "string" },
    "dry-run": { type: "boolean" }
}
const { values, positionals } = parseArgs({ options, allowPositionals: true, args: process.argv.slice(3) })

main: {
    if (values.help) {
        console.log(helpText)
        break main
    }
    
    let tuple = positionals[0]
    if (tuple === "me") tuple = `${process.platform}-${process.arch}`

    const userPackage = JSON.parse(
        await readFile("./package.json", "utf8")
    )
    const config = userPackage["0oscpu"]

    const outPath = resolve(values.out)

    if (tuple) {
        const [os, arch] = tuple.split(/-|\.|\//g)
        await publish(os, arch, outPath, values.otp, values["dry-run"])
    } else {
        for (const os of Object.keys(config)) {
            for (const arch of Object.keys(config[os])) {
                await publish(os, arch, outPath, values.otp, values["dry-run"])
            }
        }
    }
}

async function publish(os, arch, outPath, otp, dryRun) {
    const rootPath = join(outPath, `${os}-${arch}`)
    const opts = []
    if (otp) opts.push("--otp", otp)
    if (dryRun) opts.push("--dry-run")
    await $({ cwd: rootPath, stdio: "inherit" })`npm publish --tag __npm-0oscpu ${opts}`
}