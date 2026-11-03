# Technical Design

## Stack
- Next.js 15
- React
- TypeScript
- tRPC
- Zod
- React Query

## Architecture
- Next.js App Router
- Backend procedures utilizando tRPC
- Armazenamento em memória
- SSR para pré-carregar a listagem

## Data Model

Task:
- id: string
- titulo: string
- descricao?: string
- dataCriacao: Date

> **Nota (implementação):** os nomes de campo em produção são em inglês — `title`, `description`, `createdAt` — por decisão de projeto (código e textos em inglês). O mapeamento completo spec → implementação está no README ("Compatibilidade com a especificação").

## API
- task.list
- task.create
- task.update
- task.delete