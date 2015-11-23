/*
主要是选择了某一个分类的时候，
*/
function catebackground(){
	
	var cate=globalYelp.classData;	//这个变量存储[[1.2,1.4,2],[..]]]这样的每个句子的分类信息
	var type=globalYelp.classtype;	//
	
	//execute 
	vertifyData();
	reDefineType();
	drawCateColor();
	drawCateGrids();
	selectSentence();
	sentenceInteraction();
	//vertifyData();
	
	$("#selectFood").on("click",function(){
		if(globalYelp.review.cateStatue[0]==1){
			globalYelp.review.cateStatue[0]=0;
		}else{
			globalYelp.review.cateStatue[0]=1;
		}
		selectSentence();
	})
	
	$("#selectService").on("click",function(){
		if(globalYelp.review.cateStatue[1]==1){
			globalYelp.review.cateStatue[1]=0;
		}else{
			globalYelp.review.cateStatue[1]=1;
		}
		selectSentence();
	})
	
	$("#selectDecor").on("click",function(){
		if(globalYelp.review.cateStatue[2]==1){
			globalYelp.review.cateStatue[2]=0;
		}else{
			globalYelp.review.cateStatue[2]=1;
		}
		selectSentence();
	})

	$("#selectOther").on("click",function(){
		if(globalYelp.review.cateStatue[3]==1){
			globalYelp.review.cateStatue[3]=0;
		}else{
			globalYelp.review.cateStatue[3]=1;
		}
		selectSentence();
	})
}


//选择相应的分类进行显示
function selectSentence(){
	var s=globalYelp.review.cateStatue;
	$(".sentence").hide();
	for(var i=0;i<s.length;i++){
		if(s[i]==1){
			$("span[type='"+i+"']").show();
		}
	}
}


function reDefineType(){	
	//var cate=globalYelp.classData;	
	var type=globalYelp.classtype;
	
	cate.forEach(function(nums,i){
		 type[i]=judgecate(nums);
	})
}


function judgecate(nums){
	var index=-1;
	var min=3;
	nums.forEach(function(num,i){
		if(num<min){
			index=i;
			min=num;
		}
	})
	

	if(min<globalYelp.threshold){
		return index;
	}else{
		return 3;
	}
}

function drawCateColor(){
	var colorbar=["#f3d0c3","#d6dfb9","#a4d3ec","#fff"];
	var type=globalYelp.classtype;	
	type.forEach(function(num,i){
		var theid="s"+i;
		$("#"+theid).attr("type",num).css("backgroundColor",colorbar[num]);
	})
}


//与句子的交互
function sentenceInteraction(){
	var cate=globalYelp.classData;
	var type=globalYelp.classtype;
	$(".sentence").hover(function(){
		tempcolor=$(this).css("backgroundColor");
		$(this).css("backgroundColor","#ebeae7");
	},function(){
		$(this).css("backgroundColor",tempcolor);
	})

	$(".sentence").on("click",function(){
		var str=this.innerText;
		var height=$(this).height;
		var top=$(this).offset().top;
		var left=$(this).offset().left;
		var no=parseInt($(this).attr("id").substring(1));

		var maindiv=$(".classInteraction").css("top",top).css("left",left);
		var classData=globalYelp.classData;		
		
		//var freview=globalYelp.review.falsePositiveReviews;
		//var fmatrix=globalYelp.review.falseReviewMatrix;
		
		maindiv.show();
		
		var tempcolor;
		
		str=str.replace("\n"," ");
		
		$(".types").on("click",function(){
			var classnum;
			console.log(str);
			$(".classInteraction").hide();
			//判断是不是点错
			if(this.innerText=="Food"){
				classnum=0;
			}else if(this.innerText=="Service"){
				classnum=1;
			}else if(this.innerText=="Ambience"){
				classnum=2;
			}else{
				//首先确定是不是改变颜色
				classnum=3;
				classData[no][0]=2;
				classData[no][1]=2;
				classData[no][2]=2;
			}

			if(classnum!=type[no]){ //类型和那啥不一样的时候
				
				//还有一种原来就选对了的情况,另外加以判断 
				$.post($SCRIPT_ROOT+"/reclassifyit",{no:no,sentence:str,classtype:classnum},function(data,status){
			
				
				var dd=$.parseJSON(data);
						 
				
				 //refresh the classData
				dd.forEach(function(ele,i){
					if(ele<classData[i][classnum]){
						classData[i][classnum]=ele;
					}
				})
				
				saveData();	//把数据重新保存本地文件
	
				reDefineType();	//把 classData里面的数据写进  classtype里面
				drawCateColor();	//句子的颜色进行刷新,type属性改变
				drawCateGrids();
				//grid进行刷新
				//vertifyData();
				})
				
			}
			$(".types").unbind("click");
		})
	})
}

