const re = /^(\w+)\-(\w+)$/

export default function parseTarget(target: string) {
    const match = target.match(re)
    if (!match) throw new DOMException(`${target} does not match ${re}`, "SyntaxError")
    const [, os, arch] = match
    return { os, arch }
}