import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
// import { Link } from 'react-router-dom'
import { CreditCard, Check, ExternalLink, XCircle, AlertTriangle } from 'lucide-react'
import { api } from '@/services/api'
import {
  Button, Card, CardBody, CardHeader, CardFooter,
  BadgeAssinatura, SkeletonCard,
} from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import type { Assinatura, Plano, GerarLinkPagamentoResponse } from '@/types'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.09 } }),
}

export default function ClienteAssinatura() {
  const qc = useQueryClient()
  const { success, error, info } = useToast()

  const { data: assinatura, isLoading: loadingAs } = useQuery({
    queryKey: ['cliente-assinatura'],
    queryFn:  () => api.get<Assinatura>('/assinaturas/minha').then(r => r.data).catch(() => null),
  })

  const { data: planos, isLoading: loadingPlanos } = useQuery({
    queryKey: ['planos-cliente'],
    queryFn:  () => api.get<Plano[]>('/planos').then(r => r.data.filter(p => p.ativo)),
    enabled:  !assinatura,
  })

  const { mutate: assinar, isPending: assinando } = useMutation({
    mutationFn: (planoId: string) => api.post<Assinatura>('/assinaturas', { planoId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cliente-assinatura'] })
      success('Assinatura criada!', 'Bem-vindo ao plano.')
    },
    onError: () => error('Erro', 'Não foi possível assinar. Tente novamente.'),
  })

  const { mutate: gerarLink, isPending: gerando } = useMutation({
    mutationFn: (id: string) =>
      api.post<GerarLinkPagamentoResponse>(`/assinaturas/${id}/pagamento`).then(r => r.data),
    onSuccess: (data) => {
      window.open(data.linkPagamento, '_blank')
      info('Link aberto', 'Conclua o pagamento na nova aba.')
    },
    onError: () => error('Erro', 'Não foi possível gerar o link de pagamento.'),
  })

  const { mutate: cancelar, isPending: cancelando } = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/assinaturas/${id}/status`, { status: 'CANCELADA' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cliente-assinatura'] })
      success('Assinatura cancelada.')
    },
    onError: () => error('Erro', 'Não foi possível cancelar. Tente novamente.'),
  })

  // ── Estado: tem assinatura ─────────────────────────────────────────────────
  if (loadingAs) {
    return (
      <div className="max-w-2xl mx-auto">
        <SkeletonCard lines={4} />
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" className="max-w-2xl mx-auto flex flex-col gap-6">

      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-display font-bold text-surface-50 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-400" /> Minha Assinatura
        </h1>
        <p className="text-surface-400 font-body text-sm mt-0.5">
          Gerencie seu plano e pagamentos.
        </p>
      </motion.div>

      {assinatura ? (
        /* ── Tem assinatura ──────────────────────────────────────────────── */
        <motion.div variants={fadeUp} custom={1}>
          <Card highlighted={assinatura.status === 'ATIVA'}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-body text-surface-500 uppercase tracking-wider mb-1">Plano atual</p>
                  <h2 className="text-xl font-display font-bold text-surface-50">
                    {assinatura.plano.nome}
                  </h2>
                </div>
                <BadgeAssinatura status={assinatura.status} dot />
              </div>
              <p className="text-3xl font-display font-black text-gradient-brand mt-3">
                R$ {Number(assinatura.plano.preco).toFixed(2).replace('.', ',')}
                <span className="text-sm font-body text-surface-500 font-normal ml-1">/mês</span>
              </p>
            </CardHeader>

            <CardBody>
              {assinatura.plano.descricao && (
                <p className="text-surface-400 font-body text-sm mb-4">{assinatura.plano.descricao}</p>
              )}

              {assinatura.plano.planosServicos.length > 0 && (
                <div>
                  <p className="text-xs font-body font-semibold text-surface-500 uppercase tracking-wider mb-3">
                    Serviços inclusos
                  </p>
                  <ul className="flex flex-col gap-2">
                    {assinatura.plano.planosServicos.map(ps => (
                      <li key={ps.servico.id} className="flex items-center gap-2.5 text-sm font-body text-surface-300">
                        <Check className="w-4 h-4 text-brand-400 shrink-0" />
                        {ps.quantidade}× {ps.servico.nome}
                        <span className="text-surface-600">({ps.servico.duracao}min)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>

            <CardFooter>
              <div className="flex flex-col sm:flex-row gap-2">
                {assinatura.status === 'INADIMPLENTE' && (
                  <Button
                    variant="primary" size="md"
                    leftIcon={<ExternalLink className="w-4 h-4" />}
                    loading={gerando}
                    onClick={() => gerarLink(assinatura.id)}
                  >
                    Pagar agora
                  </Button>
                )}
                {['ATIVA', 'INADIMPLENTE'].includes(assinatura.status) && (
                  <Button
                    variant="ghost" size="md"
                    leftIcon={<XCircle className="w-4 h-4 text-red-400" />}
                    loading={cancelando}
                    onClick={() => cancelar(assinatura.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Cancelar assinatura
                  </Button>
                )}
              </div>

              {assinatura.status === 'INADIMPLENTE' && (
                <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-body text-yellow-300">
                    Sua assinatura está inadimplente. Regularize o pagamento para manter o acesso.
                  </p>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        /* ── Sem assinatura — mostrar planos ─────────────────────────────── */
        <>
          <motion.div variants={fadeUp} custom={1}
            className="p-4 rounded-xl border border-surface-800 bg-surface-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-surface-500" />
            </div>
            <div>
              <p className="text-sm font-body font-medium text-surface-200">Nenhum plano ativo</p>
              <p className="text-xs font-body text-surface-500 mt-0.5">
                Assine um plano abaixo para ter acesso a serviços com desconto todo mês.
              </p>
            </div>
          </motion.div>

          {loadingPlanos ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(planos ?? []).map((plano, i) => (
                <motion.div key={plano.id} variants={fadeUp} custom={i + 2}
                  className={cn(
                    'flex flex-col p-5 rounded-xl border transition-all duration-200',
                    'bg-surface-900 border-surface-800 hover:border-brand-500/40',
                  )}
                >
                  <h3 className="font-display font-bold text-surface-50 text-lg mb-1">{plano.nome}</h3>
                  {plano.descricao && (
                    <p className="text-surface-400 font-body text-xs mb-3">{plano.descricao}</p>
                  )}
                  <p className="text-2xl font-display font-black text-gradient-brand mb-4">
                    R$ {Number(plano.preco).toFixed(2).replace('.', ',')}
                    <span className="text-xs font-body text-surface-500 font-normal ml-1">/mês</span>
                  </p>
                  <ul className="flex flex-col gap-1.5 mb-5 flex-1">
                    {plano.planosServicos.map(ps => (
                      <li key={ps.servico.id} className="flex items-center gap-2 text-xs font-body text-surface-400">
                        <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        {ps.quantidade}× {ps.servico.nome}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="md" fullWidth loading={assinando}
                    onClick={() => assinar(plano.id)}>
                    Assinar
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}