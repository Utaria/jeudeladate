CREATE TABLE `blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `clicks` int(11) NOT NULL DEFAULT 0,
  `experience_min` int(11) NOT NULL DEFAULT 0,
  `experience_max` int(11) NOT NULL DEFAULT 0,
  `coin_min` int(11) NOT NULL DEFAULT 0,
  `coin_max` int(11) NOT NULL DEFAULT 0,
  `usekeys_chance` float DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;

INSERT INTO `blocks` VALUES
(1,'charbon',10,5,10,1,2,0.5),
(2,'fer',50,25,50,5,10,0.05),
(3,'or',100,500,1500,25,50,0),
(4,'redstone',100,150,300,15,30,0.005),
(5,'lapis',150,1000,2500,40,80,0),
(6,'diamant',250,3000,12000,200,250,0),
(7,'emeraude',400,6000,10000,225,300,0),
(8,'blocfer',450,11000,12000,250,325,0),
(9,'blocor',500,12500,14000,250,350,0),
(10,'blocredstone',550,13000,15000,350,500,0),
(11,'bloclapis',600,14000,16000,450,600,0),
(12,'blocdiamant',700,14500,17000,700,1000,0),
(13,'blocemeraude',800,15000,18000,800,1000,0),
(14,'obsidienne',1000,15000,19000,1000,1250,0);


CREATE TABLE `date_breakpoints` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` varchar(10) NOT NULL,
  `experience_needed` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

INSERT INTO `date_breakpoints` VALUES (1,'XX0X',100000),(2,'XX03',5000000),(3,'0X03',36000000),(4,'0303',38673818);


CREATE TABLE `levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nb` int(11) NOT NULL,
  `experience_needed` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

INSERT INTO `levels` VALUES (1,1,50),(2,2,150),(3,3,300),(4,4,1000),
(5,5,5000),(6,6,25000),(7,7,50000),(8,8,100000),(9,9,1000000),(10,10,1100000),
(11,11,1200000),(12,12,1300000),(13,13,1400000),(14,14,1500000),(15,15,1600000),
(16,16,1700000),(17,17,1800000),(18,18,1900000),(19,19,2000000),(20,20,300000000);


CREATE TABLE `levels_blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level_id` int(11) NOT NULL,
  `block_id` int(11) NOT NULL,
  `chance` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4;

INSERT INTO `levels_blocks` VALUES (1,1,1,1),(2,2,1,0.9),(3,3,1,0.4),(4,3,2,0.6),
(5,4,1,0.1),(6,4,2,0.7),(7,4,4,0.2),(8,5,2,0.4),(9,5,4,0.6),(10,6,3,0.7),(11,6,4,0.3),
(12,7,3,0.2),(13,7,5,0.8),(14,8,3,0.05),(15,8,5,0.6),(16,8,6,0.35),(17,2,2,0.1),(18,9,5,0.1),
(19,9,6,0.9),(20,10,6,1),(21,11,7,0.6),(22,12,7,1),(23,13,7,0.2),(24,13,8,0.8),(25,14,8,1),
(26,15,8,0.2),(27,15,9,0.8),(28,16,9,1),(29,17,10,1),(30,18,11,1),(31,19,12,1),(32,20,13,0.6),
(33,20,14,0.38),(34,11,6,0.4),(35,20,1,0.02);


CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `run_on` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) DEFAULT NULL,
  `cookie` varchar(150) NOT NULL DEFAULT '0',
  `ip` varchar(50) NOT NULL DEFAULT '0',
  `connection_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `level_id` int(11) NOT NULL DEFAULT 1,
  `experience` int(11) DEFAULT 0,
  `total_experience` int(11) NOT NULL DEFAULT 0,
  `coins` int(11) DEFAULT 0,
  `refererkey` varchar(10) NOT NULL,
  `refers_to` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cookie` (`cookie`),
  UNIQUE KEY `players_name_uindex` (`name`),
  KEY `level_id` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `players_products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `product_level_id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `image` mediumtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

INSERT INTO `products` VALUES
(1,'Un vrai chevalier !','Achetez cet objet pour participer au grand tirage au sort et tenter de gagner un grade d\'une valeur de 10 euros pendant 2 mois dès l\'ouverture !','https://d1u5p3l4wpay3k.cloudfront.net/minecraft_fr_gamepedia/1/1b/%C3%89tiquette_nominative.png'),
(2,'Je suis Utarien','Achetez cet objet pour participer au grand tirage au sort et tenter de gagner un grade d\'une de valeur de 5 euros pendant 2 mois dès l\'ouverture !','https://d1u5p3l4wpay3k.cloudfront.net/minecraft_fr_gamepedia/1/1b/%C3%89tiquette_nominative.png'),
(3,'Pioche magique','Une SUPER-PIOCHE qui va miner pour vous !','https://www.hexxit-wiki.com/w/images/hexxit/c/cc/Magic_Pickaxe.png'),
(4,'Super-clic !','Cet objet booste votre souris et double le nombre de coups à chaque clic ! ','https://i.imgur.com/vWOopil.png');


CREATE TABLE `products_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level` int(11) NOT NULL,
  `value` double NOT NULL,
  `product_id` int(11) NOT NULL,
  `min_level` int(11) DEFAULT NULL,
  `price` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;

INSERT INTO `products_levels` VALUES (1,1,1,3,5,200),(2,2,1.1,3,7,1000),(3,1,1,1,1,30000),
(4,1,1,2,1,15000),(5,1,2,4,8,5000),(6,3,1.2,3,10,20000),(7,4,1.3,3,12,40000),(8,5,1.4,3,15,80000),
(9,6,1.5,3,18,100000),(10,2,5,4,10,25000),(11,3,8,4,13,40000),(12,4,12,4,16,80000),
(13,5,15,4,18,100000),(14,6,25,4,20,125000);
