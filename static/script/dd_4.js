﻿

/* 
这个版本主要针对于词云的更改，根据分类显示词云这样子
*/

Date.prototype.defaultView=function(){
	var dd=this.getDate();
	if(dd<10)dd='0'+dd;
	var mm=this.getMonth()+1;
	if(mm<10)mm='0'+mm;
	var yyyy=this.getFullYear();
	return String(yyyy+"-"+mm+"-"+dd)
}


	//重新作图
function drawChart()
{
	//getData(); //存入点的数据和评论数据
	var newLength=dataLength;
	var _duration=1000;
		
	//补足/删除路径
	var lineZero = d3.svg.line()
	.x(function(d,i){if(i>=oldData.length) return w-padding; else return xScale(i);})
    .y(function(d,i){if(i>=oldData.length) return h-foot_height; else 	return yScale(oldData[i]);});
		
		//路径初始化
	path.attr("d",lineZero(globalYelp.dataset));
		
	//截断旧数据
	oldData=oldData.slice(0,globalYelp.dataset.length);
	var circle=svg.selectAll("circle").data(oldData);
		
	//删除多余的圆点
	circle.exit().remove();
		
	//圆点初始化，添加圆点,多出来的到右侧底部
	svg.selectAll("circle")
	.data(globalYelp.dataset)
	.enter()
	.append("circle")
	.attr("cx", function(d,i){
		if(i>=oldData.length) return w-padding; else return xScale(i);})  
	.attr("cy",function(d,i){
	if(i>=oldData.length) return h-foot_height; else return yScale(d);
		})  
	.attr("r",5)
	.attr("fill","#6c854b")
	.on("mousemove",function(d,i){
			
	var year=xMarks[i].substr(0,4);
	var month=xMarks[i].substr(5,2);
		
	for(var i=0;i<arrayYelpData.length;i++){
		var ss=arrayYelpData[i].date;
		var vyear=ss.substr(0,4);
		var vmonth=parseInt(ss.substr(5,2));	
			//console.log(typeof(vmonth)+typeof(month));
		if(year==vyear&&parseInt(month)==vmonth){
				//右边显示评论
			var reviewtext=d3.select(".container").text(this.text+arrayYelpData[i].text);
		}
	}
})
				
		//横轴数据动画
		xScale.domain([0,newLength-1]);		
		xAxis.scale(xScale).ticks(newLength);
		xBar.transition().duration(_duration).call(xAxis);
		xBar.selectAll("text").text(function(d){return xMarks[d];});
		xInner.scale(xScale).ticks(newLength);
		xInnerBar.transition().duration(_duration).call(xInner);				
		
		//纵轴数据动画
		yScale.domain([0,d3.max(globalYelp.dataset)]);				
		yBar.transition().duration(_duration).call(yAxis);
		yInnerBar.transition().duration(_duration).call(yInner);		
		
		//路径动画
		path.transition().duration(_duration).attr("d",line(globalYelp.dataset));
				
		//圆点动画
		svg.selectAll("circle")		
		.transition()
        .duration(_duration)
		.attr("cx", function(d,i) {				
				return xScale(i);
		})  
		.attr("cy", function(d) {
				return yScale(d);  
		})								
		
	}
	
function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 

