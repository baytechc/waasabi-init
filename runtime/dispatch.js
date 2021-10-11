import cmdRun from './cmd/run.js';
import cmdSetenv from './cmd/setenv.js';
import cmdGrepfile from './cmd/grepfile.js';
import cmdJson from './cmd/json.js';
import cmdHttp from './cmd/http.js';
import cmdHttps from './cmd/https.js';
import cmdAs from './cmd/as.js';
import cmdDir from './cmd/dir.js';
import cmdWritefile from './cmd/writefile.js';
import cmdYaml from './cmd/yaml.js';
import cmdPipe from './cmd/pipe.js';
import cmdExtract from './cmd/extract.js';
import cmdOspkg from './cmd/ospkg.js';
import cmdCreateuser from './cmd/createuser.js';
import cmdEnsuredir from './cmd/ensuredir.js';


export default async function dispatch(run, context) {
  if (Deno.args.includes('--verbose')) $debug('~ ', run, context)
  
  const [ cmd, ...rest ] = run

  if (typeof cmd != 'string') {
    console.error('Unrecognized dispatch format: ', run)
    return
  }
  
  if (cmd.startsWith('@setenv:')) {
    return await cmdSetenv(cmd, rest, context)
  }
  if (cmd.startsWith('@grepfile:')) {
    return await cmdGrepfile(cmd, rest, context)
  }
  if (cmd.startsWith('@http:')) {
    return await cmdHttp(cmd, rest, context)
  }
  if (cmd.startsWith('@https:')) {
    return await cmdHttps(cmd, rest, context)
  }
  if (cmd.startsWith('@json')) {
    return await cmdJson(cmd, rest, context)
  }
  if (cmd.startsWith('@as')) {
    return await cmdAs(cmd, rest, context)
  }
  if (cmd.startsWith('@dir')) {
    return await cmdDir(cmd, rest, context)
  }
  if (cmd.startsWith('@writefile')) {
    return await cmdWritefile(cmd, rest, context)
  }
  if (cmd.startsWith('@yaml')) {
    return await cmdYaml(cmd, rest, context)
  }
  if (cmd.startsWith('@pipe')) {
    return await cmdPipe(cmd, rest, context)
  }
  if (cmd.startsWith('@extract')) {
    return await cmdExtract(cmd, rest, context)
  }
  if (cmd.startsWith('@ospkg')) {
    return await cmdOspkg(cmd, rest, context)
  }
  if (cmd.startsWith('@createuser')) {
    return await cmdCreateuser(cmd, rest, context)
  }
  if (cmd.startsWith('@ensuredir')) {
    return await cmdEnsuredir(cmd, rest, context)
  }

  if (cmd.startsWith('@')) {
    console.log('Warning: unimplemented command: ', cmd)
    return
  }

  return await cmdRun(run, context)
}
