const Model = require('./Model');

function Level(id, number, clicks) {
    this._id = id;
    this._nb = number;
    this._clicks = clicks;
}

Level.prototype = {

    getId: function() {
        return this._id;
    },

    getNb: function() {
        return this._nb;
    },

    getClicks: function() {
        return this._clicks;
    },

    toJSON: function() {
        return { id: this._id, nb: this._nb, clicks: this._clicks };
    }

};

Level.levels = [];
Level.load = function() {
    Model.getLevels(function(err, levels) {
        if (err || !levels || levels.length === 0)
            return false;

        for (let level of levels)
            Level.levels.push(new Level(level.id, level.nb, level.clicks));
    });
};
Level.getById = function(id) {
    for (let level of Level.levels)
        if (level.getId() === id)
            return level;

    return null;
};

module.exports = Level;