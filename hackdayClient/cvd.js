var ctxNum = 0;

var cvd = function () {
				var output = '';  
				var that={};
				var oldFuncs;;
				
				var caller = function (prop) {
					return function () {
						var args = '',
							str = '';
						for (var i = 0; i < arguments.length; i++) {
							args += arguments[i];
							if (i !== arguments.length - 1) { args += ','; }
						}         
						str = 'ctx'+ctxNum+'.' + prop + '(' + args + ');';
						output += str + '\n';
						if(prop==='closePath') ctxNum++;
					};
				};
				
				that.overrideFuncs = function () {
					oldFuncs = {};
					for (var prop in CanvasRenderingContext2D.prototype) {         
						if (CanvasRenderingContext2D.prototype.hasOwnProperty(prop)) {
							try {                   
								var oldFunc = CanvasRenderingContext2D.prototype[prop];
								 if ((typeof oldFunc == 'function') &&  (prop !== 'createLinearGradient') &&  (prop !== 'createRadialGradient')) {                    
									oldFuncs[prop] = oldFunc;
									CanvasRenderingContext2D.prototype[prop] = caller(prop);
								}
							}
							catch (e) {}
						}
					}
				}    
				
				that.restoreFuncs = function() {
					for (var key in oldFuncs) {
						if(oldFuncs.hasOwnProperty(key) ){
							CanvasRenderingContext2D.prototype[key] = oldFuncs[key];
						}
					}
				}
				
				that.logCommand = function(command) {
					output += command  + ';\n';  
				}
				that.getOutput = function() {return output;}
				
				that.clearOutput = function() { output = '';};
				return that;
			}();