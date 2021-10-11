import { cmdarg } from '../util.js'

import cmdRun from './run.js'


export default async function cmdEnsuredir(cmd, rest = [], context) {
  const pathArg = cmdarg(cmd)
  const path = [ ...rest ]
  if (pathArg) path.push(pathArg)

  if (!path.length) {
    console.error('No Ensuredir path specified.')
    return
  }

  // Deno supports recursive mkdir but does not support setting the effective uid/gid
  return await cmdRun([ 'mkdir', '-p', ...path], context)
}
