import { cmdarg } from '../util.js'

import cmdRun from './run.js'


export default async function cmdCreateuser(cmd, rest, context) {
  const  usernameArg = cmdarg(cmd)
  const {
    // system user name
    username,
    // login password, should be already hashed
    password,
    // -d: home directory
    home,
    // -s: user shell
    shell,
  } = rest[0]

  const subcmd = [ 'useradd' ]

  if (home) subcmd.push('-m', '-d', home)
  if (shell) subcmd.push('-s', shell)
  if (password) subcmd.push('-p', password)
  
  subcmd.push(username ?? usernameArg)
 
  return await cmdRun(subcmd, context)
}
