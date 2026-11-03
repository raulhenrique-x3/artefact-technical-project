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

## API
- task.list
- task.create
- task.update
- task.delete