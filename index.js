//Set up mongoose to connect to myFlixDB (MongoDB)
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { userNewUrlParser: true, useUnifiedTopology: true});

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

//appending Morgan logs to a file: need built-in node modules fs and path
const fs = require('fs');
const path = require('path');

let users = [
  {
    id: 1,
    name: 'Kim',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Joe',
    favoriteMovies: ['Dune']
  }
];

let movies = [
  {
    title: 'Blue Velvet',
    director: {
      name: 'David Lynch',
      age: '50'
    },
    description: 'Kinda Crazy',
    genre: {
      name: 'Drama-thriller',
      description: 'Dramatic thriller'
    },
    year: '1986'
  },
  {
    title: 'Dune',
    director: {
      name: 'David Lynch',
      age: '50'
    },
    description: 'Dune: Desert Planet',
    genre: {
      name: 'Sci-fi',
      description: 'Fictional storytelling focusing on scientific concepts'
    },
    year: '1984'
  },
  {
    title: 'Twin Peaks: Fire Walk with Me',
    director: {
      name: 'David Lynch',
      age: '50'
    },
    description: 'Talking backwards',
    genre: {
      name: 'Comedy-drama-thriller',
      description: 'Dramatic thriller with comedic awkwardness'
    },
    year: '1992'
  },
  {
    title: 'Alien',
    director: {
      name: 'Ridley Scott',
      age: '66'
    },
    description: 'In space, noone can hear you scream...',
    genre: {
      name: 'Sci-fi and horror',
      description: 'Scary sci-fi'
    },
    year: '1979'
  },
 /* {
    title: 'Blade Runner',
    director: 'Ridley Scott',
    year: '1982'
  },
  {
    title: 'House of Gucci',
    director: 'Ridley Scott',
    year: '2021'
  }, 
  {
    title: 'Aliens',
    director: 'James Cameron',
    year: '1986'
  }, */
  {
    title: 'The Abyss',
    director: {
      name: 'James Cameron',
      age: '70'
    },
    description: 'Underwater thriller',
    genre: {
      name: 'Thriller',
      description: 'Suspenseful on the edge'
    },
    year: '1989'
  }
  /*{
    title: 'Terminator 2: Judgement Day',
    director: 'James Cameron',
    year: '1991'
  },
  {
    title: 'Lost in Translation',
    director: 'Sophia Coppola',
    year: '2003'
  }*/
];

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
  res.status(200).json(movies);
});

//GET method returning a movie by title as a JSON object (CREATE)
app.get('/movies/:title', (req, res) => {
  const { title } = req.params; //object destructuring (const title = res.params.title;)
  const movie = movies.find(movie => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send(`${title} not found.`);
  } 
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
  res.send(`<p>Welcome to ${req.url}, the future home of the MovieApp!</p>`);
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