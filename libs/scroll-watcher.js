(function () {

    // Simplify jquery easing functions into two arugments, a single floating
    // point value beetween 0 and 1 and the jquery easing function. Return an 
    // adjusted float between 0 and 1;

    var easeFloat = function (v, easefunc) {
        return easefunc(v, v, 0, 1, 1);
    };



    var ScrollWatcher = function () {

        this.$window = $(window);
        this.$window.on('scroll', $.proxy(this.onScroll, this));
        this.$window.on('resize', $.proxy(this.onResize, this));
        this.watchers = [];

        this.refreshOnFrame = true;
        this.onFrame();
    };

    var propertiesToTransformString = function (css) {

        var transform = '';

        if (css.x || css.y || css.z) {
            transform += 'translate3D(' + (css.x ? css.x : 0) + 'px, ' + (css.y ? css.y : 0) + 'px, ' + (css.z ? css.z : 0) + 'px)';
        }

        if (css.scale) {
            transform += ' scale(' + css.scale + ')';
        }

        if (css.rotate) {
            transform += ' rotate(' + css.rotate + ')';
        }

        return transform;

    };

    var watchDefaults = {

        // a jquery elment that can be used to derive the scroll location values
        $el: null,

        // alterntaive, an object can be provided and it must have the properties
        // scrollStart and scrollEnd relative to the document
        obj: null,

        // values (0 to 1 as top to bottom) that let you redefine the area monitored as
        // the viewport (e.g. values of 0.5 for both would only watch a single point in 
        // the middle of the screen)        
        viewportTop: 0,
        viewportBottom: 1,

        // events that are fired as the element is scrolled into, out of and inside
        // of the viewpoert
        onScroll: null,
        onScrollInViewport: null,
        onEnterViewport: null,
        onExitViewport: null,
        onEnterOrExitViewport: null,

        // tween
        $tween: null,
        tweenFrom: null,
        tweenTo: null,
        ease: $.easing.linear

    };

    ScrollWatcher.prototype.watch = function (options) {

        var watcher = $.extend({}, watchDefaults, options);

        watcher.needsLocationUpdate = true;

        watcher.isInViewport = false;
        watcher.wasInViewport = false;

        if (watcher.$tween && watcher.tweenFrom && watcher.tweenTo) {

            watcher.tweenCurrent = {};

            for (var key in watcher.tweenFrom) {
                if (watcher.tweenTo.hasOwnProperty(key)) {
                    watcher.tweenCurrent[key] = watcher.tweenFrom[key];
                }
            }
        }

        this.watchers.push(watcher);
        this.updateElementLocations();
    };

    ScrollWatcher.prototype.updateElementLocations = function (forceAll) {

        var viewportHeight = this.$window.height();

        $.each(this.watchers, $.proxy(function (idx, watcher) {
            if (forceAll || watcher.needsLocationUpdate) {

                if (watcher.$el) {

                    // derive from the element
                    watcher.elementTop = Math.round(watcher.$el.offset().top);
                    watcher.elementHeight = Math.round(watcher.$el.height());
                    watcher.elementBottom = Math.round(watcher.elementTop + watcher.elementHeight);

                    // start when the top of the element is at the bottom of the viewport            
                    watcher.scrollStart = watcher.elementTop - (viewportHeight * watcher.viewportBottom);

                    // when the bottom of the element is at the top of the viewport
                    watcher.scrollEnd = watcher.elementBottom - (viewportHeight * watcher.viewportTop);

                }
                else if (watcher.obj) {
                    watcher.scrollStart = watcher.obj.scrollStart;
                    watcher.scrollEnd = watcher.obj.scrollEnd;
                }
            }
        }, this));

        this.refreshOnFrame = true;
    };

    ScrollWatcher.prototype.onResize = function () {
        this.updateElementLocations(true);
    };

    ScrollWatcher.prototype.onScroll = function () {
        this.refreshOnFrame = true;
    };

    ScrollWatcher.prototype.onFrame = function () {

        if (this.refreshOnFrame) {

            var scrollTop = this.$window.scrollTop();

            var i = this.watchers.length;
            while (i--) {

                var w = this.watchers[i];

                w.lastScrollTop = w.scrollTop ? w.scrollTop : scrollTop;
                w.scrollTop = scrollTop;
                w.scrollDelta = w.scrollTop - w.lastScrollTop;

                w.actualProgress = (scrollTop - w.scrollStart) / (w.scrollEnd - w.scrollStart);
                w.progress = Math.max(0, Math.min(1, w.actualProgress));

                w.wasInViewport = w.isInViewport;
                w.wasFullyInViewport = w.isFullyInViewport;

                w.isAboveViewport = w.actualProgress > 1;
                w.isBelowViewport = w.actualProgress < 0;
                w.isInViewport = !w.isAboveViewport && !w.isBelowViewport;

                // scroll 
                if (w.onScroll) {
                    w.onScroll(w);
                }

                // enter
                if (!w.wasInViewport && w.isInViewport && w.onEnterViewport) {
                    w.onEnterViewport(w);
                }

                // exit
                if (w.wasInViewport && !w.isInViewport && w.onExitViewport) {
                    w.onExitViewport(w);
                }

                // enter or exit
                if (w.onEnterOrExitViewport && ((!w.wasInViewport && w.isInViewport) || (w.wasInViewport && !w.isInViewport))) {
                    w.onEnterOrExitViewport(w);
                }

                // scroll in viewport
                if (w.isInViewport && w.onScrollInViewport) {
                    w.onScrollInViewport(w);
                }

                if (w.tweenCurrent) {

                    w.tweenProgress = w.ease ? easeFloat(w.progress, w.ease) : w.progress;

                    for (var key in w.tweenCurrent) {

                        if (key != 'transform') {
                            w.tweenCurrent[key] = w.tweenFrom[key] + (w.tweenProgress * (w.tweenTo[key] - w.tweenFrom[key]));
                        }
                    }

                    w.tweenCurrent.transform = propertiesToTransformString(w.tweenCurrent);
                    w.$tween.css(w.tweenCurrent);
                }
            }

            this.refreshOnFrame = false;

        }

        if (!this.onFrameProxy) {
            this.onFrameProxy = $.proxy(this.onFrame, this);
        }
        window.requestAnimationFrame(this.onFrameProxy);

    };

    window.ScrollWatcher = ScrollWatcher;

})();