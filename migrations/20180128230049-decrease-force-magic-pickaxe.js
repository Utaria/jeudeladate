'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.runSql("UPDATE products_levels SET value = 4 WHERE id = 9", function() {
      db.runSql("UPDATE products_levels SET value = 3 WHERE id = 8", function() {
          db.runSql("UPDATE products_levels SET value = 2 WHERE id = 7", function() {
              db.runSql("UPDATE products_levels SET value = 1.75 WHERE id = 6", function() {
                  db.runSql("UPDATE products_levels SET value = 1.5 WHERE id = 2", function() {
                      db.runSql("UPDATE products_levels SET value = 1 WHERE id = 1", callback);
                  });
              });
          });
      });
  });
};

exports.down = function(db, callback) {
    db.runSql("UPDATE products_levels SET value = 8 WHERE id = 9", function() {
        db.runSql("UPDATE products_levels SET value = 5 WHERE id = 8", function() {
            db.runSql("UPDATE products_levels SET value = 3 WHERE id = 7", function() {
                db.runSql("UPDATE products_levels SET value = 2.5 WHERE id = 6", function() {
                    db.runSql("UPDATE products_levels SET value = 2 WHERE id = 2", function() {
                        db.runSql("UPDATE products_levels SET value = 1.5 WHERE id = 1", callback);
                    });
                });
            });
        });
    });
};

exports._meta = {
  "version": 1
};
