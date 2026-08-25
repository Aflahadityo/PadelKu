export type DashboardRole = "ADMIN" | "VENUE_OWNER"

export type ActionState = {
  fieldErrors?: Record<string, string[]>
  message: string
  status: "idle" | "error" | "success" | "warning"
}

export const initialActionState: ActionState = {
  message: "",
  status: "idle",
}
