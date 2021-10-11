import ENV from '../env.js'
import { u8str } from '../util.js'
import { expand } from '../env.js'

import { readerFromStreamReader } from 'https://deno.land/std@0.110.0/io/streams.ts'
import { copy } from 'https://deno.land/std@0.110.0/io/util.ts'



export default async function cmdRun(cmd, context = {}) {
  $debug((context.pipe ? ' >>> ' : '$> ')+cmd.join(' '))

  // Dry-run
  if ($isDryRun()) {
    return {}
  }

  const commandOpts = {
    // Auto-expand params of 'run' commands
    cmd: cmd.map(c => expand(c)),
    env: ENV,
    stdout: 'piped',
  }

  // Execute @as user/group
  if (context.uid) commandOpts.uid = parseInt(context.uid, 10)
  if (context.gid) commandOpts.gid = parseInt(context.gid, 10)

  // Inbound pipe
  if (context.pipe) {
    commandOpts.stdin = 'piped'
  }

  const proc = Deno.run(commandOpts)

  // Pipes
  if (context.pipe) {

    // ReadableStream, e.g. from a fetch()
    // https://medium.com/deno-the-complete-reference/readable-streams-in-deno-e5d707735a77
    if (context.pipe instanceof ReadableStream) {
      $debug('Piped stream from ReadableStream')
      const stream = context.pipe.getReader()
      await copy(readerFromStreamReader(stream), proc.stdin)
 
      await stream.closed
      proc.stdin.close();
      delete context.pipe
    }
  }

  context.raw = await proc.output()
  context.out = u8str(context.raw)

  $debug(commandOpts, ' --> ', context)
  return context
}


