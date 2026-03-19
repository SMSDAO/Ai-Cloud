import * as httpserver from "../../../utils/httpserver"
import * as integration from "../../../utils/integration"

describe("health", () => {
  let codeServer: httpserver.HttpServer | undefined

  afterEach(async () => {
    if (codeServer) {
      await codeServer.dispose()
      codeServer = undefined
    }
  })

  it("/healthz", async () => {
    codeServer = await integration.setup(["--auth=none"], "")
    const resp = await codeServer.fetch("/healthz")
    expect(resp.status).toBe(200)
    const json = await resp.json()
    expect(json).toStrictEqual({ lastHeartbeat: 0, status: "expired" })
  })

  it("/healthz (websocket)", async () => {
    codeServer = await integration.setup(["--auth=none"], "")
    const ws = codeServer.ws("/healthz")
    const message = await new Promise((resolve, reject) => {
      ws.on("error", (err) => {
        console.error("[healthz]", err)
      })
      ws.on("message", (message) => {
        try {
          const j = JSON.parse(message.toString())
          resolve(j)
        } catch (error) {
          reject(error)
        }
      })
      ws.on("open", () => ws.send(JSON.stringify({ event: "health" })))
    })
    ws.terminate()
    expect(message).toStrictEqual({ event: "health", status: "expired", lastHeartbeat: 0 })
  })

  it("/api/health", async () => {
    codeServer = await integration.setup(["--auth=none"], "")
    const before = Date.now()
    const resp = await codeServer.fetch("/api/health")
    const after = Date.now()
    expect(resp.status).toBe(200)
    const json = (await resp.json()) as { status: string; uptime: number; timestamp: number }
    expect(json.status).toBe("ok")
    expect(typeof json.uptime).toBe("number")
    expect(json.uptime).toBeGreaterThan(0)
    expect(json.timestamp).toBeGreaterThanOrEqual(before)
    expect(json.timestamp).toBeLessThanOrEqual(after)
  })
})
