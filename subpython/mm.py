import sqlite3

def getVertifyData():
   
    cx=sqlite3.connect("D:/tainData.db")
    cur=cx.cursor()
    a=[]
    cur.execute("select id,data from SavedData")
    CC=11626

    for i in range(CC):
        a.append("")

    for eachline in cur.fetchall():
        a[int(eachline[0])]=eachline[1]
       
    cur.close()
    cx.commit()
    cx.close()

    for i in range(CC):
        if a[i]=="":
            print i 
    return a