function getData(type)
{	
	globalYelp.overview.dateScaleType=type;
	if(arrayYelpData.length==0){
		//reviewinfo();	//load review
		
		$.post($SCRIPT_ROOT+"/freworddb",{name: dataroot },function(data,status){    
			
			var wfre=globalYelp.wordfre;
			//console.log(data);
			var alljsons=$.parseJSON(data);
			var jsons=alljsons.data;
			var cate=alljsons.classify;
			
			globalYelp.classData=cate;
			var slength=cate.length;
			if(typeof(globalYelp.classtype)!="undefined"){
				globalYelp.classtype.length=0;
			}
			
			globalYelp.classtype=new Array(slength);
			
			var length=jsons.length;
			arrayYelpData=new Array(length);
			var parseDate=d3.time.format("%Y-%m-%d").parse;
			globalYelp.reviewEdit=new Array(length);
				
			for(var i=0;i<length;i++){
				var obj={};
				var dateStr=jsons[i][0];
				obj.date=parseDate(dateStr);
				
				obj.stars=jsons[i][3];
				obj.text=jsons[i][4];
				obj.index=i;
				obj.text=obj.text.replace(/\n/g,'<br>');
				obj.text=obj.text.replace(/\*/g,'"');
				obj.nouns=jsons[i][2].split(",");
				arrayYelpData[i]=obj;
				
				obj.nouns.forEach(function(word){
					if(typeof(wfre[word])=="undefined"){
						wfre[word]=1;
					}else{
						wfre[word]=wfre[word]+1;
					}
				})
				
				var ac={};
				ac.readed=false;
				ac.text="";
				 globalYelp.reviewEdit[i]=ac;
				 appendReviews(obj);
				 
			}
			
			brushdata=arrayYelpData;
			crossdata=crossfilter(arrayYelpData);
		    datedim=crossdata.dimension(function(d){ return d.date; });
			if(type=="month"){
			//alert("month");
				averageData(arrayYelpData); //deal the point 
			}else if(type=="week"){
				averageWeek(arrayYelpData);
			}
			
		
			drawTimeline();
			drawdense();
			
			for(var word in wfre){
				if(wfre[word]<2){
					delete wfre[word];
				}
			}
		   
		   $(".sentence").each(function(i,sentence){
				$(sentence).attr("id","s"+i);
		   })
		    
			$(".sreview").each(function(i,ele){
				//ele.childNodes[2].innerHTML
				arrayYelpData[i].text=ele.childNodes[2].innerHTML;
			})
			
			//console.log(dataroot);
			$.post($SCRIPT_ROOT+"/similar",{name: dataroot, threshold:0.2},function(data,status){    
				$("#wordcloud").empty();
				globalYelp.wordcloud.groupedWords.length=0;
				
				globalYelp.wordcloud.svg=d3.select("#wordcloud").append("svg").attr("width",780).attr("height",300).attr("id","wordcloudsvg");
				
				globalYelp.wordcloud.ungroupedWords.length=0;
				globalYelp.wordcloud.groupNum.length=0;
				globalYelp.wordcloud.wordseparate.length=0;
				
				delete globalYelp.wordcloud.wordList;
				globalYelp.wordcloud.wordList={};
				var jsons=$.parseJSON(data)
				for(var i=0;i<jsons.length;i++){
					var aa=jsons[i];
					if(typeof(globalYelp.wordcloud.wordList[aa[0]])=="undefined"){ //w1不在
						if(typeof(globalYelp.wordcloud.wordList[aa[1]])=="undefined"){
							var ll=globalYelp.wordcloud.wordseparate.length;
							globalYelp.wordcloud.wordList[aa[0]]=ll;
							globalYelp.wordcloud.wordList[aa[1]]=ll;
							globalYelp.wordcloud.wordseparate[ll]=new Array();
						}else{
							globalYelp.wordcloud.wordList[aa[0]]=globalYelp.wordcloud.wordList[aa[1]];
						}
					}else{
						globalYelp.wordcloud.wordList[aa[1]]=globalYelp.wordcloud.wordList[aa[0]];
					}
				}
				//console.log(globalYelp.wordcloud.wordseparate);
			
			});
		});
		
		
	}else{
		if(type=="month"){
			//alert("month");
			averageData(arrayYelpData); //deal the point 
		}else if(type=="week"){
			averageWeek(arrayYelpData);
		}
	//console.log(dataset)
		drawTimeline();
		drawdense();
		
	}
	
	return 5;
}

var judgeWord=function(key){
	if(key.indexOf('.')>-1||typeof(globalYelp.wordfre[key])=="undefined"||key.indexOf(" ")>-1||key.length<=2||key.indexOf("'")>-1||globalYelp.wordfre[key]<3||key.indexOf("&")>-1||key.indexOf("!")>-1||key.indexOf("(")>-1||key.indexOf(":")>-1){
		return false;
	}
	return true;
}


