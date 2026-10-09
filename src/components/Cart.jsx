import React from "react";

function Cart({
  carrinho,
  fechar,
  removerProduto,
  alterarQuantidade,
}) {
  const total = carrinho.reduce(
    (soma, item) =>
      soma + item.preco * item.quantidade,
    0
  );

  const quantidade = carrinho.reduce(
    (soma, item) =>
      soma + item.quantidade,
    0
  );

  function finalizarWhatsApp() {
    if (carrinho.length === 0) return;

    const numeroWhatsApp = "5562995112002";

    let mensagem =
      "Olá! Gostaria de fazer um pedido na loja O Nutritivo.\n\n";

    carrinho.forEach((item) => {
      const subtotal =
        item.preco * item.quantidade;

      mensagem +=
        `• ${item.nome} - ${item.quantidade}x - R$ ${subtotal
          .toFixed(2)
          .replace(".", ",")}\n`;
    });

    mensagem +=
      `\n*Total: R$ ${total
        .toFixed(2)
        .replace(".", ",")}*`;

    mensagem +=
      "\n\nGostaria de receber informações sobre pagamento e entrega.";

    const mensagemCodificada =
      encodeURIComponent(mensagem);

    window.open(
      `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`,
      "_blank"
    );
  }

  return (
    <div
      className="cart-overlay"
      onClick={fechar}
    >
      <aside
        className="cart"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="cart-header">

          <div>
            <span>SEU PEDIDO</span>
            <h2>Carrinho</h2>
          </div>

          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar carrinho"
          >
            ×
          </button>

        </div>

        {carrinho.length === 0 ? (

          <div className="empty-cart">

            <div>🛍</div>

            <h3>
              Seu carrinho está vazio
            </h3>

            <p>
              Adicione seus  favoritos
              para continuar.
            </p>

            <button
              type="button"
              onClick={fechar}
            >
              CONTINUAR COMPRANDO
            </button>

          </div>

        ) : (

          <>
            <div className="cart-items">

              {carrinho.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

<img
  src={
    item.imagem?.startsWith("http")
      ? item.imagem
      : `/Perfumes/Imagens/${item.imagem}`
  }
  alt={item.nome}
/>

                  <div className="cart-item-info">

                    <h3>
                      {item.nome}
                    </h3>

                    <span>
                      R$ {item.preco
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>

                    <div className="quantity">

                      <button
                        type="button"
                        onClick={() =>
                          alterarQuantidade(
                            item.id,
                            item.quantidade - 1
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantidade}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          alterarQuantidade(
                            item.id,
                            item.quantidade + 1
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <button
                      type="button"
                      className="remove-item"
                      onClick={() =>
                        removerProduto(item.id)
                      }
                    >
                      Remover
                    </button>

                  </div>

                </div>

              ))}

            </div>

            <div className="cart-footer">

              <div className="cart-total">

                <span>
                  {quantidade} item(ns)
                </span>

                <strong>
                  R$ {total
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>

              </div>

              <button
                type="button"
                className="whatsapp-button"
                onClick={finalizarWhatsApp}
              >
                FINALIZAR PELO WHATSAPP
              </button>
              <button
  type="button"
  className="continue-shopping-button"
  onClick={fechar}
>
  CONTINUAR COMPRANDO
</button>

              <small>
                O pedido será enviado pelo WhatsApp
                para confirmar disponibilidade,
                pagamento e entrega.
              </small>

            </div>

          </>
        )}

      </aside>
    </div>
  );
}

export default Cart;