import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, Building2 } from "lucide-react"

const pendingVenues = [
  { id: "v1", name: "Padel Studio Menteng", owner: "Budi Santoso", city: "Jakarta Pusat", submittedAt: "2 hari lalu" },
  { id: "v2", name: "Padel Point Gading", owner: "Sari Dewi", city: "Jakarta Utara", submittedAt: "1 hari lalu" },
]

const approvedVenues = [
  { id: "v3", name: "Padel House Kemang", owner: "Ari Wibowo", city: "Jakarta Selatan", bookings: 45 },
  { id: "v4", name: "Arena Padel BSD", owner: "Dian Permata", city: "BSD", bookings: 28 },
]

export default function AdminPage() {
  return (
    <div className="space-y-6 pt-4 pb-8">
      <h1 className="text-h1 font-display text-ink">Panel Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-h2 font-bold font-mono text-ink">{pendingVenues.length}</p>
            <p className="text-caption text-ink-muted">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-h2 font-bold font-mono text-ink">{approvedVenues.length + pendingVenues.length}</p>
            <p className="text-caption text-ink-muted">Total Venue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-h2 font-bold font-mono text-ink">73</p>
            <p className="text-caption text-ink-muted">Booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending approvals */}
      <div>
        <h2 className="text-h2 font-display text-ink mb-3">Persetujuan Venue Baru</h2>
        {pendingVenues.length === 0 ? (
          <div className="text-center py-8 text-ink-muted">
            <Building2 className="w-12 h-12 mx-auto mb-2 text-border" />
            <p className="text-body">Tidak ada venue yang perlu disetujui.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingVenues.map((venue) => (
              <Card key={venue.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-body font-semibold text-ink">{venue.name}</h3>
                      <p className="text-caption text-ink-muted">
                        {venue.owner} · {venue.city} · {venue.submittedAt}
                      </p>
                    </div>
                    <Badge variant="urgent">Pending</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1">
                      <X className="w-4 h-4 mr-1" />
                      Tolak
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1">
                      <Check className="w-4 h-4 mr-1" />
                      Setujui
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved venues */}
      <div>
        <h2 className="text-h2 font-display text-ink mb-3">Venue Terverifikasi</h2>
        <div className="space-y-2">
          {approvedVenues.map((venue) => (
            <div key={venue.id} className="bg-surface rounded-control p-3 flex items-center justify-between">
              <div>
                <p className="text-body font-medium text-ink">{venue.name}</p>
                <p className="text-caption text-ink-muted">{venue.city} · {venue.bookings} booking</p>
              </div>
              <Badge variant="success">Aktif</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
