/**
 * This script will compare a release tag with the version from our package.json file
 * In the case they don't match, it will cancel the deployment.
 */

import {readFileSync} from 'fs'

const releaseVersion = process.argv[2]
const config = readFileSync(`./package.json`)
const pkgVersion = `v${JSON.parse(config).version}`

console.info(`
🏷  Release tag version: ${releaseVersion}
📦  Package.json version: ${pkgVersion}
`)

const compareVersions = () => {
  if (releaseVersion === pkgVersion) {
    console.info(`✅  The versions match!`)
  }
  else {
    console.error(`❌  The versions do not match. Make sure that your release tag version and the package.json version are the same.`)
    process.exit(1)
  }
}

compareVersions()
