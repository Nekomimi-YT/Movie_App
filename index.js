const mongoose = require('mongoose');
const { Movie, User } = require('./models.js');
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const app = express();

//fs and path modules required for morgan
const fs = require('fs');
const path = require('path');
//create a write stream in append mode and add to log.txt in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

//route requests for static files to the /public folder
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

/*app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested, Content-Type, Accept Authorization"
  )
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "POST, PUT, PATCH, GET, DELETE"
    )
    return res.status(200).json({})
  }
  next()
})*/

//Importing express-validator
const { check, validationResult } = require('express-validator');

//importing auth.js, Passport and passport.js
require('./auth')(app);
const passport = require('passport');
require('./passport');

//POST method that adds a new user and returns user data as a JSON object (CREATE)
app.post('/users', [
  //Validation logic for request
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // response for inout errors found with express-validator
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  let hashedPassword = User.hashPassword(req.body.Password);
  User.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(`${req.body.Username} already exists!`);      
      } else {
        User
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then(user => res.status(201).json(user))
          .catch(error => res.status(500).send(`Error: ${error}`));
      }
    })
      .catch(error => res.status(500).send(`Error: ${error}`));
});

//PUT method to update user info and return user data as JSON object (UPDATE)
app.put('/users/:username', [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', { session: false }), (req, res) => {
  
  // response for input errors found with express-validator
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  let hashedPassword = User.hashPassword(req.body.Password);
  User.findOneAndUpdate ( {Username: req.params.username}, { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true } //return document
  ) 
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(400).send(`${req.params.username} doesn't exist!`);      
      } else {
      res.json(updatedUser)
      }
    })
    .catch(error => res.status(500).send(`Error: ${error}`));
  }); 

//POST method that adds a movie to the user's favorite movies and returns user data as a JSON object (CREATE)
app.post('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
 User.findOneAndUpdate ( 
  {Username: req.params.username}, 
  { 
    $addToSet: { favoriteMovies: req.params.movieID }
  },
  { new: true } 
 )
  .then((updatedUser) => {
    if (!updatedUser) {
      return res.status(400).send(`No user with that username.`);
    } else {
      return res.json(updatedUser);
    }
  })
  .catch(error => res.status(500).send(`Error: ${error}`));
});

//DELETE method that removes a user's favorite movie and returns user data as a JSON object (DELETE)
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findOneAndUpdate ( 
    {Username: req.params.username}, 
    { 
      $pull: { favoriteMovies: req.params.movieID } 
    },
    { new: true } 
   )
  .then((updatedUser) => {
    if (!updatedUser) {
      return res.status(400).send(`No user with that username.`);
    } else {
      return res.json(updatedUser);
    }
  })
  .catch(error => res.status(500).send(`Error: ${error}`));
});


//DELETE method to remove all user data (DELETE)
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findOneAndRemove({ Username: req.params.username})
    .then((user) => {
      if (!user) {
        return res.status(400).send(`${req.params.username} was not found.`);
      } else {
        return res.status(200).send(`${req.params.username} was deleted.`);
      }
    })
});
  
//GET method returning all movies as JSON objects (CREATE)
app.get('/movies', /*passport.authenticate('jwt', { session: false }),*/(req, res) => {
  Movie.find()
  .then(movies => res.status(200).json(movies))
  .catch(error => res.status(500).send(`Error: ${error}`));
});

//GET method returning a movie by title as a JSON object (CREATE)
app.get('/movies/:title', /*passport.authenticate('jwt', { session: false }),*/ (req, res) => {
  Movie.findOne({ Title: req.params.title })
    .then(movie => res.status(200).json(movie))
    .catch (error => res.status(400).send(`Error ${error}`))
});

//GET method returning genre and genre description as a JSON object (CREATE)
app.get('/movies/genre/:genreName',/* passport.authenticate('jwt', { session: false }),*/ (req, res) => {
  Movie.findOne( {'Genre.Name': req.params.genreName} )
    .then(movie => res.status(200).json(movie.Genre))
    .catch (error => res.status(400).send(`Error: ${error}`)); 
});

//GET method returning director and director bio info as a JSON object (CREATE)
app.get('/movies/director/:directorName',/* passport.authenticate('jwt', { session: false }),*/ (req, res) => {
  Movie.findOne( {'Director.Name': req.params.directorName} )
    .then(movie => res.status(200).json(movie.Director))
    .catch (error => res.status(400).send(`Error: ${error}`)); 
});

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//log all application-level errors to the terminal
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something\'s wrong!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on Port ${port}`);
});