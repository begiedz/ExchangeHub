# ExchangeHub Web Service

ASP.NET Core (.NET 10) minimal API backed by PostgreSQL. It authenticates users, keeps their PLN wallet and serves
current NBP exchange rates (table C) to the mobile app.

## Architecture

Clean Architecture with a hand-rolled CQRS (no MediatR): every use case is a command or query with one handler.

```
Api  ──►  Application  ◄──  Infrastructure
              │
              ▼
           Domain
```

| Project | Responsibility |
|---|---|
| `ExchangeHub.Domain` | Entities and their invariants (`User`, `RefreshToken`, `Balance`, `Transaction`). No dependencies. |
| `ExchangeHub.Application` | Use cases (`Auth/*`, `Wallets/*`, `Transactions/*`, `Rates/*`), `Result` type and the interfaces Infrastructure implements. |
| `ExchangeHub.Infrastructure` | EF Core + PostgreSQL, PBKDF2 hashing, JWT, NBP client with cache and resilience. |
| `ExchangeHub.Api` | Endpoints, JWT authentication, OpenAPI, error handling. Maps `Result` to HTTP. |

Handlers are registered automatically from their handler interfaces (`ICommandHandler<,>`, `IQueryHandler<,>`).

## Running the database and the API

Requires Docker. Secrets are not stored in the repository, so create your own `.env` first:

```bash
cd server
cp .env.example .env     # then edit .env: set POSTGRES_PASSWORD and a real JWT_SIGNING_KEY
docker compose up -d --build
```

`docker compose` stops with a clear message when a required value is missing, and the API refuses to start with the
placeholder key from `.env.example`.

| What | Where |
|---|---|
| API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |
| OpenAPI document | http://localhost:8080/openapi/v1.json |
| Health check | http://localhost:8080/health |
| PostgreSQL (from the host) | `localhost:5433`, database and user `exchangehub`, password from `.env` |

Port 5433 is used on the host so it does not clash with a local PostgreSQL on 5432; `DB_PORT` and `API_PORT` in
`.env` change the host ports. The database password is fixed when the volume is first created, so after changing
`POSTGRES_PASSWORD` run `docker compose down -v`.
In the `Development` environment the API applies EF Core migrations on startup.

Stop everything with `docker compose down`; add `-v` to also delete the database volume.

### Running the API without Docker for the API

Start only the database, give the API its secrets through .NET user-secrets (stored outside the repository), then run it:

```bash
docker compose up -d db
cd src/ExchangeHub.Api
dotnet user-secrets set "ConnectionStrings:Database" "Host=localhost;Port=5433;Database=exchangehub;Username=exchangehub;Password=<POSTGRES_PASSWORD from .env>"
dotnet user-secrets set "Auth:Jwt:SigningKey" "<the same JWT_SIGNING_KEY>"
dotnet run
```

## Configuration

| Key | Meaning |
|---|---|
| `ConnectionStrings:Database` | PostgreSQL connection string. |
| `Auth:Jwt:SigningKey` | HMAC key, at least 32 characters. The API refuses to start without it. |
| `Auth:Jwt:AccessTokenMinutes` / `RefreshTokenDays` | Token lifetimes (15 minutes / 30 days). |
| `Auth:LoginProtection:MaxFailedAttempts` / `LockoutDuration` | Account lockout (5 attempts / 15 minutes). |
| `Nbp:BaseUrl` / `Nbp:CacheDuration` | NBP API address and cache time (15 minutes). |

Secrets (`ConnectionStrings:Database`, `Auth:Jwt:SigningKey`) are never committed. They come from:

| Where | How |
|---|---|
| Docker Compose | `server/.env` (git-ignored; template in `.env.example`) |
| `dotnet run` locally | .NET user-secrets |
| Any other environment | Environment variables, e.g. `Auth__Jwt__SigningKey`, `ConnectionStrings__Database` |

Integration tests need no setup: they start their own database and sign tokens with a random key per run.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | no | Create an account. |
| POST | `/api/auth/login` | no | Access + refresh token. Locks the account after repeated failures (429). |
| POST | `/api/auth/refresh` | no | Rotate a refresh token. Reusing an old token revokes the whole chain. |
| POST | `/api/auth/logout` | yes | End the session owning the given refresh token. |
| POST | `/api/auth/logout-all` | yes | End every session of the user. |
| GET | `/api/users/me` | yes | The current user. |
| GET | `/api/wallet` | yes | Balances of the current user. |
| POST | `/api/wallet/top-up` | yes | Simulated PLN top-up; also writes a history entry in the same database transaction. |
| POST | `/api/wallet/withdraw` | yes | Simulated PLN withdrawal (inverse of top-up). 422 `Wallet.InsufficientFunds` when the balance is too low; writes a `Withdrawal` history entry atomically. |
| POST | `/api/exchange/buy` | yes | Buy foreign currency for PLN at the current NBP ask rate; returns the saved transaction (201). |
| POST | `/api/exchange/sell` | yes | Sell foreign currency for PLN at the current NBP bid rate; returns the saved transaction (201). |
| GET | `/api/transactions` | yes | History of the current user, newest first. `?page=1&pageSize=20` (max 100). |
| GET | `/api/rates/current` | yes | NBP table C exactly as published. |
| GET | `/api/rates/{code}/history` | yes | Historical NBP table C bid/ask rates. Required `?from=YYYY-MM-DD&to=YYYY-MM-DD` (inclusive); days without publications are omitted. |
| GET | `/health` | no | Liveness including the database. |

Authenticated endpoints expect `Authorization: Bearer <accessToken>`.
Errors use RFC 7807 problem details with a stable `code` field (for example `Auth.InvalidCredentials`).

Quick check:

```bash
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" \
     -d '{"email":"me@example.com","password":"Passw0rd123"}'
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" \
     -d '{"email":"me@example.com","password":"Passw0rd123"}'
```

## Tests

```bash
cd server
dotnet test
```

Unit tests are self-contained. `ExchangeHub.Api.IntegrationTests` starts a real PostgreSQL through Testcontainers, so
**Docker must be running**. NBP is replaced by a stub there, so the tests need no internet access.

## Database migrations

```bash
dotnet ef migrations add <Name> -p src/ExchangeHub.Infrastructure -s src/ExchangeHub.Api -o Persistence/Migrations
```

`ConnectionStrings__Database` and `Auth__Jwt__SigningKey` must be set (any values) for the design-time build.
