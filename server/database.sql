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
  cookie varchar(255) default '0' not null,
  ip varchar(50) default '0' not null,
  connection_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
  level_id int default '1' not null,
  experience int default '0' null,
  coins int default '0' null,
  constraint cookie
  unique (cookie)
)
  engine=InnoDB
;

create index level_id
  on players (level_id)
;


-- INSERTS

INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (1, 'fer', 10, 5, 10, 1, 2, 1);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (2, 'or', 50, 25, 50, 5, 10, 0);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max, usekeys_chance) VALUES (3, 'diamant', 100, 5000, 10000, 50, 75, 0);

INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (1, 1, 50);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (2, 2, 100);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (3, 3, 200);

INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (1, 1, 1, 1);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (2, 2, 1, 0.9);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (3, 2, 2, 0.1);