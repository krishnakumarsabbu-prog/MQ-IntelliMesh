interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`p-6 max-w-[1600px] mx-auto ${className}`}>
      {children}
    </div>
  )
}
