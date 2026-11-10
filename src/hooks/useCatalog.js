import { useCallback, useEffect, useRef, useState } from "react";

import { getXtreamCategories, getXtreamContent } from "../services/xtream";

const PAGE_SIZE = 36;

function getItemId(item) {
  return String(item.stream_id || item.series_id || item.id || "");
}

function useCatalog(connection) {
  const [section, setSection] = useState("live");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  const fallbackItems = useRef(null);

  const pageRef = useRef(0);
  const loadingMoreRef = useRef(false);

  // Carrega somente as categorias da seção selecionada.
  // Nenhum conteúdo é carregado automaticamente.
  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      setLoadingCategories(true);
      setCategories([]);
      setCategoryId(null);
      setItems([]);
      setSearch("");
      setError("");
      setHasMore(false);

      fallbackItems.current = null;
      pageRef.current = 0;
      loadingMoreRef.current = false;

      try {
        const result = await getXtreamCategories(
          connection,
          section,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setCategories(result);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, [
    connection.id,
    connection.server,
    connection.username,
    connection.password,
    section,
  ]);

  // Carrega os conteúdos somente quando uma categoria
  // for efetivamente selecionada.
  useEffect(() => {
    if (categoryId === null) {
      return;
    }

    const controller = new AbortController();

    async function loadFirstPage() {
      setLoadingItems(true);
      setLoadingMore(false);
      loadingMoreRef.current = false;

      setItems([]);
      setSearch("");
      setError("");
      setHasMore(false);

      fallbackItems.current = null;
      pageRef.current = 0;

      try {
        const result = await getXtreamContent(
          connection,
          section,
          categoryId,
          controller.signal,
          {
            start: 0,
            limit: PAGE_SIZE,
          },
        );

        if (controller.signal.aborted) return;

        // Caso o servidor ignore a paginação e retorne
        // todos os conteúdos de uma só vez.
        if (result.length > PAGE_SIZE) {
          fallbackItems.current = result;

          setItems(result.slice(0, PAGE_SIZE));
          setHasMore(result.length > PAGE_SIZE);
        } else {
          setItems(result);
          setHasMore(result.length === PAGE_SIZE);
        }

        pageRef.current = 1;
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingItems(false);
        }
      }
    }

    loadFirstPage();

    return () => controller.abort();
  }, [
    connection.id,
    connection.server,
    connection.username,
    connection.password,
    section,
    categoryId,
  ]);

  // Carrega a próxima página.
  const loadMore = useCallback(async () => {
    if (
      loadingItems ||
      loadingMoreRef.current ||
      !hasMore ||
      categoryId === null
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = pageRef.current;

      // Fallback: o servidor retornou a lista inteira.
      if (fallbackItems.current) {
        const start = nextPage * PAGE_SIZE;

        const nextItems = fallbackItems.current.slice(start, start + PAGE_SIZE);

        if (nextItems.length > 0) {
          setItems((previous) => [...previous, ...nextItems]);
        }

        pageRef.current = nextPage + 1;

        setHasMore(fallbackItems.current.length > (nextPage + 1) * PAGE_SIZE);

        return;
      }

      // Paginação diretamente no servidor.
      const result = await getXtreamContent(
        connection,
        section,
        categoryId,
        undefined,
        {
          start: nextPage * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
      );

      // Detecta se o servidor ignorou a paginação.
      if (result.length > PAGE_SIZE) {
        fallbackItems.current = result;

        const visibleCount = (nextPage + 1) * PAGE_SIZE;

        setItems(result.slice(0, visibleCount));
        setHasMore(result.length > visibleCount);

        pageRef.current = nextPage + 1;
        return;
      }

      setItems((previous) => {
        const existingIds = new Set(previous.map(getItemId));

        const newItems = result.filter((item) => {
          const id = getItemId(item);

          return !id || !existingIds.has(id);
        });

        return [...previous, ...newItems];
      });

      pageRef.current = nextPage + 1;
      setHasMore(result.length === PAGE_SIZE);
    } catch (error) {
      setError(error.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [connection, section, categoryId, hasMore, loadingItems]);

  function changeSection(nextSection) {
    if (nextSection !== section) {
      setCategoryId(null);
      setSection(nextSection);
    }
  }

  function changeCategory(nextCategoryId) {
    const nextId = String(nextCategoryId);

    if (nextId !== String(categoryId)) {
      setCategoryId(nextId);
    }
  }

  // Quando o servidor não pagina, a busca pode utilizar
  // toda a lista que já foi recebida.
  const searchableItems = fallbackItems.current || items;

  const displayedItems = searchableItems.filter((item) => {
    const name = String(item.name || "").toLowerCase();

    return name.includes(search.trim().toLowerCase());
  });

  return {
    section,
    categories,
    categoryId,
    items,
    displayedItems,
    search,
    loadingCategories,
    loadingItems,
    loadingMore,
    hasMore,
    error,
    changeSection,
    changeCategory,
    setSearch,
    loadMore,
  };
}

export default useCatalog;