function averageData(arrayYelpData){ 	//用平均来平滑点
	"use strict";
	
	oldData= globalYelp.dataset; 	//oldData 存储上一个数据
	globalYelp.dataset=[];
	maxcount=0;
	dataLength=0;
	 
	var vset=[];
	var allset=[];
	var cc=arrayYelpData.length;
	var oldd=new Date(arrayYelpData[0].date);
	var msum=0;	//score of all the month
	var mc=0;	//number of the score of the month
	
	var strDate;
	
	var wordSet={};
	var allWordSet=globalYelp.grid.allWordSet;
	
	var mwords={};
	
	//把sData的nouns里面的东西放到wordSet里面
	var addWord=function(sData,wordSet){
		sData.nouns.forEach(function(word){		
			word=word.trim();
			if(typeof(wordSet[word])=="undefined"){
				wordSet[word]={};
				wordSet[word].scores=[];
			}
		})
	}

	//计算数据里面的平均值
   var calculateEverage=function(obj){
		var sum=0,cc=0;
		obj.scores.forEach(function(score){
			sum+=score;
			cc=cc+1;
		});
		obj.average=sum/cc;
	}
	
	var calsentiment=function(wordSet){
		for(var key in wordSet){
			if(judgeWord(key)){
				$("."+key).each(function(index){
					var sentiment=$(this).parent().attr("sentiment");
					if(typeof(sentiment)!="undefined"){
						var numofsen=parseFloat(sentiment.slice(1,sentiment.indexOf(',')));
						wordSet[key].scores.push(numofsen);
						calculateEverage(wordSet[key]);
					}
				})
			}
		}
	}
	
	for(var i=0;i<cc;i++){
		var sData=arrayYelpData[i];
		
		strDate=new Date(sData.date);
	
		//如果是同月份
		if(oldd.getFullYear()==strDate.getFullYear()&&oldd.getMonth()==strDate.getMonth()){
			msum=msum+parseInt(sData.stars);
			vset.push(parseInt(sData.stars));
			mc++;

			addWord(sData,wordSet);
	
			$("#display-none").append(sData.text);
			
		}else{
		
			//先结掉之前的
			var index=allset.length;
			allset[index]=new Array();
			for(var ii=0;ii<vset.length;ii++)
			{
			    allset[index].push(vset[ii]);
			}
			vset.length=0;
			vset.push(parseInt(arrayYelpData[i].stars));
		
			dataLength++;
			var aveScore=msum/mc;

			wordSet.Date= oldd.getFullYear()+'-'+oldd.getMonth();
			
			//计算wordSet里面的sentiment平均值
			calsentiment(wordSet);
			allWordSet.push(wordSet);
			
			wordSet=new Object();
			addWord(sData,wordSet);
			
			//重新开始算 
			msum=parseInt(arrayYelpData[i].stars);
			
			var singledata={};
			singledata.count=mc;
			if(mc>maxcount){
				maxcount=mc;
			}
			singledata.aveScore=aveScore;
			singledata.date=oldd.getFullYear()+"-"+(oldd.getMonth()+1)+"-15";
			
			globalYelp.dataset.push(singledata);
			mc=1;
			
			oldd=strDate;	
			
			$("#display-none").html("");
			$("#display-none").append(sData.text);
		}
	}
	dataLength++;
	aveScore=msum/mc;
	
	var singledata={};
	singledata.count=mc;
	if(mc>maxcount){
		maxcount=mc;
	}
	
	var index=allset.length;
	allset[index]=new Array();
	for(var ii=0;ii<vset.length;ii++)
	{
		allset[index].push(vset[ii]);
	}
	
	wordSet.Date= oldd.getFullYear()+'-'+oldd.getMonth();
	
	calsentiment(wordSet);
	
	allWordSet.push(wordSet);
			
	singledata.aveScore=aveScore;
	singledata.date=strDate.getFullYear()+"-"+(strDate.getMonth()+1)+"-15";
	 globalYelp.dataset.push(singledata);
	
	calVariance(allset);
	
}

//计算方差
function calVariance(allset){
	maxVariance=0;
		for(var i=0;i< globalYelp.dataset.length;i++){
			if( globalYelp.dataset[i].aveScore==-1){
				 globalYelp.dataset[i].variance=0;
				continue;
			}
			var temparray=allset[i];
			var sum=0;
			for(var j=0;j<temparray.length;j++){
				sum=sum+(temparray[j]- globalYelp.dataset[i].aveScore)*(temparray[j]- globalYelp.dataset[i].aveScore);
			}
			sum=sum/allset.length;
			if(sum>maxVariance){
				maxVariance=sum;
			}
			 globalYelp.dataset[i].variance=sum;
		}
}
	//产生随机数据
function yeardate(date1){
	date2=new Date();
	return ((date1.valueOf() - date2.valueOf()) / 86400000);
}	
	
	
function averageWeek(arrayYelpData){
	 globalYelp.dataset.length=0;
	//开始可能要清理数据dataset
	
	//console.log(data[0].date);
	cc=0;
	var csum=0.0;
	var jt=new Date(arrayYelpData[0].date); //jt 是一个礼拜的界限
	jt.setTime(jt.valueOf()+604800000);
	maxcount=0;
	var allset=[];
	var vset=[];
	maxVariance=0;
	
	//console.log(dataset);
	for(var i=0;i<arrayYelpData.length;i++){
		dt=new Date(arrayYelpData[i].date);
		//
		if(dt.valueOf()>jt.valueOf()){
			//结算一个礼拜
			var tempdate=new Date();
			tempdate.setTime(jt.valueOf()-302400000);
			aveScore=csum/cc;
			
			//
			var index=allset.length;
			allset[index]=new Array();
			for(var ii=0;ii<vset.length;ii++)
			{
			    allset[index].push(vset[ii]);//vset store the stars of the circles
			}
			
			vset.length=0;
			
			var singledata={};
			singledata.count=cc;
			
			if(cc>maxcount){
				maxcount=cc;
			}
			singledata.aveScore=aveScore;
			
			singledata.date=tempdate.getFullYear()+"-"+(tempdate.getMonth()+1)+"-"+(tempdate.getDate());
			//console.log(singledata);
			 globalYelp.dataset.push(singledata);
			
			//计算这次的数据并且为重新开始做准备
			csum=parseInt(arrayYelpData[i].stars);
			vset.push(parseInt(arrayYelpData[i].stars));
			cc=1;
			
			jt.setTime(jt.valueOf()+604800000);
			//如果一个礼拜之内没有数据，那么推迟最后一天的界限
			while(dt.valueOf()>jt.valueOf()){
				var singledata={};
				singledata.count=0;
				singledata.aveScore=-1;
				var tempdate=new Date();
				tempdate.setTime(jt.valueOf()-302400000);
				singledata.date=tempdate.getFullYear()+"-"+(tempdate.getMonth()+1)+"-"+(tempdate.getDate());
				globalYelp.dataset.push(singledata);
				jt.setTime(jt.valueOf()+604800000);
				var index=allset.length;
				allset[index]=new Array();
			}
		}else{
			cc++;
			csum=csum+parseInt(arrayYelpData[i].stars);
			vset.push(parseInt(arrayYelpData[i].stars));
		}
	}
	if(csum!=0){
		aveScore=csum/cc;
		var singledata={};
		singledata.count=cc;
		if(cc>maxcount){
			maxcount=cc;
		}
	
		var index=allset.length;
		allset[index]=new Array();
		//console.log(vset);
		for(var ii=0;ii<vset.length;ii++)
		{
			allset[index].push(vset[ii]);
		}
		
		singledata.aveScore=aveScore;
		var tempdate=new Date();
		tempdate.setTime(jt.valueOf()+302400000);
		singledata.date=tempdate.getFullYear()+"-"+(tempdate.getMonth()+1)+"-"+tempdate.getDate();
		 globalYelp.dataset.push(singledata);
	}
	
	calVariance(allset);
	//console.log(dataset);
	
}


