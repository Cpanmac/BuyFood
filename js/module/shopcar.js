/**
 * 作者：running@vip.163.com
 * 时间：2015-10-24
 * 描述：购物车
 */
$(function() {
	"use strict";
	$(document).on("pageInit", "#tldl-shop-car", function(e, id, page) {
		//读取本地存储数据
		var shopCar=new ShopCar();
		if(shopCar.shoppingCartProductList.length>0){
			// 验证购物车商品数据是否过期
			var _tempD=shopCar.TOJSON();
			//alert(JSON.stringify(_tempD));
			app.ajax({
				url:app.api.viewShoppingCart,
				data:_tempD,
				success:function(result){
					if(!result.success){
						$.toast(result.message);
					}
					shopCar.data=result.data;
					// 数据同步
					//alert(JSON.stringify(result.data.mobileShoppingCartBean.mobileShoppingCartProductList));
					shopCar.sync(result.data.mobileShoppingCartBean.mobileShoppingCartProductList);
					//alert(JSON.stringify(shopCar));
					
					
				}
			});
		}
		
		
		//渲染
		var _html=app.renderById("shop_car_tpl",shopCar);
		$(".content").append(_html);
		
		
		
		//对时间进行控制
		$("#datetime-picker").calendar({
			minDate:new Date().format("yyyy-MM-dd")
		});
		  
		//购物车减
		page.find(".mui-numbox-btn-minus").on("click",function(e){
			var _this=$(this),
			dataObj=_this.parent().dataset(),
			inputObj=_this.next();
			dataObj.count--;
			//更新购物车
			shopCar.remove(new CarProduct(dataObj.id,null,null,dataObj.productspec));
			page.find("#count-price").html(shopCar.price);
			//判断
			if(!dataObj.count){
				//将该商品从购物车cookie移除
				_this.parent().parent().parent().parent().remove();
				//如果购物车里什么都没有了，则显示购物车空空如也
				if(!page.find(".mui-numbox").length){
					$(".shopcar-list").remove();
					$("#emptyCart").show();
				}
				return;
			}
			inputObj.val(dataObj.count);
			_this.parent().attr("data-count",dataObj.count);
			
		});
		
		
		//购物车加
		page.find(".mui-numbox-btn-plus").on("click",function(e){
			var _this=$(this),
			dataObj=_this.parent().dataset(),
			inputObj=_this.prev();
			dataObj.count++;
			inputObj.val(dataObj.count);
			_this.parent().attr("data-count",dataObj.count);
			//更新购物车
			shopCar.add(new CarProduct(dataObj.id,null,null,dataObj.productspec));
			page.find("#count-price").html(shopCar.price);
		});
		
		//直接输入数量
		page.on("blur",".mui-numbox-input",function(){
			var _this=$(this),
				number=_this.val(),
				dataObj=_this.parent().dataset();
			
			if(!number&&!number.replace(/\s/g,"")){
				$.toast("数量超出范围~");
				$(this).val(1);
				number=1;
			}
			//只能输入正整数
			if(!/^[1-9]*[1-9][0-9]*$/.test(number)){
				$.toast("请输入正整数~");
				$(this).val(1);
				number=1;
			}
			_this.parent().attr("data-count",number);
			//更新购物车
			shopCar.change(new CarProduct(dataObj.id,null,null,dataObj.productspec,"","","",number));
			page.find("#count-price").html(shopCar.price);
			
		});
		
		page.find("#choice-ok").on("click",function(){
			
			var sendDate=$("#datetime-picker").val(),
				remark=$("#remark").val(),
				receiveMan=$("#receiveMan").val(),
				phone=$("#phone").val(),
				address=$("#address").val(),
				_this=$(this);
			if(_this.hasClass("disabled")){
				return;
			}
			if($("#shop_car_list li.valid").length>0){
				$.toast("请先移除购物车中有的失效商品");
				return;
			}
			
			if(!receiveMan){
				$.toast("请填写收货人~");
				$("#receiveMan").focus();
				return;
			}else if(!phone&&!/(^(\d{2,4}[-_－—]?)?\d{3,8}([-_－—]?\d{3,8})?([-_－—]?\d{1,7})?$)|(^0?1[35]\d{9}$)/.test(phone)){
				$.toast("请填写正确的联系电话~");
				$("#phone").focus();
				return;
			}else if(!address){
				$.toast("请填写收货地址~");
				return;
			}else if(!sendDate){
				$.toast("请选择配送日期~");
				return;
			} 
			
			_this.addClass("disabled");
			setTimeout(function(){
				var submitShopCar=new ShopCar();
				//客户信息字段
				var data={
						"customerOrderBean.receiveMan":receiveMan,
						"customerOrderBean.phone":phone,
						"customerOrderBean.address":address,
						"customerOrderBean.sendDate":sendDate,
						"customerOrderBean.memo":remark
				};
				//购物车字段
				data=submitShopCar.TOJSON(data);
				//提交订单
				app.ajax({
					url:app.api.generateMarketOrder,
					data:data,
					complete:function(){
						_this.removeClass("disabled");
					},
					success:function(result){
						if(result.success){
							shopCar.clear();
							$.toast("订单提交成功,2秒后跳转支付...");
							setTimeout(function(){
								location.href="paySuccess.html?orderNo="+result.data.orderBean.orderNo;
							},2000);
							
						}else{
							$.toast(result.message);
						}
					}
					
				});
				
			},500);
			
		});
		
		/**
		 * 移除该商品
		 */
		page.on("click",".del-image",function(){
			var _this=$(this),
				dataObj=_this.dataset();
			$.confirm("您确定要将\""+dataObj.productname+"\"从购物车移除吗?",function () {
				shopCar.remove(new CarProduct(dataObj.id,null,null,dataObj.productspec), true);
				//将该商品从购物车cookie移除
				_this.parent().remove();
				//如果购物车里什么都没有了，则显示购物车空空如也
				if(!page.find(".mui-numbox").length){
					$(".shopcar-list").remove();
					$("#emptyCart").show();
				}else{
					page.find("#count-price").html(shopCar.price);
				}
			});
		});
		
		
	});
	$.init();
});