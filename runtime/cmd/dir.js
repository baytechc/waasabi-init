import dispatch from '../dispatch.js'
import { cmdarg } from '../util.js'

export default async function cmdDir(cmd, rest, context = {}) {
  const path = cmdarg(cmd)

  // Get the numeric system id for the user
  const olddir = Deno.cwd()

  // Only if not a dry-run
  if (!$isDryRun()) {
    Deno.chdir(path)
  }

  $debug(`Change dir to: ${path} (was: ${olddir})`)

  if (rest?.length) {
    return await dispatch(rest, context)
  }

  return context
}
