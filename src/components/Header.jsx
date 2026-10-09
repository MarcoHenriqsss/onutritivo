import React, { useState } from "react";

function Header({ quantidadeCarrinho, abrirCarrinho }) {
  const [menuAberto, setMenuAberto] = useState(false);

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <header className="header">
      <div className="header-container">

        <a
          href="#inicio"
          className="logo"
          onClick={fecharMenu}
        >
          <img
            src="/logo.jpeg"
            alt="Delicias da Gaby - delicias naturais e saudáveis"
          />
        </a>

        <nav
          className={
            menuAberto
              ? "nav-menu aberto"
              : "nav-menu"
          }
        >
          <a
            href="#inicio"
            onClick={fecharMenu}
          >
            Início
          </a>

          <a
            href="#productos"
            onClick={fecharMenu}
          >
            Produtos
          </a>

          <a
            href="#sobre"
            onClick={fecharMenu}
          >
            Sobre nós
          </a>

          <a
            href="https://www.instagram.com/delicias_gaby0/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={fecharMenu}
          >
            Instagram
          </a>
        </nav>

        <div className="header-actions">

<button
  className="cart-button"
  onClick={abrirCarrinho}
  aria-label="Abrir carrinho"
>
  <svg
    className="cart-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 8h12l1 12H5L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>

  <span className="cart-text">Carrinho</span>

  {quantidadeCarrinho > 0 && (
    <span className="cart-count">
      {quantidadeCarrinho}
    </span>
  )}
</button>

          <button
            className="menu-button"
            onClick={() =>
              setMenuAberto(!menuAberto)
            }
            aria-label="Abrir menu"
          >
            {menuAberto ? "×" : "☰"}
          </button>

        </div>

      </div>
    </header>
  );
}

export default Header;