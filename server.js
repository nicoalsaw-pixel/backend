// --- CONFIGURAÇÕES --
const TYPING_TEXT = "vindalfar"; 
const TYPING_SPEED = 150; 
const TYPING_DELAY = 1500; 

// Substitua esta URL pela URL completa do seu backend no Render
const API_URL = 'https://backend-65c0.onrender.com/api/views'; 

// --- LÓGICA DO CONTADOR DE VISUALIZAÇÕES CORRIGIDA ---
async function updateViewCounter() {
    try {
        // 1. Geração de Timestamp para Cache-Busting
        const timestamp = new Date().getTime();
        
        // Concatena o timestamp à URL da API para FORÇAR uma nova requisição
        const response = await fetch(`${API_URL}?t=${timestamp}`); 
        
        if (!response.ok) { 
            console.error(`Erro HTTP: ${response.status} ${response.statusText}. O servidor backend pode estar offline.`);
            document.getElementById('views-number').textContent = 'Erro';
            return;
        }

        const data = await response.json();

        // 🚨 2. CORREÇÃO DE ID: Usa o ID correto 'views-number' (visto no index.html)
        const viewCountElement = document.getElementById('views-number');
        
        if (viewCountElement && data.views !== undefined) {
            viewCountElement.textContent = data.views.toLocaleString();
        } else {
            // Se o elemento não for encontrado ou os dados estiverem ausentes
            if (viewCountElement) viewCountElement.textContent = 'Erro';
            else console.error("Elemento HTML com ID 'views-number' não encontrado.");
        }

        // Log para debug (o backend deve dizer "IP já registrado" em F5)
        console.log("Resposta da API:", data.message);

    } catch (error) {
        console.error("Erro ao conectar ao backend:", error);
        document.getElementById('views-number').textContent = 'Erro';
    }
}

// --- RESTANTE DO SEU CÓDIGO JS ---

// Funções que devem existir no seu arquivo, mas que não estão no foco da correção
// (Deixei apenas as definições mínimas para o contexto)

// Função para iniciar o efeito de digitação e os efeitos do perfil
function startProfileEffects() {
    // ... seu código para o efeito de digitação
}

// Função para configuração do player de música
function setupMusicPlayer() {
    // ... seu código para o player
}

// Função para setup do efeito de faíscas
function setupFairyDustEffect() {
    // ... seu código para o efeito
}

// Função para setup do cursor
function setupCursorToggle() {
    // ... seu código para o cursor
}


// Função que é chamada UMA VEZ na interação inicial do usuário
function handleInteractionOnce() {
    const introScreen = document.getElementById('intro-screen');
    const mainContent = document.getElementById('main-content');
    
    document.removeEventListener('keydown', handleInteractionOnce);
    document.removeEventListener('click', handleInteractionOnce);

    introScreen.style.opacity = 0;

    setTimeout(() => {
        introScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
        
        startProfileEffects();
        
        // ... (código do player de música)
        
    }, 500); 
    
    // 🚨 CHAMADA DO CONTADOR APÓS INTERAÇÃO
    updateViewCounter();
}

document.addEventListener('DOMContentLoaded', () => {
    // Adiciona o listener para a interação inicial
    document.addEventListener('keydown', handleInteractionOnce);
    document.addEventListener('click', handleInteractionOnce);
    
    // Opcional: Remova ou comente esta linha para evitar que '...' apareça
    // document.getElementById('views-number').textContent = '...'; 
    
    setupMusicPlayer();
    setupFairyDustEffect();
    setupCursorToggle(); 
});