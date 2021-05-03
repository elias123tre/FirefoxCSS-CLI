# FirefoxCSS CLI

A command-line tool to install and manage Firefox userstyles seamlessly.

## Get started

> Example installation of [MaterialFox](https://github.com/muckSponge/MaterialFox). Run the following commands in console/terminal.

1. Enable custom userstyles for Firefox

   ```terminal
   npx firefoxcss-cli enable
   ```

2. Install theme from GitHub URL

   ```terminal
   npx firefoxcss-cli install https://github.com/muckSponge/MaterialFox
   ```

3. Activate the theme
   ```terminal
   npx firefoxcss-cli activate MaterialFox
   ```

Find a collection of beautiful Firefox themes at [FirefoxCSS Store](https://firefoxcss-store.github.io/)

> Note: Installation without executable requires [Node.js](https://nodejs.org) 14.x or higher

## Features

- [x] Enable userstyles globaly
- [x] Install theme from URL
- [x] Activate and deactivate installed themes
- [ ] Installing from repository with multiple variants: _[Example](https://github.com/Neikon/Almost-Dark-Grey-Colorfull-Proton---FirefoxCSS-Themes)_
- [ ] Multiple active themes
- [ ] Incemental theme updates
- [ ] Custom advanced prefrences (about:config) from theme `user.js` file
- [ ] Works without git (using simple-git)

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
```

## Running with Node.js

```terminal
git clone https://github.com/elias123tre/FirefoxCSS-CLI
cd FirefoxCSS-CLI
npm install
node index
```

## Using precompiled executable

1. [Download CLI executable](https://github.com/elias123tre/FirefoxCSS-CLI/releases) for your operating system from releases
2. Call executable from the command-line: ex. `./firefoxcss-cli.exe`

## Compiling executable locally

1.  Clone the repository:  
    `git clone https://github.com/elias123tre/FirefoxCSS-CLI`
2.  Go to cloned repository:  
    `cd FirefoxCSS-CLI`
3.  Install dependencies:  
    `npm install`
4.  Build executable for current system (specify custom [`pkg`](https://www.npmjs.com/package/pkg) build settings in `package.json`):  
    `npm run build`
5.  Run CLI executable:  
    Windows: `./firefoxcss-cli.exe`  
    Unix: `./firefoxcss-cli`

## Node.js API

The `manager.js` file exports the `Profile` class that contains methods for each command mentioned above. It also contains JSDoc comments for each method and property.

**Example implementation:**

```terminal
npm install firefoxcss-cli
```

```js
// example.js
const { Profile } = require("FirefoxCSS-CLI/manager")
Profile.install("https://github.com/muckSponge/MaterialFox")
Profile.activate("MaterialFox")
```

**Documentation:**

```ts
/**
 * Firefox profile instance: where themes can be installed, activated, removed, updated
 * and userstyles can be enabled for said profile.
 */
export class Profile {
  /**
   * Optional path to the Firefox profile to modify, otherwise the default one.
   * @param {string | undefined} profileDir path to Firefox profile
   */
  constructor(profileDir: string | undefined)
  PREFIX: string
  THEMEINI: string
  profileDir: string
  /**
   * Generate unique base36 string when called, based on current timestamp.
   */
  unique(): string
  /**
   * Get human-readable part of git(hub) uri.
   * @param {string} url github url
   */
  repoName(url: string): string
  /**
   * Get default Firefox profile.
   * @return {string} path to default Firefox profile
   */
  defaultProfile(): string
  /**
   * Get current theme configuration file or null if unofficial or non-existent userstyle.
   * @return {Object | null} Object representing theme config or null
   */
  get theme(): any
  /**
   * List of installed themes in profile.
   * @return {string[]} list of theme names
   */
  get themes(): string[]
  /**
   * Install a theme from a github url, regardless of the repos folder structure.
   * @param {string} url github link to a single theme
   * @return {string} theme name - if succesfull install
   */
  install(url: string): string
  /**
   * Deactivate current theme.
   * @return {string | null} deactivated theme name or null
   */
  deactivate(): string | null
  /**
   * Deactivate current theme (if any) and activate the new `theme`.
   * @param {string} theme the git repo name of the theme
   * @return {null} null if no such theme is installed
   */
  activate(theme: string): null
  /**
   * Removes a theme if it exists.
   * @param {string} theme the git repo name of the theme
   * @return {string | null} removed theme path or null if no theme was removed
   */
  remove(theme: string): string | null
  /**
   * Updates a theme by reinstalling it.
   * Warning: will remove any modifications made to the theme files locally.
   * @param {string} theme the git repo name of the theme
   */
  update(theme: string): string
  /**
   * Enable userstyles for the Firefox profile.
   * Required for themes to work.
   * @param {boolean=} force overwrite existing user.js file in profile folder
   */
  enable(force?: boolean | undefined): void
  /**
   * Get path of a theme or the currently active one
   * @param {string=} theme the theme to get profile path to
   * @return {string} path to theme or null if theme doesn't exist
   */
  path(theme?: string | undefined): string
  /**
   * Create a folder for a new theme
   * @param {string} name the name of the new theme
   * @param {string=} repo repository link to the theme, for updates
   */
  init(name: string, repo?: string | undefined): void
}
```
