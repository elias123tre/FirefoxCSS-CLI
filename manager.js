const os = require("os")
const path = require("path")
const { exec } = require("child_process")
const fs = require("fs")
const ini = require("ini")

/**
 * Firefox profile instance: where themes can be installed, activated, removed, updated
 * and userstyles can be enabled for said profile.
 */
class Profile {
  PREFIX = "chrome_"
  THEMEINI = "theme.ini"

  /**
   * Optional path to the Firefox profile to modify, otherwise the default one.
   * @param {string | undefined} profileDir path to Firefox profile
   */
  constructor(profileDir) {
    this.profileDir = profileDir || this.defaultProfile()
  }
  /**
   * Generate unique base36 string when called, based on current timestamp.
   */
  unique() {
    return Math.floor(new Date().valueOf() / 1000).toString(36)
  }
  /**
   * Get human-readable part of git(hub) uri.
   * @param {string} url github url
   */
  repoName(url) {
    return url
      .replace(/\/+$/g, "")
      .split("/")
      .pop()
      .replace(/\.git$/gi, "")
  }

  /**
   * Get default Firefox profile.
   * @return {string} path to default Firefox profile
   */
  defaultProfile() {
    const paths = {
      win32: "AppData\\Roaming\\Mozilla\\Firefox\\",
      darwin: "Library/Application Support/Firefox/",
    }
    let basePath = path.join(os.homedir(), paths[process.platform] ?? ".mozilla/firefox")
    let config = ini.parse(fs.readFileSync(path.join(basePath, "profiles.ini"), "utf-8"))
    let install = Object.entries(config).find(([k, v]) => k.startsWith("Install"))[1]
    return path.join(basePath, install.Default)
  }

  /**
   * Get current theme configuration file or null if unofficial or non-existent userstyle.
   * @return {Object | null} Object representing theme config or null
   */
  get theme() {
    let iniFile = path.join(this.profileDir, "chrome", this.THEMEINI)
    if (fs.existsSync(iniFile)) {
      return ini.parse(fs.readFileSync(iniFile, "utf-8"))
    } else {
      return null
    }
  }
  // TODO: Setter for current theme config

  /**
   * List of installed themes in profile.
   * @return {string[]} list of theme names
   */
  get themes() {
    let themes = fs.readdirSync(this.profileDir).filter((dirent) => {
      let stats = fs.statSync(path.join(this.profileDir, dirent))
      return stats.isDirectory() && dirent.startsWith(this.PREFIX)
    })
    return themes.map((thm) => thm.replace(this.PREFIX, ""))
  }
  // ? Implement setter for themes

  /**
   * Install a theme from a github url, regardless of the repos folder structure.
   * @param {string} url github link to a single theme
   * @return {string} theme name - if succesfull install
   */
  install(url) {
    if (fs.existsSync(url)) {
      console.log("Installing from refrenced folder")
    }

    let themeName = this.repoName(url)
    if (!themeName) throw new Error(`Unable to get theme name from URL: ${url}`)

    let themeDir = path.join(this.profileDir, this.PREFIX + themeName)
    if (fs.existsSync(themeDir)) throw new Error(`Theme is already installed: ${themeName}`)
    let tempDir = path.join(this.profileDir, "temp_" + this.unique())
    // Clone git repo to temporary directory
    exec(`git clone ${url} ${tempDir}`, (err, stdout, stderr) => {
      if (err) {
        if (stderr) console.error(stderr)
        console.error("Make sure Git is installed and accesible from the PATH")
        throw new Error(`Error during cloning of git repo: ${err}`)
      }
      console.log(stdout)

      // Move theme root or `chrome` if it is subfolder
      let tempChrome = path.join(tempDir, "chrome")
      if (fs.existsSync(tempChrome)) {
        fs.renameSync(tempChrome, themeDir)
        let tempUserjs = path.join(tempDir, "user.js")
        let themeUserjs = path.join(themeDir, "user.js")
        if (fs.existsSync(tempUserjs) && !fs.existsSync(themeUserjs)) {
          fs.renameSync(tempUserjs, themeUserjs)
        }
      } else {
        fs.renameSync(tempDir, themeDir)
      }

      // Write theme ini file
      fs.writeFile(
        path.join(themeDir, this.THEMEINI),
        ini.stringify({ name: themeName, repo: ini.safe(url) }),
        (err) => {
          if (err) {
            console.error("Unable to write theme ini file:", themeName)
            throw err
          }
        }
      )
    })
    return themeName
  }

