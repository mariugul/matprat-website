# matprat-website

[![Pipeline](https://github.com/mariugul/matprat-website/actions/workflows/pipeline.yml/badge.svg)](https://github.com/mariugul/matprat-website/actions/workflows/pipeline.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/mariugul/matprat-website/badge)](https://www.codefactor.io/repository/github/mariugul/matprat-website)

**Contents**

<!-- vscode-markdown-toc -->

- 1. [Setup](#Setup)
- 2. [Website](#Website)
- 3. [Server](#Server)
- 4. [Database](#Database)
  - 4.1. [Recipes Page](#RecipesPage)
  - 4.2. [Domains and Enums](#DomainsandEnums)
  - 4.3. [Trigger Functions](#TriggerFunctions)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## 1. <a name='Setup'></a>Setup

Install NodeJS 17

```bash
# Using Ubuntu
curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Connect to PostgreSQL container.

```bash
sudo psql -h website-db -U postgres
```

## 2. <a name='Website'></a>Website

The website is constructed with the w3.css framework and JavaScript for dynamically loading in information from the database.

## 3. <a name='Server'></a>Server

The server runs on node.js with express.js to handle the API's. The server communicates with the database using the 'pg' package to connect to postgres.

## 4. <a name='Database'></a>Database

The website information will be hosted in a PostgreSQL database. That means a good database design is crucial. The implementation of the database is found in the folder `sql`.

### 4.1. <a name='RecipesPage'></a>Recipes Page

This is basic implementation of the content for the recipes page. A recipe is identified by a unique id and a unique name. Therefore, duplicate recipes are not possible. Due to this fact, all the other tables reference the recipes-table's `id` and `name`. This is how the website will identify which content belongs on the recipe site.

<img src="images/recipes-page-db.png" alt="finished-img" width=80% >

- **Ingredients** contains the ingredients, amount and unit to use in a recipe. The recipe-id combined with the name are unique identifiers meaning you can only list a certain ingredient-name once for a specific recipe. The amount can be any decimal number and the meaning of that number is specified in the _unit_ column.

- **Steps** are the steps to take to complete a recipe. The recipe-id combined with the step-nr makes up a unique identifier so you can only have unique step numbers for each recipe. The description is what to do for this step and the note is an optional value that displays a small "note box" with information.

- **Images** are the image(s) that will be displayed on the bottom (or the top?) of the page. This table contains merely the links to where those images are. Like the other tables this also has a unique combination of recipe_id and image_nr. A description is added for information about the image and can typically be used in an "alt" tag.

### 4.2. <a name='DomainsandEnums'></a>Domains and Enums

### 4.3. <a name='TriggerFunctions'></a>Trigger Functions
