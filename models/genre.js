let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let GenreSchema = new Schema({
  name: { type: String, required: true, min: 3, max: 100}
});

GenreSchema
.virtual('url')
.get(function() {
  return 'catalog/genre' + this.id;
});

module.exports = mongoose.model('GenreInstance', GenreSchema);
