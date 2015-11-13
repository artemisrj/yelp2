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
	path.attr("d",lineZero(dataset));
		
	//截断旧数据
	oldData=oldData.slice(0,dataset.length);
	var circle=svg.selectAll("circle").data(oldData);
		
	//删除多余的圆点
	circle.exit().remove();
		
	//圆点初始化，添加圆点,多出来的到右侧底部
	svg.selectAll("circle")
	.data(dataset)
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
		yScale.domain([0,d3.max(dataset)]);				
		yBar.transition().duration(_duration).call(yAxis);
		yInnerBar.transition().duration(_duration).call(yInner);		
		
		//路径动画
		path.transition().duration(_duration).attr("d",line(dataset));
				
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
	if(arrayYelpData==null){
		//reviewinfo();	//load review
		$.get("cgi-bin/freworddb.py",function(data,status){
		
			var length=jsons.length;
			var jsons=$.parseJSON(data);
			arrayYelpData=new Array(length);
			reviewEdit=new Array(length);
			
			var parseDate=d3.time.format("%Y-%m-%d").parse;
			
			for(var i=0;i<length;i++){
				var obj={};
				obj.date=parseDate(jsons[i][0]);
				obj.stars=jsons[i][3];
				obj.text=jsons[i][4];
				
				obj.text=obj.text.replace(/\n/g,'<br>');
				obj.text=obj.text.replace(/\*/g,'"');
				obj.nouns=jsons[i][2].split(",");
				arrayYelpData[i]=obj;
			}
			console.log(arrayYelpData);
			brushdata=arrayYelpData;
			
			crossdata=crossfilter(arrayYelpData);
		    datedim=crossdata.dimension(function(d){ return d.date; });
			if(type=="month"){
			//alert("month");
				averageData(arrayYelpData); //deal the point 
			}else if(type=="week"){
				averageWeek(arrayYelpData);
			}
		//console.log(dataset)
			drawTimeline();
			drawdense();
			
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

function averageData(arrayYelpData){ 	//用平均来平滑点
	
	oldData=dataset; 	//oldData 存储上一个数据
	dataset=[];
	var vset=[];
	var allset=[];
	maxcount=0;
	var cc=arrayYelpData.length;
	var oldd=new Date(arrayYelpData[0].date);
	var msum=0;	//score of all the month
	var mc=0;	//number of the score of the month
	dataLength=0;
	var strDate;
	
	for(var i=0;i<cc;i++){
		strDate=new Date(arrayYelpData[i].date);

		if(oldd.getFullYear()==strDate.getFullYear()&&oldd.getMonth()==strDate.getMonth()){
			msum=msum+parseInt(arrayYelpData[i].stars);
			vset.push(parseInt(arrayYelpData[i].stars));
			mc++;
		}else{
		
			var index=allset.length;
			allset[index]=new Array();
			for(var ii=0;ii<vset.length;ii++)
			{
			    allset[index].push(vset[ii]);
			}
			
			vset.length=0;
			vset.push(parseInt(arrayYelpData[i].stars));
		
			dataLength++;
			aveScore=msum/mc;
			msum=parseInt(arrayYelpData[i].stars);
			
			var singledata={};
			singledata.count=mc;
			if(mc>maxcount){
				maxcount=mc;
			}
			singledata.aveScore=aveScore;
			singledata.date=oldd.getFullYear()+"-"+(oldd.getMonth()+1)+"-15";
			
			dataset.push(singledata);
			mc=1;
			//xMarks.push(da);
			oldd=strDate;
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

	singledata.aveScore=aveScore;
	singledata.date=strDate.getFullYear()+"-"+(strDate.getMonth()+1)+"-15";
	dataset.push(singledata);
	
	calVariance(allset);

	//console.log(dataset);
	
}

//计算方差
function calVariance(allset){
	maxVariance=0;
		for(var i=0;i<dataset.length;i++){
			if(dataset[i].aveScore==-1){
				dataset[i].variance=0;
				continue;
			}
			var temparray=allset[i];
			var sum=0;
			for(var j=0;j<temparray.length;j++){
				sum=sum+(temparray[j]-dataset[i].aveScore)*(temparray[j]-dataset[i].aveScore);
			}
			sum=sum/allset.length;
			if(sum>maxVariance){
				maxVariance=sum;
			}
			dataset[i].variance=sum;
		}
}
	//产生随机数据
function yeardate(date1){
	date2=new Date();
	return ((date1.valueOf() - date2.valueOf()) / 86400000);
}	
	
	
function averageWeek(arrayYelpData){
	dataset.length=0;
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
			dataset.push(singledata);
			
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
				dataset.push(singledata);
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
		dataset.push(singledata);
	}
	
	calVariance(allset);
	//console.log(dataset);
	
}
		
function wordcloud(brushdata){//输入要做词云的范围，输出词云的效果
	
	// When DOM is ready, select the container element and call the jQCloud method, passing the array of words as the first argument.
	//$("#ajax").click(function(){
	var array=new Array();
	var wordfre=new Array();
	brushdata.forEach(function(value){
		value.nouns.forEach(function(key){
			if(wordfre[key]==undefined){
				wordfre[key]=1;				
			}else{
				wordfre[key]=wordfre[key]+1;
			}
		})
	});
	
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
		return a.weight<b.weight;
	});
	
	var electedArray=wordarray.slice(0,70);
	
	var color1=["#A50026","#D73027","#F46D43","#FDAE61","#FEE08B","#FFFFBF","#D9EF8B","#A6D96A","#66BD63","#1A9850","#006837"];

	var colormiddle="#D8Daeb";
	
	var colorScale = d3.scale.linear() // <-A
        .domain(d3.range(11))
        .range(color1);
	
	electedArray.forEach(function(value){
		var sumWordSentiment=0.0;
		var cc=0;
		var sentiArray=[];
		//begin to calculate the sentiment of everword
		$("."+value.text).each(function(index){
			var sentiment=$(this).parent().attr("sentiment");
			var numOfsen=parseFloat(sentiment.slice(1,sentiment.indexOf(',')));
			if(Math.abs(numOfsen-0.0)>0.0001){
				cc=cc+1;
				sumWordSentiment=sumWordSentiment+numOfsen;	
				sentiArray.push(numOfsen);
			}
		});
		var sentimentNum;
		if(cc>0){
			sentimentNum=sumWordSentiment/cc;
		}else{
			sentimentNum=0;
		}
		wordsSentimentArray.push(sentiArray);
		var ccc=(sentimentNum+1)/(2/11);	
		value.color=colorScale(parseInt(ccc));
	})
	
	console.log(wordsSentimentArray);
	
	$("#wordcloud").empty();
	//console.log("jqcloud");
	$("#wordcloud").jQCloud(electedArray);
	//console.log("endjqcloud");
	
	$("#wordcloud> span").click(function(){ 
		var words=[];
		var index;
		var clickWord=$(this).text();
		var r;
		
		//get the every span elements info
		var spans=$("#wordcloud> span");
		
		spans.each(function(i){
			var sword={};
			sword.word=$(this).text();
			
			sword.top=parseInt($(this).css("top"));
			sword.left=parseInt($(this).css("left"));
			sword.width=parseInt($(this).css("width"));
			sword.height=parseInt($(this).css("height"));
			sword.link=this;
			
			if(clickWord==sword.word){
				index=i;
				r=sword.width;
			}
			words.push(sword);
		});
		
		var replaceWords=function(){
			var wheight=$("#wordcloud").css("height");
			var wwidth=$("#wordcloud").css("width");
			//console.log(wheight);
				//the function to judge two common element
			var overlapping = function(a, b) { //两个普通元素的判断
				var cx1=a.left+a.width/2; //center  x of a
				var cx2=b.left+b.width/2; //center x of b
				var cy1=a.top+a.height/2;
				var cy2=b.top+b.height/2;
				var sx,sy;
				
				if(cx2>cx1){ //b in the right of a 
					sx=1;
				}else{
					sx=-1;
				}
				
				if(cy2>cy1){ //b in the botton of a 
					sy=1;
				}else{
					sy=-1;
				}
				
				//if overlapping
				var dx=2*Math.abs(cx1-cx2)-a.width-b.width;
				if(dx<0){
					var dy=2*Math.abs(cy1-cy2)-a.height-b.height;
					if(dy<0) 
						return [dx*0.1*sx,dy*0.1*sy];
				}
				return [0,0];
			};
			
			//judge otherele with the indexele 
			var farAway=function(indexele,otherele){
				var cx=indexele.left+indexele.width/2;
				var cy=indexele.top+indexele.height/2;
				
				var ox=otherele.left+otherele.width/2;
				var oy=otherele.top+indexele.height/2;
				
				var judgepoint={};
				
				var sx,sy;
				
				if(cx<ox){//otherele in the right
					judgepoint.x=otherele.left;
					sx=1;
				}else{
					judgepoint.x=otherele.left+otherele.width;
					sx=-1;
				}
				
				if(cy>oy){ //otherele in the top
					judgepoint.y=otherele.top+otherele.height;
					sy=-1;
				}else{
					judgepoint.y=otherele.top;
					sy=1;
				}
				var diff=r*r-((judgepoint.x-cx)*(judgepoint.x-cx)+(judgepoint.y-cy)*(judgepoint.y-cy));
				if(diff>0){//they have the same area
					var vector=[r-Math.abs(judgepoint.x-cx),r-Math.abs(judgepoint.y-cy)];
					return [(vector[0]*0.3+2)*sx,(vector[1]*0.3+2)*sy];
					
				}else{
					return [0,0];
				}
			}
			
			var updateEle=function(word,xy){
				word.top=word.top+xy[1];
				word.left=word.left+xy[0];
				if(word.top<0){
					word.top=0;
				}
				if(word.left<0){
					word.left=0;
				}
				if(word.top+word.height>wheight){
					word.top=wheight-word.height;
				}
				if(word.left+word.width>wwidth){
					word.left=wwidth-word.width;
				} 
				$(word.link).css("top",word.top+"px");
				$(word.link).css("left",word.left+"px");
			}
			
			for(var i=0;i<words.length;i++){
				for(var j=i+1;j<words.length;j++){
					if(i==index){ //words move around clicked word
						var xy=farAway(words[i],words[j]);
						if(xy[0]==0&&xy[1]==0){
							continue;
						}
						updateEle(words[j],xy)
						
					}else if(j==index){//words move around clicked word
						var xy=farAway(words[j],words[i]);
						if(xy[0]==0&&xy[1]==0){
							continue;
						}
						updateEle(words[i],xy);
					}else{ //two common word don't over
						var xy=overlapping(words[i],words[j]);
						if(xy[0]==0&&xy[1]==0){
							continue;
						}
						updateEle(words[i],xy);
						xy[0]=-xy[0];
						xy[1]=-xy[1];
						updateEle(words[j],xy);
					}
				}
			}	
		}
		var time=3000;
		while(time--){
			setTimeout(replaceWords,30);
		}
		//replaceWords();
		console.log(words);		
	});

}

function brushed(){
	
	xscale.domain(brush.extent())
		.range([0,w]);
	var nn=datedim.filter(brush.extent());
	var timebegin=brush.extent()[0];
	var timeend=brush.extent()[1];
	brushdata=arrayYelpData.filter(function(x){ if(x.date>=timebegin&&x.date<=timeend){return x}});
	dealreview(brushdata);
	flow.attr("d",area(dataset));
	path.attr("d", strline(dataset));
	cpath.attr("d",carea(dataset));
	var xaxis=d3.svg.axis()
			   .scale(xscale)
			   .orient("bottom")
			   .ticks(10);
	xflowAxis.call(xaxis);
	
	//dbrush.extent();
	
	if(null==tempdbrush[0]){
		console.log("ss");
	}
	sbrush.transition()	
	.duration(0)
	.call(dbrush.extent(tempdbrush))
	.call(dbrush.event);
	//评论数据的处理？？？
	
}

function brushend(){
	dbrush.extent()
	wordcloud(brushdata);
	tagtime=0;
}

function brushstarted(){
	//tempdbrush[0]=dbrush.extent()[0];
	//tempdbrush[1]=dbrush.extent()[1];
	//console.log(tempdbrush);
	tagtime=1;
}

function dealreview(filterdata){
	//console.log("dealreview");
	$(".reviewContext").empty();
	filterdata.forEach(function(x){
		shtml=$(" <div class=\"sreview\"> </div>" );
		var rtitle=$("<div class=\"rtitle\"></div>");
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
		// $(".sentence").each(function(){
			// var senti=$(this).attr("sentiment");
			// var sentinum=parseFloat(senti.slice(1,senti.indexOf(',')));
			// if(sentinum>0){
				// $(this).css("background-color","#d9ef8b");
			// }else if (sentinum<0){
				// $(this).css("background-color","#fdae61");
			// }
		// })
	})
	
}

//count the number of the data
function drawTimeline(){

	var timelinetop=5;
	var timelinebotton=20
	var timelineHeight=80;
	var bottontimeline=timelineHeight-timelinebotton;
	
	var txscale=d3.time.scale()
	  .domain([new Date(dataset[0].date),new Date(dataset[dataset.length-1].date)])
	  .range([30,w]); 
	  
	var txaxis=d3.svg.axis()
			   .scale(txscale)
			   .orient("bottom")
			   .ticks(10);
	  
	var ymax=d3.max(dataset.map(function(d){
		return d.count;
	}))
	  
	var tyscale=d3.scale.linear()
			.domain([0,ymax])
			.range([bottontimeline,timelinetop]);    
	
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
				return tyscale(d.count);
			});
	
	$("#maincanvas").empty();
	var timeline=d3.select("#maincanvas")
			.append("svg")
			.attr("width",w)
			.attr("height",timelineHeight);
	
	//console.log("brush");
	brush=d3.svg.brush()
			.x(txscale)
			.extent([new Date(dataset[0].date),new Date(dataset[dataset.length-1].date)])
			.on("brush",brushed)
			.on("brushend",brushend)
			.on("brushstart",brushstarted);
	
	timeline.append("path")
		.attr("d",timearea(dataset))
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
}


