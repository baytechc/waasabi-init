import dispatch from '../dispatch.js'
import { cmdarg, u8str } from '../util.js'

export default async function cmdAs(cmd, rest, context = {}) {
  const username = cmdarg(cmd)

  cmd = ['id','-u',username]

  // Use the current user instead on dry runs
  if ($isDryRun()) {
    cmd = ['id','-u']
  }

  // Get the numeric system id for the user
  const res = await Deno.run({ cmd, stdout: 'piped' }).output()
  const uid = parseInt(u8str(res), 10)

  if (isNaN(uid)) {
    console.log(`Warning: ${username} not found on this system.`)
    return
  }

  context.uid = uid
  context.gid = uid //TODO:?
  $debug(`Execute as ${username}(${uid})`)

  if (rest?.length) {
    return await dispatch(rest, context)
  }

  return context
}
