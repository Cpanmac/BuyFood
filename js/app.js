/**
 * 作者：running@vip.163.com
 * 时间：2015-10-24
 * 描述：app 核心框架
 */
var app = app || {};
(function() {

	app.Config = {};
	app.Config.contextPath = "BuyFood"; // 项目名
	app.Config.imgServerUrl = "."; // 资源路径
	app.Config.projectPath = "."; // 项目路径
	app.Config.isDebug = true;
	

	Date.prototype.format = function (format) {
	    var o = {
	        "M+": this.getMonth() + 1, //month
	        "d+": this.getDate(),    //day
	        "h+": this.getHours(),   //hour
	        "H+": this.getHours(),   //hour
	        "m+": this.getMinutes(), //minute
	        "s+": this.getSeconds(), //second
	        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
	        "S": this.getMilliseconds() //millisecond
	    };
	    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
	    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	    for (var k in o) if (new RegExp("(" + k + ")").test(format))
	        format = format.replace(RegExp.$1,
	        RegExp.$1.length == 1 ? o[k] :
	        ("00" + o[k]).substr(("" + o[k]).length));
	    return format;
	};
	
	
	if(juicer){
		//防止和java语法冲突
		juicer.set({
			'tag::operationOpen': '{@',
			'tag::operationClose': '}',
			'tag::interpolateOpen': '^{',
			'tag::interpolateClose': '}',
			'tag::noneencodeOpen': '^^{',
			'tag::noneencodeClose': '}',
			'tag::commentOpen': '{#',
			'tag::commentClose': '}'
		});
		//图片路径
		juicer.register("imgServerUrl", function(parm) {
			return /http:\/\//g.test(parm) ? parm : app.Config.imgServerUrl + parm;
		});
		//对象转json
		juicer.register("toJSON", function(parm) {
			return JSON.stringify(parm);
		});
		//传入毫秒,输出时间字符串;处理json字符串中的时间;若毫秒不传入,则返回当前时间
		juicer.register("convertTime", function(parm,format) {
			if(!format)format="yyyy-MM-dd hh:mm:ss";
			return (parm&&new Date(parm.time).format(format))||new Date().format(format);
		});
		
		/**
		 * @desc	 模板渲染
		 * @param {Object} templateId
		 * @param {Object} renderData
		 */
		app.renderById = function(templateId, renderData) {
			if (!templateId) {
				return "";
			}
			return juicer($("#" + templateId).html()).render(renderData);
		};
	}
	
	

	//重写ajax定义的方法，主要用于权限判断
	app.ajax = function(options) {
		app.showPreloader();
		var defaults = {
			type: "POST",
			dataType: "json",
			async: false,
			error: function(xhr, errorType, error) {
				console.info(xhr, errorType, error);
			},
			complete: function(xhr, status) {
				app.hidePreloader();
			},
		};
		$.extend(true, defaults, options);
		defaults.complete=function(xhr, status){
			app.hidePreloader();
			try {
				if(typeof options.complete=="function"){
					options.complete(xhr, status);
				}
			} catch (e) {
				if(console)console.error("complete回调方法出错");
			}
		};
		//解决hbuilder不支持post请求.json文件
		if (/\.json/g.test(options.url)) defaults.type = "GET";
		defaults.url = (/\http:\/\//g.test(options.url) ? defaults.url : app.Config.projectPath + defaults.url);
		$.ajax(defaults);
	};
	
	
	

	app.parseUrlQuery = function(url) {
		var query = {}, i, params, param;
		if (url.indexOf('?') >= 0)
			url = url.split('?')[1];
		else
			return query;
		params = url.split('&');
		for (i = 0; i < params.length; i++) {
			param = params[i].split('=');
			query[param[0]] = param[1];
		}
		return query;
	};

	//TODO: 显示页面预加载提示
	app.showPreloader = function(message) {
		if (!message) {
			message = "正在加载...";
		}
		if ($('.preloader-indicator-overlay, .preloader-indicator-modal').length > 0) {
			$('.preloader-indicator-overlay, .preloader-indicator-modal').remove();
		}
		$.showIndicator();
	};

	//TODO: 隐藏页面加载提示
	app.hidePreloader = function() {
		$.hideIndicator();
	};

	app.initEvent = function() {
		$(document).on("click", "a.back", function() {
			window.history.go(-2);
		});
	};
	
	$(".back").on("touchend",function(){
		history.go(-1);
	})

})();



/**
 * 购物车类
 */
function ShopCar() {
	//构造对象时先持久化
	var shopCar = this.get() || {};
	this.price = shopCar.price || 0.00; //购物车内商品总价格
	this.number = shopCar.number || 0; //总数量
	this.shoppingCartProductList = shopCar.shoppingCartProductList || [];
	if (!shopCar.number) {
		this.save(this);
	}
}

/**
 * 往购物车中添加商品
 * @param {CarProduct} carProduct
 */
ShopCar.prototype.add = function(carProduct) {
	//判断购物车里是否有该商品,若有则数量+1,若无则push
	var _index = this.contain(carProduct);
 	var product=this.shoppingCartProductList[_index];
	if (product) {
		//TODO 更改这里可支持一次性往购物车添加多件同类型商品
		product.number++;
		product.priceSubtotal =parseFloat( (product.number * product.productPrice).toFixed(2));
	} else {
		this.shoppingCartProductList.push(carProduct);
	}
	this.update(product);
	this.save();
	return this;
};
ShopCar.prototype.remove = function(carProduct,isEmpt) {
	var _index = this.contain(carProduct);
 	var product=this.shoppingCartProductList[_index];
	if(!product){
		throw new Error("不存在的商品,无法移除!");
	}
	
	if(isEmpt){
		this.shoppingCartProductList.splice(_index,1);
	}
	//判断购物车里该商品数量,等于1则从购物车内remove掉
	else if(product.number>1){
		//TODO 更改这里可支持一次性往购物车减少多件同类型商品，注意判断也要改
		product.number--;
		product.priceSubtotal =parseFloat(( product.number * product.productPrice).toFixed(2));
	}else if(product.number==1){
		this.shoppingCartProductList.splice(_index,1);
	}
	this.update(product);
	this.save();
	return this;
};

/**
 * 直接改变购物车中某类商品的数量
 * @param {CarProduct} carProduct
 */
ShopCar.prototype.change=function(carProduct){
	var _index = this.contain(carProduct);
 	var product=this.shoppingCartProductList[_index];
	if(!product){
		throw new Error("不存在的商品,无法更改数量!");
	}
	product.number=parseInt(carProduct.number);
	product.priceSubtotal =parseFloat( (product.number * product.productPrice).toFixed(2));
	this.update(product);
	this.save();
	return this;
	
};

/**
 * 根据productSerial属性判断该商品是否存在于购物车,不存在返回false,存在则返回该商品在购物车列表中的索引
 * @param {CarProduct} carProduct
 */
ShopCar.prototype.contain = function(carProduct) {
	var CartProductList = this.shoppingCartProductList;
	for (var i=0,l=CartProductList.length;i<l;i++) {
		if (CartProductList[i].productSerial === carProduct.productSerial&&CartProductList[i].productSpec===carProduct.productSpec) {
			return i;
		}
	}
	return false;
};
/**
 * 持久化购物车对象
 * @param {CarProduct} shopCar
 */
ShopCar.prototype.save = function(shopCar) {
	localStorage.setItem("shopCar", encodeURIComponent(JSON.stringify(shopCar || this)));
};

ShopCar.prototype.clear=function(){
	localStorage.clear("shopCar");
	
};

/**
 * 获取最新的持久化购物车对象
 */
ShopCar.prototype.get = function() {
	var item = decodeURIComponent(localStorage.getItem("shopCar"));
	return item && item !== "null" ? JSON.parse(item) : null;;
};
/**
 * 更新当前购物车商品,将传入的购物车对象更新到内存，同时计算购物车价格数量等(非持久化)
 * @param {CarProduct} carProduct
 */
ShopCar.prototype.update = function(carProduct) {
	var price = 0.00,
		num = 0;;
	for (var i = 0, l = this.shoppingCartProductList.length; i < l; i++) {
		if (carProduct&&this.shoppingCartProductList[i].productSerial === carProduct.productSerial&&this.shoppingCartProductList[i].productSpec===carProduct.productSpec) {
			this.shoppingCartProductList[i] = carProduct;
		}
		price += this.shoppingCartProductList[i].priceSubtotal;
		num += this.shoppingCartProductList[i].number;
	}
	//计算总价格和总数量
	this.price = parseFloat( price.toFixed(2));
	this.number = num;
	return this;
};

/***
 * 将本地存储的购物车对象转换为可和后台对接的购物车对象
 */
ShopCar.prototype.TOJSON=function(_data){
	 var data=_data||{};
	 for(var i = 0; i < this.shoppingCartProductList.length; i++){
			data["mobileShoppingCartBean.mobileShoppingCartProductList["+i+"].number"] = this.shoppingCartProductList[i].number;
			data["mobileShoppingCartBean.mobileShoppingCartProductList["+i+"].productSerial"] = this.shoppingCartProductList[i].productSerial;
			data["mobileShoppingCartBean.mobileShoppingCartProductList["+i+"].productName"] = this.shoppingCartProductList[i].productName;
			data["mobileShoppingCartBean.mobileShoppingCartProductList["+i+"].productSpec"] = this.shoppingCartProductList[i].productSpec;
			data["mobileShoppingCartBean.mobileShoppingCartProductList["+i+"].productPrice"] = this.shoppingCartProductList[i].productPrice;
			data["mobileShoppingCartBean.mobileShoppingCartProductList["+i+"].smallpic"] = this.shoppingCartProductList[i].smallpic;
		}
	return data;
};


/***
 * 与数据库同步购物车内商品数据
 * @param {Array} latestProductList
 */
ShopCar.prototype.sync=function(latestProductList){
	var currentProductList=this.shoppingCartProductList;//当前本地存储中的商品
	for(var i=0,cl=currentProductList.length;i<cl;i++){
		//currentProductList[i]
		for(var j=0,ll=latestProductList.length;j<ll;j++){
			//latestProductList[j]
			if(currentProductList[i].productSerial==latestProductList[j].productSerial&&currentProductList[i].productSpec==latestProductList[j].productSpec){
				//赋值是否过期信息
				currentProductList[i].valid=latestProductList[j].valid;
			}
		}
	}
	this.shoppingCartProductList=currentProductList;
	return this;
};
/**
 * 购物车内商品
 * @param {String} productSerial
 * @param {String} productName
 * @param {Number} productPrice
 * @param {String} productSpec
 * @param {String} brand
 * @param {String} smallpic
 * @param {String} productSaleType
 * @param {Number} number
 */
function CarProduct(productSerial, productName, productPrice, productSpec, brand, smallpic, productSaleType, number) {
	this.productSerial = productSerial+""; //id
	this.productName = productName; //名称
	this.productPrice = parseFloat(productPrice|| 0.00) ; //单价
	this.productSpec = productSpec; //规格
	this.brand = brand; //品牌
	this.smallpic = smallpic; //略缩图
	this.productSaleType = productSaleType; //产品类型
	this.number =parseInt(number||1) ; //商品数量
	this.priceSubtotal =parseFloat( (this.productPrice * this.number).toFixed(2)); //该商品总价格

}
