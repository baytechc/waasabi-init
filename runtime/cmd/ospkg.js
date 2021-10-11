import cmdRun from './run.js'


export default async function cmdOspkg(cmd, rest, context = {}) {
  const { out: out1 } = await cmdRun([
    'apt-get', 'update', '-y'
  ])

  const { out: out2 } = await cmdRun([
    'apt-get', 'install', '-y', ...rest
  ])

  return { out: [ out1, out2 ].join('\n') }
}