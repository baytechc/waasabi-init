import { expand } from './env.js'

const U8TEXTDECODER = new TextDecoder('utf8')

export function u8str(d) {
  return typeof d=='string' ? d : U8TEXTDECODER.decode(d)
}

export function cmdarg(cmd) {
  const splt = cmd.split(':',2)

  // Command arguments are always expanded
  return expand(splt[1] ?? '')
}

export function isJSON(param) {
  if (typeof param == 'object') {
    //console.log(':: Supplied parameter is a JSON Object')
    return param
  }

  if (typeof param != 'string') {
    if ($isDryRun()) {
      $debug.verbose('Mock JSON value in Dry Run: ', param)
      return {}
    }

    $debug(':: Not a JSON value')
    return
  }

  try {
    const ret = JSON.parse(param)
    return ret
  } catch(_e) { 
    if ($isDryRun()) {
      $debug.verbose('Mock JSON value in Dry Run: ', param)
      return {}
    }

    $debug.verbose('Not a JSON value: ', param, _e)
    return
   }
}

export async function isJSONContext(context) {
  if (context.raw) {
    // https://doc.deno.land/builtin/stable#Request
    if ('json' in context.raw) {
      return await context.raw.json()
    }

    // TODO: pipes
    console.log('Unsupported raw context: ', context)
  }
  if (context.out) {
    return isJSON(context.out)
  }
}
