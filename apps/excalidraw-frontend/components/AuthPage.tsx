"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Pencil } from "lucide-react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card"
import axios from "axios"
import { BACKEND_URL } from "@/app/config"
import { toast } from "sonner"

export default function AuthPage({isSignIn}: {isSignIn: boolean}) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const router = useRouter()

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    const loadingToast = toast.loading(isSignIn ? "Signing in..." : "Creating account...")

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/${isSignIn ? "login" : "signup"}`, {
        email,
        password, 
        name: isSignIn ? null : name
      }, {withCredentials: true});

      if (response.status === 200) {
        toast.success(isSignIn ? "Welcome back!" : "Account created successfully!", {
          id: loadingToast,
        });
        localStorage.setItem("userId", response.data.user.id);
        router.push("/dashboard");
      }

      setIsLoading(false);
    } catch(error: any) {
      console.error('Authentication failed:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Authentication failed. Please try again.', {
        id: loadingToast,
      });
      setIsLoading(false);
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Logo in top left */}
      <Link href="/" className="absolute top-6 left-6 flex items-center space-x-2">
        <Pencil className="h-6 w-6 text-blue-600" />
        <span className="text-xl font-semibold text-slate-900">DrawSpace</span>
      </Link>

      <Card className="w-full max-w-md bg-white border-slate-200 shadow-lg rounded-xl p-8">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-semibold text-slate-900">
            {isSignIn ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {isSignIn 
              ? "Sign in to your account to continue" 
              : "Enter your details below to get started"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-5">
           {!isSignIn && <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                required 
                disabled={isLoading}
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500" 
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input 
                id="email" 
                placeholder="you@example.com" 
                type="email" 
                required 
                disabled={isLoading} 
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                onChange={e => setEmail(e.target.value)}
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  onChange={e => setPassword(e.target.value)}
                  value={password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
              {!isSignIn && <p className="text-xs text-slate-500">Password must be at least 6 characters long</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 text-white hover:bg-blue-700 rounded-lg cursor-pointer font-medium shadow-sm" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignIn ? "Sign in" : "Sign up"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  {isSignIn ? "Don't have an account?" : "Already have an account?"}
                </span>
              </div>
            </div>
            <Link 
              href={isSignIn ? "/signup" : "/signin"} 
              className="w-full h-11 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-slate-700"
            >
              {isSignIn ? "Create account" : "Sign in instead"}
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

