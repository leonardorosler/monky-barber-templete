import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { api, storage } from '@/services/api'
import type {
  AuthResponse,
  CadastroInput,
  LoginInput,
  Papel,
  UsuarioResumido,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  usuario: UsuarioResumido | null
  isAutenticado: boolean
  isCarregando: boolean
  papel: Papel | null
  login: (dados: LoginInput) => Promise<void>
  cadastro: (dados: CadastroInput) => Promise<void>
  logout: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Contexto
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario]       = useState<UsuarioResumido | null>(null)
  const [isCarregando, setIsCarregando] = useState(true)

  // ── Restaura sessão ao montar ────────────────────────────────────────────
  useEffect(() => {
    const accessToken  = storage.getAccessToken()
    const refreshToken = storage.getRefreshToken()

    if (!accessToken || !refreshToken) {
      setIsCarregando(false)
      return
    }

    // Valida o token buscando os dados do usuário autenticado
    api
      .get<UsuarioResumido>('/auth/me')
      .then(({ data }) => setUsuario(data))
      .catch(() => {
        // Token expirado/inválido — interceptor já tentou refresh;
        // se chegou aqui é porque falhou → limpa e começa sem sessão
        storage.clear()
      })
      .finally(() => setIsCarregando(false))
  }, [])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (dados: LoginInput) => {
    const { data } = await api.post<AuthResponse>('/auth/login', dados)
    storage.setTokens(data.accessToken, data.refreshToken)
    setUsuario(data.usuario)
  }, [])

  // ── Cadastro ─────────────────────────────────────────────────────────────
  const cadastro = useCallback(async (dados: CadastroInput) => {
    const { data } = await api.post<AuthResponse>('/auth/cadastro', dados)
    storage.setTokens(data.accessToken, data.refreshToken)
    setUsuario(data.usuario)
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // Fire-and-forget — invalida o refresh token no servidor
    api.post('/auth/logout').catch(() => null)
    storage.clear()
    setUsuario(null)
    window.location.href = '/login'
  }, [])

  // ── Loading inicial ───────────────────────────────────────────────────────
  if (isCarregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-950">
        <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAutenticado: !!usuario,
        isCarregando,
        papel: usuario?.papel ?? null,
        login,
        cadastro,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return ctx
}
