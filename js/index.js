;
(function() {
	var WIDTH = window.innerWidth,
		HEIGHT = window.innerHeight,
		COLORS = ['94C693','A49995','3E5871','01A3B0','64BD85','F79B9C','F8846B','F8846B','527384','E6A5BD','DEBC8C','73BD8C','D6B5BC','4B6ACE','42CF73','00ADCF','0094AE','009D8C','EAC14D','E6567A'],
		modal,
		ground;
		
	var Page = function(){
		this.isMove = false;
		this.init();
		this.bindEvent();
	}
	Page.prototype = {
		init: function(){
			this.node = $('.page');
			this.handler = [];
			this.handler.length = this.node.length;
			this.index = 0;
			this.node.each(function(n, item){
				if(n != 0){
					$(item).addClass('next').removeClass('hide')
				}
			})
		},
		get:function(ele){
			for(var i = 0; i< this.node.length; i++){
				var item = this.node[i];
				if(ele[0] === item){
					return i;
				}
			}
			return null;
		},
		set:function(n){
			var self = this;
			var index = self.index;
			if(n < index){
				self.node.eq(index).addClass('animate').css('transform', 'rotate(90deg)');
				self.node.eq(n).css('transform', 'rotate(-90deg)').addClass('animate').css('transform', 'rotate(0)')
			}else if( n > index){
				self.node.eq(index).addClass('animate').css('transform', 'rotate(-90deg)');
				self.node.eq(n).css('transform', 'rotate(90deg)').addClass('animate').css('transform', 'rotate(0)')
			}
			setTimeout(function(){
				self.node.eq(index).removeClass('animate');
				self.node.eq(n).removeClass('animate');
				self.emit(n, 'load');
				self.emit(index, 'unload');
				self.index = n;
				self.isMove = false;
			}, 350)
		},
		prev:function(){
			if(this.index == 0) return this.current();
			var n = this.index - 1
			this.set(n);
		},
		next:function(){
			if(this.index == this.node.length - 1) return this.current();
			var n = this.index + 1
			this.set(n)
		},
		current:function(){
			var self = this;
			this.node.eq(this.index).addClass('animate').css('transform', 'rotate(0)');
			setTimeout(function(){
				self.node.eq(self.index).removeClass('animate');
				self.isMove = false;
			}, 350)
		},
		on:function(index, type, fn){
			if(!this.handler[index]) this.handler[index] = {};
			if(!this.handler[index][type]) this.handler[index][type] = [];
			this.handler[index][type].push(fn);
		},
		once:function(index, type, fn){
			if(!this.handler[index]) this.handler[index] = {};
			if(!this.handler[index][type+'once']) this.handler[index][type+'once'] = [];
			this.handler[index][type+'once'].push(fn);
		},
		emit:function(index, type){
			if(!this.handler[index]) return;
			if(this.handler[index][type]){
				this.handler[index][type].forEach(function(item, index){
					item();
				})
			}
			if(this.handler[index][type+'once']){
				this.handler[index][type+'once'].forEach(function(item, index){
					console.log(item)
					item();
				})
				this.handler[index][type+'once'] = null;
			}
		},
		getCoord:function(e){
			var x, y;
			if(e.changedTouches) {
				return {
					x: e.changedTouches[0].clientX,
					y: e.changedTouches[0].clientY
				}
			}else{
				return {
					x: e.pageX,
					y: e.pageY
				}
			}
		},
		getDeg:function(start, end){
			var deg1 = Math.atan2( HEIGHT - start.y , start.x) / Math.PI * 180;
			var deg2 = Math.atan2( HEIGHT - end.y, end.x) / Math.PI * 180;
			return deg2- deg1;
		},
		bindEvent:function(){
			var self = this;
			var isDown = false;
			this.node.on('mousedown touchstart', function(e){
				if(isDown || self.isMove) return;
				isDown = true;
				self.isMove = true;
				e.stopPropagation();
				self.start = self.getCoord(e);
			})
			this.node.on('mousemove touchmove', function(e){
				if(!isDown || !self.isMove) return;
				e.stopPropagation();
				var cur = self.getCoord(e);
				var deg = self.getDeg(self.start, cur);
				self.node.eq(self.index).css('transform', 'rotate('+ -deg+'deg)');
			})
			$(document).on('mouseup touchend', function(e){
				if(!isDown || !self.isMove) return;
				isDown = false;
				e.stopPropagation();
				var end = self.getCoord(e);
				var deg = self.getDeg(self.start, end);
				if(deg < -10) {
					self.prev.call(self)
				} else if(deg > 10){
					self.next.call(self);
				}else{
					self.current.call(self)
				}
			})
		}
	};
	
	var page = new Page();
	page.once( page.get($('.page-data')), 'load', function(){
		typer($('.data-content'), 50); 
	})
	page.on( page.get($('.page-project')), 'load',  projectLoad);
	page.on( page.get($('.page-project')), 'unload', projectUnload);
	page.once( page.get($('.page-self')), 'load', function(){ 
		typer($('.self-content')); 
	})
	console.log(page.handler)
	
		
// canvas背景
	;(function() {
		var canvas = $('canvas')[0];
		var ctx = canvas.getContext('2d');

		var w = WIDTH;
		var h = HEIGHT;
		canvas.width = w;
		canvas.height = h;
		var g = ctx.createRadialGradient(w / 2, 2 * h, 0, w / 2, 2 * h, 2 * h);
		g.addColorStop(0, '#282C34')
		g.addColorStop(1, 'rgb(37,45,76)')
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h)

		var len = 500;
		var i = 0;
		var stars = [];

		for(; i < len; i++) {
			var deg = Math.random() * 2 * Math.PI;
			var r = Math.random() * h;
			var star = {
				x: Math.sin(deg) * r + (w / 2),
				y: Math.cos(deg) * r + h,
				s: Math.random() * 0.5 + 1,
				deg: deg,
				r: r
			}
			stars.push(star);
			drawstar(star.x, star.y, star.s);
		}
		animate();

		function drawstar(x, y, s) {
			ctx.save();
			ctx.translate(w / 2, h / 2)
			ctx.scale(s, s);
			ctx.translate(-w / 2, -h / 2)
			ctx.beginPath();
			ctx.moveTo(x, y - 5);
			ctx.lineTo(x + 1, y - 1);
			ctx.lineTo(x + 5, y);
			ctx.lineTo(x + 1, y + 1);
			ctx.lineTo(x, y + 5);
			ctx.lineTo(x - 1, y + 1);
			ctx.lineTo(x - 5, y);
			ctx.lineTo(x - 1, y - 1);

			ctx.fillStyle = 'rgba(255,255,255,.3)';

			ctx.fill();
			ctx.closePath();
			ctx.restore();
		}

		function animate() {
			window.requestAnimationFrame(animate);
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);

			for(i = 0; i < len; i++) {
				var star = stars[i];
				star.deg += 0.0005;
				star.x = Math.sin(star.deg) * star.r + (w / 2);
				star.y = Math.cos(star.deg) * star.r + h;
				drawstar(star.x, star.y, star.s);
			}
		}
		ground = {
			speedUp:function(){
				
			}
		}
	})();
