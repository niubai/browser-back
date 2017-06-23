# browser-back
移动端浏览器返回解决方案
## 核心代码

```$xslt
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
			if (+this.hData !== 1) { // 当前页面不为根页面，尝试回到来源页面
				window.history.go(hData - window.history.length);
			} else if (ua.indexOf('AladdinHybrid') !== -1 && ua.indexOf('PAEBank') !== -1) {
				alert('执行aladdin back');
			} else if (ua.indexOf('micromessenger') !== -1) {
				try { // 防止WeixinJSBridge未加载完成执行返回
					window.WeixinJSBridge.call('closeWindow');
				} catch (e) {
					document.addEventListener('WeixinJSBridgeReady', function () {
						window.WeixinJSBridge.call('closeWindow');
					}, false);
				}
			} else {
				// 为根页面，尝试执行浏览器返回，回到浏览器主页，部分手机无效
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
```