function cateWordcloud(wtype){
	var w=globalYelp.wordcloud;
	if(w.cloudType==-1){//切换分类 的话，就要
		w.cloudType=wtype;
	 }else{
		//需要清理wordcloud的一些参数？
	 }
	
	var typenum=3;
	var wordArrays=new Array(typenum);	//save word fre dic
	var wordsArrays=new Array(typenum);	//save word array
	for(var i=0;i<typenum;i++){
		wordArrays[i]={};
		wordsArrays[i]=new Array();
	}
	var type=globalYelp.classtype;//save the type of sentence
	var sentences=$(".reviewContext").find(".sentence");
	//reviewContext的子节点，，
	var nn=sentences.length;
	
	//算词频
	for(var i=0;i<nn;i++){
		var sentence=sentences[i];
		var thes=$(sentence);
		var num=parseInt(thes.attr("id").slice(1));
		
		if(type[num]!=-1){
			var curType=type[num];
			var words=thes.children("span:not(.JJ)");
			for(var j=0;j<words.length;j++){
				//先算频率
				 var word=$(words[j]).attr("class");
				 if(judgeWord(word)){
					if(typeof(wordArrays[curType])=="undefined"){
						console.log(curType);
						console.log(num);
						console.log(i);                      
					 }
					 if(typeof(wordArrays[curType][word])=="undefined"){
						wordArrays[curType][word]=1;
					 }else{
						wordArrays[curType][word]=wordArrays[curType][word]+1;
					}
				 }
			}
		}
	}
	
	//整理数组
	for(var i=0;i<typenum;i++){
		var singleType=wordArrays[i];
		for(var key in singleType){
			obj={};
			obj.text=key;
			obj.weight=singleType[key];
			wordsArrays[i].push(obj);
		}
		wordsArrays[i].sort(function(a,b){
			return b.weight-a.weight;
		});
		wordsArrays[i].slice(0,70);
		wordsArrays[i].forEach(function(value){
			calculateSentiment(value);
		})
	}

	 var color1=["#A50026","#D73027","#F46D43","#FDAE61","#FEE08B","#FFFFBF","#D9EF8B","#A6D96A","#66BD63","#1A9850","#006837"];

	 var indexDic={};

	 var electedArray=wordsArrays[wtype];
	 for(var i=0;i<electedArray.length;i++){
		indexDic[electedArray[i].text]=i;
	}
	 checkIt(w.ungroupedWords,indexDic,electedArray);
	
	for(var key in indexDic){
		if(indexDic[key]!=-1){
			var sv=electedArray[indexDic[key]];
			sv.tags=1;
			w.ungroupedWords.push(sv);
		}
	}
	
	 $("#wordcloud").jQCloud(electedArray,{maxv:0.6,valueType:wordcloudType,gw:w.groupedWords,ugw:w.ungroupedWords,gn:w.groupNum});
}

//calculate the sentiment score and the variance of the words
var calculateSentiment=function(value){
	var sumWordSentiment=0.0;
	var cc=0;
	var theSet=[]; //set of sentiment of a single word

	//begin to calculate the sentiment of everword
	$("."+value.text).each(function(index){
		//fetch the sentiment of the 
		var sentiment=$(this).parent().attr("sentiment");
		if(typeof(sentiment)!="undefined"){
			var numOfsen=parseFloat(sentiment.slice(1,sentiment.indexOf(',')));
			
			if(Math.abs(numOfsen-0.0)>0.0001){
				cc=cc+1;
				sumWordSentiment=sumWordSentiment+numOfsen;	
				theSet.push(numOfsen);
			}
		}
	});
	
	

	var varianceOfSentiment=0;
	var sentimentNum;
	if(cc>0){
		sentimentNum=sumWordSentiment/cc;
		
		theSet.forEach(function(vv){
			//console.log("per :"+vv);
			varianceOfSentiment=varianceOfSentiment+(vv-sentimentNum)*(vv-sentimentNum);
		})
		varianceOfSentiment=varianceOfSentiment/cc;
		
		if(varianceOfSentiment>maxVariance){
			maxVariance=varianceOfSentiment;
		}
		//console.log("ave:"+sentimentNum);
	}else{
		sentimentNum=0;
	}
	
	value.score=sentimentNum;
	value.sentimentVariance=Math.sqrt(varianceOfSentiment);
}
	
