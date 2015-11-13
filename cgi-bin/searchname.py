import sqlite3
import json
import cgi

def searchnames(term,city):
    cx=sqlite3.connect("d:/NameId2015_addCity.db")
    cur=cx.cursor()

    cur.execute("select bname,bcount,bid from business where bname like '%"+term+"%' and bcity ='"+term+"' order by bcount desc limit 10")

    cur.close()
    cx.commit()
    cx.close()

    #print "Content-type: text/html\n"
    return json.dumps(cur.fetchall())

    
    