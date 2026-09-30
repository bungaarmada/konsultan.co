"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createClientAction, type CreateClientState } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function ClientRegisterForm() {
  const [state, action, pending] = useActionState(createClientAction, null as CreateClientState);
  const [password, setPassword] = useState("");

  if (state?.created) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
        <div>
          <p className="font-medium">Client registered</p>
          <p className="mt-1 text-sm text-emerald-800">
            Copy these credentials now and give them to the homeowner. The password is not stored
            here and will not be shown again.
          </p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-emerald-800">Name</dt>
            <dd className="mt-1 font-medium">{state.created.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-emerald-800">Email</dt>
            <dd className="mt-1 font-medium">{state.created.email}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-emerald-800">Password</dt>
            <dd className="mt-1 rounded-md bg-white px-3 py-2 font-mono text-base">{state.created.password}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/consultant/projects/new?client=${state.created.id}`}>
              Create project for this client
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/consultant/clients/${state.created.id}`}>View client</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={() => window.location.assign("/consultant/clients")}>
            Register another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {state?.error ? (
        <p className="sm:col-span-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">{state.error}</p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required placeholder="Name as on geran" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="client@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" placeholder="+60 12-345 6789" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Portal password</Label>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => setPassword(generatePassword())}
          >
            Generate
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type="text"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="At least 6 characters"
        />
        <p className="text-xs text-muted-foreground">
          Give this password to the client with their email so they can sign in at the homeowner portal.
        </p>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save client"}
        </Button>
      </div>
    </form>
  );
}
