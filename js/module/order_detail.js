/**
 * 作者：running@vip.163.com
 * 时间：2015-10-24
 * 描述：订单详情
 */
$(function() {
	"use strict";

	$(document).on("pageInit", "#order-detail", function(e, id, page) {
		var _html="",
			parms = app.parseUrlQuery(location.href);
		app.ajax({
			url:app.api.queryOrderDetail+"?orderId="+parms.orderId,
			success:function(resule){
				//alert(JSON.stringify(resule));
				if(resule.success){
					if(resule.data.orderBean.orderState!="未支付")$(".bar.bar-tab").hide();
					_html=app.renderById("order_detail_tpl",resule.data);
				}
				
			}
			
		});
		$(page).find(".tabs").html(_html);
		
		//跳转到支付
		$("#toPay").on("click",function(){
			location.href = "paySuccess.html?orderNo="+$("#orderNo").attr("data-value");
			$(this).off("click");
		});
	});
	$.init();
});