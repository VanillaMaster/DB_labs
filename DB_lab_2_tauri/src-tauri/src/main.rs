#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]


//use r2d2_postgres::postgres::{NoTls, Client};
use r2d2_postgres::postgres::{NoTls};
use r2d2_postgres::PostgresConnectionManager;

//use serde::Deserialize;
//use tauri::api::http::Response;
//use tauri::{command, State, Window};
use tauri::{command};
//use std::{thread, string};
use std::{thread};


#[derive(Debug, serde::Serialize)]
enum MyError {}

#[macro_use]
extern crate lazy_static;

lazy_static! {
  static ref POOL: r2d2::Pool<PostgresConnectionManager<NoTls>> = {
      let manager = PostgresConnectionManager::new(
          "postgresql://fish_user:password@localhost:5432/fish".parse().unwrap(),
          NoTls,
      );
      r2d2::Pool::new(manager).unwrap()
  };
}

#[command]
async fn insert_data(name: String,value:String)-> Result<String, MyError> {
  let querry: String;
  querry = format!("INSERT INTO {} (name, author_id,publisher_id) VALUES ({})",name,value);
  
  let res = thread::spawn(move || {
    let mut client = POOL.get().unwrap();
    let res = client.query(querry.as_str(),&[]).unwrap();
    return String::from("true");
  }).join().unwrap();
  Ok(res)
}

#[command]
async fn delete_data(name: String,id:i64)-> Result<String, MyError> {
  let querry: String;
  querry = format!("DELETE FROM {} WHERE id = {}",name,id);
  
  let res = thread::spawn(move || {
    let mut client = POOL.get().unwrap();
    let res = client.query(querry.as_str(),&[]).unwrap();
    return String::from("true");
  }).join().unwrap();
  Ok(res)
}

#[command]
async fn retrieve_data(name: String,filter: String,max: String,skip:i32) -> Result<String, MyError> {
  
  let querry: String;

  if filter.eq(""){
    querry = format!("SELECT * FROM {} LIMIT {} OFFSET {}",name,max,skip); 
  } else {
    querry = format!("SELECT * FROM {} WHERE name LIKE '%{}%' LIMIT {} OFFSET {}",name,filter,max,skip);
  }
  
  //const res = await pool.query(`SELECT * FROM ${table_name}${filter ? ` WHERE name LIKE '${filter}'` : ''} LIMIT ${limit} OFFSET ${offset}`);
  //println!("{}",querry);

  //let querry: &str = "SELECT * FROM authors";

  let res = thread::spawn(move || {
    let mut response = json::object!{};

    let mut client = POOL.get().unwrap();
    let res = client.query(querry.as_str(),&[]).unwrap();

    let mut check:bool = true;
    let mut rows = json::JsonValue::new_array();
    for row in res {
      if check {
        let mut fields = json::JsonValue::new_array();
        for column in row.columns() {
          let mut field = json::JsonValue::new_object();
          field["name"] = column.name().into();
          fields.push(field).expect("json push error");
        }
        response["fields"] = fields;
        check = false;
      }

      let mut json_row = json::JsonValue::new_object();

      let mut i = 0;
      for column in row.columns() {
        match column.type_().name() {
          "int8" => {
            let val:i64 = row.get(i); 
            json_row[column.name()] = val.into();
          },
          "varchar" => {
            let val:String = row.get(i); 
            json_row[column.name()] = val.into();
          },
          _ => println!("unkbow type: {}",column.type_().name()),
        }
        i = i+1;
      }

      rows.push(json_row).expect("json push error");
    }
    response["rows"] = rows;
    return json::stringify(response);
  }).join().unwrap();
  Ok(res)
}

fn main() {
  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![
    retrieve_data,
    delete_data,
    insert_data,
  ])
  .run(tauri::generate_context!())
  .expect("error while running tauri application");

}
