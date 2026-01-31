\c mobile

CREATE TABLE type_account (
    id_type_account SERIAL PRIMARY KEY,
    name_type VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    id_type_account INT REFERENCES type_account(id_type_account)
);

CREATE TABLE entreprise(
    id_entreprise SERIAL PRIMARY KEY,
    name_entreprise VARCHAR(100) NOT NULL
);

CREATE TABLE points(
    id_point SERIAL PRIMARY KEY,
    latitude VARCHAR(50) NOT NULL,
    longitude VARCHAR(50) NOT NULL,
    surface DECIMAL NOT NULL,
    budget DECIMAL NOT NULL,
    nameplace VARCHAR(50),
    id_entreprise INT REFERENCES entreprise(id_entreprise)
);

CREATE TABLE status_point(
    id_status_point SERIAL PRIMARY KEY,
    id_point INT REFERENCES points(id_point),
    status VARCHAR(50) NOT NULL,
    daty DATE NOT NULL
);

INSERT INTO type_account (name_type) VALUES
('user'),
('manager');

INSERT INTO users (username, password, email, id_type_account) VALUES
('user01', 'test1', 'user01@test.com', 1),
('manager01', 'test2', 'manager01@test.com', 2);

INSERT INTO entreprise (name_entreprise) VALUES
('Société Tana Construction'),
('Madagascar Immo'),
('Green Land'),
('Soleil Immobilier'),
('Emeraude Développement');

INSERT INTO points (latitude, longitude, surface, budget, nameplace, id_entreprise) VALUES
('-18.9101', '47.5200', 120.50, 25000000, 'Andoharanofotsy - Terrain A', 1),
('-18.9312', '47.5215', 200.00, 42000000, 'Andoharanofotsy - Terrain B', 2),
('-18.8792', '47.5079', 150.75, 31000000, 'Antananarivo - Terrain C', 3),
('-18.8960', '47.5190', 300.00, 65000000, 'Ambohijatovo - Terrain D', 4),
('-18.9215', '47.5225', 100.00, 18000000, 'Ankadifotsy - Terrain E', 5),
('-18.9550', '47.5400', 250.00, 55000000, 'Ankorondrano - Terrain F', 1),
('-18.9333', '47.5120', 180.00, 40000000, 'Anosy - Terrain G', 2),
('-18.9180', '47.5090', 220.00, 47000000, 'Isoraka - Terrain H', 3),
('-18.9410', '47.5200', 130.00, 26000000, 'Ankadikely - Terrain I', 4),
('-18.9030', '47.5205', 160.00, 34000000, 'Andranomanalina - Terrain J', 5);

ALTER TABLE entreprise
ADD COLUMN sync_id UUID UNIQUE DEFAULT gen_random_uuid();

ALTER TABLE points
ADD COLUMN sync_id UUID UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE status_point
ADD COLUMN sync_id UUID UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Modif Lalaina 29/01/26
ALTER TABLE type_account
ADD COLUMN sync_id UUID UNIQUE DEFAULT gen_random_uuid();

ALTER TABLE users
ADD COLUMN sync_id UUID UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Correction de la dernière ligne problématique
-- Supprime les doublons de 'Manager' (si besoin, mais dans vos données c'est 'manager' en minuscule)
DELETE FROM type_account
WHERE LOWER(name_type) = 'manager'
  AND id_type_account > (
      SELECT MIN(id_type_account)
      FROM type_account
      WHERE LOWER(name_type) = 'manager'
  );