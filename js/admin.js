const API_URL =
"https://script.google.com/macros/s/AKfycbyYZqOtzsls8pEv4fG_l8BZApY3Mvprwr_OYRSi5ArJWwsLQA9vWuRVWZMCiDbMlFay/exec";

function login(){

    const usuario =
        document.getElementById("usuario").value;

    const senha =
        document.getElementById("senha").value;

    if(
        usuario === "admin" &&
        senha === "DoceCesta2026"
    ){

        document.getElementById(
            "loginBox"
        ).style.display = "none";

        document.getElementById(
            "adminArea"
        ).style.display = "block";

        loadDashboard();
        carregarPedidos();
        carregarEntregas();
        carregarProdutos();
        loadFinanceiro();
	carregarProducao();
console.log("CHAMANDO AGENDA");	
carregarAgenda();
carregarTopProdutos();

    }else{

        alert("Usuário ou senha inválidos");

    }

}

async function carregarDashboard(){

    const response =
        await fetch(
            API_URL + "?action=dashboard"
        );

    const data =
        await response.json();

    document.getElementById(
        "totalPedidos"
    ).innerText =
        data.totalPedidos || 0;

    document.getElementById(
        "recebidos"
    ).innerText =
        data.recebidos || 0;

    document.getElementById(
        "producao"
    ).innerText =
        data.producao || 0;

    document.getElementById(
        "entregues"
    ).innerText =
        data.entregues || 0;

    document.getElementById(
        "cancelados"
    ).innerText =
        data.cancelados || 0;

}

async function carregarPedidos(){

    const response =
        await fetch(
            API_URL + "?action=orders"
        );

    const dados =
        await response.json();

    const tbody =
        document.getElementById(
            "pedidosBody"
        );

    tbody.innerHTML = "";

    dados.slice(1).forEach(row=>{

        const tr =
            document.createElement("tr");

        const fotos =
            row[15]
            ? `<a href="${row[15]}" target="_blank">Ver</a>`
            : "-";

        tr.innerHTML = `

            <td>${row[0]}</td>        
<td>
<a href="#"
onclick='abrirPedido(${JSON.stringify(row)})'>
${row[2]}
</a>
</td>
            <td>${row[3]}</td>
            <td>${row[10]}</td>
            <td>${row[14]}</td>
            <td>${fotos}</td>

            <td>

                <select
                onchange="alterarStatus(
                '${row[0]}',
                this.value
                )">

                    <option>
                    Recebido
                    </option>

                    <option>
                    Produção
                    </option>

                    <option>
                    Saiu para Entrega
                    </option>

                    <option>
                    Entregue
                    </option>

                    <option>
                    Cancelado
                    </option>

                </select>

            </td>

        `;

        tbody.appendChild(tr);

    });

}

async function alterarStatus(
    pedido,
    status
){

    await fetch(
        API_URL,
        {
            method:"POST",
            body:JSON.stringify({
                action:"updateStatus",
                orderId:pedido,
                status:status
            })
        }
    );

    carregarDashboard();

    alert(
        "Status atualizado!"
    );

}

document
.getElementById("busca")
?.addEventListener(
"keyup",
function(){

const termo =
this.value.toLowerCase();

const linhas =
document.querySelectorAll(
"#pedidosBody tr"
);

linhas.forEach(l=>{

l.style.display =
l.innerText
.toLowerCase()
.includes(termo)
? ""
: "none";

});

});

