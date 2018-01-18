const Model = require('./Model');

function Block(id, name, clicks, useKeysChance) {
    this._id = id;
    this._name = name;
    this._clicks = clicks;
    this._useKeysChance = useKeysChance;

    this._chances = {};

    this._experienceWin = [];
    this._coinWin = [];
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

    setExperienceWinValues: function(min, max) {
        this._experienceWin = [min, max];
    },

    setCoinWinValues: function(min, max) {
        this._coinWin = [min, max];
    },

    toJSON: function() {
        return {
            name: this._name,
            clicks: this._clicks,
            useKeys: Math.random() < this._useKeysChance,

            win: {
                experience: randomIntFromInterval(this._experienceWin[0], this._experienceWin[1]),
                coin: randomIntFromInterval(this._coinWin[0], this._coinWin[1])
            }
        };
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
                blockObj = new Block(block.block_id, block.name, block.clicks, block.usekeys_chance);
                blockObj.setExperienceWinValues(block.experience_min, block.experience_max);
                blockObj.setCoinWinValues(block.coin_min, block.coin_max);

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

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = Block;