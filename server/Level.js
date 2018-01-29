const Model = require('./Model');

function Level(id, number, experienceNeeded) {
    this._id = id;
    this._nb = number;
    this._experienceNeeded = experienceNeeded;
    this._maxLevel = false;
}

Level.prototype = {

    getId: function() {
        return this._id;
    },

    getNb: function() {
        return this._nb;
    },

    getNeededExperience: function() {
        return this._experienceNeeded;
    },

    isMax: function() {
        return this._maxLevel;
    },

    setMaxLevel: function(b) {
        this._maxLevel = b;
    },

    toJSON: function() {
        return { id: this._id, nb: this._nb, experienceNeeded: this._experienceNeeded, max: this._maxLevel };
    }

};

Level.levels = [];
Level.load = function() {
    Model.getLevels(function(err, levels) {
        if (err || !levels || levels.length === 0)
            return false;

        for (let level of levels)
            Level.levels.push(new Level(level.id, level.nb, level.experience_needed));

        // Define max level
        Level.levels[Level.levels.length - 1].setMaxLevel(true);
    });
};
Level.getById = function(id) {
    for (let level of Level.levels)
        if (level.getId() === id)
            return level;

    return null;
};
Level.getExperienceAfterLevel = function(id) {
    if (id <= 0) return 0;
    let exp = 0;

    for (let level of Level.levels)
        if (level.getId() <= id)
            exp += level.getNeededExperience();

    return exp;
};

module.exports = Level;