import { glob } from "glob"
import parseTarget from "./parseTarget.js"

export default function getOptionalDependenciesFor(name: string, version: string, $0oscpu: Record<string, string | string[]>) {
    const optionalDependencies: Record<string, string> = { __proto__: null! }
    for (const [target, glob] of Object.entries($0oscpu)) {
        const { os, arch } = parseTarget(target)
        optionalDependencies[`@0oscpu/${os}-${arch}`] = `npm:${name}@0.0.0-0oscpu.${version}.${os}-${arch}`
    }
    return optionalDependencies
}