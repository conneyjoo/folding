/*!
 * folding.js
 * 
 * @公式  N: N=L-1-I+L, P: P=L-1-|N-L|  (N:步骤数, L:长度, I:索引, P:位移下标)
 * @author Conney Joo
 * @version 1.0
 */
(function($) {
	var Folding = function(element, options) {
		this.element = $(element)
		this.children = this.element.children()
		this.items = []
		this.options = $.extend({}, $.fn.folding.defaults, options)
		this.maxWidth = $(document).width() - (this.children.length * 5)
		this.minWidth = this.options.minWidth
		
		this.initContainer()
	}

	Folding.prototype = {
		constructor: Folding,

		initContainer: function() {
			var els = this.children, el, options = this.options
			var i = 0, len = els.length, maxWidth = this.maxWidth, maxHeight = this.getMaxHeight(), scale = 0
			
			for (; i < len; i++) {
				el = $(els[i]).addClass(options.blockCls)
				scale = parseFloat(el.data('scale'))
				el.width(maxWidth * scale)
				el.height(maxHeight)
				
				this.items.push({
					element: el,
					width: maxWidth * scale,
					scale: scale
				})
			}
			
			if (len > 0)
				this.render()
		},
	
		render: function() {
			var items = this.items, item, el, options = this.options, btn
			
			for (var i = 0, len = items.length - 1; i < len; i++) {
				item = items[i]
				btn = $(options.buttonTemplate).appendTo(item.element)
				btn.data('index', i)
				btn.bind('click', this, this.onClick)
			}
		},
		
		onClick: function(e) {
			var el = $(this), index = el.data('index'), self = e.data, expandClass = self.options.expandClass, collapseClass = self.options.collapseClass
			
			if (el.hasClass(expandClass)) {
				el.removeClass(expandClass).addClass(collapseClass)
				self.expand(index)
			} else {
				el.removeClass(collapseClass).addClass(expandClass)
				self.collapse(index)
			}
		},
		
		expand: function(index) {
			var item = this.items[index], maxWidth = this.maxWidth, minWidth = this.minWidth
			var scale = this.getSpareScale() === 1 ? 1 : parseFloat(item.element.data('scale'))
		
			item.scale = scale
			item.element.animate({width: item.scale * this.maxWidth - 0.5}, 'slow', function() {
				item.element.children().each(function() {
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
					el.animate({width: (maxWidth * item.scale) - 0.5}, 'slow')
					return true
				} else  {
					return false
				}
			})
		},
		
		collapse: function(index) {
			var item = this.items[index], maxWidth = this.maxWidth, minWidth = this.minWidth
			var scale = item.scale
			
			item.scale = 0.0
			item.element.animate({width: item.scale}, 'slow', function() {
				item.element.children().each(function() {
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
					el.animate({width: (maxWidth * item.scale) - 0.5}, 'slow')
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
		
		fold: function(index, scale, op) {
			if (index < 0 || index > this.items.length - 1)
				return;
				
			var item = this.items[index], el = item.element
			
			if (el.width() >= this.options.minWidth) {
				el.animate({width: (this.maxWidth * (scale + item.scale)) - 0.5}, 'slow')
				item.scale = scale + item.scale
			} else {
				this.fold(index + op, scale, op)
			}
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
		buttonTemplate: '<a class="caret-collapse"></a>',
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