function saveData(){
	var savedData=JSON.stringify(globalYelp.classData)
	$.post($SCRIPT_ROOT+"/saveDate",{data:savedData,busid:dataroot},function(data,status){
		console.log(status);
	})
}

function testIt(){
	$.post($SCRIPT_ROOT+"/testData",{data:"data"},function(data,status){
		var typeCount=0;
		var sentiCount=0;
		console.log("get the testData");
		var dd=$.parseJSON(data);
		
		var getSentiment=function(str){
			var sentiment=$("#s"+str).attr("sentiment");
			var numofsen=parseFloat(sentiment.slice(1,sentiment.indexOf(',')));
			return numofsen;
		}
		for(var i=0;i<dd.length;i++){
			var num=parseInt(dd[i][0]);
			var type=globalYelp.classtype[num];
			if(type==-1||type==3){
				if(dd[i][1].indexOf("other")>0){
					typeCount=typeCount+1;
				}
			}else if(type==0){
				if(dd[i][1].indexOf("service")){
					typeCount=typeCount+1;
				}
			}else if(type==1){
				if(dd[i][1].indexOf("food")>0){
					typeCount=typeCount+1;
				}	
			}else{
				if(dd[i][1].indexOf("amb")>0){
					typeCount=typeCount+1;
				}
			}
			var sentiScore=parseInt(dd[i][2]);
			if(sentiScore>0&&getSentiment(dd[i][0])>0){
				sentiCount=sentiCount+1;
			}else if(sentiScore<0&&getSentiment(dd[i][0]>0)){
				sentiCount=sentiCount+1;
			}
		}
		console.log(typeCount);
		console.log(typeCount/dd.length);
	})
}

function tempSave(){
	var aa=$(".reviewContext").find(".sentence");
	var array=[];
	for(var i=0;i<aa.length;i++){
		array.push(aa[i].innerText);
	}
	var dd=JSON.stringify(array)
	$.post($SCRIPT_ROOT+"/tempSave",{data:dd},function(data,status){
		console.log(data);
	})
}

function closeIt(){
	$(".types").unbind("click");
	$(".classInteraction").hide();
}

