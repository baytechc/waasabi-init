import dispatch from '../dispatch.js'
import cmdRun from './run.js'
import { cmdarg } from '../util.js'

export default async function cmdGrepfile(cmd, rest) {
  const pattern = rest.shift()

  const fileName = cmdarg(cmd)
  console.log(':: grep for '+pattern+' in '+fileName)

  const subcmd = [
    'grep',
    '-Pom1',
    '--color=never',
    pattern,
    fileName
  ]

  const res = await cmdRun(subcmd)
  res.out = res.out?.trimEnd('\n') ?? ''

  if (rest?.length) {
    console.log(rest)
    return await dispatch(rest, res)
  }
  return res
}
