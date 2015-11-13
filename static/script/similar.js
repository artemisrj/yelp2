var path="similarwords.txt";
	var arrayf="srray.txt";
	
	var point="loc.csv"
	
	var w=1600;
	var h=800;
	var fontSize=3;
	var svg=d3.select("body").append("svg")
	.attr("width",w).attr("height",h);
	var g;
	var linkg;
	
	var texts;
	
	//函数声明
	var compareCommon=function(ans,bns){
		var samenodes=new Array();
		ans.forEach(function(an){
			bns.forEach(function(bn){
				if(an==bn){
					samenodes.push(an);
				}
			});
		});
		if(samenodes.length==2){
			return samenodes;
		}else{
			return false;
		}
	}
	
	var calcross=function(a,b){
		return a[0]*b[1]-a[1]*b[0];
	}
	
	var searchAdjacent=function(nodes,links,nodeadjacent){
		var recordlp=new Array();
		links.forEach(function(d,i){
			var sourceNajacentNs=nodeadjacent[d.source.index].node;
			var targetNajacentNs=nodeadjacent[d.target.index].node;
			//查找两个的集合。
			var  comn=compareCommon(sourceNajacentNs,targetNajacentNs);
			
			if(comn!=false){	
				var linkpoint={};
				linkpoint.linkIndex=i;
				linkpoint.point=comn;	
				recordlp.push(linkpoint);
			}
		});

		return recordlp;
	}
	
		var calajacent=function(nlength,links){
			var adj=new Array(nlength);
			
			for(var i=0;i<nlength;i++){
				adj[i]={}
				adj[i].index=i;
				adj[i].linkIndex=new Array();//link index 
				adj[i].node=new Array(); // link node
			}
			links.forEach(function(d,i){
				var sindex,tindex;
				sindex=d.source.index;
				tindex=d.target.index;
				adj[sindex].linkIndex.push(i);
				adj[sindex].node.push(tindex);
				adj[tindex].linkIndex.push(i);
				adj[tindex].node.push(sindex);
			});
			
			return adj;
		
		}	
		
		var calvector=function(a,b){
			return [a[0]-b[0],a[1]-b[1]];
		}
	
	//开始
	$.get(point,function(data){
	
		length=data.length;	
		length=50;
		var extend=0.5;
		var loc=new CSV(data,{header:false}).parse();
	
		loc=loc.slice(0,length);
		loc=loc.map(function(d){
			return [d[0]*w*extend+w/2,d[1]*h*extend+h/2]
		});
	
		$.getJSON(path,function(data){ 
			texts=data.data;
			
		svg.selectAll("text")
		.data(loc)
		.enter()
		.append("text")
		.attr("x",function(d,i){ return d[0];})
		.attr("y",function(d,i){ return d[1];})
		.text(function(d,i){ return texts[i]});
		
		})
	});
			