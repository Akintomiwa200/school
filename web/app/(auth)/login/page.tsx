import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-xl">
      <Card variant="auth" className="relative z-10 w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-display-md normal-case">Welcome back</CardTitle>
          <CardDescription>Sign in to your School LMS account</CardDescription>
        </CardHeader>
        <form className="space-y-md px-6 pb-6">
          <div className="space-y-xs">
            <label htmlFor="email" className="type-link-sm text-muted-foreground">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@school.com" />
          </div>
          <div className="space-y-xs">
            <label htmlFor="password" className="type-link-sm text-muted-foreground">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" variant="green">
            Sign In
          </Button>
          <p className="text-center type-link-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="text-hyperlink hover:underline">
              Register
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