function abrirPedido(row){
console.log("ABRINDO PEDIDO");
console.log(row);
    const html = `

    <p><b>Pedido:</b> ${row[0]}</p>

    <p><b>Cliente:</b> ${row[2]}</p>

    <p><b>Telefone:</b> ${row[3]}</p>

    <p><b>Cesta:</b> ${row[4]}</p>

    <p><b>Pão:</b> ${row[5]}</p>

    <p><b>Espalhável:</b> ${row[6]}</p>

    <p><b>Bebida:</b> ${row[7]}</p>

    <p><b>Adicionais:</b> ${row[8]}</p>

    <p><b>Mensagem:</b><br>${row[9]}</p>

    <p><b>Data Entrega:</b> ${row[10]}</p>

    <p><b>Hora Entrega:</b> ${row[11]}</p>

    <p><b>Endereço:</b><br>${row[12]}</p>

    <p><b>Pagamento:</b> ${row[13]}</p>

    <p><b>Status:</b> ${row[14]}</p>

    <p>
        <b>Fotos:</b><br>
        <a href="${row[15]}"
        target="_blank">
        Abrir Fotos
        </a>
    </p>

    `;

    document
        .getElementById("pedidoDetalhes")
        .innerHTML = html;

console.log("CLIENTE:", row[2]);

try {

    carregarHistoricoCliente(row[2]);

} catch(err) {

    console.error(
        "ERRO HISTORICO:",
        err
    );

}

    document
        .getElementById("pedidoModal")
        .style.display = "block";

}

function fecharModal(){

    document
        .getElementById("pedidoModal")
        .style.display = "none";

}

function imprimirPedido(){

    const conteudo =
        document.getElementById(
            "pedidoDetalhes"
        ).innerHTML;

    const janela =
        window.open(
            "",
            "_blank",
            "width=800,height=900"
        );

    janela.document.write(`
        <html>
        <head>

        <title>
        Ficha de Produção
        </title>

        <style>

        body{
            font-family:Arial;
            padding:20px;
        }

        h2{
            text-align:center;
        }

        p{
            margin:8px 0;
        }

        </style>

        </head>

        <body>

        <h2>
        DOCE CESTA BRASÍLIA
        </h2>

        <h3>
        FICHA DE PRODUÇÃO
        </h3>

        ${conteudo}

        </body>
        </html>
    `);

    janela.document.close();

    setTimeout(() => {
        janela.print();
    }, 500);

}

async function carregarEntregas(){

    const response =
        await fetch(
            API_URL + "?action=deliveries"
        );

    const dados =
        await response.json();

    const tbody =
        document.getElementById(
            "deliveriesBody"
        );

    tbody.innerHTML = "";

    dados
    .sort((a,b)=>{

        const d1 =
            new Date(
                a.dataEntrega +
                " " +
                a.horaEntrega
            );

        const d2 =
            new Date(
                b.dataEntrega +
                " " +
                b.horaEntrega
            );

        return d1 - d2;

    })
    .forEach(item=>{

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>${item.dataEntrega}</td>
            <td>${item.horaEntrega}</td>
            <td>${item.cliente}</td>
            <td>${item.status}</td>
        `;

        tbody.appendChild(tr);

    });

}

async function carregarProdutos(){

    const response =
        await fetch(
            API_URL + "?action=products"
        );

    const produtos =
        await response.json();

    const tbody =
        document.getElementById(
            "produtosBody"
        );

    tbody.innerHTML = "";

    produtos.forEach(produto=>{

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${produto.categoria}</td>

            <td>
                <input
                value="${produto.produto}"
                id="nome_${produto.produto}">
            </td>

            <td>
                <input
                type="number"
                value="${produto.valor}"
                id="valor_${produto.produto}">
            </td>

            <td>

                <select
                id="ativo_${produto.produto}">

                    <option
                    ${produto.ativo==="SIM"?"selected":""}>
                    SIM
                    </option>

                    <option
                    ${produto.ativo==="NAO"?"selected":""}>
                    NAO
                    </option>

                </select>

            </td>

            <td>

                <button
                onclick="salvarProduto(
                '${produto.categoria}',
                '${produto.produto}'
                )">

                Salvar

                </button>

            </td>

        `;

        tbody.appendChild(tr);

    });

}

async function adicionarProduto(){

    const categoria =
        document.getElementById(
            "novaCategoria"
        ).value;

    const produto =
        document.getElementById(
            "novoProduto"
        ).value;

    const valor =
        document.getElementById(
            "novoValor"
        ).value;

    if(!produto){

        alert(
            "Informe o nome do produto"
        );

        return;

    }

    await fetch(
        API_URL,
        {
            method:"POST",
            body:JSON.stringify({
                action:"addProduct",
                categoria,
                produto,
                valor
            })
        }
    );

    alert(
        "Produto cadastrado!"
    );

    carregarProdutos();

}

