from flask import Flask, render_template
from flask.ext.script import Manager
from flask.ext.bootstrap import Bootstrap
from flask import request
from flask import g
import gensim
from searchname import searchnames
from freworddb import freworddb
from similar import similarData

sys.path.append('F:\code\yelp2\subpython')

app = Flask(__name__)
app.debug=True
manager = Manager(app)
bootstrap = Bootstrap(app)

g.model = gensim.models.Word2Vec.load_word2vec_format('E:/temp/WMD_code/data/yelp2.text.vector', binary=False)
#load the model
print "model loaded"
#aa=str(model.most_similar("food")[0])

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
    res=freworddb(name)
    
    return res
    
@app.route('/similar',methods=['GET','POST'])
def rsimilar():
    name=request.form["name"]
    threshold=request.form["threshold"]
    res=similarData(name,threshold)
    return res 

if __name__ == '__main__':
    manager.run()
