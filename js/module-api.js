var app = app || {};
(function(constant) {
	app.api = {};
	if(app.Config.isDebug){
		//前端调试模式
		app.api.query = app.Config.contextPath + "*.json"
		app.api={
				"queryMarketProduct":"/data/queryMarketProduct.json",
				"queryMarketProductType":"/data/queryMarketProductType.json",
				"productDetailBySerial":"/data/productDetailBySerial.json",
				"viewShoppingCart":"/data/viewShoppingCart.json",
				"generateMarketOrder":"/data/generateMarketOrder.json",
				"queryOrder":"/data/queryOrder.json",
				"queryOrderDetail":"/data/queryOrderDetail.json"
			}
	} else {
		
	}
})();