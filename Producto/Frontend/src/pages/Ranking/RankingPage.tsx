import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { MyRankingPosition } from './MyRankingPosition'
import { RankingBoard } from './RankingBoard'

export function RankingPage() {
  const [tipoRanking, setTipoRanking] = useState<'mensual' | 'global'>('mensual')
  const now = new Date()
  const mesLabel = now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  return (
    <main className="flex-1 px-4 py-6 bg-bg-app pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-display font-bold text-text-primary">Clasificación</h1>
              <p className="text-caption text-text-secondary capitalize">{mesLabel} · Santiago, Chile</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-bg-surface/50 dark:bg-gray-800/50 rounded-lg w-fit">
          <button
            className={`px-5 py-2 rounded-md font-semibold transition-all shadow-sm ${tipoRanking === 'mensual' ? 'bg-bg-surface dark:bg-gray-900 text-primary border border-border dark:border-gray-700' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}
            onClick={() => setTipoRanking('mensual')}
          >
            Mensual
          </button>
          <button
            className={`px-5 py-2 rounded-md font-semibold transition-all shadow-sm ${tipoRanking === 'global' ? 'bg-bg-surface dark:bg-gray-900 text-primary border border-border dark:border-gray-700' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}
            onClick={() => setTipoRanking('global')}
          >
            Global
          </button>
        </div>

        <MyRankingPosition tipo={tipoRanking} />
        
        <RankingBoard tipo={tipoRanking} />

        <div className="mt-8 p-4 bg-bg-surface dark:bg-gray-900 rounded-xl border border-border dark:border-gray-800">
          <p className="text-caption text-text-secondary text-center">
            Cada reporte validado por IA (≥85% de confianza) suma <strong className="text-accent">+10 puntos</strong>.
            El ranking se actualiza diariamente.
          </p>
        </div>
      </div>
    </main>
  )
}
