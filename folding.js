/*!
 * folding.js
 * 
 * @each公式  N: N=L-1-I+L, P: P=L-1-|N-L|  (N:步骤数, L:长度, I:索引, P:位移下标)
 * @author Conney Joo
 * @version 1.0
 */
(function($) {
	var Folding = function(element, options) {
		this.element = $(element)
		this.children = this.element.children()
		this.items = []
		this.options = $.extend({}, $.fn.folding.defaults, options)
		this.totalSeparationWidth = this.children.length * this.options.separationWidth
		this.element.data('events', {})
				
		this.initBlock()
		
		this.totalWidth = $(this.element).width() - ($.browser.msie ? 0 : this.totalSeparationWidth)
		this.minWidth = this.options.minWidth
		this.widthDecimal = this.sumWidthDecimal()
		
		this.initContainer()
	}

	Folding.prototype = {
		constructor: Folding,

		initContainer: function() {
			var els = this.children, el, options = this.options
			var i = 0, len = els.length, totalWidth = this.totalWidth, maxHeight = this.getMaxHeight(), scale = 0, width = 0, separationWidth = this.options.separationWidth
			
			for (; i < len; i++) {
				el = els.eq(i)
				scale = parseFloat(el.data('scale'))
				width = totalWidth * scale
				
				if ($.browser.msie) {
					width = parseInt(width)
					width = el.hasClass('last') ? width + this.widthDecimal : width
							
					el.width(width)
					el.height(maxHeight)
					el.data('scale', width / totalWidth)
					this.items.push({element: el, width: width, scale: width / totalWidth, spareWidth: separationWidth})
				} else {
					el.width(width)
					el.height(maxHeight)
					this.items.push({element: el, width: width, scale: scale, spareWidth: 0})
				}
			}
			
			if (len > 0)
				this.render()
		},
		
		initBlock: function() {
			for (var i = 0, len = this.children.length; i < len; i++) {
				this.children.eq(i).addClass(this.options.blockCls).addClass(i === (len - 1) ? 'last' : '')
			}
		},
		
		render: function() {
			var items = this.items, item, el, options = this.options, btn
			
			for (var i = 0, len = items.length; i < len; i++) {
				item = items[i]
				btn = $(options.buttonTemplate).appendTo(item.element)
				btn.data('index', i)
				btn.bind('click', this, this.onClick)
			}
		},
		
		onClick: function(e) {
			var el = $(this), index = el.data('index'), self = e.data, expandClass = self.options.expandClass, collapseClass = self.options.collapseClass
			
			if (el.hasClass(expandClass)) {
				self.expand(index)
				el.removeClass(expandClass).addClass(collapseClass)
				
				if (self.isBind('expand'))
					self.element.trigger('expand', [self, this])
			} else {
				el.removeClass(collapseClass).addClass(expandClass)
				self.collapse(index)
				
				if (self.isBind('collapse'))
					self.element.trigger('collapse', [self, this])
			}
		},
		
		expand: function(index) {
			var item = this.items[index], totalWidth = this.totalWidth, minWidth = this.minWidth, flag = this.getSpareScale() === 1
			var scale = flag ? 1 : parseFloat(item.element.data('scale')), spareWidth = flag ? this.totalSeparationWidth : this.options.separationWidth, separationWidth = this.options.separationWidth
				
			item.scale = scale
			item.spareWidth = spareWidth
			item.element.animate({width: item.scale * this.totalWidth - (flag ? spareWidth - separationWidth : 0)}, 'slow', function() {
				item.element.css('overflow', '').children().each(function() {
					var el = $(this)
					if (!el.hasClass('caret-expand'))
						el.show()
				})
			})
			
			this.each(index, function(item, i) {
				if (i === index) return false
				
				var el = item.element
				if (el.width() >= minWidth && parseFloat(el.data('scale')) !== item.scale) {
					item.scale = item.scale - scale
					item.spareWidth = item.spareWidth - spareWidth
					el.animate({width: (totalWidth * item.scale) - ($.browser.msie ? item.spareWidth - separationWidth : 0)}, 'slow').css('overflow', '')
					return true
				} else  {
					return false
				}
			})
		},
		
		collapse: function(index) {
			var item = this.items[index], totalWidth = this.totalWidth, minWidth = this.minWidth
			var scale = item.scale, width = item.width, spareWidth = item.spareWidth, separationWidth = this.options.separationWidth
			var expandClass = this.options.expandClass, collapseClass = this.options.collapseClass
			
			item.scale = 0.0
			item.spareWidth = 0
			item.element.animate({width: 0}, 'slow', function() {
				item.element.css('overflow', '').children().each(function() {
					var el = $(this)
					if (!el.hasClass('caret-expand'))
						el.hide()
				})
			})
			
			this.each(index, function(item, i) {
				if (i === index) return false
				
				var el = item.element
				if (el.width() >= minWidth) {
					item.scale = item.scale + scale
					item.spareWidth = item.spareWidth + spareWidth
					el.animate({width: (totalWidth * item.scale) - ($.browser.msie ? item.spareWidth - separationWidth : 0)}, 'slow').css('overflow', '')
					return true
				} else  {
					return false
				}
			})
		},
		
		each: function(index, fn) {
			var len = this.items.length, n = (len - 1) - index + len, i = 0
			
			while (n > 0) {
				i = (len - 1) - Math.abs((n--) - len)
				if (fn(this.items[i], i))
					break
			}
		},
		
		sumWidthDecimal: function() {
			var widthDecimal = 0, width = 0
			var i = 0, len = this.children.length
			
			for (; i < len; i++) {
				width = parseFloat(this.children.eq(i).data('scale')) * this.totalWidth
				widthDecimal += width - parseInt(width)
			}
			
			return widthDecimal
		},
		
		getSpareScale: function() {
			var items = this.items, minWidth = this.minWidth
			var i = 0, len = items.length, scale = 1.0
			
			for (; i < len; i++) {
				if (items[i].element.width() >= minWidth) {
					scale -= parseFloat(items[i].element.data('scale'))
				}
			}
			
			return scale
		},
		
		getMaxHeight: function() {
			var children = this.children, maxHeight = 0
			
			for (var i = 0, len = children.length; i < len; i++) {
				maxHeight = Math.max($(children[i]).height(), maxHeight)
			}
			
			return maxHeight
		},
		
		on: function(eventName, handler) {
			this.element.bind(eventName, handler)
			this.element.data('events')[eventName] = true
		},
		
		isBind: function(eventName) {
			return this.element.data('events')[eventName]
		}
	}
	
	$.fn.folding = function(option) {
		var methodReturn
		
		var set = this.each(function () {
			var self = $(this), data = self.data('folding')
			var options = typeof option === 'object' && option
			options.params = options.params || {}
			
			if (!data) self.data('folding', (data = new Folding(this, options)))
			if (typeof option === 'string') methodReturn = data[option]()
		})
		return (methodReturn === undefined) ? set : methodReturn
	}
	
	$.fn.folding.defaults = {
		blockCls: 'folding-block',
		expandClass: 'caret-expand',
		collapseClass: 'caret-collapse',
		buttonTemplate: '<div class="caret-collapse"></div>',
		separationWidth: 5,
		minWidth: 2,
		gap: 0.5
	}
	
	$.fn.folding.Constructor = Folding
	
	$(function() {
		$(window).on('load', function() {
			$('.folding').each(function () {
				var el = $(this)
				if (el.data('folding')) return
				el.folding(el.data())
			})
		})
	})
})($)