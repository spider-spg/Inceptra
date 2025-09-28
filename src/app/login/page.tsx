"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Globe, User, GraduationCap, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import { useEffect } from 'react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('entrepreneur')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  const { user, login, signUp, loginWithGoogle, resetPassword } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(`/${user.role}`)
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Login
        const result = await login(email, password)
        if (result.success) {
          // User will be redirected by the useEffect when user state updates
        } else {
          setError(result.error || 'Login failed')
        }
      } else {
        // Sign up
        const displayName = name.trim() || email.split('@')[0] // Use provided name or extract from email
        const result = await signUp(email, password, displayName, selectedRole)
        if (result.success) {
          // User will be redirected by the useEffect when user state updates
        } else {
          setError(result.error || 'Sign up failed')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await loginWithGoogle(selectedRole)
      if (result.success) {
        // User will be redirected by the useEffect when user state updates
      } else {
        setError(result.error || 'Google sign in failed')
      }
    } catch (err) {
      setError('Google sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResetMessage('')

    try {
      const result = await resetPassword(resetEmail)
      if (result.success) {
        setResetMessage('Password reset email sent! Check your inbox.')
        setShowResetPassword(false)
        setResetEmail('')
      } else {
        setError(result.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const roles = [
    {
      id: 'entrepreneur' as UserRole,
      name: 'Entrepreneur',
      icon: User,
      description: 'Submit and develop your business ideas',
      color: 'entrepreneur-gradient'
    },
    {
      id: 'mentor' as UserRole,
      name: 'Mentor',
      icon: GraduationCap,
      description: 'Guide and review business proposals',
      color: 'mentor-gradient'
    },
    {
      id: 'admin' as UserRole,
      name: 'Tata STRIVE Admin',
      icon: Building2,
      description: 'Manage platform and analytics',
      color: 'admin-gradient'
    }
  ]

  if (user) {
    return null // Prevent flash while redirecting
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/10 to-purple-500/10 dark:from-transparent dark:via-blue-400/10 dark:to-purple-400/10" />
      
      {/* Floating shapes for visual appeal */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-500" />
      
      <div className="relative z-10 w-full max-w-md">
      {/* Theme and Language Toggle */}
      <div className="absolute -top-16 right-0 flex items-center gap-2 z-20">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="backdrop-blur-sm bg-card/95 border border-border/50">
          <Globe className="h-4 w-4" />
        </Button>
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-card/95 border border-border/50 shadow-2xl shadow-black/10 dark:shadow-black/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">UA</span>
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Unfair Advantage</CardTitle>
          <CardDescription className="text-base">Tata STRIVE Entrepreneurship Platform</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex mb-6 p-1 bg-muted rounded-lg">
            <Button
              variant={isLogin ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setIsLogin(false)}
            >
              Signup
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select your role:</label>
              <div className="grid gap-2">
                {roles.map((role) => {
                  const Icon = role.icon
                  return (
                    <Button
                      key={role.id}
                      type="button"
                      variant={selectedRole === role.id ? "default" : "outline"}
                      className={`h-auto p-3 justify-start ${
                        selectedRole === role.id ? role.color : ''
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{role.name}</div>
                        <div className="text-xs opacity-80">{role.description}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}

            {resetMessage && (
              <div className="text-sm text-green-600 text-center">
                {resetMessage}
              </div>
            )}

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-primary underline"
                  onClick={() => setShowResetPassword(true)}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              variant={selectedRole as any}
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="grid gap-4 py-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetPassword(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !resetEmail}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}