var checkIt=function(array,indexDic,electedArray){
	array.forEach(function(value){
		var nn=indexDic[value.text];
		if(typeof(nn)!="undefined"){//这个词语留到了新的词云
			value.tags=0;         //这个词语的存在性不改变，其他属性
			value.weight=electedArray[nn].weight;
			value.sentimentVariance=electedArray[nn].sentimentVariance;
			value.score=electedArray[nn].score;
			indexDic[value.text]=-1; // 新的词组里面这个单词完成初始化
		}else{//这个词语在新的词云里面不出现
			if(typeof(value.html)=="undefined"){
				console.log(" dd"); //上一轮没有被表示的词云，这种情况应该后期不存在
			}		
			value.tags=-1; //这个词语应当被删除
		}
	})
}

function wordcloud(brushdata){//输入要做词云的范围，输出词云的效果
	
	// When DOM is ready, select the container element and call the jQCloud method, passing the array of words as the first argument.
	var array=new Array();
	var wordfre=new Array();
	brushdata.forEach(function(value){
		value.nouns.forEach(function(key){
			key=key.trim();
			if(wordfre[key]==undefined){
				wordfre[key]=1;				
			}else{
				wordfre[key]=wordfre[key]+1;
			}
		})
	});
	
	$("#reviews").text("reviews sorted by date");
	$(".reviewContext").scrollTop(0);
	wordsSentimentArray.length=0;
	
	function checknum(value) {
		var Regx = /^[A-Za-z -]*$/;
		if (Regx.test(value)) {
			return true;
		}
		else {
			return false;
		}
    }
	
	var wordarray=[];		
	for(var key in wordfre){
		//console.log(typeof(key));
		if(checknum(key)==false){
			//console.log(key);
			continue;
		}
		var obj={};
		obj.text=key;
		obj.weight=wordfre[key];
		wordarray.push(obj);
	}
	wordarray.sort(function(a,b){
		return b.weight-a.weight;
	});
	
	electedArray=wordarray.slice(0,70);
	
	var color1=["#A50026","#D73027","#F46D43","#FDAE61","#FEE08B","#FFFFBF","#D9EF8B","#A6D96A","#66BD63","#1A9850","#006837"];

	
	var maxVariance=0;

	//console.log(electedArray);
	electedArray.forEach(function(value){
		calculateSentiment(value);
	})
	
	var w=globalYelp.wordcloud;
	var indexDic={};	//indexDic代表的是所有新的词语，也就是要展现的
	for(var i=0;i<electedArray.length;i++){
		indexDic[electedArray[i].text]=i;
	}
	
	//把单词分组，加在groupedWords和ungroupedWords里面
	var addWords=function(value){
		if(typeof(w.wordList[value.text])=="undefined"){
			w.ungroupedWords.push(value);
		}else{
			var gnum=w.wordList[value.text];
			var inum=w.groupNum.indexOf(gnum);
			if(inum>-1){
				w.groupedWords[inum].push(value);
			}else{
				var ll=w.groupedWords.length;
				w.groupNum.push(gnum);
				w.groupedWords[ll]=new Array();
				w.groupedWords[ll].push(value);
			}
		}
	}
	
	//检查这个词和原来词云的关系，遍历已经有的词汇，来标示状态
	if(typeof(w.groupedWords)!="undefined"){
		w.groupedWords.forEach(function(aa){
			checkIt(aa,indexDic,electedArray);
		});
		checkIt(w.ungroupedWords,indexDic,electedArray);
	}
	
	for(var key in indexDic){
		if(indexDic[key]!=-1){//新的词云中不属于被保留的词 
			var sv=electedArray[indexDic[key]];
			sv.tags=1;
			addWords(sv); //新词归类
		}
	}
	
	$("#wordcloud").jQCloud(electedArray,{maxv:0.6,valueType:wordcloudType,gw:w.groupedWords,ugw:w.ungroupedWords,gn:0});

}

