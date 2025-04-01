# atex-codecare

📍 Projeto de Otimização de Rotas para Ação Social

Este projeto tem como objetivo desenvolver uma solução baseada na Google Maps API para otimizar a entrega de cestas básicas para famílias necessitadas. A aplicação permitirá inserir endereços e calcular a melhor rota para percorrer todos os pontos de entrega de maneira eficiente.

🚀 Funcionalidades

Inserção de múltiplos endereços de entrega.

Cálculo da melhor rota passando por todos os pontos.

Exibição da rota no Google Maps.

Otimização das paradas para reduzir tempo e distância.

🛠 Tecnologias Utilizadas

📌 Frontend:

React (com hooks e componentes reutilizáveis)

Bibliotecas:

React Router para navegação entre páginas

react-google-maps/api para integração com o Google Maps

Styled Components e CSS Modules para estilização

(Opcional) Font Awesome ou Material Icons para ícones

Google Maps API

Directions API

Distance Matrix API

Geocoding API

Back-end (opcional): Node.js com Express ou .NET Core.

Banco de Dados (opcional): Firebase Firestore ou MySQL.

📂 Estrutura do Projeto

📦 projeto
 ┣ 📂 src
 ┃ ┣ 📂 components  # Componentes reutilizáveis
 ┃ ┣ 📂 pages       # Páginas da aplicação
 ┃ ┣ 📂 styles      # Estilos globais e temas
 ┃ ┣ 📜 App.js      # Componente principal
 ┃ ┣ 📜 index.js    # Ponto de entrada
 ┣ 📜 package.json  # Dependências do projeto
 ┣ 📜 README.md     # Documentação do projeto

📌 Requisitos

Para rodar o projeto, você precisará de:

Node.js instalado.

Uma conta no Google Cloud Platform.

Criar um projeto e habilitar as APIs do Google Maps.

Gerar uma API Key e ativar as seguintes APIs:

Google Maps JavaScript API

Directions API

Distance Matrix API

Geocoding API

🏁 Como Rodar o Projeto

⿡ Clonar o Repositório

git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

⿢ Instalar as Dependências

npm install

⿣ Configurar a API Key

Crie um arquivo .env na raiz do projeto e adicione:

REACT_APP_GOOGLE_MAPS_API_KEY=SUA_API_KEY

⿤ Rodar o Projeto

npm start

Abra http://localhost:3000 no navegador.

🌱 Fluxo de Desenvolvimento (Git Flow)

Este projeto segue o fluxo básico de Git Flow:

Branch principal: main (produção)

Branch de preparação: stage (testes)

Branches de funcionalidades: feature/nome-dev

Criando uma nova feature

git checkout -b feature/nova-funcionalidade

Após desenvolver a funcionalidade:

git add .
git commit -m "Descrição da funcionalidade"
git push origin feature/nova-funcionalidade

Depois, abra um Pull Request (PR) para a branch stage.