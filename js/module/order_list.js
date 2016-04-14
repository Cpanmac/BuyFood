/**
 * 作者：running@vip.163.com
 * 时间：2015-10-24
 * 描述：订单列表
 */
$(function() {
	"use strict";
	$(document).on("pageInit", "#tldl-order-list", function(e, id, page) {
		 
		 var queryOrder = function() {
			 if(page.find(".infinite-scroll .tab.active").data("loadingOver")){
					return "";
				}
			 $(".infinite-scroll-preloader").show();
			var _html = "";
			var tab=$('.infinite-scroll .tab.active'),
					pageSize=tab.data("pageSize")||1,
					orderStatus=tab.data("status");
					
			// ajax获取数据
			app.ajax({
				url: app.api.queryOrder,
				data: {
					"orderQueryBean.currentPage":pageSize,
		      		"orderQueryBean.orderState":orderStatus
				},
				success: function(resp) {
					if (resp.success) {
						_html = app.renderById("order_list_tpl", resp.data);
						var tab=$('.infinite-scroll .tab.active');
						$('.infinite-scroll .tab.active').data("pageSize",(tab.data("pageSize")||1)+1);
						if(resp.data.orderList.length<10){
							$(".infinite-scroll-preloader").hide();
							page.find(".infinite-scroll .tab.active").data("loadingOver",true);
							return;
						}
					}else{
						$.toast(resp.message||resp.exceptionMessage);
					}
				}
			});
			return _html;
		};
		 
		 //无限下拉
		var addItems=function(number, lastIndex) {
	      // 生成新条目的HTML
	      var html = queryOrder();
	      // 拼接到被激活的tab
	      $('.infinite-scroll .tab.active .order-list-ul').append(html);
	    };
		 
		 //加载首页数据
		 var firstHtml=queryOrder();
		 $(".tab.active").find(".order-list-ul").html(firstHtml);
		 
		//监听滚动,显示或者隐藏“返回顶部”
		$(".content").on('scroll', function() {
			if ($('.content').scrollTop()>500 && $("#indexToTop").css("display") == "none") {
				$("#indexToTop").show();
			}else if($('.content').scrollTop()<=500){
				$("#indexToTop").hide();
			}
		});
		
		
	    var loading = false;
	    $(page).on('infinite', function() {
	
	      // 如果正在加载，则退出
	      if (loading) return;
	
	      // 设置flag
	      loading = true;
	
	      // 模拟1s的加载过程
	      setTimeout(function() {
	        // 重置加载flag
	        loading = false;
	
	        addItems();
	        $.refreshScroller();
	      }, 1000);
	    });
		
		$(page).find(".tab-link").on("click",function(){
			setTimeout(function(){
				if(!$('.infinite-scroll .tab.active').data("isClicked")){
					if($('.infinite-scroll .tab.active').attr("id")==="order-all")return;
					// 拼接到被激活的tab
			      	$('.infinite-scroll .tab.active .order-list-ul').append(queryOrder());
			      	$('.infinite-scroll .tab.active').data("isClicked",true);
				}
				
			},1);
		});
	});
	
	$.init();
});