function vertifyData(){

	var Count=new Array(4);
	
	if(typeof(globalYelp.testData.aa)=="undefined"){
		$.post($SCRIPT_ROOT+"/vertifyData",{data:" "},function(data,status){
			globalYelp.testData.aa=$.parseJSON(data);
			
			for(var i=0;i<4;i++){
				Count[i]={};
				Count[i].TP=0;
				Count[i].FP=0;
				Count[i].FN=0;
				Count[i].precision;
				Count[i].recall;
				Count[i].Fvalue;
			}

			var aa=globalYelp.testData.aa;
			
			
			var type=globalYelp.classtype;
			for(var i=0;i<aa.length;i++){
				if(type[i]==0&&aa[i][0]=="1"){	//food true positive
					Count[0].TP=Count[0].TP+1;
				}
				if(type[i]==0&&aa[i][0]=="0"){
					Count[0].FP=Count[0].FP+1;
				}
				if(type[i]!=0&&aa[i][0]=="1"){
					Count[0].FN=Count[0].FN+1;
				}
			
			
			
				if(type[i]==1&&aa[i][1]=="1"){//service  true positive
					Count[1].TP=Count[1].TP+1;
				}
				if(type[i]==1&&aa[i][1]=="0"){	//service false positive 
					Count[1].FP=Count[1].FP+1;
				}
				if(type[i]!=1&&aa[i][1]=="1"){
					Count[1].FN=Count[1].FN+1;
				}
				
			
				
				if(type[i]==2&&aa[i][2]=="1"){	//Ambience
					Count[2].TP=Count[2].TP+1;
				}
				if(type[i]==2&&aa[i][2]=="0"){
					Count[2].FP=Count[2].FP+1;
				}
				if(type[i]!=2&&aa[i][2]=="1"){
					Count[2].FN=Count[2].FN+1;
				}
				
				if((type[i]==3||type[i]==-1)&&aa[i][3]=="1"){
					Count[3].TP=Count[3].TP+1;
				}

			}
			
			var flag=["food","service","ambiance"];
			
			for(var i=0;i<3;i++){
				Count[i].precision=Count[i].TP/(Count[i].TP+Count[i].FP);
				Count[i].recall=Count[i].TP/(Count[i].TP+Count[i].FN);
				Count[i].Fvalue=2*Count[i].precision*Count[i].recall/(Count[i].precision+Count[i].recall);
				
				//console.log(Count[i].precision);
				console.log("The "+flag[i]+" precision is "+Count[i].precision);
				console.log("The "+flag[i]+" recall is "+ Count[i].recall);
				console.log("F value is "+Count[i].Fvalue);
			}

			
			var aaa=(Count[0].Fvalue+Count[1].Fvalue+Count[2].Fvalue)/3;
			console.log("F average value is "+aaa);	
			
		})
	}else{
		for(var i=0;i<4;i++){
			Count[i]={};
			Count[i].TP=0;
			Count[i].FP=0;
			Count[i].FN=0;
			Count[i].precision;
			Count[i].recall;
			Count[i].Fvalue;
		}

		var aa=globalYelp.testData.aa;
		
		
		var type=globalYelp.classtype;
		for(var i=0;i<aa.length;i++){
			if(type[i]==0&&aa[i][0]=="1"){	//food true positive
				Count[0].TP=Count[0].TP+1;
			}
			if(type[i]==0&&aa[i][0]=="0"){
				Count[0].FP=Count[0].FP+1;
			}
			if(type[i]!=0&&aa[i][0]=="1"){
				Count[0].FN=Count[0].FN+1;
			}
		
		
		
			if(type[i]==1&&aa[i][1]=="1"){//service  true positive
				Count[1].TP=Count[1].TP+1;
			}
			if(type[i]==1&&aa[i][1]=="0"){	//service false positive 
				Count[1].FP=Count[1].FP+1;
			}
			if(type[i]!=1&&aa[i][1]=="1"){
				Count[1].FN=Count[1].FN+1;
			}
			
		
			
			if(type[i]==2&&aa[i][2]=="1"){	//Ambience
				Count[2].TP=Count[2].TP+1;
			}
			if(type[i]==2&&aa[i][2]=="0"){
				Count[2].FP=Count[2].FP+1;
			}
			if(type[i]!=2&&aa[i][2]=="1"){
				Count[2].FN=Count[2].FN+1;
			}
			
			if((type[i]==3||type[i]==-1)&&aa[i][3]=="1"){
				Count[3].TP=Count[3].TP+1;
			}

		}
		
		var flag=["food","service","ambiance"];
		
		for(var i=0;i<3;i++){
			Count[i].precision=Count[i].TP/(Count[i].TP+Count[i].FP);
			Count[i].recall=Count[i].TP/(Count[i].TP+Count[i].FN);
			Count[i].Fvalue=2*Count[i].precision*Count[i].recall/(Count[i].precision+Count[i].recall);
			
			//console.log(Count[i].precision);
			console.log("The "+flag[i]+" precision is "+Count[i].precision);
			console.log("The "+flag[i]+" recall is "+ Count[i].recall);
			console.log("F value is "+Count[i].Fvalue);
		}

		
		var aaa=(Count[0].Fvalue+Count[1].Fvalue+Count[2].Fvalue)/3;
		console.log("F average value is "+aaa);	

	}   
		//drawCateGrids(cc);
	return Count;
}


