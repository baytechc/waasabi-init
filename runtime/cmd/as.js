import dispatch from '../dispatch.js'
import { cmdarg } from '../util.js'

export default async function cmdAs(cmd, rest, context = {}) {
  const username = cmdarg(cmd)

  // Find out the user details the old-fashioned way
  const id = Deno.readTextFileSync('/etc/passwd')
    .split('\n')
    .find(
      r => r.startsWith(username)
    )?.match(new RegExp(
      username+`:[^:]*:(?<uid>[^:]+):(?<gid>[^:]+):[^:]*:(?<home>[^:]+)`
    ))?.groups ?? {}

    console.log(id)

  context.uid = parseInt(id.uid, 10)
  context.gid = parseInt(id.gid, 10)
  context.env = {
    USER: username,
    LOGNAME: username,
  }
  context.env.HOME = id.home ?? '/home/'+username
   
  if (isNaN(context.uid) || isNaN(context.gid)) {
    console.log(`Warning: ${username} does not exist or invaccessible.`)
    return
  }

  $debug(`Execute as ${username}(${context.uid}:${context.gid}:${context.env?.HOME})`)

  if (rest?.length) {
    return await dispatch(rest, context)
  }

  return context
}
