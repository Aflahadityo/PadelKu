import { ZodError } from "zod"

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type DatabaseError = {
  code?: string
}

export function databaseErrorStatus(error: unknown): 400 | 403 | 404 | 409 | 500 {
  const code = typeof error === "object" && error !== null
    ? (error as DatabaseError).code
    : undefined

  if (code === "P0002") return 404
  if (["P0001", "23505", "40001", "55P03"].includes(code ?? "")) return 409
  if (code === "42501") return 403
  if (["22023", "22P02", "23514"].includes(code ?? "")) return 400
  return 500
}

export function throwDatabaseError(error: unknown, resource = "Permintaan"):
  never {
  const status = databaseErrorStatus(error)
  const messages = {
    400: `${resource} tidak valid.`,
    403: `Tidak berwenang memproses ${resource.toLocaleLowerCase("id-ID")}.`,
    404: `${resource} tidak ditemukan.`,
    409: `${resource} tidak dapat diproses karena konflik.`,
    500: `${resource} gagal diproses.`,
  } as const
  const codes = {
    400: "INVALID_REQUEST",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    500: "INTERNAL_ERROR",
  } as const

  throw new ApiError(status, codes[status], messages[status])
}

export function errorResponse(error: unknown, fallback = "Permintaan gagal diproses.") {
  if (error instanceof ApiError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    )
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: "Data permintaan tidak valid.",
          fields: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 },
    )
  }

  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: fallback } },
    { status: 500 },
  )
}

export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Body harus berupa JSON yang valid.")
  }
}
