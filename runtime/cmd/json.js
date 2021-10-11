import dispatch from '../dispatch.js'
import { cmdarg, isJSON, isJSONContext } from '../util.js'

import { get as _get } from 'https://cdn.skypack.dev/lodash-es';

export default async function cmdJson(cmd, rest, context) {
  const path = cmdarg(cmd).replace(/^\./,'')

  let json
  if (context) {
    json = await isJSONContext(context)
    if (!json) {
      console.log('Invalid JSON context: ', context)
    }
    const res = { out: _get(json, path) }

    console.log(':: '+path, res.out)
    return await dispatch(rest, res)
  }

  const contents = await dispatch(rest)
  json = isJSON(contents.out)

  if (!json) {
    console.log('Command '+cmd+' expected JSON content, but got: ', contents)
    return ''
  }

  const res = { out: _get(json, path) }
  console.log(':: '+path, res.out)
  return res
}
