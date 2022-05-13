const { Pool} = require('pg')

const pool = new Pool({
  user: 'fish_user',
  database: 'fish',
  password: 'password',
  port: 5432,
  host: 'localhost',
});

async function insertData() {
    const [name, color] = process.argv.slice(2);
    try {
      const res = await pool.query(
        "INSERT INTO shark (name, color) VALUES ($1, $2)",
        [name, color]
      );
      console.log(`Added a shark with the name ${name}`);
    } catch (error) {
      console.error(error)
    }
}


async function retrieveData() {
    try {
        const res = await pool.query("SELECT * FROM shark");
        return res;
    } catch (error) {
        console.error(error);
        return;
    }
}
  
  
retrieveData();