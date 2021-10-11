import { cmdarg } from '../util.js'

import cmdRun from './run.js'


export default async function cmdPipe(cmd, rest, context) {
  const targetCmd = cmdarg(cmd)

  // Pipe inbound source into the target command
  if (targetCmd) {
    // Simple command, split at spaces
    // Note: use 'rest' if you need to pipe into more complex shell commands
    const runCommand = targetCmd.split(' ')
    return await cmdRun(runCommand, context)

  // Pipe target specified as a runnable
  } else if (rest.length>0 && Array.isArray(rest[0])) {
    // Array subcommand ['echo', 'foo bar baz']
    return await cmdRun(rest[0], context)

  // Pipe target is a chained command that accepts pipes
  } else if (rest.length>0) {
    return await dispatch(rest, context)

  } else {
    console.error('No pipe destination specified.')
    return
  }

}