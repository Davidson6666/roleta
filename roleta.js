// Dados da roleta
const premios = [
    "10 Diamantes", 
    "20 Diamantes", 
    "50 Diamantes", 
    "100 Diamantes", 
    "Skin Rara", 
    "200 Diamantes", 
    "500 Diamantes", 
    "Prêmio Especial"
];

const CORES = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#8AC24A', '#F06292'
];

const probabilidades = [25, 20, 15, 12, 10, 8, 7, 3]; // Percentuais correspondentes

// Variáveis de controle
let anguloAtual = 0;
let girando = false;
let priceSelected = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const idade = parseInt(document.getElementById('idade').value);
        
        if (idade < 15) {
            alert('Você precisa ter pelo menos 15 anos para participar');
            return;
        }

        // Simulando o envio do e-mail
        const email = document.getElementById('email').value;
        enviarEmail(email).then(() => {
            // Exibir tela de confirmação
            document.getElementById('login').classList.remove('ativa');
            document.getElementById('confirmacao').classList.add('ativa');

            // Redireciona para a tela da roleta após 3 segundos
            setTimeout(() => {
                document.getElementById('confirmacao').classList.remove('ativa');
                document.getElementById('roleta-tela').classList.add('ativa');
                inicializarRoleta();
                atualizarListaProbabilidades();
                configurarBotoesPreco();
            }, 3000);
        }).catch(error => {
            alert('Erro ao enviar o e-mail: ' + error.message);
        });
    });

    // Roleta
    document.getElementById('girar-btn').addEventListener('click', girarRoleta);
    window.addEventListener('resize', inicializarRoleta);
});

function configurarBotoesPreco() {
    document.querySelectorAll('.preco-item').forEach(item => {
        item.addEventListener('click', function() {
            const price = parseInt(this.getAttribute('data-price'));
            selectPrice(price);
        });
    });
}

// Função para simular o envio de e-mail
function enviarEmail(email) {
    return new Promise((resolve, reject) => {
        // Simula um atraso para o envio do e-mail
        setTimeout(() => {
            console.log('E-mail enviado para:', email);
            resolve();
        }, 1000);
    });
}

function selectPrice(price) {
    priceSelected = price;
    document.querySelectorAll('.preco-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Encontra o botão correto pelo atributo data-price
    document.querySelector(`.preco-item[data-price="${price}"]`).classList.add('selected');
    document.getElementById("pagar-btn").disabled = false;
}

function pagarAgora() {
    if (priceSelected) {
        alert(`Você selecionou R$ ${priceSelected}. Agora você será redirecionado para a página de pagamento.`);
        document.getElementById('girar-btn').disabled = false;
    } else {
        alert("Por favor, selecione um preço antes de prosseguir.");
    }
}

function inicializarRoleta() {
    console.log("Inicializando roleta...");
    const canvas = document.getElementById('roleta');
    if (!canvas) {
        console.error("Canvas não encontrado!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const size = Math.min(window.innerWidth - 40, 500);

    canvas.width = size;
    canvas.height = size;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    desenharRoleta();
}

function desenharRoleta() {
    const canvas = document.getElementById('roleta');
    const ctx = canvas.getContext('2d');
    const centro = canvas.width / 2;
    const raio = centro - 20;
    const numSetores = premios.length;
    const anguloSetor = (2 * Math.PI) / numSetores;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha os setores
    for (let i = 0; i < numSetores; i++) {
        const anguloInicial = (i * anguloSetor) - (Math.PI / 2);
        const anguloFinal = ((i + 1) * anguloSetor) - (Math.PI / 2);

        // Setor
        ctx.beginPath();
        ctx.moveTo(centro, centro);
        ctx.arc(centro, centro, raio, anguloInicial, anguloFinal);
        ctx.fillStyle = CORES[i % CORES.length];
        ctx.fill();

        // Texto
        ctx.save();
        const anguloTexto = anguloInicial + (anguloSetor / 2);
        ctx.translate(
            centro + Math.cos(anguloTexto) * (raio * 0.7),
            centro + Math.sin(anguloTexto) * (raio * 0.7)
        );
        ctx.rotate(anguloTexto + (Math.PI / 2));
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Montserrat';
        ctx.textAlign = 'center';
        ctx.fillText(premios[i], 0, 0);
        ctx.restore();
    }
}

function girarRoleta() {
    if (girando) return;
    girando = true;

    const canvas = document.getElementById('roleta');
    const resultadoEl = document.getElementById('resultado');
    const girarBtn = document.getElementById('girar-btn');

    girarBtn.disabled = true;
    resultadoEl.textContent = "";

    // Sorteio baseado nas probabilidades
    const random = Math.random() * 100;
    let acumulado = 0;
    let premioIndex = 0;

    for (let i = 0; i < probabilidades.length; i++) {
        acumulado += probabilidades[i];
        if (random <= acumulado) {
            premioIndex = i;
            break;
        }
    }

    // Configura animação
    const numSetores = premios.length;
    const anguloSetor = (2 * Math.PI) / numSetores;
    const anguloParada = (premioIndex * anguloSetor) + (anguloSetor / 2);
    const voltas = 5;
    const giroTotal = (voltas * 2 * Math.PI) + anguloParada;

    // Animação
    canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(0)';

    setTimeout(() => {
        canvas.style.transition = `transform ${voltas}s cubic-bezier(0.2, 0.8, 0.3, 1)`;
        canvas.style.transform = `rotate(${-giroTotal}rad)`;

        setTimeout(() => {
            resultadoEl.textContent = `🎉 Você ganhou: ${premios[premioIndex]} (${probabilidades[premioIndex]}% de chance) 🎉`;
            girando = false;
            girarBtn.disabled = false;
        }, voltas * 1000);
    }, 10);
}

function atualizarListaProbabilidades() {
    const lista = document.getElementById('lista-porcentagem');
    lista.innerHTML = '';
    
    for (let i = 0; i < premios.length; i++) {
        const item = document.createElement('li');
        item.innerHTML = `<span>${premios[i]}</span> <span>${probabilidades[i]}%</span>`;
        lista.appendChild(item);
    }
}
// MODIFIQUE a função pagarAgora() para:
function pagarAgora() {
    if (priceSelected) {
        // Mostra o valor selecionado
        document.getElementById('valor-selecionado').textContent = `R$ ${priceSelected},00`;
        
        // Esconde a tela atual e mostra a de pagamento
        document.getElementById('roleta-tela').classList.remove('ativa');
        document.getElementById('pagamento-tela').classList.add('ativa');
        
        // Configura os botões de método de pagamento
        document.querySelectorAll('.metodo-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.metodo-btn').forEach(b => b.classList.remove('selecionado'));
                this.classList.add('selecionado');
            });
        });
        
        // Configura o botão de finalizar
        document.getElementById('finalizar-pagamento').addEventListener('click', function() {
            alert(`Pagamento de R$ ${priceSelected},00 confirmado! Você receberá um e-mail com a confirmação.`);
            // Volta para a tela da roleta
            document.getElementById('pagamento-tela').classList.remove('ativa');
            document.getElementById('roleta-tela').classList.add('ativa');
            // Ativa o botão de girar
            document.getElementById('girar-btn').disabled = false;
        });
    } else {
        alert("Por favor, selecione um preço antes de prosseguir.");
    }
}