async function loadFinanceiro() {

    try {

        const response =
            await fetch(
                API_URL + "?action=financeiro"
            );

        const dados =
            await response.json();

        document.getElementById(
            "fatHoje"
        ).innerHTML =
        "R$ " + dados.faturamentoHoje;

        document.getElementById(
            "fatMes"
        ).innerHTML =
        "R$ " + dados.faturamentoMes;

        document.getElementById(
            "ticketMedio"
        ).innerHTML =
        "R$ " + Number(
            dados.ticketMedio
        ).toFixed(2);

    } catch(err) {

        console.error(
            "Erro financeiro:",
            err
        );

    }

}


async function salvarProduto(
    categoria,
    produtoOriginal
){

    const produto =
        document.getElementById(
            "nome_" + produtoOriginal
        ).value;

    const valor =
        document.getElementById(
            "valor_" + produtoOriginal
        ).value;

    const ativo =
        document.getElementById(
            "ativo_" + produtoOriginal
        ).value;

    await fetch(
        API_URL,
        {
            method:"POST",
            body:JSON.stringify({
                action:"updateProduct",
                categoria,
                produtoOriginal,
                produto,
                valor,
                ativo
            })
        }
    );

    alert(
        "Produto atualizado!"
    );

    carregarProdutos();

}

function abrirAba(id, botao){

    document
    .querySelectorAll('.tab-content')
    .forEach(tab=>{

        tab.classList.remove(
            'active'
        );

    });

    document
    .querySelectorAll('.tab-btn')
    .forEach(btn=>{

        btn.classList.remove(
            'active'
        );

    });

    document
    .getElementById(id)
    .classList.add('active');

    botao.classList.add('active');

}


async function loadDashboard() {

    try {

        const response =
            await fetch(
                API_URL + "?action=dashboard"
            );

        const dados =
            await response.json();

        document.getElementById(
            "totalPedidos"
        ).innerHTML =
        dados.totalPedidos || 0;

        document.getElementById(
            "recebidos"
        ).innerHTML =
        dados.recebidos || 0;

        document.getElementById(
            "producao"
        ).innerHTML =
        dados.producao || 0;

        document.getElementById(
            "entregues"
        ).innerHTML =
        dados.entregues || 0;

        document.getElementById(
            "cancelados"
        ).innerHTML =
        dados.cancelados || 0;

document.getElementById(
"fatHoje"
).innerHTML =
"R$ " +
Number(
dados.faturamentoHoje || 0
).toFixed(2);

document.getElementById(
"fatMes"
).innerHTML =
"R$ " +
Number(
dados.faturamentoMes || 0
).toFixed(2);

document.getElementById(
"pedidosMes"
).innerHTML =
dados.pedidosMes || 0;

document.getElementById(
"ticketMedio"
).innerHTML =
"R$ " +
Number(
dados.ticketMedio || 0
).toFixed(2);

    } catch(err) {

        console.error(
            "Erro Dashboard:",
            err
        );

    }

}
async function carregarProducao(){

const response =
await fetch(
API_URL + "?action=orders"
);

const dados =
await response.json();

console.log("TOTAL PEDIDOS:", dados.length);
console.log("PRIMEIRO PEDIDO:", dados[1]);

document.getElementById(
"kanbanRecebido"
).innerHTML = "";

document.getElementById(
"kanbanProducao"
).innerHTML = "";

document.getElementById(
"kanbanPronto"
).innerHTML = "";

document.getElementById(
"kanbanEntrega"
).innerHTML = "";

document.getElementById(
"kanbanEntregue"
).innerHTML = "";

dados.slice(1).forEach(row=>{

console.log(
"STATUS:",
row[0],
row[14]
);

const status = row[14];

const card = document.createElement("div");

card.className =
"kanban-card";

card.innerHTML = `

<h4>${row[2]}</h4>

<p>
Pedido:
${row[0]}
</p>

<p>
📅 ${row[10]}
</p>

<p>
⏰ ${row[11]}
</p>

<button
onclick="
avancarStatus(
'${row[0]}',
'${status}'
)">
Avançar
</button>

`;

if(status==="Recebido"){

document
.getElementById(
"kanbanRecebido"
)
.appendChild(card);

}

else if(status==="Produção"){

document
.getElementById(
"kanbanProducao"
)
.appendChild(card);

}

else if(status==="Pronto"){

document
.getElementById(
"kanbanPronto"
)
.appendChild(card);

}

else if(
status==="Saiu para Entrega"
){

document
.getElementById(
"kanbanEntrega"
)
.appendChild(card);

}

else if(
status==="Entregue"
){

document
.getElementById(
"kanbanEntregue"
)
.appendChild(card);

}

});

}