function brushed(){
	
	var domainscale=[];
	//if brush.extend duration less than one year 
	domainscale=brush.extent();
	
	xscale.domain(domainscale)
		.range([0,w-2*globalYelp.overview.marginRight])
		.ticks(d3.time.month,1);
		
	var nn=datedim.filter(brush.extent());
	var timebegin=brush.extent()[0];
	var timeend=brush.extent()[1];
	brushdata=arrayYelpData.filter(function(x){ if(x.date>=timebegin&&x.date<=timeend){return x}});
	
	dealreview(brushdata);
	flow.attr("d",area( globalYelp.dataset));
	path.attr("d", strline( globalYelp.dataset));
	cpath.attr("d",carea( globalYelp.dataset));
	
	var xaxis=d3.svg.axis()
			   .scale(xscale)
			   .orient("bottom")
			   .miniTimeTick(globalYelp.overview.dateScaleType);
			   
	xflowAxis.call(xaxis);
	
	if(null==tempdbrush[0]){
		console.log("ss");
	}
	sbrush.transition()	
	.duration(0)
	.call(dbrush.extent(tempdbrush))
	.call(dbrush.event);
	//评论数据的处理？？？
	//DrawBar();
	
	
}

function brushend(){
	dbrush.extent()
	wordcloud(brushdata);
	tagtime=0;
	drawCateColor();
	DrawBar(globalYelp.grid.svg);
	sentenceInteraction();
	//console.log("brush end")
}

function brushstarted(){
	tagtime=1;
}

var readIt={

	handleClick:function(ele){
	
	},
	createReadState:function(ele,index){
		var index1=index||parseInt($(ele).attr("index"));
		var tri=$("<div class=\"triangle-topright\"></div>");
		if( globalYelp.reviewEdit[index1].readIt){
			tri.css("border-top-color","green");
		}
		
		tri.tipso({
			content			:"Unread",
			position			:'bottom',
			width				:70,
			background	:"#888888"
		});
		 tri.on("click",function(){
			console.log("click");
			 $(this).css("border-top-color","green");
			  globalYelp.reviewEdit[index1].readIt=true;
			  
			  $(this).tipso('update','content','Read');
			  $(".tipso_content").text("Read");
			  $(".tipso_bubble").css("background-color","green");
			  $(".tipso_arrow").css("border-bottom-color","green");
			  $(this).tipso('update','background','green');
		 })
		ele.append(tri);
	}
	
}

function appendReviews(x){
	shtml=$(" <div class=\"sreview\"> </div>" )
			.attr("index",x.index);
	var rtitle=$("<div class=\"rtitle\"></div>")
		.attr("index",x.index);
	readIt.createReadState(rtitle,x.index);
	var rinput=$("<input class=\"rinput\"> </input>")
		.attr("index",x.index)
		.val( globalYelp.reviewEdit[x.index].text);

	rinput.blur(function(){
		var index=parseInt($(this).attr("index"));
		var index=parseInt($(this).attr("index"));
		 globalYelp.reviewEdit[index].text=this.value;
		//标记的也是已经阅读的
		 globalYelp.reviewEdit[index].readIt=true;
		
		$($(this).parent()[0].childNodes[0]).css("border-top-color","green");
	})
	rtitle.append(rinput);
	
	var date=$("<div style=\"float:left;\">"+x.date.defaultView()+"      </div>");
	rtitle.append(date);
	var img=$("<div class=\"stars star"+x.stars+"\"> </div>");
	
	//rtitle.html(" Date: "+x.date+"  ");
	rtitle.append(img);
	var rc=$("<div></div>");
	rc.html(x.text);
	shtml.append(rtitle);
	
	shtml.append(rc);
	$(".reviewContext").append(shtml);
}


//create the reviews dynamically
function dealreview(filtereddata){
	//deal the reviews when the brush end
	$(".reviewContext").empty();
	filtereddata.forEach(function(x){
		appendReviews(x);
	})
	
}

//count the number of the data
function drawTimeline(){

	var timelinetop=5;
	var timelinebotton=20
	var timelineHeight=80;
	var bottontimeline=timelineHeight-timelinebotton;
	
	var txscale=d3.time.scale()
	  .domain([new Date( globalYelp.dataset[0].date),new Date( globalYelp.dataset[ globalYelp.dataset.length-1].date)])
	  .range([30,w-globalYelp.overview.marginRight]); 
	  
	var txaxis=d3.svg.axis()
			   .scale(txscale)
			   .orient("bottom")
			   .ticks(10);
	  
	var ymax=d3.max( globalYelp.dataset.map(function(d){
		return d.count;
	}))
	
	//ymax就是最大值 
	ymax=(parseInt(ymax/10)+1)*10;
	  
	globalYelp.overview.tyscale=d3.scale.linear()
			.domain([0,ymax])
			.range([bottontimeline,timelinetop]);    
	
	var tyaxis=d3.svg.axis()
			.scale(globalYelp.overview.tyscale)
			.orient("left")
			.ticks(3);
			
			
	
	mode="basis";
	var timearea=d3.svg.area()
			.interpolate(mode)
			.x(function(d){
				return txscale(new Date(d.date))
			})
			.y0(function(d){
				return bottontimeline;
			})
			.y1(function(d){
				return globalYelp.overview.tyscale(d.count);
			});
	
	$("#maincanvas").empty();
	var timeline=d3.select("#maincanvas")
			.append("svg")
			.attr("width",w)
			.attr("height",timelineHeight);
	
	//console.log("brush");
	brush=d3.svg.brush()
			.x(txscale)
			.extent([new Date( globalYelp.dataset[0].date),new Date( globalYelp.dataset[ globalYelp.dataset.length-1].date)])
			.on("brush",brushed)
			.on("brushend",brushend)
			.on("brushstart",brushstarted);
	
	//blue flow 
	timeline.append("path")
		.attr("d",timearea( globalYelp.dataset))
		.style("fill",'#9abfe4')
		.style("stroke-width",0.7);
		
		
	var tbrush=timeline.append("g")
		.attr("class","xbrush")
		.call(brush)
	
	tbrush.selectAll("rect")
		.attr("y",0)
		.attr("height",timelineHeight-10);
		
	timeline.append("g")
	   .attr("class","x axis")
	   .attr("stroke-width","100px")
	   .attr("font-size","3px")
	   .attr("shape-rendering","crispEdges")
	   .attr("transform","translate(0,60)")
	   .call(txaxis);
	   
	timeline.append("g")
		.attr("class","y axis")
		.attr("stroke-width","100px")
	   .attr("font-size","3px")
	   .attr("shape-rendering","crispEdges")
	   .attr("transform","translate(30,0)")
	   .call(tyaxis);
}

