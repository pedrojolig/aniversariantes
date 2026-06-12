const API_URL = "http://localhost:3000/api/pessoas"; 

const form = document.getElementById("formCadastro");
const lista = document.getElementById("lista");
const botao = form.querySelector("button[type='submit']");
const mensagem = document.getElementById("mensagem");
const topo = document.getElementById("topo");

function validarCampos() {
  const nome = document.getElementById("nome").value.trim();
  const dataNascimento = document.getElementById("dataNascimento").value;
  const grupo = document.getElementById("grupo").value;
  botao.disabled = !(nome && dataNascimento && grupo);
}

form.addEventListener("input", validarCampos);
botao.disabled = true;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pessoa = {
    Nome: document.getElementById("nome").value,
    DataNascimento: document.getElementById("dataNascimento").value,
    Grupo: parseInt(document.getElementById("grupo").value),
    Presente: document.getElementById("presente").value
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pessoa)
  });

  await carregarLista();
  form.reset();
  botao.disabled = true;

  mensagem.textContent = `Cadastro de ${pessoa.Nome} realizado com sucesso!`;

  setTimeout(() => {
    topo.focus();
    mensagem.textContent = "";
  }, 5000);
});

function formatarDataISO(isoString) {
  const [ano, mes, dia] = isoString.split("-");
  return `${dia}/${mes}/${ano}`;
}

async function carregarLista() {
  try {
    const res = await fetch(API_URL);
    const pessoas = await res.json();

    lista.innerHTML = "";
    pessoas.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.Nome} - ${formatarDataISO(p.DataNascimento)} (Grupo ${p.Grupo})`;

      // Botão Editar com acessibilidade
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.setAttribute("aria-label", `Editar cadastro de ${p.Nome}`);
      btnEditar.onclick = async () => {
        const novoNome = prompt("Novo nome:", p.Nome);
        if (novoNome) {
          await fetch(`${API_URL}/${p.Id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nome: novoNome })
          });
          mensagem.textContent = `Cadastro de ${p.Nome} atualizado com sucesso!`;
          await carregarLista();
          setTimeout(() => mensagem.textContent = "", 5000);
        }
      };
      li.appendChild(btnEditar);

      // Botão Excluir com acessibilidade e tratamento de mensagens
      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.setAttribute("aria-label", `Excluir cadastro de ${p.Nome}`);
      btnExcluir.onclick = async () => {
        if (confirm(`Deseja excluir ${p.Nome}?`)) {
          try {
            const res = await fetch(`${API_URL}/${p.Id}`, { method: "DELETE" });
            if (res.ok) {
              mensagem.textContent = `Cadastro de ${p.Nome} excluído com sucesso!`;
              await carregarLista();
            } else if (res.status === 404) {
              mensagem.textContent = `Pessoa ${p.Nome} não encontrada no banco.`;
            } else {
              mensagem.textContent = `Erro ao excluir ${p.Nome}. Código: ${res.status}`;
            }
          } catch (err) {
            mensagem.textContent = `Erro de rede ao excluir ${p.Nome}.`;
            console.error(err);
          }
          setTimeout(() => mensagem.textContent = "", 5000);
        }
      };
      li.appendChild(btnExcluir);

      if (p.MensagemEnviada) {
        const btn = document.createElement("button");
        btn.textContent = `OK - ${p.Nome}`;
        btn.setAttribute("aria-label", `Confirmar lembrete de ${p.Nome}`);
        btn.onclick = async () => {
          await fetch(`${API_URL}/confirmar/${p.Id}`, { method: "PUT" });
          mensagem.textContent = `Lembrete de ${p.Nome} confirmado!`;
          setTimeout(() => mensagem.textContent = "", 5000);
        };
        li.appendChild(btn);
      }

      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao carregar lista:", err);
    mensagem.textContent = "Erro ao carregar lista de pessoas.";
    setTimeout(() => mensagem.textContent = "", 5000);
  }
}

document.addEventListener("DOMContentLoaded", carregarLista);
