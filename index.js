//Set up mongoose to connect to myFlixDB (MongoDB)
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

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

//POST method to add a new user or update user information (CREATE)
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username})
    .then((user) => {
      if (user) {
        return res.status(400).send(`${req.body.Username} already exists!`);      
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
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

//PUT method to update user info (UPDATE)
app.put('/users/:username', (req, res) => {
  Users.findOneAndUpdate ( {Username: req.params.username}, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
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

//POST method to add a movie to the user's favorite movies (CREATE)
app.post('/users/:username/movies/:movieID', (req, res) => {
 Users.findOneAndUpdate ( 
  {Username: req.params.username}, 
  { 
    $addToSet: { favoriteMovies: req.params.movieID } 
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

//DELETE method to remove a favorite movie (DELETE)
app.delete('/users/:username/movies/:movieID', (req, res) => {
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

//DELETE method to remove a user (DELETE)
app.delete('/users/:username', (req, res) => {
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
app.get('/movies', (req, res) => {
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
app.get('/movies/:title', (req, res) => {
  Movies.findOne( {Title: req.params.title})
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch ((err) => {
      res.status(400).send(`Error ${err}`)
    });
});
    
//GET method returning genre and genre description as a JSON object (CREATE)
app.get('/movies/genre/:genreName', (req, res) => {
  Movies.findOne( {'Genre.Name': req.params.genreName} )
    .then((genre) => {
      res.status(200).json(genre.description);
    })
    .catch ((err) => {
      res.status(400).send(`Error: ${err}`); 
    });
});

/*
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params; 
  const genre = movies.find( movie => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send(`${genreName} not found.`);  //else statement not recognized
  } 
});*/

//GET method returning director and director bio info as a JSON object (CREATE)
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params; 
  const director = movies.find( movie => movie.director.name === directorName).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send(`${directorName} not found.`);  //else statement not recognized
  } 
});

//GET methods returning HTML files (CREATE)
app.get('/', (req, res) => {
  res.send(`<p>Welcome to the future home of the myFlix App!</p>`);
});

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', { root: __dirname });
});

//log all application-level errors to the terminal
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something\'s wrong!');
});

app.listen(8080, () => {
  console.log('Up and running on port 8080!');
});