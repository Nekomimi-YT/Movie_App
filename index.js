const express = require('express');
const app = express();

app.get('/movies', (req, res) => {
  res.json(topTenMovies);
})

app.get('/', (req, res) => {
  res.send(`<p>Welcome to ${req.url}, the future home of the MovieApp!</p>`);
});

app.listen(8080, () => {
  console.log('Up and running on port 8080!');
})