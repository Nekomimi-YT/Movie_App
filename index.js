//Set up mongoose to connect to myFlixDB (MongoDB)
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

//appending Morgan logs to a file: need built-in node modules fs and path
const fs = require('fs');
const path = require('path');
const { clear } = require('console');

const app = express();

//create a write stream in append mode
//log is added to the log.txt file in the root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//set up the logger
app.use(morgan('combined', {stream: accessLogStream}));

//route requests for static files to the /public folder
app.use(express.static('public'));

//use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//importing CORS
//const cors = require('cors');
//app.use(cors());

app.use((req, res, next) => {
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
})

//Importing express-validator
const { check, validationResult } = require('express-validator');

//importing auth.js, Passport and passport.js
let auth = require('./auth')(app);
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
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(`${req.body.Username} already exists!`);      
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then((user) => {res.status(201).json(user) 
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send(`Error: ${error}`);
          })
      }
    })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error: ${error}`);
      })
});

//PUT method to update user info and return user data as JSON object (UPDATE)
app.put('/users/:username', [
  //Validation logic for request
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
  ], passport.authenticate('jwt', { session: false }), (req, res) => {
  
    // response for input errors found with express-validator
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate ( {Username: req.params.username}, { $set:
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
    .catch((error) => {
      res.status(500).send(`Error: ${error}`);
    });  
});

//POST method that adds a movie to the user's favorite movies and returns user data as a JSON object (CREATE)
app.post('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
 Users.findOneAndUpdate ( 
  {Username: req.params.username}, 
  { 
    $addToSet: { favoriteMovies: req.params.movieID } //prevent duplicates
  },
  { new: true } 
 )
  .then((updatedUser) => {
    if (!updatedUser) {
      res.status(400).send(`No user with that username.`);
    } else {
      res.json(updatedUser);
    }
  })
  .catch((error) => {
    res.status(500).send(`Error: ${error}`);
  })
});

//DELETE method that removes a user's favorite movie and returns user data as a JSON object (DELETE)
app.delete('/users/:username/movies/:movieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate ( 
    {Username: req.params.username}, 
    { 
      $pull: { favoriteMovies: req.params.movieID } 
    },
    { new: true } 
   )
  .then((updatedUser) => {
    if (!updatedUser) {
      res.status(400).send(`No user with that username.`);
    } else {
      res.json(updatedUser);
    }
  })
  .catch((error) => {
    res.status(500).send(`Error: ${error}`);
  })
});

//DELETE method to remove all user data (DELETE)
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.username})
    .then((user) => {
      if (!user) {
        res.status(400).send(`${req.params.username} was not found.`);
      } else {
        res.status(200).send(`${req.params.username} was deleted.`);
      }
    })
});
  
//GET method returning all movies as JSON objects (CREATE)
app.get('/movies', /*passport.authenticate('jwt', { session: false }),*/(req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(200).json(movies);
})
  .catch((err) => {
    console.error(err);
    res.status(500).send(`Error: ${err}`);
  });
});

//GET method returning a movie by title as a JSON object (CREATE)
app.get('/movies/:title', /*passport.authenticate('jwt', { session: false }),*/ (req, res) => {
  Movies.findOne( {Title: req.params.title})
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch ((err) => {
      res.status(400).send(`Error ${err}`)
    });
});
    
//GET method returning genre and genre description as a JSON object (CREATE)
app.get('/movies/genre/:genreName',/* passport.authenticate('jwt', { session: false }),*/ (req, res) => {
  Movies.findOne( {'Genre.Name': req.params.genreName} )
    .then((movie) => {
      res.status(200).json(movie.Genre);
    })
    .catch ((err) => {
      res.status(400).send(`Error: ${err}`); 
    });
});

//GET method returning director and director bio info as a JSON object (CREATE)
app.get('/movies/director/:directorName',/* passport.authenticate('jwt', { session: false }),*/ (req, res) => {
  Movies.findOne( {'Director.Name': req.params.directorName} )
    .then((movie) => {
      res.status(200).json(movie.Director);
    })
    .catch ((err) => {
      res.status(400).send(`Error: ${err}`); 
    });
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