//	添加modal
    ;(function() {
		var m = Snap('#modal');
		var mm = $('.modal-container');
		var $m = $(m.node);
		var Modal = function() {
			this.init();
			this.bindEvent();
			return this;
		}
		Modal.prototype = {
			init: function() {
				this.node = $m;
				this.modal = m.circle(WIDTH, 0, 0);
				this.modal.attr({
					fill: "rgba(0,0,0,.8)"
				})
			},
			open: function(target, type) {
				var self = this;
				this.type = type;
				this.target = target.clone();
				this.target.removeClass('J_alert')
				this.target.removeClass('J_alert2')
				
				switch (type) {
					case 'tipper' : 
						self.target.css({
							position:'fixed',
							left: this.target[0].dataset.left + 'px',
							top: this.target[0].dataset.top + 'px',
							width: this.target[0].dataset.width + 'px'
						})
						mm.html(this.target);
						
						mm.fadeIn(0, function(){
							mm.addClass('tipper');
							self.target.css({
								left: '10%',
								top: '70px',
								width: '80%'
							})
							self.target.find('.J_alert2_hide').slideDown()
						})
						$m.addClass('show');
						
						this.modal.animate({
							r: 1.5 * HEIGHT
						}, 600);
						break;
					default:
						this.target.removeClass('hide')
						mm.html(this.target);
						$m.addClass('show')
						this.modal.animate({
							r: 1.5 * HEIGHT
						}, 600, function(){
							mm.fadeIn();
						});
				}
			},
			close: function() {
				var target = this.target;
				switch (this.type){
					case 'tipper':
						mm.removeClass('tipper');
						target.css({
							width: target[0].dataset.width + 'px',
							left: target[0].dataset.left + 'px',
							top : target[0].dataset.top + 'px'
						})
						target.find('.J_alert2_hide').slideUp();
						setTimeout(function(){
							mm.fadeOut(0)
						},600)
						break;
					default:
						mm.fadeOut();
						
				}
				this.modal.animate({r: 0}, 600, function() {
					$m.removeClass('show');
				})
				
			},
			bindEvent: function() {
				var self = this;
				mm.on('click', function(event) {
					self.close.call(self);
				})
			}
		}
		modal = new Modal();
	})();
	
