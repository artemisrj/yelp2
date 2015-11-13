from classify import dealSentence

fs='F:/code/yelp2/subpython/traine.txt'
f="F:/code/yelp2/subpython/train.txt"

fsave=open(fs,'w')
ff=open(f)
for line in ff:
    line=dealSentence(line)
    print line
    fsave.write(line)
    
fsave.close()
    