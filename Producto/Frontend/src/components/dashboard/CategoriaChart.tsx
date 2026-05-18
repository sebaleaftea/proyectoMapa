import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { dashboardService, type CategoriaStat } from '../../services/dashboardService'

interface CategoriaChartProps {
  comunaId: number
}

export function CategoriaChart({ comunaId }: CategoriaChartProps) {
  const [data, setData] = useState<CategoriaStat[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    dashboardService.obtenerEstadisticas(comunaId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [comunaId])

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-text-secondary">Cargando estadísticas...</div>
  }

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-text-secondary">No hay datos suficientes para graficar</div>
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="categoria" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
          <Tooltip 
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" />
          <Bar dataKey="cantidad" name="Cantidad de Barreras" fill="#2E7D32" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
