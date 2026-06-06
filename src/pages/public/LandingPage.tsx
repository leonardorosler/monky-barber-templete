import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { CalendarPlus, Clock, ChevronRight, Check, MapPin, Phone, Star } from 'lucide-react'
import { useBarbearia } from '@/contexts/BarbeariaContext'
import { api } from '@/services/api'
import { Button, SkeletonCard, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Servico, Barbeiro, Plano } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Hook reveal
// ─────────────────────────────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px', amount: threshold })
  return { ref, inView }
}

// ─────────────────────────────────────────────────────────────────────────────
// Variantes
// ─────────────────────────────────────────────────────────────────────────────

// const fadeUp = {
//   hidden:  { opacity: 0, y: 32 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
//   }),
// }

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
}


// const fadeIn = {
//   hidden:  { opacity: 0 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     transition: { duration: 0.5, delay: i * 0.08 },
//   }),
// }

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Section({ id, children, className }: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  const { ref, inView } = useReveal()
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={cn('py-20 px-4 sm:px-6', className)}
    >
      {children}
    </motion.section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, description }: {
  eyebrow: string
  title: React.ReactNode
  description?: string
}) {
  return (
    <div className="text-center mb-14 max-w-2xl mx-auto">
      <motion.span variants={fadeUp} custom={0}
        className="inline-block text-xs font-semibold font-body tracking-[0.2em] uppercase text-brand-500 mb-3">
        {eyebrow}
      </motion.span>
      <motion.h2 variants={fadeUp} custom={1}
        className="text-3xl sm:text-4xl font-display font-bold text-surface-50 leading-tight mb-4">
        {title}
      </motion.h2>
      {description && (
        <motion.p variants={fadeUp} custom={2}
          className="text-surface-400 font-body leading-relaxed">
          {description}
        </motion.p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  const { barbearia } = useBarbearia()

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {barbearia.banner ? (
        <>
          <img src={barbearia.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-950/95 via-surface-950/75 to-surface-950/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-surface-950 bg-hero-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950/20 via-transparent to-transparent" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-brand-600/8 blur-2xl pointer-events-none" />
        </div>
      )}

      <div className="absolute left-8 sm:left-16 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-brand-500/40 to-transparent hidden lg:block" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full pt-16">
        <div className="max-w-2xl">

          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px bg-brand-500" />
            <span className="text-xs font-semibold font-body tracking-[0.2em] uppercase text-brand-400">
              {barbearia.endereco ?? 'Barbearia Premium'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black text-surface-50 leading-[0.9] mb-6"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
          >
            {barbearia.nome.split(' ').map((word, i) => (
              <span key={i} className={cn('block', i % 2 !== 0 && 'text-gradient-brand')}>
                {word}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-surface-300 font-body text-lg leading-relaxed mb-10 max-w-md"
          >
            Cortes precisos, atendimento exclusivo. Reserve seu horário e
            experimente o que há de melhor em cuidados masculinos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Button variant="primary" size="lg" leftIcon={<CalendarPlus className="w-5 h-5" />}
              onClick={() => window.location.href = '/cadastro'}>
              Agendar agora
            </Button>
            <Button variant="ghost" size="lg" rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver serviços
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="flex items-center gap-8 mt-14 pt-10 border-t border-surface-800/60"
          >
            {[
              { value: '5★',  label: 'Avaliação' },
              { value: '10+', label: 'Barbeiros' },
              { value: '2k+', label: 'Clientes'  },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-display font-bold text-gradient-brand">{stat.value}</p>
                <p className="text-xs font-body text-surface-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-2xs font-body text-surface-600 uppercase tracking-widest">scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-brand-500/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Serviços
// ─────────────────────────────────────────────────────────────────────────────

function Servicos() {
  const { data, isLoading } = useQuery({
    queryKey: ['servicos-publicos'],
    queryFn:  () => api.get<Servico[]>('/servicos').then((r) => r.data),
  })

  const servicos = (data ?? []).filter((s) => s.ativo)

  return (
    <Section id="servicos" className="max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="O que oferecemos"
        title={<>Serviços feitos<br />com precisão</>}
        description="Cada detalhe importa. Escolha o serviço que combina com você e agende em segundos."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : servicos.length === 0 ? (
        <p className="text-center text-surface-500 font-body py-12">
          Nenhum serviço disponível no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicos.map((servico, i) => (
            <motion.div key={servico.id} variants={fadeUp} custom={i}
              className="group relative p-6 rounded-xl border bg-surface-900 border-surface-800 hover:border-brand-500/40 hover:shadow-brand transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-brand-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none" />
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display font-semibold text-surface-50 text-lg leading-snug">
                  {servico.nome}
                </h3>
                <span className="text-brand-400 font-display font-bold text-lg shrink-0 ml-3">
                  R$ {Number(servico.preco).toFixed(2).replace('.', ',')}
                </span>
              </div>
              {servico.descricao && (
                <p className="text-surface-400 font-body text-sm leading-relaxed mb-4 line-clamp-2">
                  {servico.descricao}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-surface-500 text-xs font-body">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{servico.duracao} min</span>
                </div>
                <Link to="/cadastro"
                  className="text-xs font-body font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                  Agendar <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Barbeiros
// ─────────────────────────────────────────────────────────────────────────────

function Barbeiros() {
  const { data, isLoading } = useQuery({
    queryKey: ['barbeiros-publicos'],
    queryFn:  () => api.get<Barbeiro[]>('/barbeiros').then((r) => r.data),
  })

  const barbeiros = (data ?? []).filter((b) => b.ativo)

  return (
    <Section id="barbeiros" className="max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="Nosso time"
        title={<>Barbeiros que<br />entendem de estilo</>}
        description="Profissionais experientes, apaixonados pelo que fazem e prontos para o seu melhor visual."
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} hasAvatar lines={1} />)}
        </div>
      ) : barbeiros.length === 0 ? (
        <p className="text-center text-surface-500 font-body py-12">
          Nenhum barbeiro disponível no momento.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {barbeiros.map((barbeiro, i) => (
            <motion.div key={barbeiro.id} variants={fadeUp} custom={i}
              className="group flex flex-col items-center text-center gap-3">
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-800 border border-surface-700 group-hover:border-brand-500/40 transition-colors duration-300">
                {barbeiro.foto ? (
                  <img src={barbeiro.foto} alt={barbeiro.usuario.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900">
                    <span className="text-4xl font-display font-bold text-brand-500/40">
                      {barbeiro.usuario.nome.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </div>
              <div>
                <p className="font-display font-semibold text-surface-100">{barbeiro.usuario.nome}</p>
                {(barbeiro.especialidades ?? []).length > 0 && (
                  <p className="text-xs font-body text-surface-500 mt-0.5">
                    {(barbeiro.especialidades ?? []).slice(0, 2).join(' · ')}
                  </p>
                )}
              </div>
              <Link to="/cadastro">
                <Badge variant="brand" dot className="cursor-pointer hover:opacity-80 transition-opacity">
                  Agendar
                </Badge>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Planos
// ─────────────────────────────────────────────────────────────────────────────

function Planos() {
  const { data, isLoading } = useQuery({
    queryKey: ['planos-publicos'],
    queryFn:  () => api.get<Plano[]>('/planos').then((r) => r.data),
  })

  const planos = (data ?? []).filter((p) => p.ativo)

  if (!isLoading && planos.length === 0) return null

  return (
    <Section id="planos" className="max-w-6xl mx-auto">
      <SectionHeader
        eyebrow="Planos mensais"
        title={<>Assine e economize<br />todo mês</>}
        description="Tenha acesso ilimitado aos melhores serviços com preço fixo. Cancele quando quiser."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {planos.map((plano, i) => {
            const destaque = i === 1 && planos.length >= 2
            return (
              <motion.div key={plano.id} variants={fadeUp} custom={i}
                className={cn(
                  'relative flex flex-col p-6 rounded-xl border transition-all duration-300',
                  destaque
                    ? 'bg-surface-900 border-brand-500/50 shadow-brand-lg scale-[1.02]'
                    : 'bg-surface-900 border-surface-800 hover:border-surface-700',
                )}
              >
                {destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-2xs font-semibold font-body bg-brand-gradient text-white tracking-wide uppercase">
                      Mais popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display font-bold text-surface-50 text-xl mb-1">{plano.nome}</h3>
                  {plano.descricao && (
                    <p className="text-surface-400 font-body text-sm">{plano.descricao}</p>
                  )}
                </div>
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-display font-black text-gradient-brand">
                      R$ {Number(plano.preco).toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-surface-500 font-body text-sm mb-1">/mês</span>
                  </div>
                </div>
                {plano.planosServicos.length > 0 && (
                  <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                    {plano.planosServicos.map((ps) => (
                      <li key={ps.servico.id} className="flex items-center gap-2.5 text-sm font-body text-surface-300">
                        <Check className={cn('w-4 h-4 shrink-0', destaque ? 'text-brand-400' : 'text-surface-500')} />
                        <span>
                          {ps.quantidade}× {ps.servico.nome}
                          <span className="text-surface-500 ml-1">({ps.servico.duracao}min)</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant={destaque ? 'primary' : 'outline'} size="md" fullWidth
                  onClick={() => window.location.href = '/cadastro'}>
                  Assinar agora
                </Button>
              </motion.div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA Banner
// ─────────────────────────────────────────────────────────────────────────────

function CtaBanner() {
  const { ref, inView } = useReveal()
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={fadeIn} className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-px">
        <div className="relative rounded-2xl bg-surface-950/90 px-8 py-12 sm:py-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-hero-pattern opacity-30 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          <motion.p variants={fadeUp} custom={0}
            className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-brand-400 mb-3">
            Reserve agora
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1}
            className="text-3xl sm:text-5xl font-display font-black text-surface-50 leading-tight mb-4">
            Seu próximo corte<br />
            <span className="text-gradient-brand">começa aqui</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2}
            className="text-surface-400 font-body mb-8 max-w-md mx-auto">
            Crie sua conta em segundos, escolha seu barbeiro e agende no melhor horário para você.
          </motion.p>
          <motion.div variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="lg" leftIcon={<CalendarPlus className="w-5 h-5" />}
              onClick={() => window.location.href = '/cadastro'}>
              Criar conta grátis
            </Button>
            <Button variant="ghost" size="lg" onClick={() => window.location.href = '/login'}>
              Já tenho conta
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Contato
// ─────────────────────────────────────────────────────────────────────────────

function Contato() {
  const { barbearia } = useBarbearia()

  const infos = [
    barbearia.endereco  && { icon: MapPin, label: 'Endereço',  value: barbearia.endereco },
    barbearia.telefone  && { icon: Phone,  label: 'Telefone',  value: barbearia.telefone },
    barbearia.instagram && { icon: Star,   label: 'Instagram', value: `@${barbearia.instagram.replace('@', '')}` },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[]

  if (infos.length === 0) return null

  return (
    <Section id="contato" className="max-w-6xl mx-auto">
      <SectionHeader eyebrow="Onde estamos" title="Venha nos visitar" />
      <div className="flex flex-wrap justify-center gap-6">
        {infos.map((info, i) => {
          const Icon = info.icon
          return (
            <motion.div key={info.label} variants={fadeUp} custom={i}
              className="flex items-center gap-4 bg-surface-900 border border-surface-800 rounded-xl px-6 py-5 min-w-[220px]">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <p className="text-2xs font-body font-semibold text-surface-500 uppercase tracking-wider">
                  {info.label}
                </p>
                <p className="text-sm font-body text-surface-200 mt-0.5">{info.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </Section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-surface-950">
      <Hero />
      <Servicos />
      <Barbeiros />
      <Planos />
      <CtaBanner />
      <Contato />
    </div>
  )
}
