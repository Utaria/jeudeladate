use jeudeladate;

create table blocks
(
  id int auto_increment
    primary key,
  name varchar(60) not null,
  clicks int default '0' not null,
  experience_min int default '0' not null,
  experience_max int default '0' not null,
  coin_min int default '0' not null,
  coin_max int default '0' not null,
  usekeys_chance float default '0' null
)
  engine=InnoDB
;

create table date_breakpoints
(
  id int auto_increment
    primary key,
  date varchar(10) not null,
  experience_needed int default '0' not null
)
  engine=InnoDB
;

create table levels
(
  id int auto_increment
    primary key,
  nb int not null,
  experience_needed int not null
)
  engine=InnoDB
;

create table levels_blocks
(
  id int auto_increment
    primary key,
  level_id int not null,
  block_id int not null,
  chance double not null
)
  engine=InnoDB
;

create table players
(
  id int auto_increment
    primary key,
  name varchar(80) null,
  cookie varchar(150) default '0' not null,
  ip varchar(50) default '0' not null,
  connection_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
  level_id int default '1' not null,
  experience int default '0' null,
  total_experience int default '0' not null,
  coins int default '0' null,
  refererkey varchar(10) not null,
  refers_to int null,
  constraint players_name_uindex
  unique (name),
  constraint cookie
  unique (cookie)
)
  engine=InnoDB
;

create index level_id
  on players (level_id)
;

create table players_products
(
  id int auto_increment
    primary key,
  player_id int not null,
  product_level_id int not null,
  date timestamp default CURRENT_TIMESTAMP not null
)
  engine=InnoDB
;

create table products
(
  id int auto_increment
    primary key,
  name varchar(255) not null,
  description mediumtext null,
  image mediumtext null
)
  engine=InnoDB
;

create table products_levels
(
  id int auto_increment
    primary key,
  level int not null,
  value double not null,
  product_id int not null,
  min_level int null,
  price int not null
)
  engine=InnoDB
;



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