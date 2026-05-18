import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section'
}

export function Card({ as: Tag = 'div', children, className, ...props }: CardProps) {
  return (
    <Tag
      className={cn('bg-bg-surface dark:bg-gray-900 rounded-xl shadow-card border border-border dark:border-gray-800', className)}
      {...props}
    >
      {children}
    </Tag>
  )
}

export function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pt-5 pb-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pb-5', className)} {...props}>
      {children}
    </div>
  )
}
