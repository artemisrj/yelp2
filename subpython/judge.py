
def theTestDate:
    f=open("F:/code/yelp2/testdata/data1.csv")
    a=[]
    for line in f:
        cc=line[0:-1].split(',')
        a.append(cc)
    return a