import React, { useState } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import Cart from "./components/Cart";
import produtos from "./data/produtos";
import { supabase } from "./lib/supabase";

function App() {

  const [produtosSupabase, setProdutosSupabase] = useState([]);

  const [carrinho, setCarrinho] = useState([]);

  React.useEffect(() => {
 async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true);

    if (error) {
      console.error("Erro ao carregar produtos:", error);
      return;
    }

    const produtosOrdenados = (data || []).sort(
      (a, b) =>
        a.nome.localeCompare(
          b.nome,
          "pt-BR",
          {
            sensitivity: "base",
          }
        )
    );

    setProdutosSupabase(produtosOrdenados);
  }

  carregarProdutos();
}, []);

  const [categoria, setCategoria] =
    useState("Todos");

  const [busca, setBusca] =
    useState("");

  const [cartAberto, setCartAberto] =
    useState(false);

  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);


  // ==========================================
  // ADICIONAR PRODUTO AO CARRINHO
  // ==========================================

  function adicionarCarrinho(produto) {

    // Produto sem preço não entra no carrinho
    if (
      produto.preco === null ||
      produto.preco <= 0
    ) {
      return;
    }

    setCarrinho((carrinhoAtual) => {

      const existe = carrinhoAtual.find(
        (item) => item.id === produto.id
      );

      // Se o produto já existe no carrinho
      if (existe) {

        return carrinhoAtual.map((item) => {

          if (item.id !== produto.id) {
            return item;
          }

          let novaQuantidade =
            item.quantidade + 1;

          // Se houver estoque definido,
          // respeita o limite
          if (
            produto.estoque > 0 &&
            novaQuantidade > produto.estoque
          ) {
            novaQuantidade = produto.estoque;
          }

          return {
            ...item,
            quantidade: novaQuantidade,
          };

        });
      }

      // Primeiro item desse produto
      return [
        ...carrinhoAtual,
        {
          ...produto,
          quantidade: 1,
        },
      ];

    });

    // Abre o carrinho depois de adicionar
    setCartAberto(true);
  }


  // ==========================================
  // REMOVER PRODUTO
  // ==========================================

  function removerProduto(id) {

    setCarrinho((carrinhoAtual) =>
      carrinhoAtual.filter(
        (item) => item.id !== id
      )
    );
  }


  // ==========================================
  // ALTERAR QUANTIDADE
  // ==========================================

  function alterarQuantidade(
    id,
    quantidade
  ) {

    // Se chegar a zero,
    // remove o produto
    if (quantidade <= 0) {

      removerProduto(id);

      return;
    }

    const produto = produtosSupabase.find(
      (item) => item.id === id
    );

    if (!produto) {
      return;
    }

    // Só limita pelo estoque quando
    // o estoque for maior que zero
    if (
      produto.estoque > 0 &&
      quantidade > produto.estoque
    ) {
      quantidade = produto.estoque;
    }

    setCarrinho((carrinhoAtual) =>
      carrinhoAtual.map((item) =>
        item.id === id
          ? {
              ...item,
              quantidade,
            }
          : item
      )
    );
  }


  // ==========================================
  // CATEGORIAS
  // ==========================================

  const categorias = [
    "Todos",

    ...new Set(
      produtosSupabase.map(
        (produto) => produto.categoria
      )
    ),
  ];


  // ==========================================
  // FILTRO DE PRODUTOS
  // ==========================================

  const produtosFiltrados =
    produtosSupabase.filter((produto) => {

      const pertenceCategoria =
        categoria === "Todos" ||
        produto.categoria === categoria;

      const correspondeBusca =
        produto.nome
          .toLowerCase()
          .includes(
            busca.toLowerCase()
          );

      return (
        pertenceCategoria &&
        correspondeBusca
      );
    });


  // ==========================================
  // QUANTIDADE TOTAL DO CARRINHO
  // ==========================================

  const quantidadeCarrinho =
    carrinho.reduce(
      (total, item) =>
        total + item.quantidade,
      0
    );


  return (
    <>

      {/* =====================================
          HEADER
      ===================================== */}

      <Header
        quantidadeCarrinho={
          quantidadeCarrinho
        }
        abrirCarrinho={() =>
          setCartAberto(true)
        }
      />


      <main>

        {/* ===================================
            HERO
        =================================== */}

        <Hero />


        {/* ===================================
            CATÁLOGO
        =================================== */}

        <section
          className="catalog"
          id="perfumes"
        >

          <div className="section-title">

            <span>
              NOSSOS PRODUTOS
            </span>

            <h2>
              Encontre o produto natural ideal para você.
            </h2>

            <p>
              Produtos naturais que cuidam de você e do planeta.
            </p>

          </div>


          {/* =================================
              CONTROLES
          ================================= */}

          <div className="catalog-controls">

            <div className="categories">

              {categorias.map(
                (cat) => (

                  <button
                    key={cat}
                    className={
                      categoria === cat
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCategoria(cat)
                    }
                  >
                    {cat}
                  </button>

                )
              )}

            </div>


            <div className="search">

              <span>
                ⌕
              </span>

              <input
                type="text"
                placeholder="Buscar produtos..."
                value={busca}
                onChange={(e) =>
                  setBusca(e.target.value)
                }
              />

            </div>

          </div>


          {/* =================================
              PRODUTOS
          ================================= */}

          {produtosFiltrados.length > 0 ? (

            <div className="products-grid">

              {produtosFiltrados.map(
                (produto) => (

                  <ProductCard
                    key={produto.id}
                    produto={produto}
                    adicionarAoCarrinho={
                      adicionarCarrinho
                    }
                    abrirProduto={
                      setProdutoSelecionado
                    }
                  />

                )
              )}

            </div>

          ) : (

            <div className="no-products">

              <h3>
                Nenhum produto encontrado.
              </h3>

              <p>
                Tente buscar por outro nome.
              </p>

            </div>

          )}

        </section>


        {/* ===================================
            SOBRE
        =================================== */}

        <section
          className="about"
          id="sobre"
        >

          <div className="about-container">

            <div className="about-image">

              <img
                src="/perfume-destaque.jpg"
                alt="O Nutritivo - Produtos Naturais"
              />

            </div>


            <div className="about-content">

              <span>
                O Nutritivo
              </span>

              <h2>
                Nossa História
                <br />
              
              </h2>

              <p>
                Fundado em 03 de março de 2016, em Anápolis,
                 O Nutritivo foi uma das primeiras lojas especializadas 
                 em alimentação saudável da região. Criada pelo nutricionista Rafael Maciel 
                 e pela administradora Gilcimara Maciel, a empresa surgiu com o objetivo de 
                 oferecer produtos para pessoas com restrições alimentares, além de itens a granel
                  e suplementos voltados à saúde e longevidade.
              </p>

              <p>
                Com o sucesso da loja, O Nutritivo expandiu sua atuação e,
                 em 04 de maio de 2018, mudou-se para um espaço maior e mais visível.
                  A mudança ampliou seu alcance em Anápolis e cidades vizinhas, 
                  consolidando a empresa como referência local em produtos
                   naturais e alimentação saudável.
                
              </p>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer>

        <div className="footer-brand">

          <strong>
            O Nutritivo
          </strong>

          <span>
            Produtos naturais que cuidam de você e do planeta.
          </span>


          <a
            href="https://www.instagram.com/onutritivo/"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-link"
          >
            Instagram · @onutritivo - Av. Universitária, 1481 - Vila Santa Isabel, Anápolis - GO, 75083-350
          </a>


          {/* =================================
              WHATSAPP FLUTUANTE
          ================================= */}

          <a
            href="https://wa.me/5522995112002"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            aria-label="Falar com a O Nutritivo pelo WhatsApp"
          >

            <svg
              viewBox="0 0 32 32"
              aria-hidden="true"
            >

              <path
                fill="currentColor"
                d="M19.11 17.24c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.26s.98 2.62 1.11 2.8c.14.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.57.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
              />

              <path
                fill="currentColor"
                d="M16.02 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.59 4.38 1.63 6.22L3.1 28.8l6.75-1.72a12.74 12.74 0 0 0 6.17 1.58h.01c7.07 0 12.8-5.73 12.8-12.8S23.09 3.2 16.02 3.2zm0 23.23h-.01a10.4 10.4 0 0 1-5.3-1.44l-.38-.23-4.01 1.02 1.07-3.91-.25-.4a10.42 10.42 0 1 1 8.88 4.96z"
              />

            </svg>

          </a>

        </div>


        <p>
          © {new Date().getFullYear()}
          {" "}
          O Nutritivo.
          Todos os direitos reservados.
        </p>

      </footer>


      {/* =====================================
          CARRINHO
      ===================================== */}

      {cartAberto && (

        <Cart
          carrinho={carrinho}

          fechar={() =>
            setCartAberto(false)
          }

          removerProduto={
            removerProduto
          }

          alterarQuantidade={
            alterarQuantidade
          }
        />

      )}


      {/* =====================================
          MODAL DO PRODUTO
      ===================================== */}

      {produtoSelecionado && (

        <ProductModal
          produto={produtoSelecionado}

          fechar={() =>
            setProdutoSelecionado(null)
          }

          adicionarCarrinho={
            adicionarCarrinho
          }

        />

      )}

    </>
  );
}

export default App;