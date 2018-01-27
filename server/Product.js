const Model = require('./Model');

function Product(id, name, description, image) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._image = image;

    this._levels = [];
}

Product.prototype = {

    getId: function() {
        return this._id;
    },

    addLevel: function(id, level, value, minLevel, price) {
        this._levels.push([id, level, value, minLevel, price]);
    },

    getLevel: function(levelId) {
        for (let level of this._levels)
            if (level[0] == levelId)
                return level;

        return null;
    },

    getName: function() {
        return this._name;
    },

    getCurrentLevelOf: function(player) {
          const purchases = player.getPurchases();
          let rLevel = null;

          for (let purchase of purchases)
              for (let level of this._levels)
                  if (level[0] === purchase && (rLevel == null || level[1] > rLevel[1]))
                      rLevel = level;

          if (rLevel != null)
              return rLevel;
          else
              return [0, 0, 0, 0, 0];
    },

    getAvailableLevelOf: function(player) {
        const next = this.getNextLevelOf(player);
        if (next === null || next[3] > player.getLevel().getNb())
            return null;

        return next;
    },

    getNextLevelOf: function(player) {
        const current = this.getCurrentLevelOf(player);

        for (let level of this._levels)
            if (level[1] === current[1] + 1)
                return level;

        if (current[1] + 1 > this._levels.length)
            return [0, "max", 0, 0, 0];

        return null;
    },

    toJSON: function() {
        return {
            id: this._id,
            name: this._name,
            description: this._description,
            image: this._image,
            nbLevels: this._levels.length
        };
    }

};

Product.products = [];
Product.load = function() {
    Model.getProducts(function(err, products) {
        if (err || !products || products.length === 0)
            return false;

        for (let product of products) {
            let prodObj = Product.getById(product.id);

            if (prodObj == null) {
                prodObj = new Product(product.id, product.name, product.description, product.image);

                Product.products.push(prodObj);
            }

            prodObj.addLevel(product.level_id, product.level, product.value, product.min_level, product.price);
        }
    });
};
Product.getById = function(id) {
    for (let product of Product.products)
        if (product.getId() === id)
            return product;

    return null;
};

Product.getAvailableProductsOfPlayer = function(player) {
    const re = [];

    for (let product of Product.products) {
        let obj = product.toJSON();

        obj.currentLevel = product.getCurrentLevelOf(player);
        obj.availableLevel = product.getAvailableLevelOf(player);
        obj.nextLevel = product.getNextLevelOf(player);

        re.push(obj);
    }

    return re;
};
Product.getProductsOf = function(player) {
    const purchases = player.getPurchases();
    const products = [];

    for (let purchase of purchases)
        for (let product of Product.products)
            if (product.getLevel(purchase))
                products.push(product.getLevel(purchase));

    return products;
};

module.exports = Product;