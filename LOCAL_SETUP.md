# Local Development Setup

This guide will help you run the matprat-website on your laptop for testing.

## Prerequisites

- Docker and Docker Compose installed
- Ports 3001, 5433, and 5050 available

## Quick Start

### 1. Start all services

```bash
docker compose -f docker-compose.local.yml up --build -d
```

This command will:
- Build the Node.js server image locally
- Start PostgreSQL database
- Initialize the database with schema and sample data
- Start pgAdmin for database management
- Start the web server

### 2. Access the application

Once all containers are running:

- **Website**: http://localhost:3001
- **pgAdmin**: http://localhost:5050
  - Email: `user@domain.com`
  - Password: `SuperSecret`
- **Database** (direct access): localhost:5433

### 3. Stop the services

```bash
docker compose -f docker-compose.local.yml down
```

To remove all data (fresh start):
```bash
docker compose -f docker-compose.local.yml down -v
```

## Services

### Server (Node.js/Express)
- Port: 3001 (host) → 3000 (container)
- Environment: development
- Connects to PostgreSQL database

### Database (PostgreSQL 14.1)
- Port: 5433 (host) → 5432 (container)
- Database: `matprat`
- User: `nodejs` / Password: `nodejs`
- Admin: `postgres` / Password: `postgres`

### pgAdmin (Database Manager)
- Port: 5050 (host) → 80 (container)
- Web interface for database management

## Database Connection via pgAdmin

1. Open http://localhost:5050
2. Login with credentials above
3. Add server:
   - Name: `Local Matprat`
   - Host: `db` (container name)
   - Port: `5432`
   - Database: `matprat`
   - Username: `nodejs`
   - Password: `nodejs`

## Development Tips

### View logs
```bash
# All services
docker compose -f docker-compose.local.yml logs -f

# Specific service
docker compose -f docker-compose.local.yml logs -f server
```

### Restart server only
```bash
docker compose -f docker-compose.local.yml restart server
```

### Connect to database directly
```bash
docker exec -it pratmat-db-local psql -U postgres -d matprat
```

### Rebuild after code changes
```bash
docker compose -f docker-compose.local.yml up --build -d
```

## Troubleshooting

### Port already in use
If you get port conflicts, check what's using the ports:
```bash
# Check port 3001 (web server)
lsof -i :3001

# Check port 5433 (database)
lsof -i :5433

# Check port 5050 (pgadmin)
lsof -i :5050
```

### Database not initializing
If the database doesn't initialize properly:
```bash
# Remove volumes and restart
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up --build -d
```

### Server can't connect to database
Make sure all containers are on the same Docker network. Check with:
```bash
docker network inspect matprat-website_default
```

## File Structure

```
.
├── server/                 # Node.js application
│   ├── Dockerfile         # Docker image definition
│   └── package.json       # Node dependencies
├── database/              # Database files
│   └── sql/              # SQL initialization scripts
│       ├── 00-init.sql   # Schema and functions
│       └── 01-data.sql   # Sample data
├── docker-compose.local.yml  # Local development compose file
└── LOCAL_SETUP.md        # This file
```
