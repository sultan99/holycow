/**
 * This script can be used to trigger npm commands inside each of our packages.
 * To use:
 * node scripts/bulk-run.mjs <my-npm-command>
 * my-npm-command: corresponds to a npm script command, like 'run build' for 'npm run build'
 */

import {execSync} from 'child_process'
import {getDirectories, pkgDir} from './utils.mjs'

const command = process.argv[2]
const directories = getDirectories(pkgDir)

/**
 * Publish an npm package to the npm registry
 */
const publishPackage = pkgName => {
  try {
    console.info(`\n🚀 Publishing the package "${pkgName}".\n`)
    console.info(execSync(`npm publish`, {cwd: `${pkgDir}/${pkgName}`}).toString())
    console.info(`\n🌟 Successfully published the package "${pkgName}".\n`)
  }
  catch (err) {
    console.error(`\n💥 oh oh, the publishing failed for the "${pkgName}" package\n`)
    process.exit(1)
  }
}

/**
 * Will run the specified command in a new shell process
 */
const runCommand = pkgName => {
  try {
    console.info(`\n💌 Running "${command}" script for package "${pkgName}".\n`)
    console.info(execSync(`npm --prefix ${pkgDir}/${pkgName} ${command}`).toString())
    console.info(`\n📬 Successfully ran "${command}" script for package "${pkgName}".\n`)
  }
  catch (err) {
    // Scripts missing on some packages shouldn't be a blocking error
    if (err.message.match(/Missing script:/i)) {
      console.info(`\n📭 Package "${pkgName}" doesn't have any "${command}" script.\n`)
    }
    // The rest should
    else {
      console.error(err.stdout.toString())
      console.error(`\n🐶 oh oh, the "${command}" script failed for the "${pkgName}" package\n`)
      process.exit(1)
    }
  }
}

const runAction = command === `publish` ? publishPackage : runCommand
directories.forEach(runAction)
