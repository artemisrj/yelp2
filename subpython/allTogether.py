import gensim, pdb, sys, scipy.io as io, numpy as np, pickle, string
sys.path.append('F:/code/yelp2/python-emd-master')
from emd import emd

def sentenceVec(line,vec_size,model,stop):
    line = line.strip()
    #line = line.translate(string.maketrans("",""), string.punctuation)
    W = line.split()
    F = np.zeros((vec_size,len(W)))
    inner = 0
    RC = np.zeros((len(W),), dtype=np.object)
    word_order = np.zeros((len(W)), dtype=np.object)
    bow_x = np.zeros((len(W),))
    for word in W[0:len(W)]:
        try:
            test = model[word]
            if word in stop:
                word_order[inner] = ''
                continue
            if word in word_order:
                IXW = np.where(word_order==word)
                bow_x[IXW] += 1
                word_order[inner] = ''
            else:
                word_order[inner] = word
                bow_x[inner] += 1
                F[:,inner] = model[word]
        except KeyError, e:
            #print 'Key error: "%s"' % str(e)
            word_order[inner] = ''
        inner = inner + 1
    Fs = F.T[~np.all(F.T == 0, axis=1)]
    bow_xs = bow_x[bow_x != 0]
    
    bow_i = bow_xs
    bow_i = bow_i / np.sum(bow_i)
    bow_i = bow_i.tolist()
    bow_xs= bow_i
    X_i = Fs
    X_i = X_i.tolist()
    Fs = X_i
    #print Fs
    return (Fs,bow_xs)



def get_wmd(ix):
    n = np.shape(X)
    n = n[0]
    Di = np.zeros((1,n))
    i = ix
    #print '%d out of %0d' % (i, n) 
   # print time.time()
    
    for j in xrange(i):
        Di[0,j] = emd( (X[i], BOW_X[i]), (X[j], BOW_X[j]), distance)
    return Di 
            
    
def similarSentence(a,b,distance,model,stop):
    aa=sentenceVec(a,400,model,stop)
    bb=sentenceVec(b,400,model,stop)
    return emd(aa,bb,distance)
    
def main():
    # 0. load word2vec model (trained on Google News)
   # 1. specify train/test datasets
    #train_dataset = sys.argv[1] # e.g.: 'twitter.txt'
    #save_file     = sys.argv[2] # e.g.: 'twitter.pk'
    
    #save_file_mat = sys.argv[3] # e.g.: 'twitter.mat'
    #train_dataset='y8VQQO_WkYNjSLcq6hyjPA.txt'
    train_dataset="E:/temp/WMD_code/y8VQQO_WkYNjSLcq6hyjPA_s.txt" #
    
    model = gensim.models.Word2Vec.load_word2vec_format('E:/temp/WMD_code/data/yelp2.text.vector', binary=False)
    SW = set()
    for line in open('E:/temp/WMD_code/stop_words.txt'):
        line = line.strip()
        if line != '':
            SW.add(line)

    stop = list(SW)
    vec_size = 400
    
    
    # 2. read document data
    #(X,BOW_X,y,C,words)  = read_line_by_line(train_dataset,[],model,vec_size)
    f=open(train_dataset)
    lines=f.readlines()
    print len(lines)
    print similarSentence(lines[3],lines[4],distance,model,stop)

    # 3. save pickle of extracted variables
    #with open(save_file, 'w') as f:
        #pickle.dump([X, BOW_X, y, C, words], f)

    # 4. (optional) save a Matlab .mat file
    #io.savemat(save_file_mat,mdict={'X': X, 'BOW_X': BOW_X, 'y': y, 'C': C, 'words': words})

if __name__ == "__main__":
    main()                                                                                             
