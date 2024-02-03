
exports.up = function(knex) {
    return knex.schema.createTable('meteo', table => {
        table.string('guildId');
        table.string('channelId');
        table.string('messageId');
        table.string('authorId');
        
        table.string('type');
        table.string('location');
        
        table.string('updatedAt');
        table.string('createdAt');
    });
  };
  
exports.down = function(knex) {
    return knex.schema.dropTable('meteo');
};

exports.config = { transaction: false };