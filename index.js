const express = require('express');
const morgan = require('morgan');

//appending Morgan logs to a file: need built-in node modules fs and path
const fs = require('fs');
const path = require('path');

let topTenMovies = [
  {
    title: 'Blue Velvet',
    director: 'David Lynch',
    year: '1986'
  },
  {
    title: 'Dune',
    director: 'David Lynch',
    year: '1984'
  },
  {
    title: 'Twin Peaks: Fire Walk with Me',
    director: 'David Lynch',
    year: '1992'
  },
  {
    title: 'Alien',
    director: 'Ridley Scott',
    year: '1979'
  },
  {
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
  },
  {
    title: 'The Abyss',
    director: 'James Cameron',
    year: '1989'
  },
  {
    title: 'Terminator 2: Judgement Day',
    director: 'James Cameron',
    year: '1991'
  },
  {
    title: 'Escape from New York',
    director: 'James Cameron',
    year: '1981'
  }
]

const app = express();
//create a write stream in append mode
//log is added to the log.txt file in the root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//set up the logger
app.use(morgan('combined', {stream: accessLogStream}));

//route requests for static files to the /public folder
app.use(express.static('public'));

//Two examples of GET method returning JSON and text data
app.get('/movies', (req, res) => {
  res.json(topTenMovies);
});

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