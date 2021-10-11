import { parse as parseYaml } from "https://deno.land/std@0.110.0/encoding/yaml.ts"
import { delay } from "https://deno.land/std@0.110.0/async/delay.ts";

import { u8str } from './runtime/util.js'

import * as logservice  from './runtime/logservice.js'
import dispatch from './runtime/dispatch.js'

// Dry Run - run without affecting the system
globalThis.$isDryRun = () => Deno.args.includes('--dry-run')

// Debug messages, only show if debugging is enabled
globalThis.$debug = (...messages) => void (Deno.args.includes('--debug') ? console.log(...messages) : null)
globalThis.$debug.verbose = (...messages) => (Deno.args.includes('--verbose') ? globalThis.$debug(...messages) : void 0)


// Load task
const M_ = (msg) => logservice.msg(msg+'\n')
try {
  const taskfile = Deno.args.filter(arg => !arg.startsWith('-'))[0]
  const taskbundle = parseYaml(Deno.readTextFileSync(taskfile))

  $debug(M_('Loaded task bundle: '+taskfile))
  $debug(M_(`Bundle contains ${taskbundle.length} tasks`))

  if ($isDryRun()) await (delay(3000))

  const metadata = {}
  for (const [t, task] of taskbundle.entries()) {
    console.log(M_(`[${t+1}/${taskbundle.length}] ${task.name}: ${task.desc}` ))

    const { meta, run } = task

    // Process metadata
    if (meta) {
      for (const [k, v] of Object.entries(meta)) {
        metadata[k] = v

        // Handle preconfigured logservice port and start the logservice
        if (k == 'logport') {
          logservice.start(v)
        } else if (k == 'logsvchost') {
          console.log('Status: ', v+':'+metadata['logport'])
        }
      }
    }

    // Run any tasks that are listed
    const subtasks = run?.entries() ?? []
    let fp
    for (const [n, cmd] of subtasks) {
      prog(n+1, task.run.length, `[${t+1}/${taskbundle.length}]`)
      fp = progbar(n+1, task.run.length, fp)

      const output = await dispatch(cmd)
      console.log('Output:', output?.out ?? u8str(output?.raw) ?? '[OK]')
      if ($isDryRun()) await (delay(500))
    }

    M_(task.success ?? 'Done')
    console.log(`[${t+1}/${taskbundle.length}] ${task.name}: ${task.success}` )
  }
}
catch(e) {
  console.error('Invalid task or no task specified: '+Deno.args.join(' '))
  console.error(e)
}

logservice.msg('\nFinished, logserver shutting down…')
logservice.finish()
await delay(3000)

logservice.end()



function progbar(completed, total, last) {
  const barlen = 12
  const { filled, empty } = calcprog(completed, total, barlen)

  logservice.msg(
    (last === undefined ? '[' : '') +
    '#'.repeat(empty>0 ? filled-(last??0) : barlen-(last??0)) +
    (empty === 0 ? '] ' : '')
  )

  return filled
}

function prog(completed, total, msg) {
  const { perc, filled, empty } = calcprog(completed, total)
  console.log(`${msg} [${'#'.repeat(filled)}${'.'.repeat(empty)}] ${perc.toFixed(0)}% (${completed}/${total})`)
}

function calcprog(completed, total, barlen = 20) {
  const perc = completed/total*100
  const filled = Math.floor(perc/(100/barlen))
  const empty = barlen-filled

  return { perc, filled, empty }
}
