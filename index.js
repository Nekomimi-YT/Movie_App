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
  const newUser = req.body;

  if (!newUser.name) {
    const message = 'You must include your name.';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);  //status 201 = create
  }
});

//PUT method to update user info (UPDATE)
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);  //truthy converts string to number

  if (!user) {
    res.status(400).send(`No user with that ID.`);
  } else {
    user.name = updatedUser.name;
    res.status(200).json(user);
  }
});

//PUT method to update user's favorite movies (UPDATE)
app.put('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params; // can pull 2 params in 1 statement

  const user = users.find(user => user.id == id);  //truthy converts string to number

  if (!user) {
    res.status(400).send(`No user with that ID.`);
  } else {
    const checkTitle = user.favoriteMovies.find(title => title === movieTitle); //use .find for find and match 
    if (checkTitle) {
      res.status(400).send(`Movie title is already on the list!`);
    } else {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s favorite movies array!`);
  }}
});

//DELETE method to remove a favorite movie (DELETE)
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params; 

  const user = users.find(user => user.id == id);  //truthy converts string to number

  if (!user) {
    res.status(400).send(`No user with that ID.`);
  } else {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle); //use .filter to create array w/out movieTitle
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s favorite movies array!`);
  }
});

//DELETE method to remove a user (DELETE)
app.delete('/users/:id', (req, res) => {
  const { id } = req.params; 

  const user = users.find(user => user.id == id);  //truthy converts string to number

  if (!user) {
    res.status(400).send(`No user with that ID.`);
  } else {
    users = users.filter(user => user.id != id); //create array w/out movieTitle
    res.status(200).send(`User ${id} has been removed.`);
  }
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
  const { genreName } = req.params; 
  const genre = movies.find( movie => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send(`${genreName} not found.`);  //else statement not recognized
  } 
});

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