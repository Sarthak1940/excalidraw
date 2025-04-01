"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Label } from "@repo/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/card"
import axios from "axios"
import { BACKEND_URL } from "@/app/config"

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

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/${isSignIn ? "login" : "signup"}`, {
        email,
        password, 
        name: isSignIn ? null : name
      }, {withCredentials: true});

      if (response.status === 201) {
        router.push("/dashboard");
        localStorage.setItem("userId", response.data.user.id);
      }

      setIsLoading(false);
    } catch(e) {
      console.log(e);
      setIsLoading(false);
    }
    
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1b] p-4">
      <Card className="w-full max-w-md bg-white text-black shadow-lg rounded-lg p-12">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
           {!isSignIn && <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" 
              placeholder="Enter your name" 
              required 
              disabled={isLoading}
              className="p-2" 
              onChange={(e) => setName(e.target.value)}
              value={name}/>
            </div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" 
              placeholder="Enter your email" 
              type="email" 
              required 
              disabled={isLoading} 
              className="p-2"
              onChange={e => setEmail(e.target.value)}
              value={email}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="p-2"
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
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {!isSignIn && <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-900 rounded-md cursor-pointer flex items-center" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignIn ? "Sign in" : "Sign up"}
            </Button>
            <p className="text-sm text-center text-gray-500">
              {isSignIn ? "Don't have an account! ": "Already have an account! "}
              <Link href={isSignIn ? "/signup": "signin"} className="underline underline-offset-4 hover:text-black">
                {isSignIn ? "Sign up": "Sign in"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

