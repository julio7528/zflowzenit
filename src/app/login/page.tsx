'use client'

import { Logo } from '@/components/app/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Only redirect if auth is not loading and user exists
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Verifique seu email para confirmar a conta!')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // Verify the session was created successfully
        if (data.session) {
          console.log('Login successful, session created')
          // Use replace instead of push to prevent back button issues
          // Also use a small delay to ensure cookies are set
          await new Promise(resolve => setTimeout(resolve, 100))
          router.replace('/dashboard')
          return
        }
      }
    } catch (error: any) {
      // Check if it's a refresh token related error message
      if (error.message?.includes('Invalid Refresh Token') || error.message?.includes('Refresh Token Not Found')) {
        // Clear any stored session data that might be causing the issue
        await supabase.auth.signOut()
        alert('Sessão expirada. Por favor, faça login novamente.')
      } else {
        alert(error.message || 'Erro ao fazer login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F0F8FF] to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#features" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
              Funcionalidades
            </Link>
            <Link href="/#courses" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
              Cursos
            </Link>
            <Link href="/#open-source" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
              Open Source
            </Link>
            <Button asChild variant="outline">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-[#7EC4CF] hover:bg-[#66A5AD]">
              <Link href="/login">Começar Gratuitamente</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Criar Conta' : 'Entrar no FlowZenit'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isSignUp 
                ? 'Crie sua conta para começar a organizar suas demandas'
                : 'Entre com suas credenciais para acessar o sistema'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#7EC4CF] hover:bg-[#66A5AD]" 
                disabled={loading}
              >
                {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
              </Button>
            </form>
            <div className="mt-4 text-center flex flex-col gap-2">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-[#66A5AD] hover:text-[#7EC4CF]"
              >
                {isSignUp 
                  ? 'Já tem uma conta? Faça login'
                  : 'Não tem uma conta? Cadastre-se'
                }
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Problemas com login? Resetar App
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo />
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma open source para gestão de produtividade baseada em metodologias comprovadas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/#features" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors">Documentação</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Aprender</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/#courses" className="hover:text-white transition-colors">Cursos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Comunidade</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Código</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contribuir</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Licença MIT</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FlowZenit. Licenciado sob MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}