//	弹窗相关
	;(function(){
		var isModal = false;
		$(document).on('click', '.J_alert', function(e){
			e.stopPropagation();
			modal.open($(e.currentTarget).find('.J_alert_content'));
		})
		$(document).on('click', '.J_alert2',function(e){
			e.stopPropagation();
			var target = e.currentTarget;
			target.dataset.top = $(target).offset().top - $(document).scrollTop();
			target.dataset.left = $(target).offset().left;
			target.dataset.width = $(target).width();
			modal.open($(target), 'tipper')
		})
	})();

// 项目经验，粘性动画
	function projectLoad(){
		var projectContent = $('.project-content');
		var items = $('.project-item');
		items.each(function(index,item){
			setTimeout(function(){
				$(item).css({
					left: index % 2 * projectContent.width() / 2,
					top: index*30
				})
				item.dataset.left = index % 2 * projectContent.width() / 2;
				item.dataset.top = index * 30;
				$(item).addClass('show');
			}, Math.floor(Math.random() * 1000))
		})
		$('.random-color').each(function(index, item){
			$(item).css('background', '#' + COLORS[Math.floor(Math.random() * COLORS.length )])
		})
	}
	function projectUnload(){
		var items = $('.project-item');
		items.css({
			left:'50%',
			top: '370px'
		})
		items.removeClass('show')
	}
	
//	技能页
	;(function(){
		var s = Snap('#skill-menu-box');
		var bg = s.rect(0, 0, 60, 60, 30, 30);
		bg.attr({fill: 'rgba(0,0,0,0)'})
		var cur, isShow = false, background, curItem, left, top, ismove = false;
		
		$('.skill-menu-list').each(function(index,item){
			$(item).on('click',function(){
				left = $(item).position().left;
				top = $(item).position().top;
				curItem = item;
				if(isShow){
					close(function(){
						if(cur !== index) open(index)
					})
				}else{
					open(index)
				}
			})
		})
		
		function close(callback){
			if(ismove) return;
			ismove = true;
			isShow = false;
			$('.skill-menu').removeClass('open')
			$('.skill-content-list').eq(cur).slideUp(200, function(){
				bg.animate({
					x: 0,
					y: top,
					width:60,
					height:60,
					rx: 30,
					ry: 30
				}, 300, function(){
					ismove = false;
					callback()
				})
			})
		}
		function open(index){
			if(ismove) return;
			ismove = true;
			isShow = true;
			cur = index;
			$('.skill-menu').addClass('open')
			background = curItem.style.background
			bg.attr({fill: background, x: 0, y : top})
			
			bg.animate({
				x: 75,
				y: 0,
				width: WIDTH - 105,
				height: WIDTH - 105,
				rx: 5,
				ry: 5,
				fill: background
			}, 600, function(){
				$('.skill-content-list').eq(index).slideDown(600, function(){ ismove = false});
			})
		}
	})();
	
//	打字机效果
	function typer(ele ,time){
		var source = ele.html();
		ele.html('');
		ele.css('display', 'block')
		var cur = 0, len = source.length;
		time = time || 100
		output()
		
		function output(){
			setTimeout(function(){
				if(source[cur] == '<'){
					cur = source.indexOf('>', cur) + 1;
				}else{
					cur ++;
				}
				ele.html(source.substring(0, cur) + (cur < len-1 ? '_' : ''))
				if(cur < len - 1) output();
			}, time)
		}
	}
})()