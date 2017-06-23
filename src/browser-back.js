(function(global){
	/**
	 * 点击物理键返回拦截
	 * @param fun 点击物理键返回执行函数
	 */
	global.normalBrowserBack = function (fun) {
		if(Object.prototype.toString.call(fun) !== '[object Function]'){
			throw new Error('fun is not function');
		}
		history.pushState({}, '', '');
		setTimeout(function () { // 防止某些安卓手机初始化执行，导致页面无法跳转问题
			window.onpopstate = fun;
		}, 200);
		return fun;
	};
	/**
	 * 记录返回按钮来源，及注册返回事件
	 * @param indexName 页面名称，防止命名冲突
	 * @param fun 回调函数
	 */
	global.indexBrowserBack = function (indexName, fun) {
		let h = indexName +'History';
		let hData = window.sessionStorage.getItem(h);
		if (!hData) {
			hData = window.history.length;
			window.sessionStorage.setItem(h, hData);
		}
		let backFun = function () {
			let ua = window.navigator.userAgent.toLowerCase();
			if (ua.indexOf('AladdinHybrid') !== -1 && ua.indexOf('PAEBank') !== -1) {
				alert('执行aladdin back');
			} else if (ua.match(/MicroMessenger/i) === 'micromessenger') {
				try { // 防止WeixinJSBridge未加载完成执行返回
					window.WeixinJSBridge.call('closeWindow');
				} catch (e) {
					document.addEventListener('WeixinJSBridgeReady', function () {
						window.WeixinJSBridge.call('closeWindow');
					}, false);
				}
			} else {
				window.sessionStorage.removeItem(h);
				window.history.go(hData - window.history.length);
				setTimeout(() => {
					window.sessionStorage.setItem(h, hData);  // 防止用户继续浏览器页面再回来点击返回问题
					global.normalBrowserBack(fun || backFun);
					alert('您未正确设置入口链接，无法返回', '确定');
				}, 1000);
			}
		}
		global.normalBrowserBack(fun || backFun);
		return fun || backFun;

	}
})(window);