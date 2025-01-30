import {readdirSync} from 'node:fs'

export const pkgDir = `./packages`

export const getDirectories = path =>
  readdirSync(path, {withFileTypes: true})
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
