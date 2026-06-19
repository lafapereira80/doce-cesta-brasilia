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
	carregarAgenda();

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

    const tbody =
        document.getElementById(
            "producaoBody"
        );

    tbody.innerHTML = "";

    dados.slice(1).forEach(row=>{

        const status =
            row[14];

        if(
            status === "Entregue" ||
            status === "Cancelado"
        ){
            return;
        }

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${row[0]}</td>
            <td>${row[2]}</td>
            <td>${row[10]}</td>
            <td>${row[11]}</td>
            <td>${status}</td>

            <td>

            <button
            onclick="
            avancarStatus(
            '${row[0]}',
            '${status}'
            )">

            Avançar

            </button>

            </td>

        `;

        tbody.appendChild(tr);

    });

}

async function avancarStatus(
    pedido,
    status
){

    let novoStatus =
        status;

    if(status==="Recebido"){
        novoStatus="Produção";
    }
    else if(
        status==="Produção"
    ){
        novoStatus=
        "Saiu para Entrega";
    }
    else if(
        status==="Saiu para Entrega"
    ){
        novoStatus=
        "Entregue";
    }

    await alterarStatus(
        pedido,
        novoStatus
    );

    carregarProducao();

}

async function carregarAgenda(){

    const response =
        await fetch(
            API_URL + "?action=orders"
        );

    const dados =
        await response.json();

    console.log(
        "DATA DO PRIMEIRO PEDIDO:",
        dados[1][10]
    );

}