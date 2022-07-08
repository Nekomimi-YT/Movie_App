const express = require('express');
const morgan = require('morgan');

//appending Morgan logs to a file: need built-in node modules fs and path
fs = require('fs');
path = require('path');

const app = express();
//create a write stream in append mode
//log is added to the log.txt file in the root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//set up the logger
app.use(morgan('combined', {stream: accessLogStream}));

app.get('/movies', (req, res) => {
  res.json(topTenMovies);
})

app.get('/', (req, res) => {
  res.send(`<p>Welcome to ${req.url}, the future home of the MovieApp!</p>`);
});

app.listen(8080, () => {
  console.log('Up and running on port 8080!');
})