var drawGrids=function(word){
	
	var set;
	var width=700;
	var gMargin=10;
	var gridHeight=15;
	
	var ll=globalYelp.grid.allWordSet.length;
	var clickWords=globalYelp.wordcloud.clickedWords;
	
	$("#wordgrids").html("");
	var svg=d3.select("#wordgrids").append("svg").attr("width",width).attr("height",(clickWords.LL*2+1)*gridHeight);
	
	var gwidth=(width-gMargin*2)/ll;
	
	var i=0;
	for(var word in clickWords){
		if(word=="LL"){
			continue;
		}
		var g=svg.append("g");
		drawLine(g,word,i,gwidth,gridHeight);
		i+=1;
	}
}

var drawLine=function(svg,word,i,gwidth,gridHeight){
	var height=i*gridHeight*2+30;
	svg.append("text").attr("x",20).attr("y",height).text(word);
	globalYelp.grid.allWordSet.forEach(function(mm,index){
		console.log(mm["Date"]);
		if(typeof(mm[word])!="undefined"){
			if(typeof(mm[word].average)=="undefined"){
				return;
			}
			svg.append("rect").attr("x",gwidth*index).attr("width",gwidth).attr("height",gridHeight).attr("y",height).attr("fill",colorSentiment(mm[word].average));
		}
	})
}

var colorSentiment=function(value){

	var color1=["#A50026","#D73027","#F46D43","#FDAE61","#FEE08B","#FFFFBF","#D9EF8B","#A6D96A","#66BD63","#1A9850","#006837"];
	
	var colorScale = d3.scale.linear() // <-A
		.domain(d3.range(11))
		.range(color1);
		
	var ccc=(value+1)/(2/11);	
	return colorScale(parseInt(ccc));
}

var continueColor=function(value){
	
	var color1=["#A50026","#D73027","#F46D43","#FDAE61","#FEE08B","#FFFFBF","#D9EF8B","#A6D96A","#66BD63","#1A9850","#006837"];
	
	var colorScale=d3.scale.linear()
		.domain(d3.range(11))
		.range(color1);
	var ccc=(value+1)/(2/11);
	return colorScale(ccc);
}

var judgeDateTime=function(){
	var firstDate=arrayYelpData[0].date.defaultView().slice(0,-3);
	var lastDate=arrayYelpData[arrayYelpData.length-1].date.defaultView().slice(0,-3);
	var dateArray=[];
	var curDate=firstDate;
	while(curDate!=lastDate){
		dateArray.push(curDate);
		var month=parseInt(curDate.slice(5,7));
		month=month+1;
		if(month==13){
			var year=parseInt(curDate.slice(0,4))+1;
			curDate=year+"-"+"01";
		}else{
			if(month<10){
				curDate=curDate.slice(0,5)+"0"+month;
			}else{
				curDate=curDate.slice(0,5)+month;
			}		
		}
	}
	dateArray.push(lastDate);
	return dateArray;
}

