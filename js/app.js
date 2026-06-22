const API_URL =
"https://script.google.com/macros/s/AKfycbyYZqOtzsls8pEv4fG_l8BZApY3Mvprwr_OYRSi5ArJWwsLQA9vWuRVWZMCiDbMlFay/exec";

let priceTable = {};
let produtosSistema = [];
let selectedPhotos = [];
let totalProdutos = 0;

/*
==========================
CARREGAMENTO INICIAL
==========================
*/

document.addEventListener("DOMContentLoaded", () => {

setupPolaroidUpload();

carregarProdutosFormulario();

loadPrices();

bindEvents();

});



/*
==========================
PREÇOS
==========================
*/


async function loadPrices() {

try {


const response =
  await fetch(
    API_URL + "?action=prices"
  );

const data =
  await response.json();

if (!Array.isArray(data)) return;

data.slice(1).forEach(row => {

  const nome = row[0];
  const valor = Number(row[1]);

  if (nome) {
    priceTable[nome] = valor;
  }

});

updateSummary();


} catch (err) {


console.error(
  "Erro carregando preços:",
  err
);


}
}


/*
==========================
EVENTOS
==========================
*/

function bindEvents() {

document
.querySelectorAll(
"select,input,textarea"
)
.forEach(el => {

  el.addEventListener(
    "change",
    updateSummary
  );

});

document
.getElementById("pedidoForm")
.addEventListener(
"submit",
submitOrder
);

}

/*
==========================
UPLOAD POLAROID
==========================
*/


function setupPolaroidUpload() {

    document
    .getElementById("fotos")
    .addEventListener(
        "change",
        previewPhotos
    );

}

function previewPhotos(e) {

const preview =
document.getElementById(
"preview"
);

preview.innerHTML = "";

selectedPhotos =
[...e.target.files];

selectedPhotos.forEach(file => {

const reader =
  new FileReader();

reader.onload = function(ev) {

  const img =
    document.createElement("img");

  img.src =
    ev.target.result;

  preview.appendChild(img);

};

reader.readAsDataURL(file);

});

}

/*
==========================
RESUMO
==========================
*/


function updateSummary() {

    const cesta =
        document.getElementById(
            "nomeCesta"
        ).value;

    let total = 0;

    let html = "";

    const produtoCesta =
        produtosSistema.find(
            p =>
                p.produto === cesta
        );

    if (produtoCesta) {

        total +=
            Number(
                produtoCesta.valor
            );

        html += `
            <p>
                ${produtoCesta.produto}
                - R$ ${Number(
                    produtoCesta.valor
                ).toFixed(2)}
            </p>
        `;

    }

    document
    .querySelectorAll(
        '#adicionaisContainer input[type="checkbox"]:checked'
    )
    .forEach(item => {

        const produto =
            produtosSistema.find(
                p =>
                    p.produto === item.value
            );

        if (!produto) return;

        total +=
            Number(
                produto.valor
            );

        html += `
            <p>
                ${produto.produto}
                - R$ ${Number(
                    produto.valor
                ).toFixed(2)}
            </p>
        `;

    });

    html += `
        <hr>

        <p>
        <strong>
        Total Produtos:
        R$ ${total.toFixed(2)}
        </strong>
        </p>

        <p style="
            color:#d35400;
            font-size:14px;
        ">
        ⚠️ O valor do frete será informado após a análise do endereço de entrega.
        </p>
    `;

    document
    .getElementById(
        "resumoPedido"
    )
    .innerHTML = html;
totalProdutos = total;
    document
    .getElementById(
        "totalPedido"
    )
    .innerHTML =
    "Total Produtos: R$ " +
    total.toFixed(2);

}

/*
==========================
BASE64
==========================
*/

async function fileToBase64(file) {

return new Promise(
(resolve,reject)=>{


  const reader =
    new FileReader();

  reader.onload =
    ()=>{

      resolve(
        reader.result
        .split(",")[1]
      );

    };

  reader.onerror =
    reject;

  reader.readAsDataURL(
    file
  );

}

);

}

/*
==========================
ENVIO PEDIDO
==========================
*/

