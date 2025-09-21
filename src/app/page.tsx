'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  BookMarked, 
  Columns3, 
  FileText, 
  History, 
  LayoutDashboard, 
  Users,
  CheckCircle,
  Target,
  TrendingUp,
  Zap,
  Github,
  Play,
  ArrowRight,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/app/logo';

export default function LandingPage() {
  const features = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Captura Inteligente de Demandas",
      description: "Interface guiada para capturar e categorizar automaticamente suas demandas em tarefas, projetos ou referências."
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Priorização com Matriz GUT",
      description: "Sistema de pontuação automática usando Gravidade, Urgência e Tendência. Reordenação automática conforme prazos."
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Fluxo PDCA Completo",
      description: "Guia através do ciclo Plan-Do-Check-Act com campos específicos e rastreamento histórico seguindo MASP."
    },
    {
      icon: <Columns3 className="h-8 w-8" />,
      title: "Kanban Inteligente",
      description: "Visualização em quadro com colunas: Backlog, Analisando, Em Andamento, Aguardando, Bloqueado e Concluído."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Análise com IA",
      description: "Gráfico de Pareto, Brainstorming, Análise dos 5 Porquês e Planos de Ação gerados por Inteligência Artificial."
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Histórico e Relatórios",
      description: "Log completo de demandas, evolução dos scores GUT, dashboards e extração de lições aprendidas."
    }
  ];

  const courses = [
    {
      title: "Fundamentos da Matriz GUT",
      description: "Aprenda a priorizar tarefas efetivamente usando a metodologia GUT",
      duration: "2h 30min",
      level: "Iniciante"
    },
    {
      title: "PDCA na Prática",
      description: "Resolva problemas de forma estruturada com o ciclo PDCA",
      duration: "3h 15min",
      level: "Intermediário"
    },
    {
      title: "Kanban para Produtividade Pessoal",
      description: "Organize seu fluxo de trabalho com metodologia Kanban",
      duration: "2h 45min",
      level: "Iniciante"
    },
    {
      title: "FlowZenit - Guia Completo",
      description: "Tutorial completo da plataforma e todas suas funcionalidades",
      duration: "4h 20min",
      level: "Todos os níveis"
    }
  ];

  const valueProps = [
    "100% Open Source - Use gratuitamente e contribua",
    "Metodologias Comprovadas - GUT, PDCA e MASP",
    "IA Integrada - Análises automáticas",
    "Interface Intuitiva - Design limpo e moderno",
    "Multiplataforma - Acesse de qualquer dispositivo"
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
            <Link href="#features" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
              Funcionalidades
            </Link>
            <Link href="#courses" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
              Cursos
            </Link>
            <Link href="#open-source" className="text-gray-600 hover:text-[#7EC4CF] transition-colors">
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

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-[#7EC4CF]/10 text-[#66A5AD] border-[#7EC4CF]/20">
            🚀 100% Open Source
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transforme <span className="text-[#7EC4CF]">Caos</span> em <span className="text-[#66A5AD]">Produtividade</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A plataforma open source que organiza suas demandas usando metodologias comprovadas como <strong>GUT</strong> e <strong>PDCA</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#7EC4CF] hover:bg-[#66A5AD] text-lg px-8 py-6">
              <Link href="/login">
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="#demo">
                <Play className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {valueProps.map((prop, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-[#7EC4CF]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-[#7EC4CF]" />
                </div>
                <p className="text-sm text-gray-600 font-medium">{prop}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para organizar, priorizar e executar suas demandas de forma eficiente
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-[#7EC4CF]/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-[#7EC4CF]">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Metodologias Comprovadas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Baseado em frameworks reconhecidos mundialmente para gestão e resolução de problemas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-20 h-20 bg-[#7EC4CF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#7EC4CF]">GUT</span>
                </div>
                <CardTitle>Matriz GUT</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <strong>Gravidade, Urgência e Tendência</strong> - Priorize tarefas baseado no impacto, prazo e evolução do problema
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-20 h-20 bg-[#66A5AD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#66A5AD]">PDCA</span>
                </div>
                <CardTitle>Ciclo PDCA</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <strong>Plan-Do-Check-Act</strong> - Metodologia estruturada para melhoria contínua e resolução de problemas
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-20 h-20 bg-[#7EC4CF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#7EC4CF]">MASP</span>
                </div>
                <CardTitle>MASP</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <strong>Método de Análise e Solução de Problemas</strong> - Abordagem sistemática para identificar e resolver problemas
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Aprenda com Nossos Cursos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Domine as metodologias de produtividade e tire o máximo proveito do FlowZenit
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <CardDescription className="text-gray-600 mb-4">
                        {course.description}
                      </CardDescription>
                    </div>
                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center ml-4">
                      <Play className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{course.duration}</Badge>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Assistir no YouTube
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section id="open-source" className="py-20 px-4 bg-white">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-8">
              <Github className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              100% Open Source
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              FlowZenit é completamente gratuito e de código aberto. Use, modifique e contribua com melhorias para toda a comunidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="https://github.com" target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  Ver no GitHub
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-[#7EC4CF] hover:bg-[#66A5AD] text-lg px-8 py-6">
                <Link href="/login">
                  Começar a Usar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
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
                <li><Link href="#features" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors">Documentação</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Aprender</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#courses" className="hover:text-white transition-colors">Cursos</Link></li>
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