var drawCateGrids=function(tempvalue){
	//
	globalYelp.grid.allGridsNum=740;
	var allGridsNum=globalYelp.grid.allGridsNum;
	var typenum=3;
	var type;
	
	//save the scores of 
	delete globalYelp.grid.allType;
	globalYelp.grid.allType=new Array(3);
	var allType=globalYelp.grid.allType;
	allType[0]={};
	allType[1]={};
	allType[2]={};
	
	if(typeof(tempvalue)=="undefined"){
		type=globalYelp.classtype; //经常忘了数据格式。
	}else{
		type=tempvalue;
	}
	
	
	type.forEach(function(ele,i){
		if(ele!=-1&&ele!=3){
			var sentence=$("#s"+i);
			if(sentence.length>0){
				if(typeof(sentence.parent().prev().children()[2])=="undefined"){
					console.log(sentence);
					console.log(sentence.parent().prev());
				} 
				var dateStr=sentence.parent().prev().children()[2].innerText.slice(0,-3);
				
				var sentiment=$("#s"+i).attr("sentiment");
				
				if(typeof(sentiment)!="undefined"){
					var numOfsen=parseFloat(sentiment.slice(1,sentiment.indexOf(',')));
					if((numOfsen-0.0)<-0.05){
						if(typeof(allType[ele][dateStr])=="undefined"){
							allType[ele][dateStr]=new Array();
						}
						allType[ele][dateStr].push(numOfsen);
					}
				}
			}
		}
	})
	
	
	//calculate average score
	for (var i=0;i<typenum;i++){
		var n=allType[i].length;
		var onetype=allType[i];
		for(var key in onetype){
			var sum=0;
			var Adate=onetype[key];
			var nn=Adate.length;
			for(var j=0;j<nn;j++){
				sum=sum+Adate[j];
			}
			Adate.averageScore=sum/nn;
		}
	 }
	
	var set;
	var width=760;
	var gMargin=10;
	var gridHeight=15;
	var dates=judgeDateTime();
	
	$("#grids").html("");
	var svg=d3.select("#grids").append("svg").attr("width",width).attr("height",typenum*gridHeight*2+30);
	
	var fontBaseHeight=40;
	
	var filterReveiw=function(catenum){
		$(".sreview").hide();
		var types=globalYelp.classtype;
		types.forEach(function(ele,i){
			if(ele==catenum){
				var theid="s"+i;
				$("#"+theid).parent().parent().show();
			}
		})
	}
	
	var FoodIA=svg.append("text").text("Food").attr("x",50).attr("y",fontBaseHeight).style("fill","#b03a23").style('text-anchor',"end").style("font-size",15);
	FoodIA.on("click",function(){
		cateWordcloud(0);
		filterReveiw(0);
	})
	var ServiceIA=svg.append("text").text("Service").attr("x",50).attr("y",fontBaseHeight+gridHeight*2).style("fill","#83ba39").style("text-anchor","end").style("font-size",15);
	ServiceIA.on("click",function(){
		cateWordcloud(1);
		filterReveiw(1);
	})

	var DecorIA=svg.append("text").text("Ambiance").attr("x",50).attr("y",fontBaseHeight+gridHeight*4).style("fill","#3090bc").style("text-anchor","end").style("font-size",15);
	DecorIA.on("click",function(){
		cateWordcloud(2);
		filterReveiw(2);
	})

	var gwidth=1;
	globalYelp.grid.svg=svg;
	DrawBar(svg);
}


var DrawBar=function(svg){
	var allGrids=reDrawBar();
	var gwidth=1;
	typenum=3;
	var gridHeight=15;
	var allGridsNum=globalYelp.grid.allGridsNum;
	
	//高度有所修改，所以显示也有一点不一样
	
	for(var i=0;i<typenum;i++){
		for(var j=0;j<allGridsNum;j++){
			svg.append("rect").attr("x",gwidth*j+60).attr("width",gwidth).attr("height",gridHeight).attr("y",30+gridHeight*i*2).attr("fill",continueColor(allGrids[i][j]));
		}
	}
}

var reDrawBar=function(){
	var interpolationValue=function(a,b,array){
		a=parseInt(a);
		b=parseInt(b);
		var v1=array[a];
		var v2=array[b];
		var mm=b-a;
		if(typeof(v1)!="undefined"&&typeof(v2)!="undefined"){
			for(var j=1;j<mm;j++){
				array[a+j]=(v2-v1)*j/mm+v1;
			}
		}else if(typeof(v1)=="undefined"){
			for(var j=0;j<mm;j++){
				array[a+j]=v2;
			}
		}else{
			for(var j=1;j<=mm;j++){
				array[a+j]=v1;
			}
		}
	}
	var allType=globalYelp.grid.allType
	var typenum=3;
	var allGridsNum=globalYelp.grid.allGridsNum;

	var allGrids=new Array(3);
	for(var i=0;i<3;i++){
		allGrids[i]=new Array(allGridsNum);
	}
		
	for(var i=0;i<typenum;i++){
		for(var date in allType[i]){
			var ii=xscale(new Date(date+"-15"));
			if(ii<0){
				ii=0;
			}
			if(ii>w-2*globalYelp.overview.marginRight){
				ii=w-2*globalYelp.overview.marginRight;
			}
			allGrids[i][parseInt(ii)]=allType[i][date].averageScore;
		}
	}

	for(var i=0;i<typenum;i++){
		var pre=0,next;
		for(var ele in allGrids[i]){
			next=ele;
			interpolationValue(pre,next,allGrids[i]);
			pre=next;
		}
		interpolationValue(pre,allGridsNum-1,allGrids[i]);
	}
	return allGrids;
}
