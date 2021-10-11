import { cmdarg } from '../util.js'

export default async function cmdWritefile(cmd, rest, context = {}) {
  const path = cmdarg(cmd)
  $debug('Writing: ', path, ' <<< ', rest?.length ? rest : context)

  // Dry-run
  if ($isDryRun()) {
    return {}
  }

  // No more parameters, must be a pipe
  if (!rest?.length) {
    // TODO: pipes
    // res = await Deno.writeFile (this one can be binary)

  // Rest has the text data
  } else {
    const contents = rest.join('')
    await Deno.writeTextFile(path, contents)

  }

  // @as handling
  if (context.uid) {
    Deno.chownSync(path, context.uid ?? null, context.gid ?? null)
  }
}
