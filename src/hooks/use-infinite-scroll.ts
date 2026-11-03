"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  /** Chamado quando a sentinela se aproxima do viewport */
  onLoadMore: () => void | Promise<unknown>;
  /** Se existem mais páginas (o hook fica inativo quando falso) */
  hasNextPage: boolean;
  /** Verdadeiro enquanto um carregamento já está em andamento — evita carregamentos duplicados */
  isLoading?: boolean;
  /** Distância em px antes do viewport que dispara o carregamento (padrão 400) */
  rootMargin?: number;
}

/**
 * Gatilho reutilizável de scroll infinito: anexe o ref retornado a um elemento
 * sentinela colocado após a lista; `onLoadMore` dispara enquanto a sentinela se
 * aproxima do viewport. IntersectionObserver nativo, sem dependências.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>({
  onLoadMore,
  hasNextPage,
  isLoading = false,
  rootMargin = 400,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<T | null>(null);

  // Mantém o callback mais recente sem reexecutar o efeito a cada mudança de identidade
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void onLoadMoreRef.current();
        }
      },
      // Começa a carregar antes de a sentinela ficar visível na tela
      { rootMargin: `0px 0px ${rootMargin}px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isLoading, rootMargin]);

  return sentinelRef;
}
