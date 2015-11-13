import sqlite3
import json
import cgi
cx=sqlite3.connect("D:/basedata2015.db")
cur=cx.cursor()
#cur.execute('create table users(login varchar(8),uid integer)')

buisId=cgi.FieldStorage()


#cur.execute('insert into users values("join",100)')
cur.execute('select * from '+buisId['name'].value)

print "Content-type: text/html\n"
print json.dumps(cur.fetchall())

cur.close()
cx.commit()
cx.close()