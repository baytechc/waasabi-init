import dispatch from '../dispatch.js'
import { expand } from '../env.js'
import { u8str, isJSON } from '../util.js'

export default async function cmdHttp(cmd, rest, context = {}) {
  // URL starts with the protocol identifier actually (strip the @ only)
  const url = expand(cmd.substr(1))

  // Look for a request config object
  let config = isJSON(rest[0])

  // Found custom request configuration options 
  if (typeof config == 'object' && Object.keys(config).length) {
    $debug('HTTP:', config)
    rest.shift()
  } else {
    $debug('GET: '+url)
    config = {}
  }


  let fetchopts
  if ('data' in config) {
    const data = new URLSearchParams
    const dataEntries = Object.entries(isJSON(config.data))
    if(!dataEntries) {
      console.log('Failed to get entries from: ', config.data)
    }

    dataEntries.forEach(([k,v]) => data.append(k,expand(v)))

    const method = 'POST'
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    const body = data.toString()
    console.log('@http:', { method, headers, body })

    fetchopts = { method, headers, body }

  } else if ('jsondata' in config) {
    const data = typeof config.jsondata == 'object' ? JSON.stringify(config.jsondata) : config.jsondata

    const method = config.method ?? 'POST'
    const headers = isJSON(data) ? { 'Content-Type': 'application/json' } : {}
    const body = expand(data)

    fetchopts = { method, headers, body }

  // Formdata request
  } else if ('formdata' in config) {
    const data = new FormData
    const formEntries = Object.entries(isJSON(config.formdata))
    if(!formEntries) {
      console.log('Failed to generate FormData from: ', config.formdata)
    }
    formEntries.forEach(([k,v]) => data.append(k,expand(v)))
    console.log(data)

    const method = 'POST'
    const headers = { 'Content-Type': 'multipart/form-data' }
    const body = data

    fetchopts = { method, headers, body }

  }
  
  // Only when it's not a dry run
  let res
  if (!$isDryRun()) {
    res = await fetch(url, fetchopts)
    console.log('Status: ', res?.status ?? '?', res?.statusText ?? '')
    
  } else {
    console.log('Status: (dry-run)')
    
  }
  

  // TODO: inbound pipes
  // if (context) {}

  // Outgoing pipe
  if (rest?.length) {
    context.pipe = res?.body

    if ($isDryRun()) {
      // mock empty pipe
      context.pipe = new ReadableStream()
    }

    context.pipefile = new URL(url).pathname

    return dispatch(rest, context)
  }

  const raw = await res?.arrayBuffer()
  const out = u8str(raw)

  return ({ raw, out })
}
