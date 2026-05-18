import { useEffect, useState } from 'react'
import { Medal } from 'lucide-react'
import { Card, CardHeader } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { rankingService } from '../../services/rankingService'
import type { RankingEntry } from '../../types'
import { cn } from '../../lib/utils'

export function RankingBoard({ tipo }: { tipo: 'global' | 'mensual' }) {
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true)
      try {
        const data = await rankingService.getranking(tipo)
        setRanking(data)
      } catch (error) {
        console.error("Error fetching ranking", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRanking()
  }, [tipo])

  if (loading) {
    return <div className="py-8 text-center text-body text-text-secondary animate-pulse">Cargando clasificación...</div>
  }

  if (ranking.length === 0) {
    return <div className="py-8 text-center text-body text-text-secondary">Aún no hay reportes. ¡Sé el primero!</div>
  }

  const top3 = ranking.slice(0, 3)
  const remainder = ranking.slice(3)

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 relative items-end h-48 md:h-56 pb-2">
        {top3.map((entry, index) => {
          // 0 -> 1st (gold), 1 -> 2nd (silver), 2 -> 3rd (bronze)
          // Actually, let's map order visually. Usually podium is 2 - 1 - 3
          // But flex-row puts them in DOM order. Let's stick to DOM order 1,2,3 for simplicity or style them to be 1 in middle?
          // We can use order classes if we wrap them properly or just render linearly.
          const isFirst = index === 0;
          const isSecond = index === 1;
          const isThird = index === 2;
          
          let heightClass = "h-32";
          let colorClass = "bg-gray-300";
          let orderClass = "order-2";
          
          if (isFirst) {
              heightClass = "h-40 md:h-48";
              colorClass = "bg-yellow-400";
              orderClass = "order-2 md:order-2 z-10"; // middle
          } else if (isSecond) {
              heightClass = "h-32 md:h-36";
              colorClass = "bg-gray-300";
              orderClass = "order-1 md:order-1"; // left
          } else if (isThird) {
              heightClass = "h-24 md:h-28";
              colorClass = "bg-amber-600";
              orderClass = "order-3 md:order-3"; // right
          }

          return (
            <div key={entry.user.id} className={cn("flex flex-col items-center justify-end rounded-t-lg pb-4 shadow-sm", colorClass, heightClass, orderClass)}>
              <div className="mb-2">
                  <Avatar name={entry.user.name} className="ring-2 ring-white" />
              </div>
              <p className="text-white font-bold text-xs md:text-sm truncate w-full px-1 text-center">
                  {entry.user.name}
              </p>
              <p className="text-white font-bold text-lg leading-tight mt-1">#{entry.position}</p>
              <p className="text-white text-xs font-semibold">{entry.points} pts</p>
            </div>
          )
        })}
      </div>

      {remainder.length > 0 && (
        <Card>
          <CardHeader className="pb-0" />
          <div role="list" className="pb-2">
            {remainder.map((entry, i) => (
              <div key={entry.user.id} className={cn("flex items-center gap-4 px-5 py-3 transition-colors", i < remainder.length - 1 && "border-b border-border dark:border-gray-800")}>
                <p className="font-bold text-text-secondary w-6 text-center">#{entry.position}</p>
                <Avatar name={entry.user.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">
                    {entry.user.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {entry.reportsCount || Math.floor(entry.points / 10)} reportes
                  </p>
                </div>
                <p className="font-bold text-accent">{entry.points} pts</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
