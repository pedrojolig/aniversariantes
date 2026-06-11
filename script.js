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

  // Mensagem acessível
  mensagem.textContent = `Cadastro de ${pessoa.Nome} realizado com sucesso!`;

  // Após 5 segundos, foco volta para o topo e mensagem desaparece
  setTimeout(() => {
    topo.focus();       // move foco para o topo
    mensagem.textContent = ""; // limpa a mensagem da tela
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

      if (p.MensagemEnviada) {
        const btn = document.createElement("button");
        btn.textContent = `OK - ${p.Nome}`;
        btn.onclick = async () => {
          await fetch(`${API_URL}/confirmar/${p.Id}`, { method: "PUT" });
          alert(`Lembrete de ${p.Nome} confirmado!`);
        };
        li.appendChild(btn);
      }

      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao carregar lista:", err);
  }
}

document.addEventListener("DOMContentLoaded", carregarLista);
