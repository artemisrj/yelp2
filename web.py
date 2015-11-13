import sys
import time
import json
import gensim
import codecs
from flask import Flask, render_template
from flask.ext.script import Manager
from flask.ext.bootstrap import Bootstrap
from flask import request
from flask import g
sys.path.append('F:\code\yelp2\subpython')
from searchname import searchnames
from freworddb import freworddb
from classify import classifyMethod,classifyIt,reclassify,falseReviews,falseReviewSimilar
from similar import similarData
from mm import getVertifyData


app = Flask(__name__)
app.debug=True
manager = Manager(app)
bootstrap = Bootstrap(app)

model = gensim.models.Word2Vec.load_word2vec_format('E:/temp/WMD_code/data/yelp2.text.vector', binary=False)
reviewdata=[]
print "model loaded"

@app.route('/')
def index():
    return render_template('d3_2.html')

@app.route('/searchname',methods=['GET','POST'])
def searchname():
    term=request.args.get("term",'')
    city=request.args.get("city",'')
    a=searchnames(term,city)
    return a

@app.route('/freworddb',methods=['GET','POST']) 
def freword():
    name=request.form["name"]
    aa=freworddb(name)
    obj={}
    obj["data"]=aa
    global reviewdata
    reviewdata=aa
    obj["classify"]=classifyIt(name,aa,model)
    res=json.dumps(obj)
    return res
    
@app.route('/reclassifyit',methods=['GET','POST'])
def reclssifyIt():
    no=request.form['no']
    sentence=request.form['sentence']
    classtype=request.form['classtype']
    
    f="F:/code/yelp2/subpython/traine.txt"
    a=open(f,"a")
    sentence=sentence.replace("\n",' ')
    a.write("\n"+classtype+" "+sentence)
    a.close()
    global reviewdata
    return json.dumps(reclassify(sentence,reviewdata,model))
    
@app.route('/similar',methods=['GET','POST'])
def rsimilar():
    name=request.form["name"]
    threshold=request.form["threshold"]
    res=similarData(name,threshold)
    return res 
    
@app.route('/saveDate',methods=['GET','POST'])
def saveDate():
    data=request.form["data"]
    id=request.form["busid"]
    dir="F:/code/yelp2/temp/"
    path=dir+id
    ff=open(path,'w')
    ff.write(data)
    ff.close()
    print time.strftime("%X",time.localtime())+"\tend of save the data"
    return time.strftime("%X",time.localtime())+"\twrite the data"
 
@app.route('/dealFalseReviews',methods=['GET','POST'])
def dealFalseReviews():
    reviews=request.form["reviews"]
    return json.dumps(falseReviews(reviews,model))
    
    
@app.route('/falseSimilarReview',methods=['GET','POST'])
def falseSimilarReview():
    typereviews=request.form["sentences"]
    review=request.form["review"]
    res=falseReviewSimilar(typereviews,review, model)
    return json.dumps(res)
    
@app.route('/testData',methods=['GET','POST'])
def testData():
    f=open("F:/code/yelp2/testdata/data1.csv")
    a=[]
    for line in f:
        cc=line[0:-1].split(',')
        a.append(cc)
    return json.dumps(a)
    
@app.route('/tempSave',methods=['GET','POST'])
def tempSave():
    cc=unicode(request.form['data'])
    f=codecs.open("F:/code/yelp2/testData/save.txt",'w','utf-8')
    f.write(cc)
    f.close()
    return "ok"
    
@app.route('/vertifyData',methods=['GET','POST'])
def vertifyData():
    a=getVertifyData()
    return json.dumps(a)

if __name__ == '__main__':
    manager.run()