//the flow of down
function drawdense(){
	
	var xrange=[0,w-2*globalYelp.overview.marginRight];
	var yrange=[ybottom,10];
	//console.log(dataset);
	svg=d3.select("#maincanvas")
		.append("svg")
		.attr("width",w)
		.attr("height",h)
		
	svg.append("defs")
		.append("clipPath")
		.attr("id","clip")
		.append("rect")
		.attr("x",0)
		.attr("width",w-2*globalYelp.overview.marginRight)
		.attr("height",ybottom);
	
	svg=svg.append("g")
		.attr("transform","translate(0,0)");
	
	xscale=d3.time.scale()
	  .domain([new Date( globalYelp.dataset[0].date),new Date( globalYelp.dataset[ globalYelp.dataset.length-1].date)])
	  .range(xrange);
	  
	  
	var areascale=d3.scale.linear()
			.domain([0,maxVariance*6])
			.range([0,ybottom-10]);
	  
	var xaxis=d3.svg.axis()
			   .scale(xscale)
			   .orient("bottom")
			   .ticks(10);
			   
	var yscale=d3.scale.linear()
				.domain([1,5])
				.range(yrange);
				
	var tyaxis=d3.svg.axis()
			.scale(globalYelp.overview.tyscale)
			.orient("right")
			.ticks(3);
			
	svg.append("g")
		.attr("class","y axis")
		.attr("stroke-width","100px")
	   .attr("font-size","3px")
	   .attr("shape-rendering","crispEdges")
	   .attr("transform","translate(730,240)")
	   .call(tyaxis);
				
	var yaxis=d3.svg.axis()
				.scale(yscale)
				.orient("left")
				.ticks(5);
	
	mode="basis";
	
	strline=d3.svg.line()
				.interpolate(mode)
				.x(function(d){
					return xscale(new Date(d.date));
				})
				.y(function(d){
					//console.log(d.aveScore);
					return yscale(d.aveScore);
				});
					
	area=d3.svg.area()
			.interpolate(mode)
			.x(function(d){
				return xscale(new Date(d.date))
			})
			.y0(function(d){
				return yscale(d.aveScore)+areascale(d.variance)
			})
			.y1(function(d){
				return yscale(d.aveScore)-areascale(d.variance)
			});
			
	flow=svg.append("g")
		.attr("transform","translate(30,0)")
		.append("path")
		.attr("d",area( globalYelp.dataset.filter( function(x){return x.aveScore>0;} )))
		.style("fill",'#99b77b')
		.attr("clip-path","url(#clip)")
		.style("stroke-width",0.7);
		
	path=svg.append("g")
		.attr("transform","translate(30,0)")
		.append("path")
        .attr("d", strline( globalYelp.dataset.filter( function(x){return x.aveScore>0;} )))
		.style("fill","#99b77b")
		.style("fill","none")
		.style("stroke-width",1)
		.style("stroke","#2d4f2c")
		.style("stroke-opacity",0.9)
		.attr("clip-path","url(#clip)");
	
	xflowAxis=svg.append("g")
	   .attr("class","x axis")
	   .attr("stroke-width","100px")
	   .attr("font-size","3px")
	   .attr("shape-rendering","crispEdges")
	   .attr("transform","translate(30,300)")
	   .call(xaxis);
	
	svg.append("g")
	    .attr("class","y axis")
		.attr("font-size","3px")
		.attr("transform","translate(30,0)")
		.call(yaxis);
		
	drawcount(xscale);
	
	//brush part
	dbrush=d3.svg.brush()
		.x(xscale) //scales
		.on("brushend",filterdata);	//filterdata 里面写了交互行为
	
	sbrush=svg.append("g")
		 .attr("class","xbrush")
		 .attr("transform","translate(30,0)")
		 .call(dbrush);
	
	sbrush.selectAll("rect")
		.attr("y",0)
		.attr("height",ybottom);	
	//svg.onclick()
}

