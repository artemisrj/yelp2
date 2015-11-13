/*!
 * jQCloud Plugin for jQuery
 
 *这个版本的主要是变成d3版本了
 *
 * Version 1.0.5
 *
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license.
 *
 * Date: 2013-05-09 18:54:22 +0200
*/

(function( $ ) {
  "use strict";
  
  $.fn.jQCloud = function(word_array, options) {
    // Reference to the container element
    var $this = this;
    // Namespace word ids to avoid collisions between multiple clouds
    var cloud_namespace = $this.attr('id') || Math.floor((Math.random()*1000000)).toString(36);
	
	var color1=["#A50026","#D73027","#F46D43","#FDAE61","#FEE08B","#FFFFBF","#D9EF8B","#A6D96A","#66BD63","#1A9850","#006837"];
	
	var color2=["#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"];
	
    // Default options value
    var default_options = {
      width: $this.width(),
      height: $this.height()-20,
      center: {
        x: ((options && options.width) ? options.width : $this.width()) / 2.0,
        y: ((options && options.height) ? options.height : $this.height()) / 2.0
      },
      delayedMode: word_array.length < 50,
      shape: false, // It defaults to elliptic shape
      encodeURI: true,
      removeOverflowing: true,
    };

	
    options = $.extend(default_options, options || {});
	
	var hightlightedwords=new Array();
	var clickgroups=new Array();

    // Add the "jqcloud" class to the container for easy CSS styling, set container width/height
    //$this.addClass("jqcloud").width(options.width).height(options.height);

    // Container's CSS position cannot be 'static'
    if ($this.css("position") === "static") {
      $this.css("position", "relative");
    }
	
	
	//start from here to draw word cloud 
    var drawWordCloud = function() {
		var svg=d3.select("#"+$this.attr("id")).append("svg").attr("width",$this.width()).attr("height",$this.height()).attr("id","wordcloudsvg");
	
      // Helper function to test if an element overlaps others
      var hitTest = function(elem, other_elems) {
        // Pairwise overlap detection
        var overlapping = function(a, b) {
			var aleft=parseInt(a.attr("x"));
			var abotton=parseInt(a.attr("y"));
			var awidth=parseInt(a.style("width"));
			var aheight=parseInt(a.style("height"));
			var bleft=parseInt(b.attr("x"));
			var bbotton=parseInt(b.attr("y")); 
			var bwidth=parseInt(b.style("width"));
			var bheight=parseInt(b.style("height"));
			
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
        var i = 0;
        // Check elements for overlap one by one, stop and return false as soon as an overlap is found
        for(i = 0; i < other_elems.length; i++) {
          if (overlapping(elem, other_elems[i])) {
            return true;
          }
        }
        return false;
      };

      // Make sure every weight is a number before sorting
      for (var i = 0; i < word_array.length; i++) {
        word_array[i].weight = parseFloat(word_array[i].weight, 10);
      }

      // Sort word_array from the word with the highest weight to the one with the lowest
      word_array.sort(function(a, b) { if (a.weight < b.weight) {return 1;} else if (a.weight > b.weight) {return -1;} else {return 0;} });

      var step = (options.shape === "rectangular") ? 18.0 : 2.0,
          already_placed_words = [],
          aspect_ratio = options.width / options.height;

      // Function to draw a word, by moving it in spiral until it finds a suitable empty place. This will be iterated on each word.
      var drawOneWord = function(index, word) {
        // Define the ID attribute of the span that will wrap the word, and the associated jQuery selector string
        var word_id = cloud_namespace + "_word_" + index,
            word_selector = "#" + word_id,
            angle = 6.28 * Math.random(),
            radius = 0.0,

            // Only used if option.shape == 'rectangular'
            steps_in_direction = 0.0,
            quarter_turns = 0.0,

            weight = 5,
            custom_class = "",
            inner_html = "",
            word_span;

        // Extend word html options with defaults
        word.html = $.extend(word.html, {id: word_id});

        // If custom class was specified, put them into a variable and remove it from html attrs, to avoid overwriting classes set by jQCloud
        if (word.html && word.html["class"]) {
          custom_class = word.html["class"];
          delete word.html["class"];
        }

        // Check if min(weight) > max(weight) otherwise use default
        if (word_array[0].weight > word_array[word_array.length - 1].weight) {
          // Linearly map the original weight to a discrete scale from 1 to 10
          weight = Math.round((word.weight - word_array[word_array.length - 1].weight) /
                              (word_array[0].weight - word_array[word_array.length - 1].weight) * 9.0) + 1;
        }
        //word_span = $('<text>').attr(word.html).addClass('w' + weight + " " + custom_class);
		//console.log(word.html);

		if(options.valueType=="score"){
			var colorScale = d3.scale.linear() // <-A
			.domain(d3.range(11))
			.range(color1);
			
			//console.log("score");
			var ccc=(word.score+1)/(2/11);	
			word.color=colorScale(parseInt(ccc));
		}else{
		//console.log("else");
			var countcolor=color2.length;
			var colorScale=d3.scale.linear()
				.domain(d3.range(countcolor))
				.range(color2);
			var pev=options.maxv/countcolor;
			var ccc=word.sentimentVariance/pev;
			word.color=colorScale(parseInt(ccc));
		}
		
		//增加clickedWords的交互
		
		if(word.text in globalYelp.wordcloud.clickedWords){
			globalYelp.wordcloud.clickedWords[word.text]=word.color;
			word.color="#5F9EA0";
		}
		
		word_span =svg.append("g").attr("class","wd").append("text").attr("class",'w' + weight + " " + custom_class).attr("id",word.html.id).attr("fill",word.color).style("font-size",weight*5);

        // Append link if word.url attribute was set
        if (word.link) {
          // If link is a string, then use it as the link href
          if (typeof word.link === "string") {
            word.link = {href: word.link};
          }

          // Extend link html options with defaults
          if ( options.encodeURI ) {
            word.link = $.extend(word.link, { href: encodeURI(word.link.href).replace(/'/g, "%27") });
          }

          inner_html = $('<a>').attr(word.link).text(word.text);
        } else {
          inner_html = word.text;
        }
		
		
        word_span.text(word.text);

        // Bind handlers to words
        // if (!!word.handlers) {
          // for (var prop in word.handlers) {
            // if (word.handlers.hasOwnProperty(prop) && typeof word.handlers[prop] === 'function') {
              // $(word_span).bind(prop, word.handlers[prop]);
            // }
          // }
        // }
		//***********************add my code***************************
		function RGBToHex(rgb){ 
		   var regexp = /[0-9]{0,3}/g;  
		   var re = rgb.match(regexp);//利用正则表达式去掉多余的部分，将rgb中的数字提取
		   var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];  
		   for (var i = 0; i < re.length; i++) {
				var r = null, c = re[i], l = c; 
				var hexAr = [];
				while (c > 16){  
					  r = c % 16;  
					  c = (c / 16) >> 0; 
					  hexAr.push(hex[r]);  
				 } hexAr.push(hex[c]);
				 if(l < 16&&l != ""){        
					 hexAr.push(0)
				 }
			   hexColor += hexAr.reverse().join(''); 
			}  
		   //alert(hexColor)  
		   return hexColor;  
		}
		
		//******************** my code ***************
		//when click the word,add events
		word_span.on("click",function(){
			
			
			var point=$(this);
			var spanWidth=$(this).width();
			var spanHeight=$(this).height();
			
			
			var wordsText=$(this).text();	
			//console.log(word_array);
			
			hightlightedwords[wordsText]=this;
			//console.log(hightlightedwords);
			
			//console.log(globalYelp.wordcloud.clickedWords.indexOf(wordsText))
			//console.log(typeof(globalYelp.wordcloud.clickedWords[wordsText]));
			if(typeof(globalYelp.wordcloud.clickedWords[wordsText])=="undefined"){
				globalYelp.wordcloud.clickedWords[wordsText]=$(this).css("fill");
				$(this).css("fill","#5F9EA0");
					$("."+wordsText).css("color","#5F9EA0");
				
			}else{
				$(this).css("fill",globalYelp.wordcloud.clickedWords[wordsText])
				delete globalYelp.wordcloud.clickedWords[wordsText];
				//console.log(globalYelp.wordcloud.clickedWords);
				$("."+wordsText).css('color','')
			
			}
		
			var drawCircle=function(point,spanWidth,spanHeight){	
				var newg={};
				var pp=point.position();
				
				function move(){
					var dx=d3.event.dx;
					var dy=d3.event.dy;
					//console.log(d3.event);
					
					var word=this.className.animVal.slice(1);
					
					clickgroups[word].x=clickgroups[word].x+dx;
					clickgroups[word].y=clickgroups[word].y+dy;
					
					d3.select(this)
						.attr("transform",function(d){
							return "translate("+(clickgroups[word].x)+","+clickgroups[word].y+")";
						})
			
				}
				
				
				
				var drag=d3.behavior.drag()
					.on("drag",move);
				
				var dataset=[3,4,5];
				var circleg=svg.append("g")
					.attr("class","g"+wordsText)
					.call(drag)
					.attr("transform",function(){return "translate("+(pp.left+spanWidth+10)+","+(pp.top+10)+")"});
					
				newg.g=circleg;
				newg.x=pp.left+spanWidth+10;
				newg.y=pp.top+10;
				console.log(hightlightedwords[wordsText]);
				clickgroups[wordsText]=newg;
				
				circleg.append("circle")
					.attr("r",spanHeight/2)
					.attr("cx",spanHeight/2)
					.attr("cy",spanHeight/2)
					.attr("fill","#ffffff")
					.attr("opacity",0.7);
					
				var pie=d3.layout.pie();	
				
				var innerRadius=spanHeight/5*3;
				var outerRadius=spanHeight/2;
				var arc=d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius);
					
				var arcs=circleg.selectAll("g.arc")
					.data(pie(dataset))
					.enter()
					.append("g")
					.attr("class","arc")
					.attr("transform","translate("+(spanHeight/2)+","+(spanHeight/2)+")");
					
				var color=d3.scale.category10();
				arcs.append("path")
					.attr("fill",function(d,i){
						return color(i);
					})
					.attr("d",arc);
			}
			//drawCircle(point,spanWidth,spanHeight);
					
			var positive=0;
			var negative=0;
			
			var changeBackGround=function(){
				//console.log(globalYelp.wordcloud.clickedWords.attributes.length)
				var cc=0;
				$(".sreview").css("display","none");
				$(".sentence").css("backgroundColor","")
				for( var key in globalYelp.wordcloud.clickedWords){
					console.log(key);
					$("."+key).parent().each(function(){
						//console.log("display");
						var senti=$(this).attr("sentiment");
						//console.log(senti.indexOf(","));
						$(this).parent().parent().css("display","block");
						//console.log($(this).parent().parent());
						$(this).css("display","block");
						var num=parseFloat(senti.slice(1,parseInt(senti.indexOf(','))));
						var sentencebgcolor;
						//console.log(num);
						if(num>0){
							sentencebgcolor="#fee08b";
						}else if(num<0){
							sentencebgcolor="#d9ef8b";
						}
						$(this).css("backgroundColor",sentencebgcolor);
					});
					cc=cc+1;
				}
				if(cc==0){
					$(".sreview").css("display","block");
				}
			};
				
			changeBackGround();	
	
			
			var wordsMove=function(){
			
				var words=[];
				var index;
				var clickWord=wordsText;
				var r;
		
				//get the every span elements info
				var cwords=svg.selectAll("text").each(function(){	
				
				});//end of cwords
		
		
		// spans.each(function(i){
			// var sword={};
			// sword.word=$(this).text();
			
			// sword.top=parseInt($(this).css("top"));
			// sword.left=parseInt($(this).css("left"));
			// sword.width=parseInt($(this).css("width"));
			// sword.height=parseInt($(this).css("height"));
			// sword.link=this;
			
			// if(clickWord==sword.word){
				// index=i;
				// r=sword.width;
			// }
			// words.push(sword);
		// });
		
		// var replaceWords=function(){
			// var wheight=$("#wordcloud").css("height");
			// var wwidth=$("#wordcloud").css("width");
			//console.log(wheight);
				//the function to judge two common element
			// var overlapping = function(a, b) { //两个普通元素的判断
				// var cx1=a.left+a.width/2; //center  x of a
				// var cx2=b.left+b.width/2; //center x of b
				// var cy1=a.top+a.height/2;
				// var cy2=b.top+b.height/2;
				// var sx,sy;
				
				// if(cx2>cx1){ //b in the right of a 
					// sx=1;
				// }else{
					// sx=-1;
				// }
				
				// if(cy2>cy1){ //b in the botton of a 
					// sy=1;
				// }else{
					// sy=-1;
				// }
				
				//if overlapping
				// var dx=2*Math.abs(cx1-cx2)-a.width-b.width;
				// if(dx<0){
					// var dy=2*Math.abs(cy1-cy2)-a.height-b.height;
					// if(dy<0) 
						// return [dx*0.1*sx,dy*0.1*sy];
				// }
				// return [0,0];
			// };
			
			//judge otherele with the indexele 
			// var farAway=function(indexele,otherele){
				// var cx=indexele.left+indexele.width/2;
				// var cy=indexele.top+indexele.height/2;
				
				// var ox=otherele.left+otherele.width/2;
				// var oy=otherele.top+indexele.height/2;
				
				// var judgepoint={};
				
				// var sx,sy;
				
				// if(cx<ox){//otherele in the right
					// judgepoint.x=otherele.left;
					// sx=1;
				// }else{
					// judgepoint.x=otherele.left+otherele.width;
					// sx=-1;
				// }
				
				// if(cy>oy){ //otherele in the top
					// judgepoint.y=otherele.top+otherele.height;
					// sy=-1;
				// }else{
					// judgepoint.y=otherele.top;
					// sy=1;
				// }
				// var diff=r*r-((judgepoint.x-cx)*(judgepoint.x-cx)+(judgepoint.y-cy)*(judgepoint.y-cy));
				// if(diff>0){//they have the same area
					// var vector=[r-Math.abs(judgepoint.x-cx),r-Math.abs(judgepoint.y-cy)];
					// return [(vector[0]*0.3+2)*sx,(vector[1]*0.3+2)*sy];
					
				// }else{
					// return [0,0];
				// }
			// }
			
			// var updateEle=function(word,xy){
				// word.top=word.top+xy[1];
				// word.left=word.left+xy[0];
				// if(word.top<0){
					// word.top=0;
				// }
				// if(word.left<0){
					// word.left=0;
				// }
				// if(word.top+word.height>wheight){
					// word.top=wheight-word.height;
				// }
				// if(word.left+word.width>wwidth){
					// word.left=wwidth-word.width;
				// } 
				// $(word.link).css("top",word.top+"px");
				// $(word.link).css("left",word.left+"px");
			// }
			
			// for(var i=0;i<words.length;i++){
				// for(var j=i+1;j<words.length;j++){
					// if(i==index){ //words move around clicked word
						// var xy=farAway(words[i],words[j]);
						// if(xy[0]==0&&xy[1]==0){
							// continue;
						// }
						// updateEle(words[j],xy)
						
					// }else if(j==index){//words move around clicked word
						// var xy=farAway(words[j],words[i]);
						// if(xy[0]==0&&xy[1]==0){
							// continue;
						// }
						// updateEle(words[i],xy);
					// }else{ //two common word don't over
						// var xy=overlapping(words[i],words[j]);
						// if(xy[0]==0&&xy[1]==0){
							// continue;
						// }
						// updateEle(words[i],xy);
						// xy[0]=-xy[0];
						// xy[1]=-xy[1];
						// updateEle(words[j],xy);
					// }
				// }
			// }	
		// }
		// var time=3000;
		// while(time--){
			// setTimeout(replaceWords,30);
		// }
		//replaceWords();
		// console.log(words);		
	// });
			}
			
			
			function sortReview(){
				var s1=function(a,b){
					var obj1=a.childNodes[2];
					var obj2=b.childNodes[2];
					var childNodes1=obj1.childNodes;
					var childNodes2=obj2.childNodes;
					//console.log(childNodes);
					
					var  calsenti=function(childNodes){
						var creviewscore=0;
						var cc=0;
						for(var i=0;i<childNodes.length;i++){  //ever sentence
							//console.log(childNodes[i]);
							var wc=childNodes[i].childNodes;
							for(var j=0;j<wc.length;j++){
								if(wc[j].className==" "+wordsText){
									var senti=$(wc[j]).parent().attr("sentiment");
									var num=parseFloat(senti.slice(1,parseInt(senti.indexOf(','))));
									creviewscore=creviewscore+num;
									cc=cc+1;
									break;
								}
							}
						}
						if(cc!=0){
							creviewscore=creviewscore/cc;
						}
						return creviewscore;
					}
					var v1=calsenti(childNodes1);
					var v2=calsenti(childNodes2);
					
					if(v1>v2){
						return 1;
					}else{
						return -1;
					}
				}	
			var sortit=$(".sreview").toArray().sort(s1);
			//console.log(sortit);
			$(".reviewContext").empty().append(sortit).scrollTop(0);
			$(".chart-title").text("reviews sorted by sentiment score");
		}
		
		sortReview();
		
		$(".triangle-topright").tipso({
			content:"click to tag readed"
		}).on("click",function(){
			//console.log("click");
			$(this).css("border-top-color","green");
			var index1=parseInt($(this).parent().attr("index"));
			 globalYelp.reviewEdit[index1].readIt=true;
		})
		
		}) ;
		
		//**************************************************************
       // $("#"+$this.attr("id")+" svg").append(word_span);

		//console.log(word_span.style("width"));
        var width = parseInt(word_span.style("width")),
            height = parseInt(word_span.style("height")),
            left = options.center.x - width / 2.0,
            top = options.center.y - height / 2.0;

        // Save a reference to the style property, for better performance
        
	
       // word_style.position = "absolute";
	   //console.log(width)
        word_span.attr("x",left);
        word_span.attr("y",top);

        while(hitTest(word_span, already_placed_words)) {
          // option shape is 'rectangular' so move the word in a rectangular spiral
          if (options.shape === "rectangular") {
            steps_in_direction++;
            if (steps_in_direction * step > (1 + Math.floor(quarter_turns / 2.0)) * step * ((quarter_turns % 4 % 2) === 0 ? 1 : aspect_ratio)) {
              steps_in_direction = 0.0;
              quarter_turns++;
            }
            switch(quarter_turns % 4) {
              case 1:
                left += step * aspect_ratio + Math.random() * 2.0;
                break;
              case 2:
                top -= step + Math.random() * 2.0;
                break;
              case 3:
                left -= step * aspect_ratio + Math.random() * 2.0;
                break;
              case 0:
                top += step + Math.random() * 2.0;
                break;
            }
          } else { // Default settings: elliptic spiral shape
            radius += step;
            angle += (index % 2 === 0 ? 1 : -1)*step;

            left = options.center.x - (width / 2.0) + (radius*Math.cos(angle)) * aspect_ratio;
            top = options.center.y + radius*Math.sin(angle) - (height / 2.0);
          }
          word_span.attr("x",left);
          word_span.attr("y",top);
        }

        // Don't render word if part of it would be outside the container
        if (options.removeOverflowing && (left < 0 || top < 0 || (left + width) > options.width || (top + height) > options.height)) {
          word_span.remove()
          return;
        }


        already_placed_words.push(word_span);

        // Invoke callback if existing
        if ($.isFunction(word.afterWordRender)) {
          word.afterWordRender.call(word_span);
        }
      };

      var drawOneWordDelayed = function(index) {
        index = index || 0;
        if (!$this.is(':visible')) { // if not visible then do not attempt to draw
          setTimeout(function(){drawOneWordDelayed(index);},10);
          return;
        }
        if (index < word_array.length) {
          drawOneWord(index, word_array[index]);
          setTimeout(function(){drawOneWordDelayed(index + 1);}, 10);
        } else {
          if ($.isFunction(options.afterCloudRender)) {
            options.afterCloudRender.call($this);
          }
        }
      };

      // Iterate drawOneWord on every word. The way the iteration is done depends on the drawing mode (delayedMode is true or false)
      if (options.delayedMode){
        drawOneWordDelayed();
      }
      else {
        $.each(word_array, drawOneWord);
        if ($.isFunction(options.afterCloudRender)) {
          options.afterCloudRender.call($this);
        }
      }
	   
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
	
		var g=svg.append("g")
			.attr("id","wdp")
			.attr("x",20);
		
		if(options.valueType=="score"){
			colorBar(g,color1,["Negative","Positive"]);
		}else{
			colorBar(g,color2,["Low","High"]);
		}
		
    };

	
    // Delay execution so that the browser can render the page before the computatively intensive word cloud drawing
	drawWordCloud();
	
	
    //setTimeout(function(){drawWordCloud();}, 1);
    return $this;
  };
})(jQuery);
