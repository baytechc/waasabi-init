import { Server } from "https://deno.land/std@0.110.0/http/server.ts";
import { delay } from "https://deno.land/std@0.110.0/async/delay.ts";

const encoder = new TextEncoder();
function encode(input) { return encoder.encode(input); }

const head = `<!DOCTYPE html><html>
<head>
  <meta charset="utf-8">
  <title>Waasabi Installer</title>
</head>
<body style="padding-bottom:1em">
<script>
new ResizeObserver(
  () => document.documentElement.scrollTo(0,document.documentElement.scrollTopMax)
).observe(document.body)
</script>
<pre><code>
`

let content = [ head ]
export function msg(str) {
  content.push(str)
  return str
}

let finished = false
export function finish() {
  finished = true
}

let server
export async function start(port = 65432) {
  server = new Server({
    addr: `:${port}`,
    handler: requestHandler
  });

  await server.listenAndServe();
}

export function end() {
  server.close()
  content = [ head ]
}

function requestHandler(req) {
  // Send data from start
  let contentPtr = 0

  const stream = new ReadableStream({
    start() {
    },
    async pull(controller) {
      // Unsent content
      if (contentPtr < content.length) {
        const chunk = content.slice(contentPtr).join('')
        controller.enqueue(encode(chunk))
        contentPtr = content.length
  
        return
      }

      // Finished, all log messages sent
      if (finished) {
        return controller.close();
      }

      // No updates, wait a short while
      await delay(700);
    },
    cancel() {
    }
  })

  return new Response(stream, {
    status: 200,
    statusText: 'OK',
    headers: new Headers({
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    })
  });
}
