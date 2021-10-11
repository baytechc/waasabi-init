import { setenv } from '../env.js'
import { cmdarg } from '../util.js'

export default async function cmdSetenv(cmd, subcmd, context) {
  const varName = cmdarg(cmd)
  $debug(`Set "${varName}" to: `, subcmd.length ? subcmd : context)
  
  let v
  if (subcmd?.length) {
    const res = await dispatch(subcmd)
    v = (typeof res == 'object' ? res.out : res).trimEnd('\n')
  
  } else if (context.out) {
    v = context.out?.trimEnd('\n')
  } else {
    console.log(`Variable ${varName} had no value.`)
    return
  }

  $debug(varName+'='+v)
  return setenv(varName, v)
}
