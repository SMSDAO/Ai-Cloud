import { getMockReq, getMockRes } from "@jest-mock/express"
import { AuthType } from "../../../../src/node/cli"
import { requireRole } from "../../../../src/node/middleware/rbac"
import * as nodeHttp from "../../../../src/node/http"

jest.mock("../../../../src/node/http", () => ({
  ...jest.requireActual("../../../../src/node/http"),
  authenticated: jest.fn(),
}))

const mockedAuthenticated = nodeHttp.authenticated as jest.MockedFunction<typeof nodeHttp.authenticated>

function makeReq(authType: AuthType = AuthType.Password) {
  return getMockReq({
    args: { auth: authType, "proxy-domain": [] },
    cookies: {},
    cookieSessionName: "session",
    heart: {} as never,
    settings: {} as never,
    updater: {} as never,
  })
}

describe("requireRole middleware", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("role: user", () => {
    it("calls next for an unauthenticated request", async () => {
      mockedAuthenticated.mockResolvedValue(false)
      const req = makeReq()
      const { res, next } = getMockRes()

      await requireRole("user")(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(res.status).not.toHaveBeenCalled()
    })

    it("calls next for an authenticated request", async () => {
      mockedAuthenticated.mockResolvedValue(true)
      const req = makeReq()
      const { res, next } = getMockRes()

      await requireRole("user")(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(res.status).not.toHaveBeenCalled()
    })
  })

  describe("role: developer", () => {
    it("calls next when the user is authenticated", async () => {
      mockedAuthenticated.mockResolvedValue(true)
      const req = makeReq()
      const { res, next } = getMockRes()

      await requireRole("developer")(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(res.status).not.toHaveBeenCalled()
    })

    it("responds 403 when the user is not authenticated", async () => {
      mockedAuthenticated.mockResolvedValue(false)
      const req = makeReq()
      const { res, next } = getMockRes()

      await requireRole("developer")(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
    })
  })

  describe("role: admin", () => {
    it("calls next when the user is authenticated", async () => {
      mockedAuthenticated.mockResolvedValue(true)
      const req = makeReq()
      const { res, next } = getMockRes()

      await requireRole("admin")(req, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(res.status).not.toHaveBeenCalled()
    })

    it("responds 403 when the user is not authenticated", async () => {
      mockedAuthenticated.mockResolvedValue(false)
      const req = makeReq()
      const { res, next } = getMockRes()

      await requireRole("admin")(req, res, next)

      expect(next).not.toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(403)
    })
  })
})

