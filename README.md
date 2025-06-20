# 📦 App de Inventário para Padaria

Um aplicativo mobile completo, construído com React Native e Expo, para gerenciamento de inventário focado nas necessidades de uma padaria ou pequeno negócio de alimentos. O app oferece uma interface rica, alertas inteligentes e ferramentas de gestão para otimizar o controle de estoque.

---

### ✨ Principais Funcionalidades

*   **Gestão Completa de Produtos (CRUD):** Adicione, visualize, edite e remova produtos com informações detalhadas como preço, quantidade, categoria e data de validade.
*   **Visualização Dupla e Ordenação:** Alterne entre os modos de visualização em **Grade** (visual) e **Lista** (denso). Ordene os produtos por nome, quantidade ou data de validade.
*   **Alertas Visuais Inteligentes:**
    *   🏷️ **Status de Validade:** Indicadores de cor (verde, laranja, vermelho) mostram claramente se um produto está OK, próximo de vencer ou já vencido.
    *   ⚠️ **Estoque Baixo:** Produtos que atingem o nível mínimo de estoque recebem uma borda de destaque para fácil identificação.
*   **Filtros e Busca:** Encontre produtos rapidamente usando a barra de busca ou filtre a visualização por **categorias** pré-definidas.
*   **Painel de Controle e Relatórios:**
    *   💰 **Valor do Estoque:** Um relatório no topo da tela exibe o valor financeiro total do inventário em tempo real.
    *   🔔 **Sino de Notificações:** Um ícone de sino alerta sobre a quantidade de produtos próximos do vencimento e abre um modal com a lista detalhada.
*   **Lista de Compras Inteligente:** Uma tela separada que gera automaticamente uma lista de compras com todos os produtos que estão com estoque baixo.
*   **Exportação de Dados:** Exporte todo o inventário para um arquivo **CSV**, permitindo backups e análises em planilhas como Excel ou Google Sheets.
*   **Dados de Exemplo:** O aplicativo é populado com 100 produtos de exemplo na primeira inicialização para uma demonstração rica e imediata das funcionalidades.

---

### 🚀 Tecnologias Utilizadas

*   **React Native**
*   **Expo (com Expo Router para navegação)**
*   **TypeScript**
*   **Expo Image Picker** (para upload de imagens da galeria)
*   **Expo File System & Sharing** (para exportação de CSV)
*   **AsyncStorage** (para persistência de dados no dispositivo)
*   **Ionicons** (para iconografia)

---

### 📂 Estrutura do Projeto

O código está organizado de forma modular para facilitar a manutenção e escalabilidade:

-   `app/`: Contém as telas principais do aplicativo, utilizando a navegação baseada em arquivos do Expo Router.
    -   `index.tsx`: Tela principal do inventário.
    -   `shopping-list.tsx`: Tela da lista de compras.
    -   `_layout.tsx`: Define a estrutura de navegação e os cabeçalhos das telas.
-   `components/`: Componentes reutilizáveis, como o modal de adição/edição de produtos.
-   `services/`: Lógica de negócio desacoplada da UI, como o gerador de dados e o exportador de CSV.
-   `types/`: Centralização das interfaces TypeScript do projeto.

---

### 🛠️ Como Executar o Projeto

**Pré-requisitos:**
*   Node.js (versão LTS recomendada)
*   Yarn (gerenciador de pacotes)
*   App Expo Go instalado em um dispositivo móvel (Android/iOS)

**Passos:**

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
    cd SEU-REPOSITORIO
    ```

2.  **Instale as dependências:**
    ```bash
    yarn install
    ```

3.  **Execute o projeto:**
    ```bash
    yarn start
    ```

4.  Aguarde o Metro Bundler iniciar e escaneie o QR Code exibido no terminal com o app Expo Go.
