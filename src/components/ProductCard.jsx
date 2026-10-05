import React from "react";

function ProductCard({
  produto,
  adicionarAoCarrinho,
  abrirProduto,
}) {
  const temPreco =
    produto.preco !== null && produto.preco > 0;

  function consultarWhatsApp() {
    const mensagem = encodeURIComponent(
      `Olá! Gostaria de consultar o preço e a disponibilidade do produto ${produto.nome}.`
    );

    window.open(
      `https://wa.me/5562995112002?text=${mensagem}`,
      "_blank"
    );
  }

  return (
    <article className="product-card">

      <div
        className="product-image"
        onClick={() => abrirProduto(produto)}
      >
<img
  src={
    produto.imagem?.startsWith("http")
      ? produto.imagem
      : `/Perfumes/Imagens/${produto.imagem}`
  }
  alt={produto.nome}
/>
      </div>

      <div className="product-info">

        <span className="product-category">
          {produto.categoria}
        </span>

        <h3>
          {produto.nome}
        </h3>

        <p className="product-description">
          {produto.descricao}
        </p>

        <div className="product-bottom">

          {temPreco ? (
            <strong>
              R$ {produto.preco
                .toFixed(2)
                .replace(".", ",")}
            </strong>
          ) : (
            <strong>
              Confira!
            </strong>
          )}

          {temPreco ? (
            <button
              type="button"
              onClick={() =>
                adicionarAoCarrinho(produto)
              }
            >
              Adicionar ao carrinho
            </button>
          ) : (
            <button
              type="button"
              onClick={consultarWhatsApp}
            >
              Consultar no WhatsApp
            </button>
          )}

        </div>

      </div>

    </article>
  );
}

export default ProductCard;