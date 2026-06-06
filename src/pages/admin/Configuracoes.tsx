import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Settings, Save } from 'lucide-react'
import { useBarbearia } from '@/contexts/BarbeariaContext'
import { api } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import { Button, Input, Card, CardBody, CardHeader, CardFooter } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { DiaSemana } from '@/types'

const DIAS: { key: DiaSemana; label: string }[] = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça'   },
  { key: 'qua', label: 'Quarta'  },
  { key: 'qui', label: 'Quinta'  },
  { key: 'sex', label: 'Sexta'   },
  { key: 'sab', label: 'Sábado'  },
  { key: 'dom', label: 'Domingo' },
]

const schema = z.object({
  nome:      z.string().min(2, 'Nome obrigatório'),
  telefone:  z.string().optional(),
  instagram: z.string().optional(),
  facebook:  z.string().optional(),
  endereco:  z.string().optional(),
})
type FormData = z.infer<typeof schema>

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }),
}

export default function AdminConfiguracoes() {
  const { barbearia } = useBarbearia()
  const qc            = useQueryClient()
  const { success, error } = useToast()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    reset({
      nome:      barbearia.nome      ?? '',
      telefone:  barbearia.telefone  ?? '',
      instagram: barbearia.instagram ?? '',
      facebook:  barbearia.facebook  ?? '',
      endereco:  barbearia.endereco  ?? '',
    })
  }, [barbearia, reset])

  const { mutate: salvar } = useMutation({
    mutationFn: (data: FormData) => api.patch('/barbearia', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['barbearia'] })
      success('Configurações salvas!')
    },
    onError: () => error('Erro', 'Não foi possível salvar as configurações.'),
  })

  return (
    <motion.div initial="hidden" animate="visible" className="max-w-2xl mx-auto flex flex-col gap-6">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-display font-bold text-surface-50 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-400" /> Configurações
        </h1>
        <p className="text-surface-400 font-body text-sm mt-0.5">
          Dados e horários da barbearia.
        </p>
      </motion.div>

      {/* Dados gerais */}
      <motion.div variants={fadeUp} custom={1}>
        <Card>
          <CardHeader>
            <p className="text-sm font-body font-semibold text-surface-100">Dados da barbearia</p>
          </CardHeader>
          <CardBody>
            <form id="form-config" onSubmit={handleSubmit(d => salvar(d))} className="flex flex-col gap-4">
              <Input label="Nome" error={errors.nome?.message} {...register('nome')} />
              <Input label="Telefone" hint="Exibido no site" {...register('telefone')} />
              <Input label="Endereço" {...register('endereco')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Instagram" placeholder="@usuario" {...register('instagram')} />
                <Input label="Facebook"  placeholder="usuario ou página" {...register('facebook')} />
              </div>
            </form>
          </CardBody>
          <CardFooter>
            <Button type="submit" form="form-config" variant="primary" size="md"
              loading={isSubmitting} disabled={!isDirty}
              leftIcon={<Save className="w-4 h-4" />}>
              Salvar alterações
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Horários */}
      <motion.div variants={fadeUp} custom={2}>
        <Card>
          <CardHeader>
            <p className="text-sm font-body font-semibold text-surface-100">Horário de funcionamento</p>
            <p className="text-xs font-body text-surface-500 mt-0.5">
              Deixe em branco os dias em que a barbearia não funciona.
            </p>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              {DIAS.map(({ key, label }) => {
                const horario = barbearia.horarioFuncionamento?.[key]
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className={cn(
                      'w-20 text-sm font-body shrink-0',
                      horario ? 'text-surface-200' : 'text-surface-600',
                    )}>
                      {label}
                    </span>
                    {horario ? (
                      <span className="text-sm font-body text-brand-400">
                        {horario.abre} – {horario.fecha}
                      </span>
                    ) : (
                      <span className="text-xs font-body text-surface-600 italic">Fechado</span>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs font-body text-surface-600 mt-4">
              Para alterar os horários, entre em contato com o suporte Monky Barber.
            </p>
          </CardBody>
        </Card>
      </motion.div>

      {/* Slug */}
      <motion.div variants={fadeUp} custom={3}>
        <Card>
          <CardHeader>
            <p className="text-sm font-body font-semibold text-surface-100">Identificação</p>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-body text-surface-500 mb-1">ID da barbearia</p>
                <p className="text-sm font-mono text-surface-400 bg-surface-800 px-3 py-2 rounded-lg">{barbearia.id}</p>
              </div>
              <div>
                <p className="text-xs font-body text-surface-500 mb-1">Slug (URL)</p>
                <p className="text-sm font-mono text-brand-400 bg-surface-800 px-3 py-2 rounded-lg">{barbearia.slug}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  )
}