const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  ReleaseYear: String,
  Genre: {
    //embedded document
    Name: String,
    Description: String
  },
  Director: {
    //enbedded document
    Name: String,
    Bio: String,
    Birth: String,
    Death: String
  },
  ImagePath: String,
  CriticRating: String,
  AudienceRating: String,
  Actors: [String], //an array of strings
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema); //creates db.movies
let User = mongoose.model('User', userSchema); //creates db.users

module.exports.Movie = Movie;
module.exports.User = User;
