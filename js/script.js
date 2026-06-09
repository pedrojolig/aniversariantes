const API_URL = "http://localhost:3000/api/pessoas"; 

const form = document.getElementById("formCadastro");
const lista = document.getElementById("lista");

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

  carregarLista();
});

async function carregarLista() {
  const res = await fetch(API_URL);
  const pessoas = await res.json();

  lista.innerHTML = "";
  pessoas.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.Nome} - ${new Date(p.DataNascimento).toLocaleDateString()} (Grupo ${p.Grupo})`;
    lista.appendChild(li);
  });
}

carregarLista();
