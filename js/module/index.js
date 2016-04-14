/**
 * 作者：running@vip.163.com
 * 时间：2015-10-24
 * 描述：首页业务
 */
$(function() {
	"use strict";
	$(document).on("pageInit", "#tldl-index", function(e, id, page) {
		//初始化购物车
		var shopCar=new ShopCar();

		var queryProduct = function(data) {
			if($(".catergory .active").data("loadingOver")){
				return "";
			}
			var _html = "";
			app.ajax({
				url: app.api.queryMarketProduct,
				data: data,
				success: function(resp) {
					if (resp.success) {
						_html = app.renderById("vagetables_tpl", resp.data);
						if(resp.data.productList.length<10){
							$(".infinite-scroll-preloader").hide();
							page.find(".catergory .active").data("loadingOver",true);
							return;
						}
						
						$(".vagetables-ul").attr("pageSize",parseInt($(".vagetables-ul").attr("pageSize"))+1);
					}
				}
			});
			return _html;
		};
		
		var addItems = function (number, lastIndex) {
			// 生成新条目的HTML
			var _parm={
				"productQueryBean.currentPage":parseInt($(".vagetables-ul").attr("pageSize"))	
			};
			if(page.find(".catergory .active").data("id")!=="all"){
				_parm["productQueryBean.productType"]=page.find(".catergory .active").data("id");
			}
			var html = queryProduct(_parm);
			$('.infinite-scroll .vagetables-ul').append(html);
		};
		
		function addProduct(event,product) {
			
		    var offset = $('#toShopCar').offset(), flyer = $('<img class="u-flyer"  src="'+(/http:\/\//g.test(product.smallpic) ? product.smallpic : app.Config.imgServerUrl + product.smallpic)+'"/>');
		    flyer.fly({
		        start: {
		            left: event.pageX,
		            top: event.pageY
		        },
		        end: {
		            left: offset.left,
		            top: offset.top,
		            width: 20,
		            height: 20
		        },
		        onEnd:function(){
		        	$(".u-flyer").remove();
		        	$("#shopcar-category-num").text(shopCar.shoppingCartProductList.length);
		        }
		    });
		}
		
		var Events={
			loading:false,
			bindCatergory:function() {
				var _this = $(this),
					catergoryId = _this.data("id"),
					keyword=$("#search").val();
					$(".vagetables-ul").attr("pageSize",1);//页码变为1
				if(_this.hasClass("all")){
					catergoryId="";
					_this.parent().parent().find("li").removeClass("active");
				}else{
					page.find(".all").removeClass("active");
					_this.parent().children().removeClass("active");
				}
				_this.addClass("active");
				page.find(".catergory .active").data("loadingOver",false);
				var _html = queryProduct({
					"productQueryBean.currentPage": parseInt($(".vagetables-ul").attr("pageSize")),
					"productQueryBean.productType": catergoryId,
					"productQueryBean.searchKeywords":keyword||""
				});
				$(".vagetables-ul").html(_html);
				//返回顶部
				$('.content').scrollTop(0);
			},
			bindReturnTop:function() {
				if ($('.content').scrollTop() > 500 && $("#indexToTop").css("display") == "none") {
					$("#indexToTop").show();
				} else if ($('.content').scrollTop() <= 500) {
					$("#indexToTop").hide();
				};
			},
			bindInfinite:function() {
				// 如果正在加载，则退出
				if (Events.loading) return;
	
				// 设置flag
				Events.loading = true;
	
				// 模拟1s的加载过程
				setTimeout(function() {
					// 重置加载flag
					Events.loading = false;
	
					addItems();
					$.refreshScroller();
				}, 100);
			}
			
		};
		
		
		//加载生成分类列表
		app.ajax({
			url:app.api.queryMarketProductType,
			success:function(result){
				if(result.success){
					
					var _catergoryHtml=app.renderById("catergory_list_tpl",result.data);
					$(".catergory-wrap").html(_catergoryHtml);
				}
			}
			
		});
		
		
		
		//横向拉动
		var scroll_li = $(".catergory-list li");
		$(".catergory-wrap").css("width", (scroll_li.length * (scroll_li.width() + (parseFloat($("html").css("font-size"))*0.75))) + "px");
		setTimeout(function() {
			new IScroll($(".catergory-list")[0], {
				eventPassthrough: true,
				scrollX: true,
				scrollY: false,
				preventDefault: false
			});
			//点击分类
			$(".catergory").on("click", "li,.all",Events.bindCatergory);
		}, 16);
		
		//加载首页数据列表
		var firstHtml=queryProduct({
			"productQueryBean.currentPage":parseInt($(".vagetables-ul").attr("pageSize"))
		});
		$(".vagetables-ul").html(firstHtml);
		$("#shopcar-category-num").text(shopCar.shoppingCartProductList.length);

		//监听滚动,显示或者隐藏“返回顶部”
		$(".content").on('scroll',Events.bindReturnTop);
		
		//加入购物车
		$(page).on("click",".product-shopope-box",function(e){
			e.preventDefault();
			e.stopPropagation();
			var product=JSON.parse($(this).data("obj"));
			var carProduct = new CarProduct(product.serial, product.name, product.price, product.spec, product.brand, product.smallpic, product.productType, 1);
			shopCar.add(carProduct);
			addProduct(e,product);
			
		});
		
		//无限滚动
		$(page).on('infinite',Events.bindInfinite);
		
		$(".searchbar-cancel").on("click",function(){
			$(this).attr("cancle",true);
		});
		$("#search").on('focus',function(e){
			$(".searchbar-cancel").attr("cancle",false);
		});
		//搜索
		$("#search").on('blur',function(e){
			$(".searchbar-overlay").removeClass("searchbar-overlay-active");
			var keys=$(this).val();
			setTimeout(function(){
				if(eval($(".searchbar-cancel").attr("cancle")))return;
				$(".vagetables-ul").attr("pageSize",1);
				$(".catergory .active").data("loadingOver",false);
				var _html=queryProduct({
					"productQueryBean.currentPage":1,
					"productQueryBean.searchKeywords":keys
				});
				$(".vagetables-ul").html(_html);
				$('.content').scrollTop(0);
			},100);
			
		});
		//加遮罩
		$("#search").on('focus',function(e){
			$(".searchbar-overlay").addClass("searchbar-overlay-active");
		});
		//禁止遮罩touch
		$(".searchbar-overlay").on("touchstart",function(e){
			e.preventDefault();
		});

	});

	$.init();
});
/**兼容低版本安卓*/
(function () {
	  var lastTime = 0;
	  var vendors = ['webkit', 'moz'];
	  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
	    window.cancelAnimationFrame =
	      window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	  }

	  if (!window.requestAnimationFrame){
	    window.requestAnimationFrame = function (callback, element) {
	      var currTime = new Date().getTime();
	      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	      var id = window.setTimeout(function () {
	          callback(currTime + timeToCall);
	        },
	        timeToCall);
	      lastTime = currTime + timeToCall;
	      return id;
	    };
	  }
	  if (!window.cancelAnimationFrame){
	    window.cancelAnimationFrame = function (id) {
	      clearTimeout(id);
	    };
	  }
	}());