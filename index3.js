var request=require("superagent");
var cheerio=require("cheerio");
var async=require("async");
var path=require("path");
var fs=require("fs");

var config={
	"Accept" : "*/*",
	"Accept-Encoding" : "gzip, deflate, br",
	"Accept-Language" : "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
	"Connection" : "keep-alive",
	"Content-Length" : "132",
	"Content-Type" : "application/x-www-form-urlencoded; charset=UTF-8",
	"Host" : "www.zhihu.com",
	"Referer" : "https://www.zhihu.com/question/34937418",
	"User-Agent" : "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:44.0) Gecko/20100101 Firefox/44.0",
	"X-Requested-With" : "XMLHttpRequest"
};
var photos=[];/*存储所有图片链接的数组*/

/*获取首屏所有图片链接*/
var getInitUrlList=function(){
	request.get("https://www.zhihu.com/question/34937418")
			.end(function(err,res){
				if(err){
					console.log(err);
				}else{
					var $=cheerio.load(res.text);
					var answerList=$(".zm-item-answer");
					answerList.map(function(i,answer){
						var images=$(answer).find('.zm-item-rich-text img');
						images.map(function(i,image){
							photos.push($(image).attr("src"));
						});
					});
					console.log("已成功抓取"+photos.length+"张图片的链接");
					getIAjaxUrlList(20);
				}
			});
}

/*每隔300毫秒模拟发送ajax请求，并获取请求结果中所有的图片链接*/
var getIAjaxUrlList=function(offset){
	request.post("https://www.zhihu.com/node/QuestionAnswerListV2")
			.set(config)
				.send("method=next&params=%7B%22url_token%22%3A34937418%2C%22pagesize%22%3A20%2C%22offset%22%3A" +offset+ "%7D&_xsrf=98360a2df02783902146dee374772e51")
					.end(function(err,res){
						if(err){
							console.log(err);
						}else{
							var response=JSON.parse(res.text);/*想用json的话对json序列化即可，提交json的话需要对json进行反序列化*/
							if(response.msg&&response.msg.length){
								var $=cheerio.load(response.msg.join(""));/*把所有的数组元素拼接在一起，以空白符分隔*/
								var answerList=$(".zm-item-answer");
								answerList.map(function(i,answer){
									var images=$(answer).find('.zm-item-rich-text img');
									images.map(function(i,image){
										photos.push($(image).attr("src"));
									});
								});
								setTimeout(function(){
									offset+=20;
									console.log("已成功抓取"+photos.length+"张图片的链接");
									getIAjaxUrlList(offset);
								},300);
							}else{
								console.log("图片链接全部获取完毕，一共有"+photos.length+"条图片链接");
								// console.log(photos);
								return downloadImg(50);
							}
						}
					});
}

var requestAndwrite=function(url,callback){
	request.get(url).end(function(err,res){
		if(err){
			console.log(err);
			console.log("有一张图片请求失败啦...");
		}else{
			var fileName=path.basename(url);
			fs.writeFile("./img/"+fileName,res.body,function(err){
				if(err){
					console.log(err);
					console.log("有一张图片写入失败啦...");
				}else{
					callback(null,"successful !");
					/*callback貌似必须调用，第二个参数为下一个回调函数的result参数*/
				}
			});
		}
	});
}

var downloadImg=function(asyncNum){
	/*有一些图片链接地址不完整没有“http:”头部,帮它们拼接完整*/
	for(var i=0;i<photos.length;i++){
		if(photos[i].indexOf("http")===-1){
			photos[i]="http:"+photos[i];
		}
	}
	console.log("即将异步并发下载图片，当前并发数为:"+asyncNum);
	async.mapLimit(photos,asyncNum,function(photo,callback){
		requestAndwrite(photo,callback);
	},function(err,result){
		if(err){
			console.log(err);
		}else{
			console.log(result);
		}
	});

};

getInitUrlList();