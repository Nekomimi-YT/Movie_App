const mongoose = require('mongoose');
const { Movie, User } = require('./models.js');
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { check, validationResult } = require('express-validator');
require('./auth')(app);
const passport = require('passport');
require('./passport');

/**
 * Morgan creates logs for endpoint testing
 * fs and path modules required to use morgan
 */
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

/**
 * Creates a write stream in append mode and logs to log.txt in root directory
 */
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a'
});

/**
 * Middleware:
 * Morgan - endpoint logging
 * Express.static - routes requests for static files to the /public folder
 * Bodyparser - parses body JSON info and URL info
 * Express error catch - log all application-level errors to the terminal
 */
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something's wrong!");
});

/**
 * POST method that adds a new user and returns user data as a JSON object (CREATE)
 * Includes validation
 * @function registerUser
 * @returns user
 */
app.post(
  '/users',
  [
    //Validation logic for request
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {
    // response for in-out errors found with express-validator
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
          User.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then((user) => res.status(201).json(user))
            .catch((error) => res.status(500).send(`Error: ${error}`));
        }
      })
      .catch((error) => res.status(500).send(`Error: ${error}`));
  }
);

/**
 * PUT method to update user info and return user data as JSON object (UPDATE)
 * Includes validation
 * @function updateUser
 * @param username
 * @returns updated user object
 */
app.put(
  '/users/:username',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // response for input errors found with express-validator
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let hashedPassword = User.hashPassword(req.body.Password);
    User.findOneAndUpdate(
      { Username: req.params.username },
      {
        $set: {
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
          res.json(updatedUser);
        }
      })
      .catch((error) => res.status(500).send(`Error: ${error}`));
  }
);

/**
 * POST method that adds a movie to the user's favorite movies and returns user data as a JSON object (CREATE)
 * @function addFavorite
 * @param username
 * @param movieID
 * @returns updated user object
 */
app.post(
  '/users/:username/movies/:movieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { Username: req.params.username },
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
      .catch((error) => res.status(500).send(`Error: ${error}`));
  }
);

/**
 * DELETE method that removes a user's favorite movie and returns user data as a JSON object (DELETE)
 * @function deleteFavorite
 * @param username
 * @param movieID
 * @returns updated user object
 */
app.delete(
  '/users/:username/movies/:movieID',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndUpdate(
      { Username: req.params.username },
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
      .catch((error) => res.status(500).send(`Error: ${error}`));
  }
);

/**
 * DELETE method to remove all user data (DELETE)
 * @function deleteUser
 * @param username
 * @returns success or error message
 */
app.delete(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOneAndRemove({ Username: req.params.username }).then((user) => {
      if (!user) {
        return res.status(400).send(`${req.params.username} was not found.`);
      } else {
        return res.status(200).send(`${req.params.username} was deleted.`);
      }
    });
  }
);

/**
 * GET method returning all movies as JSON objects (CREATE)
 * @function getMovies
 * @returns movies array of objects
 */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movie.find()
      .then((movies) => res.status(200).json(movies))
      .catch((error) => res.status(500).send(`Error: ${error}`));
  }
);

/**
 * GET method returning a movie by title as a JSON object (CREATE)
 * @function getMovieByTitle
 * @param title
 * @returns movie object
 */
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movie.findOne({ Title: req.params.title })
      .then((movie) => res.status(200).json(movie))
      .catch((error) => res.status(400).send(`Error ${error}`));
  }
);

/**
 * GET method returning genre and genre description as a JSON object (CREATE)
 * @function getGenre
 * @param genreName
 * @returns Genre object
 */
app.get(
  '/movies/genre/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movie.findOne({ 'Genre.Name': req.params.genreName })
      .then((movie) => res.status(200).json(movie.Genre))
      .catch((error) => res.status(400).send(`Error: ${error}`));
  }
);

/**
 * GET method returning director and director bio info as a JSON object (CREATE)
 * @function getDirector
 * @param directorName
 * @returns Director object
 */
app.get(
  '/movies/director/:directorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movie.findOne({ 'Director.Name': req.params.directorName })
      .then((movie) => res.status(200).json(movie.Director))
      .catch((error) => res.status(400).send(`Error: ${error}`));
  }
);

/**
 * GET method returning the user info as a JSON object (CREATE)
 * @function getUser
 * @param username
 * @returns user object
 */
app.get(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findOne({ Username: req.params.username })
      .then((user) => res.status(200).json(user))
      .catch((error) => res.status(400).send(`Error ${error}`));
  }
);

/**
 * GET method returning index.html at the root endpoint
 */
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

/**
 * GET method returning documentation file at the /documentation endpoint
 */
app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

/**
 * Defines the listening port
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on Port ${port}`);
});
