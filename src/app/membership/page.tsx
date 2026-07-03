import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Check } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "Gratis",
    features: ["Cari & booking venue", "Riwayat booking", "Rating & review"],
    isPopular: false,
  },
  {
    name: "Pro",
    price: "Rp49.000",
    period: "/bulan",
    features: ["Semua fitur Basic", "Diskon 10% per booking", "Prioritas booking slot", "Notifikasi reminder"],
    isPopular: true,
  },
]

export default function MembershipPage() {
  return (
    <div className="space-y-6 pt-4 pb-8">
      <div className="text-center">
        <Crown className="w-12 h-12 text-brand mx-auto mb-3" />
        <h1 className="text-h1 font-display text-ink">Membership</h1>
        <p className="text-body text-ink-muted mt-1">
          Nikmati diskon & fitur eksklusif
        </p>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.isPopular ? "ring-2 ring-brand" : ""}>
            <CardContent className="p-5 space-y-4">
              {plan.isPopular && (
                <Badge variant="brand" className="self-start">Terpopuler</Badge>
              )}
              <div>
                <h3 className="text-h2 font-display text-ink">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-display-detail font-display font-bold text-ink">{plan.price}</span>
                  {plan.period && <span className="text-body text-ink-muted">{plan.period}</span>}
                </div>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-body text-ink-muted">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.isPopular ? "primary" : "secondary"}
                className="w-full"
              >
                {plan.price === "Gratis" ? "Pakai Gratis" : "Langganan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
