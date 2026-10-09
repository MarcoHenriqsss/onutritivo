import React from "react";

function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-content">

        <span className="hero-small">
          Delícias da Gaby - Produtos caseiros e saborosos.
        </span>

        <h1>
          Doces, tortas e muito mais.
          <br />
          
        </h1>

        <p>
          Descubra uma variedade de sobremesas caseiras, feitas com ingredientes frescos e de alta qualidade.
        </p>

        <a href="#productos" className="hero-button">
          CONHECER PRODUTOS
        </a>

      </div>
    </section>
  );
}

export default Hero;