/*
主要是选择了某一个分类的时候，
*/
function catebackground(){
	
	var cate=globalYelp.classData;	//这个变量存储[[1.2,1.4,2],[..]]]这样的每个句子的分类信息
	var type=globalYelp.classtype;	//
	
	//execute 
	reDefineType();
	drawCateColor();
	drawCateGrids();
	selectSentence();
	sentenceInteraction();
	vertifyData();
	
	$("#selectFood").on("click",function(){
		if(globalYelp.review.cateStatue[1]==1){
			globalYelp.review.cateStatue[1]=0;
		}else{
			globalYelp.review.cateStatue[1]=1;
		}
		selectSentence();
	})
	
	$("#selectService").on("click",function(){
		if(globalYelp.review.cateStatue[0]==1){
			globalYelp.review.cateStatue[0]=0;
		}else{
			globalYelp.review.cateStatue[0]=1;
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
	var cate=globalYelp.classData;	
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
		return -1;
	}
}

function drawCateColor(){
	var colorbar=["#d6dfb9","#f3d0c3","#a4d3ec","#fff"];
	var cate=globalYelp.classData;	
	cate.forEach(function(nums,i){
		var cc=judgecate(nums);
		var theid="s"+i;
		if(cc==-1){
			cc=3;
		}
		$("#"+theid).attr("type",cc).css("backgroundColor",colorbar[cc]);
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
		
		//var freview=globalYelp.review.falsePositiveReviews;
		//var fmatrix=globalYelp.review.falseReviewMatrix;
		
		maindiv.show();
		
		var tempcolor;
		
		str=str.replace("\n"," ");
		
		$(".types").on("click",function(){
			var classnum;
			
			if(this.innerText=="Food"){
				classnum=1;
			}else if(this.innerText=="Service"){
				classnum=0;
			}else if(this.innerText=="Ambience"){
				classnum=2;
			}else{
				//首先确定是不是改变颜色
				if(type[no]!=-1&&type[no]!=3){	//-1是未分类,3是已经确定过了
					var ptype=parseInt($(this).attr("type"));
		
					classnum=3;
					cate[no][0]=2;
					cate[no][1]=2;
					cate[no][2]=2;
					type[no]=3;	//3代表表示过的
					
					saveData();
				
					//保存句子 
					// freview.push(str);
					// var ll=freview.length;
					// fmatrix[ll-1]=new Array();
					
					if(ll>1){
						$.post($SCRIPT_ROOT+"/dealFalseReviews",{reviews:JSON.stringify(freview)},function(data,status){
						//console.log(data);
							var aa=$.parseJSON(data);
							fmatrix[ll-1]=aa;
							for(var i=0;i<aa.length;i++){
								if(aa[i]<1){								
									//计算这个句子和已经有的句子的相似性
									var tt=$("span[type='"+ptype+"']")
									var ss=new Array();
									for(var j=0;j<tt.length;j++){
										ss.push(tt[j].innerText.replace("\n",' '))
									}
									$.post($SCRIPT_ROOT+"/falseSimilarReview",{sentences:JSON.stringify(ss),review:str},function(data,status){
										console.log(data);
									})
								}
							}
						})
					}
				
					$("#s"+no).css("backgroundColor",'#fff');
					$(this).attr("type",3);
					//颜色和type一起变
					 
					$(".classInteraction").hide();
					//重新更新wordcloud
					var cloudType=globalYelp.wordcloud.cloudType;
					if(cloudType!=-1){
						cateWordcloud(cloudType);
					}
				}
			}
			if(classnum!=3){
				
				//还有一种原来就选对了的情况,另外加以判断 
				if(globalYelp.classtype[no]!=classnum){
					$.post($SCRIPT_ROOT+"/reclassifyit",{no:no,sentence:str,classtype:classnum},function(data,status){
				
					$(".classInteraction").hide();
					var dd=$.parseJSON(data);
					var classData=globalYelp.classData;
					// var filterdData=[];
					// console.log(dd);
					// var nn=dd.length;
					// for(var i=0;i<nn;i++){
						// if(dd[i]<globalYelp.threshold){
							// var tempa=[];
							// tempa.push(i);
							// tempa.push(dd[i]);
							// filterdData.push(tempa);
						// }
					// }

					 
					
					 //refresh the classData
					dd.forEach(function(ele,i){
						if(ele<classData[i][classnum]){
							classData[i][classnum]=ele;
						}
					})
					
					saveData();	//把数据重新保存本地文件
					
					reDefineType();	//把 classData里面的数据写进  classtype里面
					drawCateColor();	//句子的颜色进行刷新
					drawCateGrids();
					//grid进行刷新
				
					})
				}else{
					console.log("correct classify");
				}
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
	$(".classInteraction").hide();
}

function vertifyData(){
	$.post($SCRIPT_ROOT+"/vertifyData",{data:" "},function(data,status){
		var Count=new Array(4);
		for(var i=0;i<4;i++){
			Count[i]={};
			Count[i].TP=0;
			Count[i].FP=0;
			Count[i].FN=0;
			Count[i].precision;
			Count[i].recall;
		}
		var cc=globalYelp.tempType;
		var aa=$.parseJSON(data);
		for(var i=0;i<aa.length;i++){
			if(aa[i][0]=="1"){
				cc[i]=1;	//food
			}else if(aa[i][1]=="1"){	//SERVICE
				cc[i]=0;
			}else if(aa[i][2]=="1"){
				cc[i]=2;
			}else{
				cc[i]=3;
			}
		}
		
		
		var type=globalYelp.classtype;
		for(var i=0;i<aa.length;i++){
			if(type[i]==0&&aa[i][1]=="1"){//service  true positive
				Count[0].TP=Count[0].TP+1;
			}
			if(type[i]==0&&aa[i][1]=="0"){	//service false positive 
				Count[0].FP=Count[0].FP+1;
			}
			if(type[i]!=0&&aa[i][1]=="1"){
				Count[0].FN=Count[0].FN+1;
			}
			
			if(type[i]==1&&aa[i][0]=="1"){	//food true positive
				Count[1].TP=Count[1].TP+1;
			}
			if(type[i]==1&&aa[i][0]=="0"){
				Count[1].FP=Count[1].FP+1;
			}
			if(type[i]!=1&&aa[i][0]=="1"){
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
		for(var i=0;i<3;i++){
			Count[i].precision=Count[i].TP/(Count[i].TP+Count[i].FP);
			Count[i].recall=Count[i].TP/(Count[i].TP+Count[i].FN);
		}
		
		console.log("The service precision is "+Count[0].precision);
		console.log("The service recall is "+Count[0].recall);
		console.log("F value is "+2*Count[0].precision*Count[0].recall/(Count[0].precision+Count[0].recall));
		console.log("The food precision is "+Count[1].precision);
		console.log("The food recall is "+ Count[1].recall);
		console.log("F value is "+2*Count[1].precision*Count[1].recall/(Count[1].precision+Count[1].recall));
		console.log("The ambiance precision is "+Count[2].precision);
		console.log("The ambiance recall is "+Count[2].recall);
		console.log("F value is "+2*Count[2].precision*Count[2].recall/(Count[2].precision+Count[2].recall));
		//drawCateGrids(cc);
	})
}