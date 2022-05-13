from asyncio.windows_events import NULL
from time import sleep
from urllib import response
import webview
import psycopg2

class API:
    def __init__(self):
        self.client = psycopg2.connect("postgresql://fish_user:password@localhost:5432/fish")


    def retrievData(self,name,filter=None,limit=1,offset=0):
        cursor = self.client.cursor()
        cursor.execute("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{}'".format(name))
        column_names = cursor.fetchall()
        cursor.close()

        query = "SELECT * FROM {}".format(name)

        if not (filter is None):
            query+= " WHERE name LIKE '{}'".format(filter)

        query+= " LIMIT {} OFFSET {}".format(limit,offset)

        cursor = self.client.cursor()
        cursor.execute(query)
        data = cursor.fetchall()
        cursor.close()

        response = {}

        fields = []
        for column in column_names:
            fields.append({"name":column[0]})
        response["fields"] = fields
        rows = []
        for row in data:
            rowdata = {}
            i=0
            for cell in row:
                rowdata[(column_names[i][0])] = cell
                i+=1
            rows.append(rowdata)
        response["rows"] = rows
        return response

    def deleteData(self,table_name,id):
        cursor = self.client.cursor()
        cursor.execute("DELETE FROM {} WHERE id = {}".format(table_name,id))
        cursor.close()
        return True

    def insertData(self,table_name,value):
        cursor = self.client.cursor()
        cursor.execute("INSERT INTO {} (name, author_id,publisher_id) VALUES ({})".format(table_name,value))
        cursor.close()
        return True



if __name__ == "__main__":

    f = open("./index.html", "r")
    html =  f.read()
    f.close()

    #print(html)

    api = API()
    webview.create_window('Hello world', html=html,js_api=api)
    webview.start()
    html = NULL

    #print(api.retrievData("books"))