async function submitOrder(e) {

e.preventDefault();

try {

const adicionais = [];

document
  .querySelectorAll(
    'input[type="checkbox"]:checked'
  )
  .forEach(el => {

    adicionais.push(
      el.value
    );

  });

const photos = [];

for (
  const file
  of selectedPhotos
) {

  photos.push({

    name:
      file.name,

    contentType:
      file.type,

    base64:
      await fileToBase64(
        file
      )

  });

}

const payload = {

  nomeCliente:
    document.getElementById(
      "nomeCliente"
    ).value,

  telefone:
    document.getElementById(
      "telefone"
    ).value,

  nomeCesta:
    document.getElementById(
      "nomeCesta"
    ).value,

  tipoPao:
    document.getElementById(
      "tipoPao"
    ).value,

  espalhavel:
    document.getElementById(
      "espalhavel"
    ).value,

  bebida:
    document.getElementById(
      "bebida"
    ).value,

  adicionais,

  mensagem:
    document.getElementById(
      "mensagem"
    ).value,

  dataEntrega:
    document.getElementById(
      "dataEntrega"
    ).value,

  horaEntrega:
    document.getElementById(
      "horaEntrega"
    ).value,

  endereco:
    document.getElementById(
      "endereco"
    ).value,

  pagamento:
    document.querySelector(
      'input[name="pagamento"]:checked'
    ).value,

  photos,

valorProdutos:
    totalProdutos

};

const response =
  await fetch(
    API_URL,
    {
      method:"POST",
      body:JSON.stringify(
        payload
      )
    }
  );

const result =
  await response.json();

if(result.success){

  document
    .getElementById("pedidoForm")
    .classList.add("hidden");

  document
    .getElementById("sucesso")
    .classList.remove("hidden");

  document
    .getElementById("numeroPedido")
    .innerHTML =
    "Pedido: " +
    result.orderId;

  const mensagem = encodeURIComponent(

`🌷 Doce Cesta Brasília

Pedido: ${result.orderId}

Cliente: ${payload.nomeCliente}

Telefone: ${payload.telefone}

Cesta: ${payload.nomeCesta}

Pão: ${payload.tipoPao}

Espalhável: ${payload.espalhavel}

Bebida: ${payload.bebida}

Adicionais: ${payload.adicionais.join(", ")}

Entrega: ${payload.dataEntrega}

Horário: ${payload.horaEntrega}

Pagamento: ${payload.pagamento}`
  );

  window.open(
    `https://wa.me/5561984533575?text=${mensagem}`,
    '_blank'
  );

}else{

  alert(result.error);

}

} catch(err){


console.error(err);

alert(
  "Erro ao enviar pedido."
);

}

}

async function carregarProdutosFormulario(){

    const response =
        await fetch(
            API_URL + "?action=products"
        );

    const produtos =
        await response.json();
produtosSistema = produtos;

    const cesta =
        document.getElementById("nomeCesta");

    const pao =
        document.getElementById("tipoPao");

    const espalhavel =
        document.getElementById("espalhavel");

    const bebida =
        document.getElementById("bebida");

    const adicionais =
        document.getElementById(
            "adicionaisContainer"
        );

    cesta.innerHTML = "";
    pao.innerHTML = "";
    espalhavel.innerHTML = "";
    bebida.innerHTML = "";
    adicionais.innerHTML = "";

    produtos.forEach(item=>{

        if(item.ativo !== "SIM"){
            return;
        }

        if(item.categoria === "Cesta"){

            cesta.innerHTML +=
            `<option>${item.produto}</option>`;

        }

        if(item.categoria === "Pão"){

            pao.innerHTML +=
            `<option>${item.produto}</option>`;

        }

        if(item.categoria === "Espalhável"){

            espalhavel.innerHTML +=
            `<option>${item.produto}</option>`;

        }

        if(item.categoria === "Bebida"){

            bebida.innerHTML +=
            `<option>${item.produto}</option>`;

        }

       if(item.categoria === "Adicional"){

    const idPolaroid =
        item.produto === "Polaroid"
        ? 'id="polaroid"'
        : "";

    adicionais.innerHTML += `

    <label class="check">

        <input
        type="checkbox"
        value="${item.produto}"
        ${idPolaroid}>

        ${item.produto}

    </label>

    `;

}

    });
document
.querySelectorAll(
'#adicionaisContainer input[type="checkbox"]'
)
.forEach(check=>{

    check.addEventListener(
        "change",
        () => {

            updateSummary();

            const polaroid =
                document.getElementById(
                    "polaroid"
                );

            const upload =
                document.getElementById(
                    "uploadContainer"
                );

            if(polaroid){

                upload.classList.toggle(
                    "hidden",
                    !polaroid.checked
                );

            }

        }
    );

});updateSummary();
}