# 🛠️ Especificação Técnica (Tech Spec) - DishDiary

Este documento descreve a arquitetura técnica, modelo de dados e contratos de API para a aplicação **Gamory**, uma plataforma web para avaliação e organização de jogos digitais.

---

# 1. 🧩 Arquitetura Geral

A aplicação será construída como uma **Single Page Application simples (SPA híbrida)** com múltiplas páginas HTML e uso de JavaScript para manipulação dinâmica dos dados.

### Tecnologias:

* HTML5
* CSS3 + Framework (Bootstrap v5.3.8)
* JavaScript (Vanilla)
* JSON Server (API fake)
* Web Storage (LocalStorage)
* API Publíca (Recipe API)

---

# 2. 🗂️ Estrutura de Páginas

A aplicação deve conter pelo menos **3 páginas HTML distintas**:

1. **login.html**

   * Login de usuário
   * Redirecionamento após autenticação

2. **cadastro.html**

   * Criação de conta
   * Validação de formulário

3. **index.html (Dashboard)**

   * Listagem de receitas
   * Visualização e interação

Todas as páginas devem ser **responsivas** utilizando o framework CSS escolhido.

---

# 3. 🧠 Modelo de Dados (Diagrama ER)

```mermaid
erDiagram
    USUARIOS ||--o{ RECEITAS : "cadastra"
    USUARIOS ||--o{ INTERACAO : "realiza"
    RECEITAS ||--o{ INTERACAO : "recebe"

    USUARIOS {
        string id PK
        string nome
        string email
        string senha
    }

    RECEITAS {
        string id PK
        string usuarioId FK
        string titulo
        string genero
        int nota
        
    }

    INTERACAO {
        string id PK
        string usuarioId FK
        string receitaId FK
        string comentario
        string dataCriacao
        string nota
    }
```

---

# 4. 📚 Dicionário de Dados

## 🔹 Usuários

Responsável pela autenticação e identificação.

* **id**: Identificador único gerado pelo JSON Server
* **nome**: Nome do usuário
* **email**: Usado para login
* **senha**: Armazenada em texto simples (MVP)

---

## 🔹 Receitas

Responsável pelo registro das experiências do usuário.

* **id**: Identificador único
* **usuarioId**: Relacionamento com usuário
* **titulo**: Nome da receita
* **genero**: Categoria (Doces, Salgados, Prato principal, sobremesas etc..)
* **nota**: Valor de 1 a 5
* **comentario**: Texto opcional
* **dataCriacao**: Data em formato ISO

---

# 5. 🔌 Rotas da API (JSON Server)

## 🔹 Usuários

* `GET /usuarios` → Lista usuários
* `POST /usuarios` → Cria novo usuário

## 🔹 Receitas

* `GET /receitas` → Lista receitas
* `GET /receitas?usuarioId=1` → Receitas de um usuário
* `POST /receita` → Cria receita
* `PUT /receita/:id` → Atualiza receita
* `DELETE /receita/:id` → Remove receita

---

# 6. 💾 Estrutura do Banco (db.json)

```json
{
  "usuarios": [
    {
      "id": "1",
      "nome": "joaozinho",
      "email": "joao@email.com",
      "senha": "MinhaSenha!"
    }
  ],
  "receita": [
    {
      "id": "1",
      "usuarioId": "1",
      "titulo": "Frango a parmeggiana",
      "genero": "Prato principal",
      "nota": 5,
      "comentario": "Melhor coisa que eu ja comi!!!!",
      "dataCriacao": "2026-03-22"
    }
  ]
}
```



# 7. ✅ Critérios de Conclusão

* 3 páginas HTML implementadas
* Responsividade funcional
* CRUD completo de jogos
* Integração com JSON Ser