async function avancarStatus(
pedido,
status
){

let novoStatus = status;

if(status==="Recebido")
novoStatus="Produção";

else if(status==="Produção")
novoStatus="Pronto";

else if(status==="Pronto")
novoStatus="Saiu para Entrega";

else if(status==="Saiu para Entrega")
novoStatus="Entregue";

await alterarStatus(
pedido,
novoStatus
);

/* PROCURA O PEDIDO NA TABELA */

const response =
await fetch(
API_URL + "?action=orders"
);

const dados =
await response.json();

const pedidoAtual =
dados
.slice(1)
.find(
row => row[0] === pedido
);

if(pedidoAtual){

const cliente =
pedidoAtual[2];

const telefone =
String(pedidoAtual[3])
.replace(/\D/g,'');

let mensagem = "";

if(novoStatus==="Produção"){

mensagem =
`Olá ${cliente}! 😊

Seu pedido ${pedido}
entrou em produção.

Estamos preparando tudo com carinho.`;

}

else if(novoStatus==="Pronto"){

mensagem =
`Olá ${cliente}! 🎁

Seu pedido ${pedido}
já está pronto.`;

}

else if(novoStatus==="Saiu para Entrega"){

mensagem =
`Olá ${cliente}! 🚚

Seu pedido ${pedido}
saiu para entrega e chegará em breve.`;

}

else if(novoStatus==="Entregue"){

mensagem =
`Olá ${cliente}! ❤️

Seu pedido ${pedido}
foi entregue.

Obrigado pela preferência!`;

}

if(mensagem){

window.open(
`https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`,
"_blank"
);

}

}

carregarProducao();

loadDashboard();

}

async function carregarAgenda(){

    const response =
        await fetch(
            API_URL + "?action=orders"
        );

    const dados =
        await response.json();

    const tbody =
        document.getElementById(
            "agendaBody"
        );

    tbody.innerHTML = "";

    const hoje =
        new Date();

    const hojeStr =
        hoje.toISOString().split("T")[0];

    let encontrados = 0;

    dados.slice(1).forEach(row=>{

        if(!row[10]) return;

        const dataPedido =
            new Date(row[10])
            .toISOString()
            .split("T")[0];

        if(dataPedido === hojeStr){

            encontrados++;

            const tr =
                document.createElement("tr");

const hora =
new Date(row[11])
.toLocaleTimeString(
'pt-BR',
{
hour:'2-digit',
minute:'2-digit'
}
);

const endereco =
row[12] || "";

let regiao = "Brasília";

if(endereco.includes("Asa Sul"))
regiao = "Asa Sul";

else if(endereco.includes("Asa Norte"))
regiao = "Asa Norte";

else if(endereco.includes("Guará"))
regiao = "Guará";

else if(endereco.includes("Águas Claras"))
regiao = "Águas Claras";

else if(endereco.includes("Taguatinga"))
regiao = "Taguatinga";

else if(endereco.includes("Sudoeste"))
regiao = "Sudoeste";

 tr.innerHTML = `

<td>${hora}</td>
<td>${row[2]}</td>
<td>${row[4]}</td>
<td>${regiao}</td>
<td>${row[12]}</td>
<td>${row[14]}</td>

`;

            tbody.appendChild(tr);

        }

    });

    console.log(
        "PEDIDOS DE HOJE:",
        encontrados
    );

}

