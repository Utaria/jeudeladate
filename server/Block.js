const Model = require('./Model');

function Block(id, name) {
    this._id = id;
    this._name = name;
    this._chances = {};
}

Block.prototype = {

    getId: function() {
        return this._id;
    },

    getName: function() {
        return this._name;
    },

    getChanceForLevel: function(level) {
        if (this._chances[level.getId()] == null)
            return 0;

        return this._chances[level.getId()];
    },

    addLevelChance: function(levelId, chance) {
        this._chances[levelId] = chance;
    },

    toJSON: function() {
        return { name: this._name };
    }

};

Block.blocks = [];
Block.load = function() {
    Model.getBlocks(function(err, blocks) {
        if (err || !blocks || blocks.length === 0)
            return false;

        for (let block of blocks) {
            let blockObj = Block.getById(block.block_id);

            if (blockObj == null) {
                blockObj = new Block(block.block_id, block.name);
                Block.blocks.push(blockObj);
            }

            blockObj.addLevelChance(block.level_id, block.chance);
        }
    });
};
Block.getById = function(id) {
    for (let block of Block.blocks)
        if (block.getId() === id)
            return block;

    return null;
};
Block.randomForLevel = function(level) {
    let rand = Math.random();
    let total = 0;

    for (let block of Block.blocks) {
        total += block.getChanceForLevel(level);

        if (rand < total)
            return block;
    }

    return null;
};

module.exports = Block;