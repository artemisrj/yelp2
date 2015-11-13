# -*- coding: utf-8 -*-
import sqlite3
import json
import cgi

cx=sqlite3.connect("d:/databaseSimilar2015.db")
cur=cx.cursor()

buisId=cgi.FieldStorage()

cur.execute("select * from "+buisId['name'].value+" where  weight >"+buisId['threshold'].value)

#cur.execute("select * from b_zt1TpTuJ6y9n551sw9TaEg")

print "Content-type: text/html\n"
print json.dumps(cur.fetchall())

cur.close()
cx.commit()
cx.close()