CREATE TABLE blocks
(
  id             INT AUTO_INCREMENT
    PRIMARY KEY,
  name           VARCHAR(60)     NOT NULL,
  clicks         INT DEFAULT '0' NOT NULL,
  experience_min INT DEFAULT '0' NOT NULL,
  experience_max INT DEFAULT '0' NOT NULL,
  coin_min       INT DEFAULT '0' NOT NULL,
  coin_max       INT DEFAULT '0' NOT NULL
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
  id              INT AUTO_INCREMENT
    PRIMARY KEY,
  name            VARCHAR(80)                         NULL,
  cookie          VARCHAR(255) DEFAULT '0'            NOT NULL,
  ip              VARCHAR(50) DEFAULT '0'             NOT NULL,
  connection_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  level_id        INT DEFAULT '1'                     NOT NULL,
  experience      INT DEFAULT '0'                     NULL,
  coins           INT DEFAULT '0'                     NULL,
  CONSTRAINT cookie
  UNIQUE (cookie)
)
  ENGINE = InnoDB;

CREATE INDEX level_id
  ON players (level_id);

-- INSERTS

INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max) VALUES (1, 'fer', 10, 5, 10, 1, 2);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max) VALUES (2, 'or', 50, 25, 50, 5, 10);
INSERT INTO jeudeladate.blocks (id, name, clicks, experience_min, experience_max, coin_min, coin_max) VALUES (3, 'diamant', 100, 5000, 10000, 50, 75);

INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (1, 1, 50);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (2, 2, 100);
INSERT INTO jeudeladate.levels (id, nb, experience_needed) VALUES (3, 3, 200);

INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (1, 1, 1, 1);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (2, 2, 1, 0.9);
INSERT INTO jeudeladate.levels_blocks (id, level_id, block_id, chance) VALUES (3, 2, 2, 0.1);