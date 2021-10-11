import dispatch from '../dispatch.js'
import { cmdarg } from '../util.js'

import YAML from 'https://cdn.skypack.dev/yaml@2.0.0-8'


export default async function cmdYaml(cmd, rest, context = {}) {
  const yamlFile = cmdarg(cmd)
  const yamlContents = Deno.readTextFileSync(yamlFile)


  console.log(cmd, rest)

  const yamlData = YAML.parseDocument(yamlContents)

  while (rest.length>0) {
    const c = rest[0][0];

    // Set a YAML key
    if (c.startsWith('@set:')) {
      const [ ycmd, yarg ] = rest.shift()
      opSet(yamlData, cmdarg(ycmd), yarg)

    // Unset a key
    } else if (c.startsWith('@unset:')) {
      const [ ycmd ] = rest.shift()
      opUnset(yamlData, cmdarg(ycmd))

    // Not a recognized command, end the loop
    } else {
      break

    } 
  }

  // Result of processing
  context.raw = yamlData
  context.out = yamlData.toString({ lineWidth: 0 })

  // Still remaining rest args (maybe a @writefile or similar)
  if (rest.length>0) {
    return await dispatch(rest, context)

  // Write back changed contents to the original file
  } else {
    if ($isDryRun()) {
      console.log(context.out)
    } else {
      Deno.writeTextFileSync(yamlFile, context.out)
    }

  }

  return context
}

// Currently only supports "items.2.obj.key" -style string paths
function getPath(key) {
  return typeof key == 'string' ? key.split('.') : [ String(key) ]
}

function opSet(Y, key, val) {
  Y.setIn(getPath(key), val)

  console.log(`Set YAML <${key}> to: ${val}`)
}

function opUnset(Y, key) {
  Y.deleteIn(getPath(key))

  console.log(`Removed YAML <${key}>`)
}
