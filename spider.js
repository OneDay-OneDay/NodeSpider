let async = require("async");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");

let setting = require("./setting.js");

let fetch_data_get = require("./fetch.js").fetch_data_get;
let fetch_data_post = require("./fetch.js").fetch_data_post;

// 存储所有图片链接的数组
let photos=[  ];
let count = 0;

// 获取首屏所有图片链接
function getInitUrlList(){
	fetch_data_get( setting.firstLink, {  } )
		.then(( result ) => {
			let $ = cheerio.load( result.text );
			let answerList = $( ".zm-item-answer" );
			answerList.map(function( i, answer ){
				let images = $( answer ).find( '.zm-item-rich-text img' );
				images.map(function( i, image ){
					photos.push( $(image).attr( "src" ) );
				});
			});
			console.log( "已成功抓取" + photos.length + "张图片的链接" );
			getIAjaxUrlList( 20 );
		})
		.catch(( error ) => console.log( error ));
}

// 每隔300毫秒模拟发送ajax请求，并获取请求结果中所有的图片链接
function getIAjaxUrlList( offset ){
	fetch_data_post( setting.ajaxLink, setting.post_data_h + offset + setting.post_data_f, setting.header )
		.then(( result ) => {
			let response = JSON.parse( result.text );
			if( offset == 100 ) {
				// 把所有的数组元素拼接在一起
				let $ = cheerio.load( response.msg.join("") );
				let answerList = $( ".zm-item-answer" );
				answerList.map(function( i ,answer ){
					let images = $( answer ).find( '.zm-item-rich-text img' );
					images.map(function( i, image ){
						photos.push( $(image).attr("src") );
					});
				});
				setTimeout(function() {
					offset += 20;
					console.log( "已成功抓取 " + photos.length + " 张图片的链接" );
					getIAjaxUrlList( offset );
				}, setting.ajax_timeout)
			} else {
				console.log( "图片链接全部获取完毕，一共有" + photos.length + "条图片链接" );
				return downloadImg( setting.download_v );
			}
		})
		.catch(( error ) => console.log( error ));
}

function downloadImg( asyncNum ){
	// 有一些图片链接地址不完整没有“http:”头部,帮它们拼接完整
	for( let i=0; i<photos.length; i++ ){
		if( photos[i].indexOf( "http" ) == -1 ) {
			photos[i] = "http:" + photos[i]
		}
	};
	console.log( "即将异步并发下载图片，当前并发数为:" + asyncNum );
	async.mapLimit( photos, asyncNum, function( photo, callback ){
		fetch_data_get( photo, {  } )
			.then(( result ) => {
				let fileName = path.basename( photo );
				fs.writeFile( "./img/" + fileName, result.body, function( err ){
					if( err ) {
						console.log( err );
					} else {
						count ++;
						console.log( count + " done " );
						callback( null, fileName );
					}
				})
			})
			.catch(( error ) => console.log( error ))
	},function( err, result ){
		if( err ) {
			console.log( err );
		} else {
			console.log( " all right ! " );
			console.log( result );
		}
	})
}

getInitUrlList();
