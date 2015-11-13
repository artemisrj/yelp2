(function($){
	$.fn.cloud2=function(eleArray,w){
		//console.log("before"+w.groupedWords.length)
		eleArray.sort(function(a,b){
			return b.weight-a.weight;
		})
		
		var weightGap=(eleArray[0].weight-eleArray[eleArray.length-1].weight);
		var checkedWords=[];//专门用来
		
		
		//console.log(weightGap);
		var deleteDom=function(array){
			array.forEach(function(value){
				if(value.tags==-1){
					if(typeof(value.html)=="undefined"){
						//console.log(value);
					}else{
						$("#"+value.html.id).parent().remove();
						var i=array.indexOf(value);
						array.splice(i,1);
					}
				}
			})
		}
		var adjustOverlapped=function(aid,bid){
				var a=$("#"+aid),b=$("#"+bid);

				var aleft=parseInt(a.attr("x"));
				var abotton=parseInt(a.attr("y"));
				var awidth=parseInt(a.css("width"));
				var aheight=parseInt(a.css("height"));
				
				var bleft=parseInt(b.attr("x"));
				var bbotton=parseInt(b.attr("y")); 
				var bwidth=parseInt(b.css("width"));
				var bheight=parseInt(b.css("height"));
				
				var acx=aleft+awidth/2;
				var acy=abotton-aheight/2;
				var bcx=bleft+bwidth/2;
				var bcy=bbotton-bheight/2;
				
				var disx=Math.abs(acx-bcx);
				var disy=Math.abs(acy-bcy);
				var tarw=(awidth+bwidth)/2;
				var tarh=(aheight+bheight)/2;
				
				if(disx<tarw&&disy<tarh){//覆盖的话return true 没有覆盖 return false 
					var dz=Math.sqrt(disx*disx+disy*disy);
					var rr=5;
					var dx=(acx-bcx)/dz*rr;
					var dy=(acy-bcy)/dz*rr;
					
					a.attr("x",aleft+dx).attr("y",abotton+dy);
					b.attr("x",bleft-dx).attr("y",bbotton-dy);
					
					//需要挪的位置			
					
					return true;
				}else{
					return false;
				}
		}
		
		var addOneWord=function(word,pos){
			//有个中心围绕着中心来
			
		}

		
		var overlapping = function(aid, bid) {
				var a=$("#"+aid),b=$("#"+bid);
				var aleft=parseInt(a.attr("x"));
				var abotton=parseInt(a.attr("y"));
				var awidth=parseInt(a.css("width"));
				var aheight=parseInt(a.css("height"));
			
				
				if(abotton-aheight<0){
					return true;
				}
				var bleft=parseInt(b.attr("x"));
				var bbotton=parseInt(b.attr("y")); 
				var bwidth=parseInt(b.css("width"));
				var bheight=parseInt(b.css("height"));
				
				var acx=aleft+awidth/2;
				var acy=abotton-aheight/2;
				var bcx=bleft+bwidth/2;
				var bcy=bbotton-bheight/2;
				
			  if (Math.abs(2.0*acx-2.0*bcx) < awidth + bwidth) {
				if (Math.abs(2.0*acy -2.0*bcy ) < aheight + bheight) {
					//overlap
				  return true;
				}
			  }
			  return false;
			};
		var hitTest = function(elemId, other_elemsId) {
			// Pairwise overlap detection
			var i = 0;
			// Check elements for overlap one by one, stop and return false as soon as an overlap is found
			for(i = 0; i < other_elemsId.length; i++) {
			  if (overlapping(elemId, other_elemsId[i])) {
				return true;
			  }
			}
			return false;
      };
		
		
		var wordsChange=function(array){
			array.forEach(function(value){
				if(value.tags==0){
					var weight=Math.round((value.weight-eleArray[eleArray.length-1].weight)/weightGap*9)+1;
					if(typeof(value.html)=="undefined"){
					
					}else{ 
						$("#"+value.html.id).css("font-size",weight*5);
						checkedWords.push(value.html.id);
					}
				}
			})
		}
		
		//delete dom nodes
		deleteDom(w.ungroupedWords);
		w.groupedWords.forEach(function(array){
			deleteDom(array);
		})
		
		//change the size of 
		wordsChange(w.ungroupedWords);
		w.groupedWords.forEach(function(array){
			wordsChange(array);
		})
		
		var tag=false;
		while(!tag){	//重新布局,如果
			tag=true;
			for(var i=0;i<checkedWords.length;i++){
				for(var j=i+1;j<checkedWords.length;j++){
					var aid=checkedWords[i];
					var bid=checkedWords[j];
					if(adjustOverlapped(aid,bid)){
						//挪开来，
						tag=false;
					}
				}
			}
		
		}
		
		w.groupedWords.forEach(function(ag){
			if(typeof(ag.pos)=="undefined"){
				//找一个空地形成组织
				
			}else{
				//console.log(ag.pos);
				ag.forEach(function(word){
					addOneWord(word,ag.pos);
				})
				//开始好好地围着中心点布局，
				
			}
		})
		
		//再进行ungrouped的进行
		
		
		//console.log("end"+w.groupedWords.length)
		return this;
	}

})(jQuery);