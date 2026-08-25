"use client"

import { useActionState, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Check, LoaderCircle, LockKeyhole, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  forgotPasswordAction,
  initialAuthState,
  loginAction,
  registerAction,
  resetPasswordAction,
  type AuthActionState,
} from "./actions"

type FormKind = "login" | "register" | "forgot" | "reset"

const actions: Record<
  FormKind,
  (state: AuthActionState, formData: FormData) => Promise<AuthActionState>
> = {
  login: loginAction,
  register: registerAction,
  forgot: forgotPasswordAction,
  reset: resetPasswordAction,
}

function FieldError({ state, name }: { state: AuthActionState; name: string }) {
  const errors = state.fieldErrors?.[name]
  if (!errors?.length) return null
  return (
    <p id={`${name}-error`} className="text-sm font-medium text-error" role="alert">
      {errors[0]}
    </p>
  )
}

function fieldA11y(state: AuthActionState, name: string) {
  const invalid = Boolean(state.fieldErrors?.[name]?.length)
  return {
    "aria-invalid": invalid,
    "aria-describedby": invalid ? `${name}-error` : undefined,
  }
}

export function AuthForm({
  kind,
  next,
  initialMessage,
  initialStatus = "success",
  showDemo = false,
}: {
  kind: FormKind
  next?: string
  initialMessage?: string
  initialStatus?: "error" | "success"
  showDemo?: boolean
}) {
  const [state, formAction, pending] = useActionState(actions[kind], {
    ...initialAuthState,
    ...(initialMessage ? { status: initialStatus, message: initialMessage } : {}),
  })
  const formRef = useRef<HTMLFormElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const isRegister = kind === "register"
  const isLogin = kind === "login"
  const isForgot = kind === "forgot"
  const submitLabel = {
    login: "Masuk ke PadelKu",
    register: "Buat akun",
    forgot: "Kirim tautan",
    reset: "Simpan kata sandi",
  }[kind]

  function loginAsDemo(email: string) {
    if (!formRef.current || !emailRef.current || !passwordRef.current) return
    emailRef.current.value = email
    passwordRef.current.value = "PadelKuDev123!"
    formRef.current.requestSubmit()
  }

  return (
    <div className="w-full">
      <form ref={formRef} action={formAction} className="space-y-5" noValidate>
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {isRegister ? (
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama lengkap</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Nama kamu"
              disabled={pending}
              {...fieldA11y(state, "fullName")}
            />
            <FieldError state={state} name="fullName" />
          </div>
        ) : null}

        {isRegister ? (
          <fieldset className="space-y-2">
            <legend className="text-body font-medium text-ink">Saya mendaftar sebagai</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="cursor-pointer rounded-[12px] border border-border bg-surface p-3 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                <input className="peer sr-only" type="radio" name="role" value="PLAYER" defaultChecked />
                <span className="block font-semibold text-ink">Pemain</span>
                <span className="mt-0.5 block text-xs leading-5 text-ink-muted">Cari dan booking lapangan</span>
              </label>
              <label className="cursor-pointer rounded-[12px] border border-border bg-surface p-3 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                <input className="peer sr-only" type="radio" name="role" value="VENUE_OWNER" />
                <span className="block font-semibold text-ink">Mitra venue</span>
                <span className="mt-0.5 block text-xs leading-5 text-ink-muted">Kelola venue dan jadwal</span>
              </label>
            </div>
            <FieldError state={state} name="role" />
          </fieldset>
        ) : null}

        {!kind.includes("reset") ? (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="email"
                ref={emailRef}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@email.com"
                className="pl-11"
                disabled={pending}
                {...fieldA11y(state, "email")}
              />
            </div>
            <FieldError state={state} name="email" />
          </div>
        ) : null}

        {isRegister ? (
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor WhatsApp <span className="font-normal text-ink-muted">(opsional)</span></Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0812 3456 7890"
              disabled={pending}
              {...fieldA11y(state, "phone")}
            />
            <FieldError state={state} name="phone" />
          </div>
        ) : null}

        {!isForgot ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="password">{kind === "reset" ? "Kata sandi baru" : "Kata sandi"}</Label>
              {isLogin ? (
                <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:underline">
                  Lupa kata sandi?
                </Link>
              ) : null}
            </div>
            <div className="relative">
              <LockKeyhole aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete={kind === "login" ? "current-password" : "new-password"}
                placeholder={kind === "login" ? "Masukkan kata sandi" : "Minimal 8 karakter"}
                className="pl-11"
                disabled={pending}
                {...fieldA11y(state, "password")}
              />
            </div>
            <FieldError state={state} name="password" />
          </div>
        ) : null}

        {isRegister || kind === "reset" ? (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi kata sandi</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Ulangi kata sandi"
              disabled={pending}
              {...fieldA11y(state, "confirmPassword")}
            />
            <FieldError state={state} name="confirmPassword" />
          </div>
        ) : null}

        {state.message ? (
          <div
            className={`flex items-start gap-2.5 rounded-[12px] border px-4 py-3 text-sm leading-6 ${
              state.status === "success"
                ? "border-success/30 bg-success/5 text-success"
                : "border-error/30 bg-error/5 text-error"
            }`}
            role={state.status === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {state.status === "success" ? <Check className="mt-1 size-4 shrink-0" aria-hidden="true" /> : null}
            <span>{state.message}</span>
          </div>
        ) : null}

        <Button type="submit" size="lg" className="w-full gap-2" disabled={pending} aria-disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "Memproses..." : submitLabel}
          {!pending ? <ArrowRight className="size-4" aria-hidden="true" /> : null}
        </Button>
      </form>

      {showDemo && isLogin ? (
        <aside className="mt-6 border-t border-border pt-5">
          <p className="mb-3 text-sm font-semibold text-ink">Masuk cepat akun demo</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Player", "player@padelku.id"],
              ["Venue", "owner@padelku.id"],
              ["Admin", "admin@padelku.id"],
            ].map(([label, email]) => (
              <Button key={email} type="button" variant="secondary" size="sm" disabled={pending} onClick={() => loginAsDemo(email)}>
                {label}
              </Button>
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  )
}
