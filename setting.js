module.exports = {
	header : {
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
	},
	firstLink : "https://www.zhihu.com/question/34937418",
	ajaxLink : "https://www.zhihu.com/node/QuestionAnswerListV2",
	post_data_h : "method=next&params=%7B%22url_token%22%3A34937418%2C%22pagesize%22%3A20%2C%22offset%22%3A",
	post_data_f : "%7D&_xsrf=98360a2df02783902146dee374772e51",
	//  发送ajax间隔时间
	ajax_timeout : 5,
	//  下载图片速度
	download_v : 100
}