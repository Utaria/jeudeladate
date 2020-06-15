<p align="center">
    <img src="https://i.imgur.com/rNl9EhX.png" alt="Logo de Utaria" width="500">
</p>

<h1 align="center">Jeu de la date (V2)</h1>
<h4 align="center">
Réalisé pour le démarrage de la V2 de notre survie
<br>
Utilise Express, TypeScript, Jade, WebSocket
</h4>

<p align="center">
    <a href="https://twitter.com/Utaria_FR">
        <img src="https://img.shields.io/twitter/follow/Utaria_FR.svg?style=social&label=Suivez-nous%20sur%20Twitter" alt="Suivez-nous">
    </a>
    <a href="https://github.com/Utaria/jeudeladate/commits/master">
        <img src="https://img.shields.io/github/last-commit/Utaria/jeudeladate/master.svg" alt="GitHub last commit">
    </a>
    <a href="https://github.com/Utaria/jeudeladate/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/Licenses-CC%20BY--SA%203.0%20&%20MIT-green.svg" alt="License">
    </a>
</p>

Ce jeu a été réalisé pour le démarrage de la V2 de notre serveur Survie. *(Ouvert le 03/03/2018)* \
Développé par [Utarwyn](https://github.com/utarwyn).  


## En quoi consiste ce jeu ?

Ce jeu est un __"clicker"__. Il faut donc cliquer sur des blocs avec une pioche pour les casser et gagner des pièces et de l'expérience. Les pièces permettent d'acheter des améliorations afin d'avoir un auto-clicker plus rapide ou de casser plus rapidement les blocs. Au fil des niveaux, les blocs sont de plus en plus long à casser mais rapportent plus de pièces et d'expérience. L'expérience rapportée par chaque joueur permet de débloquer la date d'ouverture en collaboration (paliers d'expérience globale).

## Quelques images du jeu ?

<p align="center">
  <img src="https://i.imgur.com/ccEjt0o.png" alt="Ecran principal du jeu" width="500"><br>
  <img src="https://i.imgur.com/I2xlJBE.png" alt="Ecran de visualisation de la date" width="500"><br>
  <img src="https://i.imgur.com/tRUugQh.png" alt="Ecran de la boutique" width="500">
</p>

## Comment ce jeu a-t-il été mis en place ?

L'outil utilise **NodeJS**, la mise en page **Jade** ainsi que du **TypeScript** et du **LESS** pour le jeu côté Client.
Le programme utilise les **Websockets *(Socket.io)*** pour communiquer avec le serveur en temps-réel.

## Guide d'installation

1. Cloner le dépôt
2. Installer les dépendances avec `npm install` ou `yarn install`
3. Initialiser votre base de données avec les fichiers SQL dans le dossier **database**
4. Créer le fichier `storage/config.json` en adaptant le contenu suivant :
```json
{
  "port" : 3000,
  "base" : "http://localhost",
  "db" : {
    "host" : "localhost",
    "port" : 3306,
    "user" : "root",
    "password" : "root",
    "database" : "jeudeladate"
  }
}
```
5. Démarrer le jeu avec `npm start`
6. Connectez-vous sur **http://localhost:3000** :rocket:

## Remerciements

On remercie tous les participants du jeu et les joueurs de notre V2 :fire: :heart_eyes:

## Licence

> Voir le fichier [LICENSE](https://github.com/Utaria/jeudeladate/blob/master/LICENSE)

---

> GitHub [@Utaria](https://github.com/utaria) &nbsp;&middot;&nbsp;
> Twitter [@Utaria_FR](https://twitter.com/Utaria_FR)
