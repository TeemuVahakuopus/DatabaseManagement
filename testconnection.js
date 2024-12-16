const client = require('./db');

// yhteyden testaus
client.query('SELECT NOW()') 
  .then(res => {
    console.log('Database connection successful:', res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('Error executing query', err.stack);
  });
