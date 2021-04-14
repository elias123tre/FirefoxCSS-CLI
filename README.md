# FirefoxCSS CLI

A command-line tool to install and manage Firefox userstyles seamlessly.

## Get started

1. [Download CLI tool](https://github.com/elias123tre/firefoxcss-cli) for your operating system

## Features

- [x] Enable userstyles globaly
- [x] Install theme from URL
- [x] Activate and deactivate installed themes
- [ ] Multiple active themes
- [ ] Incemental theme updates
- [ ] Custom advanced prefrences (about:config) from theme `user.js` file

## Usage

```
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

Options:
    -h --help      Display this help message.

Examples:
    firefoxcss-cli enable

    firefoxcss-cli install https://github.com/muckSponge/MaterialFox

    firefoxcss-cli activate MaterialFox
```
