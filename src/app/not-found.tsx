import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 space-y-4">
      <div className="bg-white p-8 rounded-full shadow-lg mb-4">
        <FileQuestion className="h-16 w-16 text-gray-400" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900">Página não encontrada</h2>
      <p className="text-gray-500 max-w-md text-center">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">
          Voltar para o início
        </Link>
      </Button>
    </div>
  )
}
