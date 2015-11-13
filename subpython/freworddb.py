import sqlite3
import json
import cgi
from BeautifulSoup import BeautifulSoup
from allTogether import similarSentence
import gensim
import numpy as np

def freworddb(name):
    cx=sqlite3.connect("D:/basedata2015_index2.db")
    cur=cx.cursor()
    #cur.execute('create table users(login varchar(8),uid integer)')
    #cur.execute('insert into users values("join",100)')
    cur.execute('select * from '+name)
    #print "Content-type: text/html\n"
    aa=cur.fetchall()
    cur.close()
    cx.commit()
    cx.close()
    return aa
   