function trainDataBy(){
	//首先判断哪个最低，然后再开始训练，重复这个过程。 
	//保存每次的数据，然后选择哪个方面，然后选择什么句子，这个句子各方面的参数和它的标记选择     
	
	var cc=vertifyData();
	var g=globalYelp.testData;
	var type=globalYelp.classtype;
	var aa=globalYelp.testData.aa;
	var rr=g.recordText="";
	var classData=globalYelp.classData;
	

	if(typeof(g.rTestProcess)=="undefined"){
		g.rTestProcess=new Array(3);
		g.rTestProcess[0]=0;
		g.rTestProcess[1]=0;
		g.rTestProcess[2]=0;
	}
	
	var index;
	var min=1;
	for(var i=0;i<3;i++){
		if(cc[i].Fvalue<min){
			min=cc[i].Fvalue;
			index=i;
		}
	}
	
	g.recordText=JSON.stringify(cc)+"\n";
	if(cc[index].precision<cc[index].recall){
		//寻找标注了为index这个属性但是实际上为另外一个属性的句子
		for(var i=0;i<type.length;i++){
			if(type[i]==index&&aa[i][index]=='0'){
				var str=$("#s"+i).text();
				
				var classnum=aa[i];
		
				g.recordText=g.recordText+str+"\n"+"It is from "+type[i]+" to "+aa[i]+"\n";
		
			//判断是不是点错
				if(classnum==3){
					//首先确定是不是改变颜色
					classnum=3;
					classData[i][0]=2;
					classData[i][1]=2;
					classData[i][2]=2;
				}
			
				//还有一种原来就选对了的情况,另外加以判断 
				$.post($SCRIPT_ROOT+"/reclassifyit",{no:i,sentence:str,classtype:classnum},function(data,status){
			
					var dd=$.parseJSON(data);
							 
					 //refresh the classData
					dd.forEach(function(ele,i){
						if(ele<classData[i][classnum]){
							classData[i][classnum]=ele;
							saveData();	//把数据重新保存本地文件
							reDefineType();	//把 classData里面的数据写进  classtype里面
							drawCateColor();	//句子的颜色进行刷新,type属性改变
							drawCateGrids();
							//grid进行刷新
							vertifyData();
						}
					})
				
				
				})	
			break;
			}
			
		}
	}else{	//召回率
		for(var i=g.rTestProcess[index];i<type.length;i++){
			if(aa[i][index]=="1"&&type[i]!=index){
				var str=$("#s"+i).text();
				
				var classnum=index;
				console.log(str);
				g.recordText=g.recordText+str+"\n"+"It is from "+type[i]+" to "+aa[i][index]+"\n";
		
			//判断是不是点错
				if(classnum==3){
					//首先确定是不是改变颜色
					classnum=3;
					classData[i][0]=2;
					classData[i][1]=2;
					classData[i][2]=2;
				}

					
				//还有一种原来就选对了的情况,另外加以判断 
				$.post($SCRIPT_ROOT+"/reclassifyit",{no:i,sentence:str,classtype:index},function(data,status){
			
					var dd=$.parseJSON(data);
							 
					 //refresh the classDatat
					dd.forEach(function(ele,i){
						if(ele<classData[i][classnum]){
							classData[i][classnum]=ele;
							saveData();	//把数据重新保存本地文件
							reDefineType();	//把 classData里面的数据写进  classtype里面
							drawCateColor();	//句子的颜色进行刷新,type属性改变
							drawCateGrids();
							//grid进行刷新
							vertifyData();
						}
					})
				})	
				g.rTestProcess[index]=i;
				break;
			}
		}
	}
	
	
}