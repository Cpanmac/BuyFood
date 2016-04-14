/**
 * 作者：running@vip.163.com
 * 时间：2015-10-24
 * 描述：商品详情
 */
$(function() {
	"use strict";
	$(document).on("pageInit", "#tldl-dish-detail", function(e, id, page) {
		var parms = app.parseUrlQuery(location.href),
			disabled = false,
			carProduct, //购物车商品
			shopCar = new ShopCar(); //初始化购物车

		//更新右下角购物车种类数目小图标
		page.find("#shopcar-category-num").html(shopCar.shoppingCartProductList.length);


		//获取详情数据
		app.ajax({
			url: app.api["productDetailBySerial"],
			data: parms,
			success: function(result) {
				if (result.success) {
					//初始化购物车商品
					var product = result.data.productBean;
					carProduct = new CarProduct(product.serial, product.name, product.price, product.spec, product.brand, product.bigPic, product.productType, 1);
					
					page.find(".content").html(app.renderById("dish_detail_tpl", result.data));
				}
			}
		});
		
		//立即购买
		page.find("#directorder").on("click",function(){
			shopCar.add(carProduct);
			location.href="shopCar.html";;
		});
		
		//加入购物车
		page.find("#add_cart").on("click", function() {
			if (disabled) return;
			disabled = true;

			shopCar.add(carProduct);
			//更新右下角购物车种类数目
			page.find("#shopcar-category-num").html(shopCar.shoppingCartProductList.length);

			//显示加入成功
			page.find("#cart-success").show();
			setTimeout(function() {
				page.find("#cart-success").hide();
				disabled = false;
			}, 1500);
		});
	});
	$.init();
});