  /**
   * Deactivate current theme.
   * @return {string | null} deactivated theme name or null
   */
  deactivate() {
    let chromeFolder = path.join(this.profileDir, "chrome")
    let themeName = this.theme?.name ?? "unknown_" + this.unique()
    if (fs.existsSync(chromeFolder)) {
      fs.rename(chromeFolder, path.join(this.profileDir, this.PREFIX + themeName), (err) => {
        if (err) {
          console.error(
            "Unable to acces `chrome` folder in Firefox profile, make sure Firefox is closed"
          )
          throw err
        }
      })
    } else {
      return null
    }
    return themeName
  }

  /**
   * Deactivate current theme (if any) and activate the new `theme`.
   * @param {string} theme the git repo name of the theme
   * @return {null} null if no such theme is installed
   */
  activate(theme) {
    let chromeFolder = path.join(this.profileDir, "chrome")
    let themeDir = path.join(this.profileDir, this.PREFIX + theme)
    if (fs.existsSync(themeDir)) {
      if (this.deactivate() === null) console.log("No theme to deactivate beforehand")

      fs.rename(path.join(this.profileDir, this.PREFIX + theme), chromeFolder, (err) => {
        if (err) {
          throw new Error("Unable to activate theme, folder occupied")
        }
        console.log("New theme applied:", theme)
        console.log("Restart Firefox for changes to take effect")
      })
    } else {
      return null
    }
  }

  /**
   * Removes a theme if it exists.
   * @param {string} theme the git repo name of the theme
   * @return {string | null} removed theme path or null if no theme was removed
   */
  remove(theme) {
    let themePath = path.join(this.profileDir, this.PREFIX + theme)
    if (fs.existsSync(themePath)) {
      fs.rmdirSync(themePath, { recursive: true })
      return themePath
    } else {
      return null
    }
  }

  /**
   * Updates a theme by reinstalling it.
   * Warning: will remove any modifications made to the theme files locally.
   * @param {string} theme the git repo name of the theme
   */
  update(theme) {
    let themeDir = path.join(this.profileDir, this.PREFIX + theme)
    // Check if installed
    if (!fs.existsSync(themeDir)) {
      throw new Error(`Theme is not installed: ${theme}`)
    }

    let iniFile = path.join(themeDir, this.THEMEINI)
    let themeConfig = {}
    // Check if ini file exists
    if (fs.existsSync(iniFile)) {
      themeConfig = ini.parse(fs.readFileSync(iniFile, "utf-8"))
    } else {
      throw new Error(
        `Theme is installed but no ${this.THEMEINI} file found to update it: ${theme}`
      )
    }
    let url = themeConfig.repo
    if (!url) throw new Error(`No repo url found in ${this.THEMEINI} file for theme: ${theme}`)

    this.remove(theme)
    return this.install(url)
  }

  /**
   * Enable userstyles for the Firefox profile.
   * Required for themes to work.
   * @param {boolean=} force overwrite existing user.js file in profile folder
   */
  enable(force = false) {
    let userjs = path.join(this.profileDir, "user.js")
    if (force || !fs.existsSync(userjs)) {
      let contents = [
        ["toolkit.legacyUserProfileCustomizations.stylesheets", true],
        ["svg.context-properties.content.enabled", true],
      ]
        .map(([key, val]) => `user_pref("${key}", "${val}");`)
        .join("\n")
      fs.writeFile(userjs, contents, (err) => {
        if (err) {
          console.error("Unable to write `user.js` file to enable userstyles")
          throw err
        }
        console.log("Custom userstyles enabled, a browser restart may be required")
      })
    } else {
      console.error("user.js file does already exist, overwrite it by passing `force = true`")
    }
  }
}

if (require.main === module) {
  p = new Profile()
  console.log("Firefox profile:", p.profileDir)
  console.log("Themes:", p.themes)
  console.log("Current theme:", p.theme)
}

module.exports = { Profile }
