const Model = require('./Model');

function Level(id, number, experienceNeeded) {
    this._id = id;
    this._nb = number;
    this._experienceNeeded = experienceNeeded;
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

    toJSON: function() {
        return { id: this._id, nb: this._nb, experienceNeeded: this._experienceNeeded };
    }

};

Level.levels = [];
Level.load = function() {
    Model.getLevels(function(err, levels) {
        if (err || !levels || levels.length === 0)
            return false;

        for (let level of levels)
            Level.levels.push(new Level(level.id, level.nb, level.experience_needed));
    });
};
Level.getById = function(id) {
    for (let level of Level.levels)
        if (level.getId() === id)
            return level;

    return null;
};

module.exports = Level;