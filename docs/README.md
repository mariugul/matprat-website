# matprat-website

[![Pipeline](https://github.com/mariugul/matprat-website/actions/workflows/pipeline.yml/badge.svg)](https://github.com/mariugul/matprat-website/actions/workflows/pipeline.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/mariugul/matprat-website/badge)](https://www.codefactor.io/repository/github/mariugul/matprat-website)

A recipe website for managing and displaying cooking recipes with ingredients, step-by-step instructions, and images. Built with Node.js, Express, and PostgreSQL, fully containerized with Docker.

## 🚀 Quick Start

### Local Development

1. **Prerequisites**: Docker and Docker Compose installed

2. **Start the application**:
   ```bash
   docker compose -f docker-compose.local.yml up --build -d
   ```

3. **Access the services**:
   - **Website**: http://localhost:3001
   - **pgAdmin**: http://localhost:5050 (user: `user@domain.com`, password: `SuperSecret`)
   - **Database**: localhost:5433

4. **Stop the application**:
   ```bash
   docker compose -f docker-compose.local.yml down
   ```

For detailed setup instructions, see [`LOCAL_SETUP.md`](../LOCAL_SETUP.md).

## 🏗️ Architecture

### Technology Stack

- **Frontend**: HTML, CSS (w3.css), JavaScript
- **Backend**: Node.js 16 with Express.js
- **Database**: PostgreSQL 14.1
- **Container Orchestration**: Docker & Docker Compose
- **Database Management**: pgAdmin 4

### Application Structure

```
matprat-website/
├── server/              # Node.js Express application
│   ├── app.js          # Main application entry point
│   ├── Dockerfile      # Server container definition
│   └── package.json    # Node dependencies
├── database/           # Database scripts and configuration
│   └── sql/           # SQL initialization scripts
│       ├── 00-init.sql    # Schema, types, and functions
│       └── 01-data.sql    # Sample recipe data
├── production/         # Production deployment configuration
│   ├── docker-compose.yml     # Production setup
│   └── webhooks/              # Webhook configuration
└── docs/              # Documentation
```

## 📊 Database Schema

The database uses PostgreSQL and consists of five main tables centered around recipes. Each recipe is uniquely identified by its name.

<img src="images/recipes-page-db.png" alt="Database schema diagram" width=80% >

### Core Tables

#### **recipes**
Main table containing recipe metadata:
- `name` (Primary Key): Unique recipe identifier
- `description`: Short recipe description (max 200 chars)
- `default_portions`: Number of servings (default: 2)
- `difficulty`: Enum ('easy', 'intermediate', 'advanced')
- `cook_time`: Cooking time in minutes

#### **ingredients**
Recipe ingredients with measurements:
- `recipe_name` + `ingredient` (Composite Primary Key)
- `amount`: Quantity as a decimal value
- `unit`: Measurement unit (gram, litre, dl, ts, ss, small, medium, large)
- `note`: Optional ingredient note

#### **steps**
Step-by-step cooking instructions:
- `recipe_name` + `step_nr` (Composite Primary Key)
- `description`: What to do in this step (max 500 chars)
- `note`: Optional step note or tip

#### **images**
Recipe images and their metadata:
- `recipe_name` + `image_nr` (Composite Primary Key)
- `link`: Image file path or URL
- `description`: Image description for alt text

#### **categories**
Recipe categorization (many-to-many):
- `recipe_name` + `category` (Composite Primary Key)
- `category`: Enum ('breakfast', 'lunch', 'dinner', 'tradition', 'christmas', 'easter')

### Data Types

**Custom Domains:**
- `recipe_name`: varchar(50)
- `recipe_description`: varchar(200)
- `step_description`: varchar(500)
- `ingredient_name`: varchar(30)
- `image_link`: varchar(100)
- `image_description`: varchar(20)
- `note_description`: varchar(100)

**Enums:**
- `measurement_units`: gram, litre, dl, ts, ss, small, medium, large
- `category`: breakfast, lunch, dinner, tradition, christmas, easter
- `difficulty`: easy, intermediate, advanced

### Database Functions

The database includes stored functions for common queries:
- `recipes()`: Get all recipes with metadata
- `recipeinfo(recipe_name)`: Get specific recipe details
- `ingredients(recipe_name)`: Get recipe ingredients
- `steps(recipe_name)`: Get cooking steps
- `images(recipe_name)`: Get recipe images
- `categories()`: Get all recipe categories

## 🔧 Development

### Database Management

**Connect to database directly:**
```bash
docker exec -it pratmat-db-local psql -U postgres -d matprat
```

**View database logs:**
```bash
docker compose -f docker-compose.local.yml logs db -f
```

**Reset database:**
```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
```

### Server Development

**View server logs:**
```bash
docker compose -f docker-compose.local.yml logs server -f
```

**Restart server after code changes:**
```bash
docker compose -f docker-compose.local.yml restart server
```

**Full rebuild:**
```bash
docker compose -f docker-compose.local.yml up --build -d
```

## 🚀 Production Deployment

Production uses Docker Compose with pre-built images from Docker Hub:
```bash
cd production
docker compose up -d
```

**Production services:**
- Web server (port 3000)
- PostgreSQL database
- pgAdmin for database management
- Automated daily backups using [prodrigestivill/postgres-backup-local](https://hub.docker.com/r/prodrigestivill/postgres-backup-local)

**Backups:** Database is backed up daily to `/var/opt/db_backups` with retention:
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 6 months

For webhook configuration and automatic deployments, see [`production/webhooks/README.md`](../production/webhooks/README.md).

## 📝 API Endpoints

The server exposes RESTful endpoints (documented in `server/app.js`):
- Recipes listing and details
- Ingredients by recipe
- Cooking steps by recipe
- Recipe images
- Category filtering

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature-name`
2. Make your changes
3. Test locally with `docker compose -f docker-compose.local.yml up`
4. Commit and push: `git push origin feature-name`
5. Create a Pull Request (main branch is protected)

## 📄 License

This is a personal project.
