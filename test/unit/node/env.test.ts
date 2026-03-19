import { validateEnv } from "../../../src/node/env"

describe("validateEnv", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("passes with no env vars set", () => {
    delete process.env.PORT
    delete process.env.NODE_ENV
    delete process.env.PASSWORD
    expect(() => validateEnv()).not.toThrow()
  })

  it("passes with valid PORT", () => {
    process.env.PORT = "8080"
    expect(() => validateEnv()).not.toThrow()
  })

  it("passes with valid NODE_ENV", () => {
    process.env.NODE_ENV = "production"
    expect(() => validateEnv()).not.toThrow()
  })

  it("passes with valid PASSWORD", () => {
    process.env.PASSWORD = "supersecret"
    expect(() => validateEnv()).not.toThrow()
  })

  it("exits on non-numeric PORT", () => {
    process.env.PORT = "not-a-port"
    const mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`)
    })
    expect(() => validateEnv()).toThrow("process.exit: 1")
    mockExit.mockRestore()
  })

  it("exits on out-of-range PORT", () => {
    process.env.PORT = "99999"
    const mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`)
    })
    expect(() => validateEnv()).toThrow("process.exit: 1")
    mockExit.mockRestore()
  })

  it("exits on PASSWORD shorter than 8 characters", () => {
    process.env.PASSWORD = "short"
    const mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`)
    })
    expect(() => validateEnv()).toThrow("process.exit: 1")
    mockExit.mockRestore()
  })

  it("exits on invalid NODE_ENV", () => {
    process.env.NODE_ENV = "staging"
    const mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`)
    })
    expect(() => validateEnv()).toThrow("process.exit: 1")
    mockExit.mockRestore()
  })
})
