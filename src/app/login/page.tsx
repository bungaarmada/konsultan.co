import Link from "next/link";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoLoginAction, loginAction } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-primary">
          <HardHat className="h-6 w-6 text-accent" />
          <span className="font-heading text-2xl">Konsultan.co</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use a demo account or your seeded credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error === "invalid" ? (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">Invalid email or password.</p>
            ) : null}
            {error === "config" ? (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Firebase is not configured. Copy <code>.env.example</code> to <code>.env</code> and add your project keys.
              </p>
            ) : null}
            {error === "seed" ? (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Demo accounts are missing. Run <code>npm run db:seed</code> after configuring Firebase.
              </p>
            ) : null}
            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required defaultValue="ahmad@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required defaultValue="demo123" />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <form action={demoLoginAction.bind(null, "HOMEOWNER")}>
                <Button type="submit" variant="outline" className="w-full">
                  Homeowner demo
                </Button>
              </form>
              <form action={demoLoginAction.bind(null, "CONSULTANT")}>
                <Button type="submit" variant="outline" className="w-full">
                  Consultant demo
                </Button>
              </form>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              ahmad@example.com · admin@konsultan.co · password demo123
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
