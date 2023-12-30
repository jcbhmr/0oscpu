import { ParseArgsConfig, parseArgs } from "node:util";
import PackageJSON from "@npmcli/package-json"
import getOptionalDependenciesFor from "./lib/getOptionalDependenciesFor.js";

const options = {} satisfies ParseArgsConfig['options']
const args = process.argv.slice(3)
const { values, positionals } = parseArgs({ options, args })

main: {
    const userPackage = await PackageJSON.load("./")

    userPackage.update({
        "scripts": {
            "build": `cargo build`,
            "build:x": `bash ./just build:x`,
            "postbuild": "0oscpu build me && 0oscpu link me",
            "postbuild:x": "0oscpu build",
            "postversion": "0oscpu version",
            "prepublishOnly": "0oscpu publish",
            ...userPackage.content.scripts,
        },
        // @ts-ignore
        "0oscpu": {
            "win32-x64": "target/{x86_64-pc-windows-msvc/,}{release,debug}/myapp.exe",
            "linux-arm64": "target/{aarch64-unknown-linux-gnu/,}{release,debug}/myapp",
            "linux-x64": "target/{x86_64-unknown-linux-gnu/,}{release,debug}/myapp",
            "darwin-arm64": "target/{aarch64-apple-darwin/,}{release,debug}/myapp",
            "darwin-x64": "target/{x86_64-apple-darwin/,}{release,debug}/myapp",
            ...userPackage.content['0oscpu'],
        },
        "optionalDependencies": {
            ...userPackage.content.optionalDependencies,
            ...getOptionalDependenciesFor(userPackage.content.name, userPackage.content.version, Object.setPrototypeOf(Object(userPackage.content['0oscpu']), null)),
        },
    })

    await userPackage.save()

    console.log("Initialized 0oscpu!")
}