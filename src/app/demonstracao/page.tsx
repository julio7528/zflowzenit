'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/app/logo';
import Link from 'next/link';
import { ArrowLeft, Github, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function DemonstrationPage() {
  const tutorialSteps = [
    {
      title: "1. Login e Validação",
      description: "Faça o login no nosso portal e confirme seu e-mail para poder validar o acesso.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Login+Screen"
    },
    {
      title: "2. Criação de Cards",
      description: "Após logado em nosso portal, você vai ter acesso ao menu e a criação de cards para suas demandas. Basta clicar em novo item e preencher a atividade de descrição e criar uma categoria para ela.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Card+Creation"
    },
    {
      title: "3. Verificação de Ação",
      description: "É possível ser executado? (Opção: Não). Se não, armazene dados para consulta futura, follow-up ou referência.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Actionability+Check"
    },
    {
      title: "4. Tipo de Execução",
      description: "Caso o item seja executável, separe em: Execução Única ou Projeto.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Execution+Type"
    },
    {
      title: "5. Caminho de Projeto",
      description: "Se for Projeto: Iniciar card como projeto principal. Avaliar impacto, necessidade de resolução e prioridade.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Project+Path"
    },
    {
      title: "6. Caminho de Ação Única",
      description: "Se for Execução Única (Não apenas um passo): Regra 2 Minutos: Pode ser feito agora? Sim -> Execute e registre. Não -> Delegar, Agendar no calendário ou Ação futura. Nota: Avaliar análise GUT.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Single+Action+Path"
    },
    {
      title: "7. Pontuação e Tags",
      description: "Novo card criado: Pontuação de urgência, Tag (Tarefa vs Projeto), Tag de Categoria, Prazo ativo.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Scoring+and+Tags"
    },
    {
      title: "8. Visualização Kanban",
      description: "Acompanhamento no Kanban: Mover cards entre colunas para atualizar status.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Kanban+View"
    },
    {
      title: "9. Visualizações de Progresso",
      description: "Em Andamento: Projetos ativos no momento. Calendário: Consulta de distribuições e demandas do dia.",
      image: "https://placehold.co/800x450/e2e8f0/1e293b?text=Progress+and+Calendar"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F8FF] to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#features" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
              Funcionalidades
            </Link>
            <Link href="/#courses" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
              Cursos
            </Link>
            <Link href="/#open-source" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
              Open Source
            </Link>
            <Button asChild variant="outline">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-[#7EC4CF] hover:bg-[#66A5AD]">
              <Link href="/login">Começar Gratuitamente</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
            <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-[#7EC4CF]">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para Home
                </Link>
            </Button>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Demonstração do <span className="text-[#7EC4CF]">FlowZenit</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
                Acompanhe o passo a passo de como transformar o caos em produtividade utilizando nossa metodologia.
            </p>
        </div>

        <div className="space-y-16 max-w-4xl mx-auto">
            {tutorialSteps.map((step, index) => (
                <div key={index} className="relative pl-8 md:pl-0">
                    {/* Connecting Line */}
                    {index !== tutorialSteps.length - 1 && (
                        <div className="absolute left-4 md:left-1/2 top-12 bottom-[-64px] w-0.5 bg-gray-200 hidden md:block" />
                    )}
                    
                    <div className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                        {/* Number Badge (Mobile only) */}
                        <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#7EC4CF] text-white font-bold md:hidden">
                            {index + 1}
                        </div>

                        {/* Image Section */}
                        <div className="w-full md:w-1/2">
                            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-white">
                                <Image 
                                    src={step.image} 
                                    alt={step.title}
                                    width={800}
                                    height={450}
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="w-full md:w-1/2 space-y-4">
                            <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#7EC4CF]/10 text-[#7EC4CF] font-bold text-xl mb-4">
                                {index + 1}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{step.title.split('. ')[1]}</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-white rounded-2xl p-12 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Pronto para começar?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de usuários que já estão organizando suas vidas com o FlowZenit.
            </p>
            <Button asChild size="lg" className="bg-[#7EC4CF] hover:bg-[#66A5AD] text-lg px-8 py-6">
                <Link href="/login">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white mt-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo />
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma open source para gestão de produtividade baseada em metodologias comprovadas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/#features" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors">Documentação</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Aprender</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/#courses" className="hover:text-white transition-colors">Cursos</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Comunidade</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Código</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contribuir</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Licença MIT</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FlowZenit. Licenciado sob MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
