import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const schema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;
type Role = "ATTENDEE" | "ORGANISER";

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("ATTENDEE");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await register(values.email, values.password, values.name, role);
      toast.success("Account created! Welcome to EventFlow.");
      navigate("/events", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <CalendarDays className="size-8 text-primary" />
          <h1 className="text-2xl font-bold">EventFlow</h1>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>I want to…</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Role picker */}
            <div className="grid grid-cols-2 gap-2">
              {(["ATTENDEE", "ORGANISER"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-lg border-2 p-3 text-left transition-colors",
                    role === r
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50",
                  )}
                >
                  <p className="font-medium text-sm">
                    {r === "ATTENDEE" ? "Attend events" : "Organise events"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r === "ATTENDEE"
                      ? "Browse, register & get tickets"
                      : "Create & manage your own events"}
                  </p>
                </button>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Create account as {role === "ATTENDEE" ? "Attendee" : "Organiser"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="ml-1 font-medium text-primary hover:underline">
              Log in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
