-- Créer la base de données (si elle n'existe pas)
CREATE DATABASE authdb;

-- Se connecter à la base de données
\c authdb;

-- Créer la table users test fotsiny
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    nom VARCHAR(255),
    role VARCHAR(50)
);