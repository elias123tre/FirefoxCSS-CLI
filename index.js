#!/usr/bin/env node
const { Profile } = require("./manager")
const [command, ...args] = process.argv.slice(2)

const manpage = `
firefoxcss-cli - a command-line tool to install and manage Firefox userstyles seamlessly

Usage: firefoxcss-cli COMMAND [ arguments ] [...options]

Commands:
    enable
        Enable custom userstyles for current Firefox profile.
    install URL
        Install a theme from a GitHub URL.
    activate THEME
        Activate THEME after deactivating current one.
    list
        List installed themes.
    remove THEME
        Remove/uninstall THEME.
    deactivate
        Deactivate currently active theme.
    update THEME
        Update THEME by reinstalling it. Any modifications will be lost.
    profile
        Echo directory for default Firefox profile.
    current
        Echo current theme properties or null.
    path [THEME]
        Echo directory for a theme or the activated one
    new NAME [REPO]
        Create a new theme.

Options:
    -h --help      Display this help message.

Examples:
    firefoxcss-cli enable

    firefoxcss-cli install https://github.com/muckSponge/MaterialFox

    firefoxcss-cli activate MaterialFox
`

const verifyArgs = (command, cmdArgs) => {
  if (!Object.values(cmdArgs).every((a) => a)) {
    console.log("Usage:", command, ...Object.keys(cmdArgs).map((a) => `\{${a}\}`))
    throw new Error("Too few arguments")
  }
}
const help = () => {
  console.log(manpage.trim())
}

let profile = new Profile()

let commands = {
  list: () => {
    console.log("Installed themes:", profile.themes)
  },
  profile: () => {
    console.log(profile.profileDir)
  },
  current: () => {
    console.log("Current theme:", JSON.stringify(profile.theme))
  },
  install: (url) => {
    verifyArgs("install", { url })
    let themeName = profile.install(url)
    if (themeName) {
      console.log("Installed theme:", themeName)
      console.log(`Activate it with \`activate ${themeName}\` command`)
    } else {
      console.error("Failed to install theme")
    }
  },
  deactivate: () => {
    console.log("Deactivated theme:", profile.deactivate())
  },
  activate: (theme) => {
    verifyArgs("activate", { theme })
    let activated = profile.activate(theme)
    if (activated === null) {
      console.error("Theme is not installed:", theme)
    }
  },
  remove: (theme) => {
    verifyArgs("remove", { theme })
    let removed = profile.remove(theme)
    if (removed !== null) {
      console.log("Removed theme from path:", removed)
    } else {
      console.error("No theme to remove:", theme)
    }
  },
  update: (theme) => {
    verifyArgs("update", { theme })
    profile.update(theme)
  },
  enable: () => {
    profile.enable()
  },
  path: (theme) => {
    console.log(profile.path(theme))
  },
  new: (name, repo) => {
    verifyArgs("new", { name /*, repo*/ })
    profile.init(name, repo)
  },
  "-h": help,
  "--help": help,
}

if (require.main === module) {
  let func = commands[command]
  if (func) {
    try {
      func(...args)
    } catch (err) {
      console.error(err.toString())
    }
  } else {
    if (command) console.error("Unknown command:", command)
    console.log(
      "Available commands:",
      Object.keys(commands)
        .filter((c) => !c.startsWith("-"))
        .join(", ")
    )
    console.log("Show help page with --help option")
  }
}
