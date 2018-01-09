CREATE TABLE blocks
(
  id   INT AUTO_INCREMENT
    PRIMARY KEY,
  name VARCHAR(60) NOT NULL
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