function filterdata(){
	var timebegin=dbrush.extent()[0];
	var timeend=dbrush.extent()[1];
	
	$("#dateRange").html(timebegin.defaultView() +" - "+timeend.defaultView());
	tempdbrush=dbrush.extent();
	if(tagtime==0){
		//过滤相应的数据
		var sbrushdata=brushdata.filter(function(x){ if(x.date>=timebegin&&x.date<=timeend){return x}});
		
		dealreview(sbrushdata);	//显示对应范围的评论
		wordcloud(sbrushdata);	//显示词云
	}
	drawCateColor();
	selectSentence();
	sentenceInteraction();
	
}


function changeWordcloud(){
	
	var color1=["#A50026","#D73027","#F46D43","#FDAE61","#FEE08B","#FFFFBF","#D9EF8B","#A6D96A","#66BD63","#1A9850","#006837"];
	
	var color2=["#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"];
		
	var colorBar=function(g,color,text){
		g.selectAll("rect")
			.data(color)
			.enter()
			.append("rect")
			.attr("width",10)
			.attr("height",10)
			.attr("x",function(d,i){ return 60+i*10;})
			.attr("y",280)
			.style("fill",function(d){ return d})
			.style("font-size","10px");
			
		g.append("text")
			.text(text[0])
			.attr("x",55-color.length*5)
			.attr("y",290)
			.style("font-size","10px");
			
		g.append("text")
			.text(text[1])
			.attr("x",70+color.length*10)
			.attr("y",290)
			.style("font-size","10px");
	}
	
	var indexDic={};
		for(var i=0;i<electedArray.length;i++){
			indexDic[electedArray[i].text]=i;
		}
		
	if(wordcloudType=="score"){
		//console.log("changescore");
		$(".wd text").each(function(i,hh){
		    var index=indexDic[hh.textContent];
	
			var vv=electedArray[index].sentimentVariance;
			
			var countcolor=color2.length;
			var colorScale=d3.scale.linear()
				.domain(d3.range(countcolor))
				.range(color2);
		     var pev=0.6/countcolor;
			 var ccc=vv/pev;
			
			 
			 if(electedArray[index].text in globalYelp.wordcloud.clickedWords){
				 $(this).attr("fill","#5F9EA0");
			}else{
				 $(this).attr("fill",colorScale(parseInt(ccc)));
			}
			 
		});
		wordcloudType="ave";
		var wdp=d3.select("#wdp");
		
		$("#wdp").empty();
		
		colorBar(wdp,color2,["Low","High"]);
		
	}else{
		var colorScale = d3.scale.linear() // <-A
			.domain(d3.range(11))
			.range(color1);
		//console.log("change to score");
		$(".wd text").each(function(ii,hh){
			var index=indexDic[hh.textContent];
			var cc=electedArray[index].score;
			
			 if(electedArray[index].text in globalYelp.wordcloud.clickedWords){
				 $(this).attr("fill","#5F9EA0");
			}else{
				$(this).attr("fill",colorScale(parseInt((cc+1)/(2/11))));	
			}
		})
		wordcloudType="score";
		var wdp=d3.select("#wdp");
		$("#wdp").empty();
		
		colorBar(wdp,color1,["Negative","Positive"]);
	}
}

function drawcount(xscale){
	var num=globalYelp.dataset.length;

	var cscale=d3.scale.linear()
			.domain([0,maxcount])
			.range([0,60]);
			
	carea=d3.svg.area()
	.interpolate(mode)
	.x(function(d){
		return xscale(new Date(d.date))
	})
	.y0(function(d){
		return ybottom;
	})
	.y1(function(d){
		return ybottom-cscale(d.count);
	});
	
	cpath=svg.append("g")
		.attr("transform","translate(30,0)")
		.append("path")
		.attr("clip-path","url(#clip)")
		.attr("d",carea(globalYelp.dataset))
		.style("fill","#9abfe4")
		.style("stroke-width",0.7);
	
}

function sortReview(){
	var s1=function(a,b){
		var obj1=$(a)[0].childNodes[1];
		var obj2=$(b)[0].childNodes[1];
		var date1=obj1.innerText;
		var date2=obj2.innerText;
		var star1=obj1.childNodes[1].className[10]
		var star2=obj2.childNodes[1].className[10]

		if(star1>star2){
			return 1;
		}else if(star2==star1){
			if(date1>date2){
				return 1;
			}else if(date2==date1){
				return 0;
			}else{
				return -1;
			}
		}else{
			return -1;
		}
	}

	var sortit=$(".sreview").toArray().sort(s1);
	console.log(sortit);
	$(".reviewContext").empty().append(sortit);
}

