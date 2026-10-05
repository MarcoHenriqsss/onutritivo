import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Admin.css";

function Admin() {
  const [sessao, setSessao] = useState(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);

  const [formAberto, setFormAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [arquivoImagem, setArquivoImagem] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: "",
    categoria: "",
    estoque: 0,
    ativo: true,
  });

  useEffect(() => {
    async function verificarSessao() {
      const { data } = await supabase.auth.getSession();

      setSessao(data.session);
    }

    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSessao(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (sessao) {
      carregarProdutos();
    }
  }, [sessao]);

 async function carregarProdutos() {
  setCarregandoProdutos(true);

  const { data, error } = await supabase
    .from("produtos")
    .select("*");

  setCarregandoProdutos(false);

  if (error) {
    console.error(
      "Erro ao carregar produtos:",
      error
    );

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

  setProdutos(produtosOrdenados);
}
  async function entrar(e) {
    e.preventDefault();

    setErro("");
    setCarregando(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos.");
    }
  }

  async function sair() {
    await supabase.auth.signOut();

    setSessao(null);
  }

  function abrirNovoProduto() {
    setProdutoEditando(null);

    setForm({
      nome: "",
      descricao: "",
      preco: "",
      imagem: "",
      categoria: "",
      estoque: 0,
      ativo: true,
    });

    setFormAberto(true);
  }

  function abrirEdicao(produto) {
    setProdutoEditando(produto);

    setForm({
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      preco:
        produto.preco !== null
          ? produto.preco
          : "",
      imagem: produto.imagem || "",
      categoria: produto.categoria || "",
      estoque: produto.estoque || 0,
      ativo: produto.ativo,
    });

    setFormAberto(true);
  }

  function fecharFormulario() {
    setFormAberto(false);
    setProdutoEditando(null);
  }

function extrairNomeImagemStorage(imagem) {
  if (!imagem?.startsWith("http")) {
    return null;
  }

  const partes = imagem.split(
    "/storage/v1/object/public/produtos/"
  );

  if (partes.length !== 2) {
    return null;
  }

  return partes[1];
}  

async function enviarImagem(file) {
  if (!file) return null;

  const extensao = file.name.split(".").pop();
  const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;

  const { error } = await supabase.storage
    .from("produtos")
    .upload(nomeArquivo, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Erro ao enviar imagem:", error);

    setErro("Não foi possível enviar a imagem.");

    return null;
  }

  const { data } = supabase.storage
    .from("produtos")
    .getPublicUrl(nomeArquivo);

  return data.publicUrl;
}

  function alterarCampo(e) {
    const { name, value, type, checked } =
      e.target;

    setForm((formAtual) => ({
      ...formAtual,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function salvarProduto(e) {
    e.preventDefault();

    setErro("");

let imagemUrl = form.imagem;

if (arquivoImagem) {
  imagemUrl = await enviarImagem(arquivoImagem);

  if (!imagemUrl) {
    return;
  }
}

const produto = {
  nome: form.nome.trim(),
  descricao: form.descricao.trim(),
  preco:
    form.preco === ""
      ? 0
      : Number(form.preco),
  imagem: imagemUrl,
  categoria: form.categoria.trim(),
  estoque: Number(form.estoque) || 0,
  ativo: form.ativo,
};

    if (!produto.nome) {
      setErro("Informe o nome do produto.");
      return;
    }

    if (produto.preco < 0) {
      setErro("O preço não pode ser negativo.");
      return;
    }

    if (produto.estoque < 0) {
      setErro("O estoque não pode ser negativo.");
      return;
    }

    let resultado;

    if (produtoEditando) {
      resultado = await supabase
        .from("produtos")
        .update(produto)
        .eq("id", produtoEditando.id);
    } else {
      resultado = await supabase
        .from("produtos")
        .insert(produto);
    }

    if (resultado.error) {
      console.error(
        "Erro ao salvar produto:",
        resultado.error
      );

      setErro(
        "Não foi possível salvar o produto."
      );

      return;
    }

    await carregarProdutos();

    fecharFormulario();
  }

  async function alternarAtivo(produto) {
    const { error } = await supabase
      .from("produtos")
      .update({
        ativo: !produto.ativo,
      })
      .eq("id", produto.id);

    if (error) {
      console.error(
        "Erro ao alterar produto:",
        error
      );

      return;
    }

    await carregarProdutos();
  }

async function excluirProduto(produto) {
  const confirmar = window.confirm(
    `Deseja realmente excluir "${produto.nome}"?`
  );

  if (!confirmar) return;

  const caminhoImagem = extrairNomeImagemStorage(
    produto.imagem
  );


  if (caminhoImagem) {
    const { error: erroImagem } =
      await supabase.storage
        .from("produtos")
        .remove([caminhoImagem]);

    if (erroImagem) {
      console.error(
        "Erro ao excluir imagem:",
        erroImagem
      );

      alert(
        "Não foi possível excluir a imagem do produto."
      );

      return;
    }
  }

  const { error } = await supabase
    .from("produtos")
    .delete()
    .eq("id", produto.id);

  if (error) {
    console.error(
      "Erro ao excluir produto:",
      error
    );

    alert(
      "Não foi possível excluir o produto."
    );

    return;
  }

  await carregarProdutos();
}

  if (!sessao) {
    return (
      <div className="admin-login">

        <div className="admin-login-box">

          <span className="admin-login-small">
            O Nutritivo
          </span>

          <h1>
            Painel Administrativo
          </h1>

          <p>
            Entre para gerenciar seus produtos.
          </p>

          <form onSubmit={entrar}>

            <label>
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Seu e-mail"
              required
            />

            <label>
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              placeholder="Sua senha"
              required
            />

            {erro && (
              <div className="admin-error">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
            >
              {carregando
                ? "ENTRANDO..."
                : "ENTRAR"}
            </button>

          </form>

        </div>

      </div>
    );
  }

  return (
    <div className="admin-panel">

      <header className="admin-header">

        <div>
          <span>
            O Nutritivo
          </span>

          <h1>
            Painel Administrativo
          </h1>
        </div>

        <button
          type="button"
          onClick={sair}
        >
          SAIR
        </button>

      </header>

      <main className="admin-content">

        <div className="admin-title">

          <div>
            <span>
              CATÁLOGO
            </span>

            <h2>
              Produtos
            </h2>
          </div>

          <button
            type="button"
            className="admin-new-button"
            onClick={abrirNovoProduto}
          >
            + NOVO PRODUTO
          </button>

        </div>

        {carregandoProdutos ? (

          <p>
            Carregando produtos...
          </p>

        ) : (

          <div className="admin-products">

            {produtos.map((produto) => (

              <div
                className={
                  produto.ativo
                    ? "admin-product"
                    : "admin-product inativo"
                }
                key={produto.id}
              >

<img
  src={
    produto.imagem?.startsWith("http")
      ? produto.imagem
      : `/Perfumes/Imagens/${produto.imagem}`
  }
  alt={produto.nome}
/>

                <div className="admin-product-info">

                  <span>
                    {produto.categoria}
                  </span>

                  <h3>
                    {produto.nome}
                  </h3>

                  <p>
                    {produto.descricao}
                  </p>

                  <div className="admin-product-details">

                    <strong>
                      {produto.preco > 0
                        ? `R$ ${Number(produto.preco)
                            .toFixed(2)
                            .replace(".", ",")}`
                        : "Confira!"}
                    </strong>

                    <span>
                      Estoque: {produto.estoque}
                    </span>

                  </div>

                  <div className="admin-product-actions">

                    <button
                      type="button"
                      onClick={() =>
                        abrirEdicao(produto)
                      }
                    >
                      EDITAR
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        alternarAtivo(produto)
                      }
                    >
                      {produto.ativo
                        ? "DESATIVAR"
                        : "ATIVAR"}
                    </button>

                    <button
                      type="button"
                      className="danger"
                      onClick={() =>
                        excluirProduto(produto)
                      }
                    >
                      EXCLUIR
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

      {formAberto && (

        <div
          className="admin-modal-overlay"
          onClick={fecharFormulario}
        >

          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>
                <span>
                  O Nutritivo
                </span>

                <h2>
                  {produtoEditando
                    ? "Editar produto"
                    : "Novo produto"}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharFormulario}
              >
                ×
              </button>

            </div>

            <form
              className="admin-form"
              onSubmit={salvarProduto}
            >

              <label>
                Nome
              </label>

              <input
                name="nome"
                value={form.nome}
                onChange={alterarCampo}
                placeholder="Nome do produto"
                required
              />

              <label>
                Descrição
              </label>

              <textarea
                name="descricao"
                value={form.descricao}
                onChange={alterarCampo}
                placeholder="Descrição do produto"
                rows="4"
              />

              <div className="admin-form-grid">

                <div>
                  <label>
                    Preço
                  </label>

                  <input
                    type="number"
                    name="preco"
                    value={form.preco}
                    onChange={alterarCampo}
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label>
                    Estoque
                  </label>

                  <input
                    type="number"
                    name="estoque"
                    value={form.estoque}
                    onChange={alterarCampo}
                    min="0"
                    step="1"
                  />
                </div>

              </div>

              <label>
                Categoria
              </label>

              <input
                name="categoria"
                value={form.categoria}
                onChange={alterarCampo}
                placeholder="Castanhas, Sementes, Temperos..."
              />

<label>
  Imagem do produto
</label>

<label className="admin-file-upload">
  <span>📷 Escolher imagem</span>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setArquivoImagem(e.target.files[0] || null)
    }
  />
</label>

{arquivoImagem && (
  <small className="admin-file-name">
    {arquivoImagem.name}
  </small>
)}

              <label className="admin-checkbox">

                <input
                  type="checkbox"
                  name="ativo"
                  checked={form.ativo}
                  onChange={alterarCampo}
                />

                Produto ativo na loja

              </label>

              {erro && (
                <div className="admin-error">
                  {erro}
                </div>
              )}

              <div className="admin-form-actions">

                <button
                  type="button"
                  onClick={fecharFormulario}
                >
                  CANCELAR
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  SALVAR PRODUTO
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Admin;