use jeudeladate;

CREATE TABLE IF NOT EXISTS levels (
  id integer not null primary key auto_increment,
  nb integer not null,
  experience_needed bigint not null
) ENGINE=INNODB CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS players (
  id integer not null primary key auto_increment,
  name varchar(80) not null,
  cookie varchar(150) not null,
  refererkey varchar(10) not null,
  ip varchar(50) default null,
  connection_time timestamp not null default current_timestamp() on update current_timestamp(),
  coins integer default 0 not null,
  experience bigint default 0 not null,
  total_experience bigint default 0 not null,
  level_id integer default 1 not null,
  refers_to integer default null,
  INDEX level_id_index (level_id),
  INDEX refers_to_index (refers_to),
  UNIQUE KEY name_index (name),
  UNIQUE KEY cookie_index (cookie),
  FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
  FOREIGN KEY (refers_to) REFERENCES players(id) ON DELETE SET NULL
) ENGINE=INNODB CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blocks (
  id integer not null primary key auto_increment,
  name varchar(255) not null,
  clicks integer default 0 not null,
  experience_min bigint default 0 not null,
  experience_max bigint default 0 not null,
  coin_min integer default 0 not null,
  coin_max integer default 0 not null,
  usekeys_chance float default 0 not null
) ENGINE=INNODB CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS levels_blocks (
  id integer not null primary key auto_increment,
  level_id integer not null,
  block_id integer not null,
  chance double default 0 not null,
  INDEX level_id_index (level_id),
  FOREIGN KEY (level_id) references levels(id) ON DELETE CASCADE,
  INDEX block_id_index (block_id),
  FOREIGN KEY (block_id) references blocks(id) ON DELETE CASCADE
) ENGINE=INNODB CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id integer not null primary key auto_increment,
  name varchar(100) not null,
  description mediumtext default null,
  image mediumtext default null
) ENGINE=INNODB CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products_levels (
  id integer not null primary key auto_increment,
  level integer default 1 not null,
  value double not null,
  product_id integer not null,
  min_level integer default 0 not null,
  price integer not null,
  INDEX product_id_index (product_id),
  FOREIGN KEY (product_id) references products(id) ON DELETE CASCADE
) ENGINE=INNODB CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS players_products (
  player_id integer not null,
  product_level_id integer not null,
  date timestamp not null default current_timestamp(),
  PRIMARY KEY (player_id, product_level_id),
  FOREIGN KEY (player_id) references players(id) ON DELETE CASCADE,
  FOREIGN KEY (product_level_id) references products_levels(id) ON DELETE CASCADE
) ENGINE=INNODB CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS date_breakpoints (
  id integer not null primary key auto_increment,
  date varchar(10) not null,
  experience_needed bigint default 0 not null
) ENGINE=INNODB CHARSET=utf8mb4;
