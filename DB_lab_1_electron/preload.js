window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const {contextBridge} = require('electron');

const { Pool} = require('pg')

const pool = new Pool(require("./credentials.json"));

async function main() {
  contextBridge.exposeInMainWorld('DB', {
    retrieveData,
    deleteData,
    insertData,
  });
}
main();

async function retrieveData(table_name,filter=null,limit=1,offset=0) {
  try {
      const res = await pool.query(`SELECT * FROM ${table_name}${filter ? ` WHERE name LIKE '${filter}'` : ''} LIMIT ${limit} OFFSET ${offset}`);
      return res;
  } catch (error) {
      console.error(error);
      return;
  }
}

async function deleteData(table_name,id) {
  try {
      const res = await pool.query(`DELETE FROM ${table_name} WHERE id = ${id}`);
      return res;
  } catch (error) {
      console.error(error);
      return;
  }
}

async function insertData(table_name,value) {
  try {
      const res = await pool.query(`INSERT INTO ${table_name} (name, author_id,publisher_id) VALUES (${value})`);
      return res;
  } catch (error) {
      console.error(error);
      return;
  }
}

//select column_name from information_schema.columns where table_name='shark';