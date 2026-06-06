import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Search } from 'lucide-react'
import { useState } from 'react'
import { api } from '@/services/api'
import { Table, Input, TableColumn } from '@/components/ui'
import type { Cliente } from '@/types'

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function AdminClientes() {
  const [busca, setBusca] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-clientes'],
    queryFn:  () => api.get<Cliente[]>('/clientes').then(r => r.data),
  })

  const lista = (data ?? []).filter(c =>
    !busca ||
    c.usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.usuario.email.toLowerCase().includes(busca.toLowerCase()),
  )

  const columns: TableColumn<Cliente>[] = [
    { key: 'nome', header: 'Cliente',
      render: c => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand-400">{c.usuario.nome.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-surface-100">{c.usuario.nome}</p>
            <p className="text-xs text-surface-500">{c.usuario.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'telefone', header: 'Telefone',
      render: c => <span className="text-surface-300">{c.usuario.telefone ?? '—'}</span>,
    },
    { key: 'criadoEm', header: 'Cliente desde', align: 'center',
      render: c => <span className="text-surface-400 text-sm">{formatData(c.criadoEm)}</span>,
    },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-50 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" /> Clientes
          </h1>
          <p className="text-surface-400 font-body text-sm mt-0.5">{data?.length ?? 0} clientes cadastrados</p>
        </div>
        <div className="w-full sm:w-64">
          <Input placeholder="Buscar por nome ou e-mail..." leftIcon={<Search className="w-4 h-4" />}
            value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      <Table columns={columns} data={lista} loading={isLoading} rowKey={c => c.id}
        emptyMessage="Nenhum cliente encontrado." emptyIcon={<Users className="w-8 h-8" />} />
    </motion.div>
  )
}