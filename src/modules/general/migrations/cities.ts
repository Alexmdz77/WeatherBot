
exports.up = function(knex) {
    return knex.schema.createTable('cities', table => {
        table.string('name').primary().notNullable();
        table.string('lat');
        table.string('lng');
        table.string('country');
        table.string('admin1');
        table.string('admin2');
    });
  };
  
exports.down = function(knex) {
    return knex.schema.dropTable('cities');
};

exports.config = { transaction: false };