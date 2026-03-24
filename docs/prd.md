# 📄 Product Requirements Document (PRD) - DishDiary

## 1. Visão Geral e Objetivo
O DishDiary é uma aplicação web que permite ao usuário criar o próprio livro de receitas de fácil acesso.
O grande diferencial é que a aplicação teria uma proposta bem clara: transformar a experiência de cozinhar, provar e avaliar pratos em algo social, organizado e prazeroso, onde usuários podem:
Registrar o que cozinharam ou comeram
Avaliar receitas (com notas, comentários, fotos)
Descobrir novos pratos através de outras pessoas
Criar um histórico pessoal de experiências culinárias
Funciona como um diário gastronômico + rede social, onde cada prato vira uma “experiência compartilhável”.


## 2. Atores do Sistema
Visitante: Usuário não autenticado que acessa a página inicial e deseja criar uma conta.
Usuario: Usuário autenticado que já possui uma conta e faz uso da aplicação e das suas funções
O Administrador(Sistema): Ator invisível que aplica as regras ao usuário
## 3. Histórias de Usuário e Escopo
Abaixo estão as funcionalidades principais do MVP (Minimum Viable Product), escritas sob a perspectiva do usuário final.
# 👤 Épico 1: Autenticação e Conta
- **US01** - Criação da Conta: Como um Visitante, quero preencher um formulário com meus dados pessoais (Nome, email, Senha) para criar uma nova conta no DishDiary.
  - **Critérios de Aceitação:** A senha deve ser validada, tendo no mínimo 6 caracteres e um caracter especial; todos os campos são obrigatórios.
- **US02** - Acesso ao Sistema (Login): Como um Usuário, quero inserir meu email e Senha para acessar meu painel.
# 🍕 Épico 2: Interações na Plataforma
- **US03** - Visualização de receitas: Como um usuário logado, quero ver meu histórico de receitas realizadas em destaque no painel principal, para saber quais receitas (já) fiz.

- **US04** - Realizar Comentários: Como um usuário, quero fazer um comentário em uma receita postada na plataforma

- **US05** - Postar uma receita: Como um usuário, quero realizar uma postagem em meu perfil com uma receita que realizei
  - **Critérios de Aceitação:** A postagem deve conter no mínimo uma foto e uma descrição
