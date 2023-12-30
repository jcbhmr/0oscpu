# 0oscpu

## Usage

```sh
0oscpu init
```

```jsonc
// package.json
{
    "name": "myapp",
    "version": "4.5.6",
    "scripts": {
        "build": "cargo build",
        "postbuild": "0oscpu build me && 0oscpu link me",
        "build:x": "bash ./just build:x",
        "postbuild:x": "0oscpu build",
        "postversion": "0oscpu version",
        "prepublishOnly": "0oscpu publish"
    },
    "0oscpu": {
        "win32-x64": "target/{x86_64-pc-windows-msvc/,}{release,debug}/myapp.exe",
        "linux-arm64": "target/{aarch64-unknown-linux-gnu/,}{release,debug}/myapp",
        "linux-x64": "target/{x86_64-unknown-linux-gnu/,}{release,debug}/myapp",
        "darwin-arm64": "target/{aarch64-apple-darwin/,}{release,debug}/myapp",
        "darwin-x64": "target/{x86_64-apple-darwin/,}{release,debug}/myapp"
    },
    "optionalDependencies": {
        "@0oscpu/win32-x64": "npm:myapp@0.0.0-0oscpu.4.5.6.win32-x64",
        "@0oscpu/darwin-arm64": "npm:myapp@0.0.0-0oscpu.4.5.6.darwin-arm64",
        "@0oscpu/darwin-x64": "npm:myapp@0.0.0-0oscpu.4.5.6.darwin-x64",
        "@0oscpu/linux-x64": "npm:myapp@0.0.0-0oscpu.4.5.6.linux-x64"
    }
}
```

<details><summary><code>just</code> scripts</summary>

```sh
#!/bin/bash
set -e

build:x()(
    true "${NODE:?}"
    for target in \
        x86_64-pc-windows-msvc \
        aarch64-unknown-linux-gnu \
        x86_64-unknown-linux-gnu \
        aarch64-apple-darwin \
        x86_64-apple-darwin \
    ; do
        cargo build --target "$target" "$@"
    done
)

cd "$(dirname "${BASH_SOURCE[0]}")"; c=$1; shift; "$c" "$@"
```

This example uses a `./just <script>`-style runner. Why? So that all the scripts can be contained in a single Bash `just` file. It runs on Windows too using either Git Bash or WSL.

</details>

**What's going on there?** Let's break it down:

- **`"build": "<build-own-target>"`:** This should build **only for your local target**. Think like `cargo build` or `go build`. For local development.

- **`"postbuild": "0oscpu build me && 0oscpu link me"`:** Builds the `out/$OS-$ARCH/` package folder and `npm link`-s it to the current workspace.

- **`"build:x": "<build-all-targets>"`:** This should build **all the targets**. Usually this is something like `bash ./build-all-targets.sh`. Should be run before `npm publish` to build everything.

- **`"postbuild:x": "0oscpu build"`:** Builds the `out/$OS-$ARCH/` package folders for **every key** in the `package.json`'s `0oscpu` map. Should be run before `npm publish`.

- **`"optionalDependencies": { ... }`:** This is the magic. We are mapping custom names (`@me/$OS-$ARCH` by convention) to the magic prerelease versions.
