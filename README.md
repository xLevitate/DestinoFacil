# DestinoFacil

## Descrição do Projeto

DestinoFacil é um site desenvolvido que funciona como um buscador inteligente de destinos de viagem. A plataforma permite que usuários encontrem locais para visitar com base em suas preferências de locais.

Principais objetivos:
- Busca de destinos baseado em preferências personalizadas
- Salvamento de destinos favoritos
- Redirecionamento para sites de reserva de voos (Google Flights)
- Visualização de informações detalhadas sobre destinos, incluindo pontos turísticos e clima

## Tecnologias Utilizadas

### Frontend
- **React.js**: Biblioteca para construção de interfaces
- **Next.js 15**: Framework de React para renderização do lado do servidor
- **Tailwind CSS**: Framework CSS para design responsivo
- **Preline UI**: Componentes UI baseados em Tailwind CSS para interface moderna
- **Axios**: Cliente HTTP para requisições à API
- **JWT**: Autenticação baseada em tokens

### Backend
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para Node.js
- **MongoDB**: Banco de dados NoSQL
- **Mongoose**: ODM (Object Data Modeling) para MongoDB
- **JWT**: Implementação de autenticação segura

### APIs Integradas
- **GeoDB Cities (Free)**: API para informações detalhadas sobre cidades
- **Pexels API**: API para busca de imagens

### Hospedagem
- **Vercel**: Hospedagem do frontend
- **Render**: Hospedagem do backend
- **MongoDB Atlas**: Serviço de banco de dados na nuvem

## Configuração Local

### Pré-requisitos
- Node.js (versão 18.x ou superior)
- npm ou yarn
- Git

### Passos para Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seu-usuario/DestinoFacil.git
   cd DestinoFacil
   ```

2. Configuração do Frontend
   ```bash
   cd frontend
   npm install
   ```

3. Configuração de variáveis de ambiente
   Crie um arquivo `.env.local` na pasta frontend com as seguintes variáveis:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_PEXELS_API_KEY=sua_chave_api_pexels
   ```

4. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   ```

5. Acesse a aplicação em `http://localhost:3000`

## Equipe

- Aluisio Paredes
- Enzo Gabriel
- Guilherme Almeida
- Pedro Cesar
- Victor Santana
