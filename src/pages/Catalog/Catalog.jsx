import inlineStyles from "../../styles/inlineStyles.js";
import { useEffect, useRef } from "react";

import useCatalog from "../../hooks/useCatalog";
import CatalogSkeleton from "../../components/CatalogSkeleton/CatalogSkeleton";
import Logo from "../../components/Logo/Logo";
import Icon from "../../components/Icon/Icon";

const SECTIONS = [
  { id: "live", label: "TV AO VIVO" },
  { id: "movies", label: "FILMES" },
  { id: "series", label: "SÉRIES" },
];

function Catalog({ connection, onBack, onSelectChannel }) {
  const {
    section,
    categories,
    categoryId,
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
  } = useCatalog(connection);

  const loadMoreRef = useRef(null);
  const firstCategoryRef = useRef(null);

  function getItemId(item) {
    return item.stream_id || item.series_id || item.id;
  }

  function getItemImage(item) {
    return item.stream_icon || item.cover || item.movie_image || "";
  }

  function getItemName(item) {
    return item.name || "Conteúdo sem nome";
  }

  // Ao terminar de carregar as categorias,
  // posiciona o foco na primeira opção da sidebar.
  useEffect(() => {
    if (!loadingCategories && categoryId === null) {
      firstCategoryRef.current?.focus();
    }
  }, [loadingCategories, categories, categoryId]);

  // Observa o final da lista e solicita a próxima página.
  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasMore || search.trim() || categoryId === null) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "500px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, loadMore, search, categoryId]);

  return (
    <main style={inlineStyles("min-h-screen bg-[#10131c] text-white")}>
      {/* Cabeçalho */}
      <header style={inlineStyles("flex flex-wrap items-center justify-between mr-4 mb-4 border-b border-white/10 px-8 py-5")}>
        <Logo />

        <button
          type="button"
          onClick={onBack}
          style={inlineStyles("shrink-0 border border-white-200 px-6 py-3 focus:outline-none focus:ring-4 focus:ring-indigo-400 text-sm")}
        >
          <>
            <Icon
              name="back"
              style={inlineStyles("mr-2 inline-block align-middle ")}
              size={20}
            />
            Minhas conexões
          </>
        </button>
      </header>

      {/* Navegação e pesquisa */}
      <nav style={{...(inlineStyles("flex flex-wrap items-center mb-4 mr-4 border-b border-white/10 px-8 py-5")), ...{"marginBottom":"16px"}}}>
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeSection(item.id)}
            style={{...(inlineStyles(`shrink-0 px-6 py-4 text-sm font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-400 ${
              section === item.id
                ? "bg-indigo-800 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`)), ...{"marginRight":"8px","marginBottom":"8px"}}}
          >
            {item.label}
          </button>
        ))}

        <div data-focus-ring="" style={{...(inlineStyles("ml-auto flex min-w-[260px] max-w-sm flex-1 items-center rounded-lg border border-white/20 bg-white/5 px-4 focus-within:ring-4 focus-within:ring-indigo-400")), ...{"marginRight":"8px","marginBottom":"8px"}}}>
          <Icon
            name="search"
            style={inlineStyles("mr-3 shrink-0 text-gray-400")}
            size={20}
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar conteúdo..."
            style={inlineStyles("w-full min-w-0 bg-transparent py-3 text-lg text-white outline-none placeholder:text-gray-100")}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={inlineStyles("ml-2 shrink-0 px-2 text-xl text-gray-400 focus:outline-none focus:text-white")}
              aria-label="Limpar pesquisa"
            >
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
      </nav>

      {/* Conteúdo */}
      <div style={inlineStyles("flex min-h-[700px]")}>
        {/* Categorias */}
        <aside id="catalog-sidebar" style={inlineStyles("w-100 shrink-0 self-start border-r border-white/10 px-6 py-8")}>
          <h2 style={inlineStyles("mb-6 text-xl font-bold")}>Categorias</h2>

          {loadingCategories ? (
            <p style={inlineStyles("text-gray-400")}>Carregando categorias...</p>
          ) : (
            <div
              style={{...inlineStyles("flex max-h-[calc(100vh-250px)] flex-col overflow-y-auto"), ...{
                display: "flex",
                maxHeight: "100vh",
                flexDirection: "column",
                overflowY: "auto",
                
              }}}
              
            >
              <button
                ref={firstCategoryRef}
                type="button"
                style={{...inlineStyles(`mt-0 p-4 text-left text-base focus:bg-indigo-800 min-h-[52px] focus:outline: none ${
                  categoryId === "all"
                    ? "bg-indigo-800 font-semibold text-white"
                    : "text-gray-300 hover:bg-white/10"
                }`), ...{
                  height: "52px",
                  minHeight: "52px",
                  display: "block",
                  borderRadius: "none",
                  verticalAlign: "middle",
                  fontWeight: "600",
                  
                }}}
                onClick={() => changeCategory("all")}
                
              >
                Todas as categorias
              </button>

              {categories.map((category) => {
                const id = String(category.category_id);

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => changeCategory(id)}
                    style={{...(inlineStyles(`mt-0 p-4 text-left text-base focus:bg-indigo-800 min-h-[52px] focus:outline: none ${
                      String(categoryId) === id
                        ? "bg-indigo-800 font-semibold text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`)), ...{"marginTop":"0px"}}}
                  >
                    {category.category_name}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Lista de conteúdos */}
        <section id="catalog" style={inlineStyles("min-w-0 flex-1 px-10 py-8")}>
          <div style={inlineStyles("mb-8")}>
            <h2 style={inlineStyles("text-3xl font-bold")}>
              {SECTIONS.find((item) => item.id === section)?.label}
            </h2>

            <p style={inlineStyles("mt-2 text-gray-400")}>
              {categoryId === null
                ? "Selecione uma categoria para visualizar os conteúdos."
                : search
                  ? `${displayedItems.length} resultado(s) encontrado(s)`
                  : `${displayedItems.length} conteúdo(s) carregado(s)`}
            </p>
          </div>

          {error && (
            <div style={inlineStyles("rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300")}>
              <h3 style={inlineStyles("mb-2 text-xl font-bold")}>
                Não foi possível carregar o catálogo
              </h3>

              <p>{error}</p>
            </div>
          )}

          {/* Nenhuma categoria selecionada */}
          {!error && !loadingCategories && categoryId === null && (
            <div style={inlineStyles("flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03]")}>
              <span style={inlineStyles("mb-4 text-5xl text-gray-500")}>
                {section === "live" ? "TV" : <Icon name="play" size={32} />}
              </span>

              <h3 style={inlineStyles("text-2xl font-semibold")}>
                Selecione uma categoria
              </h3>

              <p style={inlineStyles("mt-3 text-center text-gray-400")}>
                Escolha uma categoria na lateral para carregar os conteúdos.
              </p>
            </div>
          )}

          {/* Carregamento inicial */}
          {!error &&
            categoryId !== null &&
            loadingItems &&
            displayedItems.length === 0 && (
              <div>
                <div style={inlineStyles("mb-6 flex items-center ")}>
                  <div style={{...(inlineStyles("h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-indigo-500")), ...{"marginRight":"12px"}}} />

                  <p style={inlineStyles("text-lg text-gray-300")}>
                    Carregando catálogo...
                  </p>
                </div>

                <CatalogSkeleton count={12} />
              </div>
            )}

          {/* Categoria sem conteúdos */}
          {!error &&
            categoryId !== null &&
            !loadingItems &&
            !loadingCategories &&
            displayedItems.length === 0 && (
              <div style={inlineStyles("flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.03]")}>
                <span style={inlineStyles("mb-4 text-5xl text-gray-500")}>
                  {section === "live" ? "TV" : "▶"}
                </span>

                <h3 style={inlineStyles("text-2xl font-semibold")}>
                  {search
                    ? "Nenhum resultado encontrado"
                    : "Nenhum conteúdo encontrado"}
                </h3>

                <p style={inlineStyles("mt-3 text-gray-400")}>
                  {search
                    ? "Tente pesquisar usando outro nome."
                    : "Esta categoria não possui conteúdos disponíveis."}
                </p>
              </div>
            )}

          {/* Conteúdos */}
          {!error && displayedItems.length > 0 && (
            <>
              <div style={inlineStyles("grid grid-cols-4 mb-4 mr-4 gap-4")}>
                {displayedItems.map((item, index) => {
                  const image = getItemImage(item);

                  const card = (
                    <article
                      tabIndex={section === "live" ? undefined : 0}
                      style={inlineStyles("h-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] focus:outline-none focus:ring-4 focus:ring-indigo-400")}
                    >
                      <div style={inlineStyles("flex aspect-[2/3] items-center justify-center overflow-hidden bg-[#202638]")}>
                        {image ? (
                          <img
                            src={image}
                            alt={getItemName(item)}
                            style={inlineStyles("h-full w-full object-cover")}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span style={inlineStyles("text-5xl text-gray-500")}>
                            {section === "live" ? "TV" : "▶"}
                          </span>
                        )}
                      </div>

                      <div style={inlineStyles("p-4 text-left")}>
                        <h3 style={inlineStyles("line-clamp-2 text-base font-semibold")}>
                          {getItemName(item)}
                        </h3>

                        {section === "movies" && item.rating && (
                          <p style={inlineStyles("mt-2 text-sm text-yellow-400")}>
                            Nota: {item.rating}
                          </p>
                        )}

                        {section === "live" && (
                          <p style={inlineStyles("mt-2 text-sm text-gray-400")}>
                            Canal de televisão
                          </p>
                        )}

                        {section === "series" && (
                          <p style={inlineStyles("mt-2 text-sm text-gray-400")}>Série</p>
                        )}
                      </div>
                    </article>
                  );

                  return section === "live" ? (
                    <button
                      key={`${getItemId(item)}-${index}`}
                      type="button"
                      onClick={() => onSelectChannel(item)}
                      style={inlineStyles("block h-full w-full rounded-xl text-left transition-transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-400")}
                    >
                      {card}
                    </button>
                  ) : (
                    <div key={`${getItemId(item)}-${index}`}>{card}</div>
                  );
                })}
              </div>

              {/* Indicador de carregamento / fim da lista */}
              {!search && (
                <div
                  ref={loadMoreRef}
                  style={inlineStyles("flex min-h-24 items-center justify-center")}
                >
                  {loadingMore && (
                    <div style={inlineStyles("flex items-center ")}>
                      <div style={{...(inlineStyles("h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-indigo-500")), ...{"marginRight":"12px"}}} />

                      <p style={inlineStyles("text-lg text-gray-400")}>
                        Carregando mais conteúdos...
                      </p>
                    </div>
                  )}

                  {!loadingMore && hasMore && (
                    <p style={inlineStyles("text-sm text-gray-500")}>
                      Role para carregar mais conteúdos
                    </p>
                  )}

                  {!hasMore && (
                    <p style={inlineStyles("text-sm text-gray-200")}>
                      Você chegou ao final da lista.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default Catalog;
