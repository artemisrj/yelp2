import gensim
import numpy as np
from freworddb import freworddb
from bs4 import BeautifulSoup
from allTogether import similarSentence
import os
import json
import time
import gc

def dealSentence(line):
    not_letters_or_digits = u'!"#%\'()*+,-./:;<=>?@[\]^_`{|}~'+u'0123456789'
    translate_table=dict((ord(char),u' ') for char in not_letters_or_digits)   
    line=unicode(line).translate(translate_table)
    return line

def distance(x1,x2):
    return np.sqrt( np.sum((np.array(x1) - np.array(x2))**2) )

def classifyCate(line,trainData,model,stop):
    scores=[]
    for type in trainData:
        tempScore=2
        for sentence in type:
            sc=similarSentence(sentence,line,distance,model,stop)
            if sc<tempScore:
                tempScore=sc
        scores.append(tempScore)
    return scores
    
def classifyMethod(aa,trainData,model,stop):
    simples=[]
    for line in aa:
        html=line[4]
        soup=BeautifulSoup(html).contents[0].contents[0]     
        for singleSentence in soup:
            singleSentence=dealSentence(singleSentence.get_text())
            simples.append(singleSentence)
    a=[]
    nn=0
    for line in simples:
       # res=classifyCate(line,trainData,model,stop)
        scores=[]
        for type in trainData:
            tempScore=2
            for sentence in type:
                sc=similarSentence(sentence,line,distance,model,stop)
                if sc<tempScore:
                    tempScore=sc
            scores.append(tempScore)
        #print res  [2,1,2,3]
        
        a.append(scores)
        print time.strftime("%X",time.localtime())+"\t"+str(nn)
        nn=nn+1
        #gc.collect()
    print time.strftime("%X",time.localtime())+"\t end of the train process"
    return a

def reclassifyMethod(aa,trainData,model,stop):
    print time.strftime("%X",time.localtime())+"\tReclassify the reviews data"
    #trainData是被训练的句子，aa是整个评论数据集
    simples=[]
    for line in aa:
        html=line[4]
        soup=BeautifulSoup(html).contents[0].contents[0]
        for singleSentence in soup:
            singleSentence=dealSentence(singleSentence.get_text())
            simples.append(singleSentence)
    scores=[]
    for line in simples:
        res=similarSentence(trainData,line,distance,model,stop)
        if res<2:
            scores.append(res)
        else:
            scores.append(2)
    return scores
        
def createStopword():
    SW = set()
    for line in open('E:/temp/WMD_code/stop_words.txt'):
        line = line.strip()
        if line != '':
            SW.add(line)
    stop = list(SW)   
    return stop

def createTrainData():
    print time.strftime("%X",time.localtime())+"\tcreate new train data"
    f="F:/code/yelp2/subpython/traine.txt"
    n=0
    trainData=[]
    for i in range(4):  
        trainData.append([])

    for line in open(f):
        #print line[0]
        num=int(line[0])
        trainData[num].append(line[2:])
    print trainData
        
    return trainData
    
def  classifyIt(name,aa,model):
    dir="F:/code/yelp2/temp/"
    path=dir+name
    
    if os.path.exists(path):
        ff=open(path)
        for line in ff:
            return json.loads(line)
    else:
        stop=createStopword()
        trainData=createTrainData()
        res=classifyMethod(aa,trainData,model,stop)
        ff=open(path,"w")
        ff.write(json.dumps(res))
        ff.close()
        return res

def reclassify(sentence,reviewdata,model):
    stop=createStopword()
    return reclassifyMethod(reviewdata,sentence,model,stop)
    
def falseReviews(reviews,model):
    reviewsArray=json.loads(reviews)
    ll=len(reviewsArray)
    stop=createStopword()
    b=dealSentence(reviewsArray[ll-1])
    savedArray=[]
    for i in range(ll-1):
        a=dealSentence(reviewsArray[i])
        savedArray.append(similarSentence(a,b,distance,model,stop))
    print time.strftime("%X",time.localtime())+"\tend of deal false review"
    return savedArray
    
def falseReviewSimilar(typereviews,review,model):
    stop=createStopword()
    review=dealSentence(review)
    savedArray=[]
    for rr in typereviews:
        rr=dealSentence(rr)
        savedArray.append(similarSentence(review,rr,distance,model,stop))
        
    print time.strftime("%X",time.localtime())+"\tend of deal similar false reviews"
    return savedArray
    
    
if __name__=="__main__":
    createTrainData()