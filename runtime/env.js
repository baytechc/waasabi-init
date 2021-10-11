// Automagically provide all of Deno.env through the prototype
const ENV = Object.create(Deno.env, {})
export default ENV

export function setenv(key, value) {
  return ENV[key] = value
}

export function expand(text) {
  return text.replace(/(?<!\$)\$\w+/g, (k) => {
    const key = k.substr(1)
    const val = ENV[key]
    if (val === undefined) {
      console.log('Warning key value not found: ', k)
      return k
    } else {
      $debug(text, ' ==> ', val)
      return val
    }
  })
}