function drawdense(){
	
	var xrange=[0,w];
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
		.attr("x",30)
		.attr("width",w)
		.attr("height",ybottom);
		
		
	svg=svg.append("g")
		.attr("transform","translate(0,0)");
	
	xscale=d3.time.scale()
	  .domain([new Date(dataset[0].date),new Date(dataset[dataset.length-1].date)])
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
				//console.log(d.aveScore);
				//console.log(d.variance);
				//console.log(yscale(d.aveScore)+areascale(d.variance));
				return yscale(d.aveScore)+areascale(d.variance)
			})
			.y1(function(d){
				return yscale(d.aveScore)-areascale(d.variance)
			});
			
	flow=svg.append("g")
		.attr("transform","translate(0,0)")
		.append("path")
		.attr("d",area(dataset.filter( function(x){return x.aveScore>0;} )))
		.style("fill",'#99b77b')
		.attr("clip-path","url(#clip)")
		.style("stroke-width",0.7);
		
	path=svg.append("g")
		.attr("transform","translate(0,0)")
		.append("path")
        .attr("d", strline(dataset.filter( function(x){return x.aveScore>0;} )))
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
		.on("brushend",filterdata);
	
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
		var sbrushdata=brushdata.filter(function(x){ if(x.date>=timebegin&&x.date<=timeend){return x}});
		
		dealreview(sbrushdata);
		wordcloud(sbrushdata);
	}
	
	
}

function drawcount(xscale){
	var num=dataset.length;

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
		.attr("transform","translate(0,0)")
		.append("path")
		.attr("clip-path","url(#clip)")
		.attr("d",carea(dataset))
		.style("fill","#9abfe4")
		.style("stroke-width",0.7);
	
}