function adicionarGrupoAgenda(
    tbody,
    titulo,
    pedidos
){

    const trTitulo =
        document.createElement("tr");

    trTitulo.innerHTML = `
        <td colspan="5"
        style="
            background:#8B5E3C;
            color:white;
            font-weight:bold;
        ">
            ${titulo}
        </td>
    `;

    tbody.appendChild(
        trTitulo
    );

    if(pedidos.length === 0){

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td colspan="5">
                Nenhum pedido
            </td>
        `;

        tbody.appendChild(tr);

        return;

    }

    pedidos
    .sort((a,b)=>
        new Date(a[11]) -
        new Date(b[11])
    )
    .forEach(row=>{

        const hora =
            row[11]
            ? new Date(row[11])
            .toLocaleTimeString(
                'pt-BR',
                {
                    hour:'2-digit',
                    minute:'2-digit'
                }
            )
            : "";

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>${hora}</td>
            <td>${row[2]}</td>
            <td>${row[4]}</td>
            <td>${row[12]}</td>
            <td>${row[14]}</td>
        `;

        tbody.appendChild(tr);

    });

}

function imprimirRota(){

    const linhas =
    document.querySelectorAll(
        "#agendaBody tr"
    );

    let html = "";

    linhas.forEach(linha=>{

        const colunas =
        linha.querySelectorAll("td");

        html += `

        <p>

        <b>Horário:</b>
        ${colunas[0].innerText}

        <br>

        <b>Cliente:</b>
        ${colunas[1].innerText}

        <br>

        <b>Cesta:</b>
        ${colunas[2].innerText}

        <br>

        <b>Endereço:</b>
        ${colunas[3].innerText}

        </p>

        <hr>

        `;

    });

    const janela =
    window.open(
        "",
        "_blank",
        "width=800,height=900"
    );

    janela.document.write(`

    <html>

    <head>

    <title>
    Rota de Entregas
    </title>

    <style>

    body{
        font-family:Arial;
        padding:20px;
    }

    h1{
        text-align:center;
    }

    </style>

    </head>

    <body>

    <h1>
    DOCE CESTA BRASÍLIA
    </h1>

    <h2>
    ROTA DE ENTREGAS
    </h2>

    ${html}

    </body>

    </html>

    `);

    janela.document.close();

    setTimeout(()=>{

        janela.print();

    },500);

}

async function carregarTopProdutos(){

const response =
await fetch(
API_URL + "?action=topProdutos"
);

const dados =
await response.json();

const tbody =
document.getElementById(
"topProdutosBody"
);

tbody.innerHTML = "";

dados.forEach((item,index)=>{

const tr =
document.createElement("tr");

tr.innerHTML = `

<td>${index+1}º</td>
<td>${item[0]}</td>
<td>${item[1]}</td>

`;

tbody.appendChild(tr);

});

}

async function carregarHistoricoCliente(nome){

console.log("INICIANDO HISTORICO:", nome);

const response =
await fetch(
API_URL +
"?action=historicoCliente&nome=" +
encodeURIComponent(nome)
);

console.log("FETCH OK");

const dados =
await response.json();

console.log("DADOS:", dados);

let produtosHtml = "";

for(const produto in dados.produtos){

produtosHtml += `
<li>
${produto}
(${dados.produtos[produto]}x)
</li>
`;

}

document.getElementById(
"historicoCliente"
).innerHTML = `
<p>📦 Total de Pedidos: <b>${dados.totalPedidos}</b></p>
<p>💰 Total Gasto: <b>${dados.totalGasto}</b></p>
<p>🎯 Ticket Médio: <b>${dados.ticketMedio}</b></p>
<ul>${produtosHtml}</ul>
`;

console.log("HISTORICO CARREGADO");

}
