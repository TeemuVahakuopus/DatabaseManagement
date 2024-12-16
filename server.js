
require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const app = express();
const port = 3004;



console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);


const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});


client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => {
    console.error('Connection error', err.stack);
    process.exit(1); 
  });


app.use(express.json());


app.post('/movies', (req, res) => {
  const { name, year, genre } = req.body;
  const query = 'INSERT INTO movies (name, year, genre) VALUES ($1, $2, $3) RETURNING *';
  const values = [name, year, genre];

  client.query(query, values)
    .then(result => {
      res.status(201).json(result.rows[0]);
    })
    .catch(err => {
      console.error('Database query failed:', err.stack);
      res.status(500).json({ error: 'Database query failed' });
    });
});


app.get('/movies/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM movies WHERE id = $1';
  
  client.query(query, [id])
    .then(result => {
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Movie not found' });
      }
    })
    .catch(err => {
      console.error('Database query failed:', err.stack);
      res.status(500).json({ error: 'Database query failed' });
    });
});


app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM movies WHERE id = $1';

  client.query(query, [id])
    .then(result => {
      if (result.rowCount > 0) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'Movie not found' });
      }
    })
    .catch(err => {
      console.error('Database query failed:', err.stack);
      res.status(500).json({ error: 'Database query failed' });
    });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


app.post('/movies/bulk', (req, res) => {
  const movies = req.body.movies; 

  
  const query = 'INSERT INTO movies (name, year, genre) VALUES ($1, $2, $3) RETURNING *';
  
  
  const promises = movies.map(movie => {
    const values = [movie.name, movie.year, movie.genre];
    return client.query(query, values);
  });

  
  Promise.all(promises)
    .then(results => {
      const addedMovies = results.map(result => result.rows[0]);
      res.status(201).json({ addedMovies });
    })
    .catch(err => {
      console.error('Database query failed:', err.stack);
      res.status(500).json({ error: 'Database query failed' });
    });
});
