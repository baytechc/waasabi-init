import { cmdarg } from '../util.js'

import cmdRun from './run.js'


export default async function cmdExtract(cmd, rest, context) {
  const targetPath = cmdarg(cmd)

  // Pipe inbound source into the correct extract tool depending on filename
  let subcmd
  if (context.pipe || context.pipefile) {
    const { pipefile } = context

    // gzipped tar
    if (pipefile?.endsWith('.tar.gz') || pipefile?.endsWith('.tgz')) {
      subcmd = [ 'tar', '-xz', '--strip-components=1', '--one-top-level='+targetPath ]
    } else if (pipefile?.endsWith('.tar.xz') || pipefile?.endsWith('.txz')) {
      subcmd = [ 'tar', '-xJ', '--strip-components=1', '--one-top-level='+targetPath ]
    }
  
  // Rest contains the source file path
  } else if (rest.length>0) {
    if (rest[0]?.endsWith('.zip')) {
      // Unzip only supports extracting from existing files
      subcmd = [ 'unzip', rest[0], '-d', targetPath ]
    }

  } else {
    console.error('No pipe destination specified.')
    return
  }

  if (!subcmd) {
    console.error('Unsupported compressed file format: ', context.pipefile ?? rest[0])
    return
  }

  return await cmdRun(subcmd, context)
}