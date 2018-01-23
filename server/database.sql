use jeudeladate;

CREATE TABLE blocks
(
  id             INT AUTO_INCREMENT
    PRIMARY KEY,
  name           VARCHAR(60)       NOT NULL,
  clicks         INT DEFAULT '0'   NOT NULL,
  experience_min INT DEFAULT '0'   NOT NULL,
  experience_max INT DEFAULT '0'   NOT NULL,
  coin_min       INT DEFAULT '0'   NOT NULL,
  coin_max       INT DEFAULT '0'   NOT NULL,
  usekeys_chance FLOAT DEFAULT '0' NULL
)
  ENGINE = InnoDB;

CREATE TABLE date_breakpoints
(
  id                INT AUTO_INCREMENT
    PRIMARY KEY,
  date              VARCHAR(10)     NOT NULL,
  experience_needed INT DEFAULT '0' NOT NULL
)
  ENGINE = InnoDB;

CREATE TABLE levels
(
  id                INT AUTO_INCREMENT
    PRIMARY KEY,
  nb                INT NOT NULL,
  experience_needed INT NOT NULL
)
  ENGINE = InnoDB;

CREATE TABLE levels_blocks
(
  id       INT AUTO_INCREMENT
    PRIMARY KEY,
  level_id INT    NOT NULL,
  block_id INT    NOT NULL,
  chance   DOUBLE NOT NULL
)
  ENGINE = InnoDB;

CREATE TABLE players
(
  id               INT AUTO_INCREMENT
    PRIMARY KEY,
  name             VARCHAR(80)                         NULL,
  cookie           VARCHAR(255) DEFAULT '0'            NOT NULL,
  ip               VARCHAR(50) DEFAULT '0'             NOT NULL,
  connection_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  level_id         INT DEFAULT '1'                     NOT NULL,
  experience       INT DEFAULT '0'                     NULL,
  total_experience INT DEFAULT '0'                     NOT NULL,
  coins            INT DEFAULT '0'                     NULL,
  CONSTRAINT cookie
  UNIQUE (cookie)
)
  ENGINE = InnoDB;

CREATE INDEX level_id
  ON players (level_id);

CREATE TABLE players_products
(
  id               INT AUTO_INCREMENT
    PRIMARY KEY,
  player_id        INT                                 NOT NULL,
  product_level_id INT                                 NOT NULL,
  date             TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
)
  ENGINE = InnoDB;

CREATE TABLE products
(
  id          INT AUTO_INCREMENT
    PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description MEDIUMTEXT   NULL,
  image       VARCHAR(255) NULL
)
  ENGINE = InnoDB;

CREATE TABLE products_levels
(
  id         INT AUTO_INCREMENT
    PRIMARY KEY,
  level      INT    NOT NULL,
  value      DOUBLE NOT NULL,
  product_id INT    NOT NULL,
  min_level  INT    NULL,
  price      INT    NOT NULL
)
  ENGINE = InnoDB;




-- INSERTS

INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (1, 'charbon', 10, 5, 10, 1, 2, 0.5);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (2, 'fer', 50, 25, 50, 5, 10, 0.05);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (3, 'or', 100, 500, 1500, 25, 50, 0);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (4, 'redstone', 100, 150, 300, 15, 30, 0.01);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (5, 'lapis', 150, 1000, 2500, 40, 80, 0);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (6, 'diamant', 250, 3000, 12000, 200, 250, 0);

INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (1, 1, 50);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (2, 2, 100);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (3, 3, 200);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (4, 4, 500);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (5, 5, 5000);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (6, 6, 25000);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (7, 7, 50000);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (8, 8, 100000);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (9, 9, 1000000);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (10, 10, 50000000);

INSERT INTO jeudeladate.date_breakpoints (id, date, experience_needed) VALUES (1, 'XX0X', 100000);
INSERT INTO jeudeladate.date_breakpoints (id, date, experience_needed) VALUES (2, 'XX03', 10000000);
INSERT INTO jeudeladate.date_breakpoints (id, date, experience_needed) VALUES (3, '0X03', 250000000);
INSERT INTO jeudeladate.date_breakpoints (id, date, experience_needed) VALUES (4, '0303', 500000000);

INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (1, 1, 1, 1);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (2, 2, 1, 1);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (3, 3, 1, 0.4);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (4, 3, 2, 0.6);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (5, 4, 1, 0.1);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (6, 4, 2, 0.7);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (7, 4, 4, 0.2);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (8, 5, 2, 0.4);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (9, 5, 4, 0.6);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (10, 6, 3, 0.7);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (11, 6, 4, 0.3);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (12, 7, 3, 0.2);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (13, 7, 5, 0.8);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (14, 8, 3, 0.05);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (15, 8, 5, 0.6);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (16, 8, 6, 0.35);

INSERT INTO jeudeladate.players_products (id, player_id, product_level_id, date) VALUES (1, 1, 5, '2018-01-21 01:30:14');
INSERT INTO jeudeladate.players_products (id, player_id, product_level_id, date) VALUES (2, 1, 4, '2018-01-21 17:46:02');
INSERT INTO jeudeladate.players_products (id, player_id, product_level_id, date) VALUES (3, 3, 1, '2018-01-21 21:39:59');
INSERT INTO jeudeladate.players_products (id, player_id, product_level_id, date) VALUES (4, 3, 2, '2018-01-22 18:17:12');
INSERT INTO jeudeladate.players_products (id, player_id, product_level_id, date) VALUES (5, 3, 5, '2018-01-22 22:57:26');

INSERT INTO jeudeladate.products (id, name, description, image) VALUES (1, 'Un vrai chevalier !', 'Achetez cet objet pour participer au grand tirage au sort et tenter de gagner un grade d''une valeur de 10 euros pendant 2 mois dès l''ouverture !', 'https://d1u5p3l4wpay3k.cloudfront.net/minecraft_fr_gamepedia/1/1b/%C3%89tiquette_nominative.png');
INSERT INTO jeudeladate.products (id, name, description, image) VALUES (2, 'Je suis Utarien', 'Achetez cet objet pour participer au grand tirage au sort et tenter de gagner un grade d''une de valeur de 5 euros pendant 2 mois dès l''ouverture !', 'https://d1u5p3l4wpay3k.cloudfront.net/minecraft_fr_gamepedia/1/1b/%C3%89tiquette_nominative.png');
INSERT INTO jeudeladate.products (id, name, description, image) VALUES (3, 'Pioche magique', 'Une SUPER-PIOCHE qui va miner pour vous !', 'https://www.hexxit-wiki.com/w/images/hexxit/c/cc/Magic_Pickaxe.png');
INSERT INTO jeudeladate.products (id, name, description, image) VALUES (4, 'Super-clic !', 'Cet objet booste votre souris et double le nombre de coups à chaque clic ! ', 'https://i.imgur.com/vWOopil.png');

INSERT INTO jeudeladate.products_levels (id, level, value, product_id, min_level, price) VALUES (1, 1, 1, 3, 5, 250);
INSERT INTO jeudeladate.products_levels (id, level, value, product_id, min_level, price) VALUES (2, 2, 2, 3, 7, 1000);
INSERT INTO jeudeladate.products_levels (id, level, value, product_id, min_level, price) VALUES (3, 1, 1, 1, 1, 30000);
INSERT INTO jeudeladate.products_levels (id, level, value, product_id, min_level, price) VALUES (4, 1, 1, 2, 1, 15000);
INSERT INTO jeudeladate.products_levels (id, level, value, product_id, min_level, price) VALUES (5, 1, 1, 4, 8, 5000);