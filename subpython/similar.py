# -*- coding: utf-8 -*-
import sqlite3
import json

def similarData(name,threshold):
    cx=sqlite3.connect("d:/databaseSimilarWords2015_4.db")
    cur=cx.cursor()


    cur.execute("select * from "+name+" where  weight >"+threshold)

    #cur.execute("select * from b_zt1TpTuJ6y9n551sw9TaEg")

    # "Content-type: text/html\n"
    res=json.dumps(cur.fetchall())

    cur.close()
    cx.commit()
    cx.close()
    return res
    