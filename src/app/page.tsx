import Link from "next/link";
import { ArrowRight, Compass, FileCheck2, HardHat, MapPinned, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { title: "Submit documents", body: "Geran tanah, IC, and pelan tapak in one intake." },
  { title: "Quotation & lantikan", body: "Review fees and acknowledge your appointment letter." },
  { title: "Endorsement pipeline", body: "Track Arkitek, C&S, Majlis, and PPSA with live badges." },
  { title: "Match contractors", body: "Certified builders within 20 km of your site coordinates." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <HardHat className="h-6 w-6 text-accent" />
          <span className="font-heading text-xl">Konsultan.co</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Open portal</Link>
          </Button>
        </div>
      </header>

      <section className="blueprint-grid border-y border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              House construction consultancy
            </p>
            <h1 className="font-heading mt-4 text-4xl leading-tight text-primary md:text-5xl">
              From geran to ground-breaking, with every endorsement in view.
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Konsultan.co is the working desk between homeowners and consultants — document
              intake, quotation, Arkitek / C&S / Majlis / PPSA tracking, then certified contractors
              inside a 20 km radius.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Enter as homeowner
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Consultant desk</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-primary">Live pipeline</p>
            <ul className="mt-4 space-y-3">
              {[
                ["Submission", "Complete"],
                ["Consultant review", "Quotation issued"],
                ["Arkitek", "Approved"],
                ["C&S", "In progress"],
                ["Majlis", "Pending"],
                ["PPSA", "Pending"],
              ].map(([label, status]) => (
                <li key={label} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm">
                  <span>{label}</span>
                  <span className="text-xs text-muted-foreground">{status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-xl border border-border bg-card p-5">
            <p className="font-heading text-3xl text-accent/80">0{index + 1}</p>
            <h2 className="mt-3 font-heading text-lg">{step.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
          <div className="flex gap-3">
            <FileCheck2 className="h-5 w-5 text-accent" />
            <div>
              <p className="font-medium">Role-based portals</p>
              <p className="mt-1 text-sm text-primary-foreground/70">Homeowner and consultant desks, isolated by RBAC.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <div>
              <p className="font-medium">Endorsement trail</p>
              <p className="mt-1 text-sm text-primary-foreground/70">PENDING, IN_PROGRESS, REVISION_NEEDED, APPROVED.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPinned className="h-5 w-5 text-accent" />
            <div>
              <p className="font-medium">Haversine matching</p>
              <p className="mt-1 text-sm text-primary-foreground/70">Contractors filtered to 20 km of the project pin.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Compass className="h-4 w-4" />
          Konsultan.co
        </span>
        <span>Demo accounts on the sign-in page</span>
      </footer>
    </div>
  );
}
