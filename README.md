# Desafio Backend - Riderize API

API GraphQL desenvolvida como parte do desafio de backend da Riderize, para gerenciamento de criação e inscrição em pedais de ciclismo.

---

## ✨ Funcionalidades

- Autenticação de usuários com JWT (Registro e Login)
- Criação, listagem e gerenciamento de Pedais (Rides)
- Sistema de inscrição em pedais com regras de negócio (limites, datas, etc.)
- Consultas para o usuário ver seus pedais criados e suas inscrições
- Projeto 100% containerizado com Docker.

---

## 🛠️ Tecnologias Utilizadas

- Node.js
- TypeScript
- GraphQL com Apollo Server e TypeGraphQL
- PostgreSQL
- Prisma ORM
- Docker & Docker Compose

---

## 🚀 Como Rodar o Projeto (com Docker)

**Pré-requisitos:** [Docker](https://www.docker.com/products/docker-desktop/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados.

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/viniciusminas/riderize
   cd riderize
   ```

2. **Crie o arquivo de variáveis de ambiente:**
   - Renomeie o arquivo `.env.example` para `.env`.
   - Preencha as variáveis, se necessário (a `DATABASE_URL` já está configurada para o Docker).

3. **Suba os contêineres:**
   - O comando a seguir irá construir a imagem da API e iniciar os contêineres da API e do banco de dados em segundo plano.
   ```bash
   docker compose up --build -d
   ```

4. **Aplique as migrações do banco de dados:**
   - Este comando executa o Prisma dentro do contêiner da API para criar as tabelas no banco de dados.
   ```bash
   docker compose exec api npx prisma migrate dev
   ```

5. **Pronto!**
   - A API estará rodando e acessível em `http://localhost:4000/graphql`.

---

--- 

## 🌍 Deploy

O projeto também está disponível em ambiente de produção no Railway:

🔗 **GraphQL:** (https://riderize-production.up.railway.app/graphql)


## 📬 Contato

Vinícius Minas - viniciusminas_@hotmail.com - [LinkedIn](https://www.linkedin.com/in/vinicius-antonio-minas/)
