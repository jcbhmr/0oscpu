import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, join, resolve } from "node:path"
import { parseArgs } from "node:util"
const package_ = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"))

const helpText = `\
npm-0oscpu v${package_.version}

USAGE
  npm-0oscpu generate [tuple] [options]
  
EXAMPLES
  npm-0oscpu generate me
  npm-0oscpu generate
  npm-0oscpu generate linux/arm
  npm-0oscpu generate darwin.arm64
  npm-0oscpu generate win32-x64

OPTIONS
  --help:       show help text
  --out:        change out dir [default: out]
  --extra-file: include additional file in output package [multiple]
`
/** @satisfies {import('node:util').ParseArgsConfig['options']} */
const options = {
    help: { type: "boolean" },
    out: { type: "string", default: "out" },
    "extra-file": { type: "string", multiple: true, default: [] }
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
    const extraFilePaths = values["extra-file"].map(x => resolve(x))

    if (tuple) {
        const [os, arch] = tuple.split(/-|\.|\//g)
        await generate(os, arch, config[os][arch], outPath, userPackage, extraFilePaths)
    } else {
        for (const os of Object.keys(config)) {
            for (const arch of Object.keys(config[os])) {
                await generate(os, arch, config[os][arch], outPath, userPackage, extraFilePaths)
            }
        }
    }
}

async function generate(os, arch, files, outPath, userPackage, extraFilePaths) {
    if (typeof files === "string") files = { ".": files }
    const rootPath = join(outPath, `${os}-${arch}`)
    await mkdir(rootPath, { recursive: true })

    for (const filePath of extraFilePaths) {
        await copyFile(filePath, join(rootPath, basename(filePath)))
    }

    const exports = { __proto__: null }
    for (const [exportsKey, filePath] of Object.entries(files)) {
        await copyFile(filePath, join(rootPath, basename(filePath)))
        exports[exportsKey] = `./${basename(filePath)}`
    }

    const outPackage = {
        name: userPackage.name,
        version: `0.0.0-0oscpu.${userPackage.version}.${os}-${arch}`,
        exports: exports,
    }
    await writeFile(join(rootPath, "package.json"), JSON.stringify(outPackage))
}