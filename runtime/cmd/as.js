import dispatch from '../dispatch.js'
import { cmdarg, u8str } from '../util.js'

export default async function cmdAs(cmd, rest, context = {}) {
  const username = cmdarg(cmd)

  cmd = ['id',username]

  // Use the current user instead on dry runs
  if ($isDryRun()) {
    cmd = ['id']
  }

  // Get the numeric system uid/gid for the user
  const res = await Deno.run({ cmd, stdout: 'piped' }).output()
  const ids = Object.fromEntries(
    u8str(res).match(/[ug]id=\d+/g)?.map(m => m.split('=') ?? [])
  )

  context.uid = parseInt(ids.uid, 10)
  context.gid = parseInt(ids.gid, 10)
   
  if (isNaN(context.uid) || isNaN(context.gid)) {
    console.log(`Warning: ${username} does not exist or invaccessible.`)
    return
  }

  $debug(`Execute as ${username}(${context.uid}:${context.gid})`)

  if (rest?.length) {
    return await dispatch(rest, context)
  }

  return context
}
