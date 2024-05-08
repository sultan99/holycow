/**
 * This script will take the version of the main package.json of this repo
 * and copy it inside the package.json of all npm packages located in the ./packages/ folder
 * This aims to keep all of our package version synchronized together.
 */

import {getDirectories, pkgDir} from './utils.mjs'
import {readFileSync, writeFileSync} from 'fs'

const directories = getDirectories(pkgDir)
const config = readFileSync(`./package.json`)
const version = JSON.parse(config).version

const copyVersion = pkgName => {
  const path = `${pkgDir}/${pkgName}/package.json`
  const pkgFile = readFileSync(path).toString()
  const newPkgFile = pkgFile.replace(/^ {0,2}"version": "(.*?)",$/m, `  "version": "${version}",`)
  if (pkgFile !== newPkgFile) {
    console.info(`✨ Synchronizing version of ${pkgName} to ${version}`)
    writeFileSync(path, newPkgFile)
  }
}

directories.forEach(copyVersion)
