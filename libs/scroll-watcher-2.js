
(function () {

    // Helpers

    /*
    Simplify jquery easing functions into two arugments, a single floating
    point value beetween 0 and 1 and the jquery easing function. Return an 
    adjusted float between 0 and 1;    
    */

    var easeFloat = function (v, easefunc) {
        return easefunc(v, v, 0, 1, 1);
    };

    /* 
    Converts 6 digit hex to RGBA 
    */

    var hexToRgba = function (hex, alpha) {
        alpha = alpha || 1;
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16),
            a: alpha,
            toString: function () {
                return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
            }
        };
    };

    /* 
    Builds a transform string from the properties {x, y, scale, rotate }.
    */

    var propertiesToTransformString = function (css) {

        var transform = '';

        if (css.x || css.y || css.z) {
            transform += 'translate3D(' + (css.x ? css.x : 0) + 'px, ' + (css.y ? css.y : 0) + 'px, ' + (css.z ? css.z : 0) + 'px)';
        }

        if (css.scale) {
            transform += ' scale(' + css.scale + ')';
        }

        if (css.rotate || css.rotate === 0) {
            transform += ' rotate(' + css.rotate + 'deg)';
        }

        return transform;

    };

    /*
    Functions to create and update the markup for a ScrollWatcher debug marker.    
    */

    var markerColors = ['#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e67e22', '#e74c3c'],
        markerColorIndex = 0,
        getMarkerColor = function () {
            return markerColors[(markerColors.length % ++markerColorIndex)];
        };

    var createMarker = function (watcher) {

        var color = watcher.markerColorOverride ? watcher.markerColorOverride : getMarkerColor();
        var $marker = $('<div />').addClass('sw-marker');

        $('<div />').addClass('sw-scroll-viewport').css({
            position: 'fixed',
            top: (watcher.viewportTop * 100) + 'vh',
            height: (watcher.viewportHeight * 100) + 'vh',
            width: '100vw',
            right: 0,
            zIndex: 99999999,
            borderTop: '1px solid ' + hexToRgba(color, 0.5).toString(),
            borderBottom: '1px solid ' + hexToRgba(color, 0.5).toString(),
            background: hexToRgba(color, 0.03).toString(),
            pointerEvents: 'none'
        }).appendTo($marker);

        $('<div />').addClass('sw-scroll-marker').css({
            position: 'absolute',
            width: 'calc(100vw - 20px)',
            left: 4,
            zIndex: 99999999,
            borderTop: '1px dashed ' + color,
            borderBottom: '1px dashed ' + color,
            borderLeft: '8px solid ' + hexToRgba(color, 0.2).toString(),
            pointerEvents: 'none'
        }).appendTo($marker);

        watcher.$marker = $marker;
        $marker.appendTo($('body'));

        updateMarker(watcher);
    };

    var updateMarker = function (watcher) {
        if (watcher.$marker) {
            watcher.$marker.find('.sw-scroll-marker').css({
                top: watcher.watchTop,
                height: watcher.watchHeight// - watcher.scrollStart
            });
        }
    };

    /*
    Static functions that update a watcher object.
    */

    // recalculate the area being watched based on the location of an element

    var calculateWatchProperties = function (watcher, currentWindowHeight, currentPageHeight, currentScrollTop) {

        if (watcher.beforeRecalculate) {
            watcher.beforeRecalculate(watcher);
        }

        currentWindowHeight = currentWindowHeight || $(window).height();
        currentPageHeight = currentPageHeight || $(document).height();
        currentScrollTop = (currentScrollTop || currentScrollTop === 0) ? currentScrollTop : $(window).scrollTop();

        // these are handy in event handlers and that's all
        watcher.currentWindowHeight = currentWindowHeight;
        watcher.currentPageHeight = currentPageHeight;
        watcher.currentScrollTop = currentScrollTop;

        if (watcher && watcher.$el) {
            watcher.watchTop = Math.round(watcher.$el.offset().top);
            watcher.watchHeight = Math.round(watcher.$el.height());
        }

        watcher.watchBottom = Math.round(watcher.watchTop + watcher.watchHeight);
        watcher.viewportBottom = watcher.viewportTop + watcher.viewportHeight;

        if (watcher.progressMode === 'traverse') {

            // start when the top of the element is at the bottom of the viewport            
            watcher.scrollStart = watcher.watchTop - (currentWindowHeight * watcher.viewportBottom);

            // when the bottom of the element is at the top of the viewport
            watcher.scrollEnd = watcher.watchBottom - (currentWindowHeight * watcher.viewportTop);

        }
        else {
            // start when the top of the element is at the top of the viewport            
            watcher.scrollStart = watcher.watchTop - (currentWindowHeight * watcher.viewportTop);

            // when the bottom of the element is at the bottom of the viewport
            watcher.scrollEnd = watcher.watchBottom - (currentWindowHeight * watcher.viewportBottom);
        }

        // adjust scrollStart and scrollBottom for full page
        if (watcher.adjustForFullPage) {
            watcher.scrollStart = Math.max(watcher.scrollStart, 0);
            watcher.scrollEnd = Math.min(watcher.scrollEnd, currentPageHeight - currentWindowHeight);
        }

        if (watcher.afterRecalculate) {
            watcher.afterRecalculate(watcher);
        }

        calculateWatcherProgress(watcher, currentScrollTop);

    };

    // calculate the progress of the watcher though the viewport
    var calculateWatcherProgress = function (watcher, currentScrollTop) {

        // delta
        watcher.lastScrollTop = watcher.scrollTop ? watcher.scrollTop : currentScrollTop;
        watcher.scrollTop = currentScrollTop;
        watcher.scrollDelta = watcher.scrollTop - watcher.lastScrollTop;

        // progress
        watcher.actualProgress = (currentScrollTop - watcher.scrollStart) / (watcher.scrollEnd - watcher.scrollStart);
        watcher.progress = Math.max(0, Math.min(1, watcher.actualProgress));

        // viewport
        watcher.isAboveViewport = watcher.actualProgress > 1;
        watcher.isBelowViewport = watcher.actualProgress < 0;
        watcher.isInViewport = watcher.actualProgress > 0 && watcher.actualProgress <= 1;
    };

    /*
    ScrollWatcher
    
        Notes:
        
        -   This only works with window scrolling. 
            
        -   The watch() function returns an object. This is the same object that gets passed in as
            options with a bunch of stuff added to it. If you're passing in scrollStart and scrollEnd
            parameters instead of an element, you can update those properties on this object and
            the right thing will happen (probably need to call .refresh() once you update them though).
    
    */
    var ScrollWatcher = function (useRequestAnimationFrame) {
        this.$doc = $(document);
        this.$window = $(window);
        this.$window.on('scroll', $.proxy(this.onScroll, this));
        this.$window.on('resize', $.proxy(this.onResize, this));
        this.watchers = [];
        this.useRequestAnimationFrame = useRequestAnimationFrame;
        if (useRequestAnimationFrame) {
            this.onFrame();
        }
    };


    var watchDefaults = {

        // DOM element, jQuery element or selector to be watched (only first match will be watched)
        element: null,

        // scrollTop and scrollHeight of the area to be watched (setting element will override)
        watchTop: 0,
        watchHeight: 0,

        // the area of the viewport that gets monitored, defaults is the full screen but a single
        // line in the middle of the screen could be specified as {viewportTop: 0.5, viewportHeight: 0}
        viewportTop: 0,
        viewportHeight: 1,

        // determines how progress is measured as the element (or watch area) moves across the 
        // viewport; 'traverse' means no overlap is allowed so 0 is 'top-bottom' (element-top meets
        // viewport-bottom) and 1 is 'bottom-top'; overlap is 0 at 'top-top' and 1 at 'bottom-bottom'.
        progressMode: 'traverse', // or 'overlap'

        // fires when page the scrolls, regardless of where the element is relative to the viewport
        onScroll: null,

        // fires on page scroll and any part of the element overlaps with any part of the viewport
        onScrollInViewport: null,

        // fired when the element enters the viewport (always or just from above or below)
        onEnterViewport: null,
        onEnterViewportFromAbove: null,
        onEnterViewportFromBelow: null,

        // fired when the element exits the viewport (always or just toward above or below)
        onExitViewport: null,
        onExitViewportToAbove: null,
        onExitViewportToBelow: null,

        // fired anytime the elment enters or exits
        onEnterOrExitViewport: null,

        // fired before or after the position of the element and other watch properties are recalculated
        beforeRecalculate: null,
        afterRecalculate: null,

        // the elmeent to tween (if tweenFrom and tweenTo and element are specified but tweelElement
        // is null, then tweenElement defaultes to element)
        $tween: null,

        // The following properties are supported: 
        //    - x, y, scale, rotate will be converted to a transform string, 
        //    - color, backgroundColor, borderColor must be specified as rgba or 6-digit hex
        //    - any single number numerical css property (opacity, marginTop, etc), supported
        //      unit types (px, %, vh, vw, em, rem) will be preserved
        tweenFrom: null,
        tweenTo: null,

        // a jquery easing function that controls the rate at which properties are tweened
        ease: $.easing.linear,

        // debug helpers that render indicators for the watch are and the adjusted viewport (which 
        // may not be fully visible if it's off screen)
        showMarker: false,
        showViewport: false,
        markerColorOverride: null,

    };

    ScrollWatcher.prototype.watch = function (options) {

        var watcher = $.extend({}, watchDefaults, options);

        // watch element
        if (watcher.element) {
            watcher.$el = $(watcher.element);
        }

        // tweening
        if (watcher.$tween && watcher.tweenFrom && watcher.tweenTo) {

            watcher.tweenCurrent = {};

            for (var key in watcher.tweenFrom) {
                if (watcher.tweenTo.hasOwnProperty(key)) {
                    watcher.tweenCurrent[key] = watcher.tweenFrom[key];
                }
            }
        }

        // all watchers start out of viewport
        watcher.isInViewport = false;

        // add watch indicator
        if (watcher.showMarker) {
            createMarker(watcher);
        }

        calculateWatchProperties(watcher, this.$window.height(), this.$doc.height(), 0);
        this.watchers.push(watcher);
        this.refresh();

        return watcher;
    };

    // Forces ScrollWatcher to recalculate the locations of watched elements

    ScrollWatcher.prototype.recalculate = function () {

        var currentWindowHeight = this.$window.height(),
            currentDocumentHeight = this.$doc.height(),
            currentScrollTop = this.$window.scrollTop();

        $.each(this.watchers, $.proxy(function (idx, watcher) {
            calculateWatchProperties(watcher, currentWindowHeight, currentDocumentHeight, currentScrollTop);
        }, this));

        this.refresh();
    };

    // Forces scrollwatcher to refresh everything as if the user had scrolled

    ScrollWatcher.prototype.refresh = function () {
        this.refreshOnFrame = true;
        this.onFrame();
    };

    // Update watchers and raise events (this is the equivalent of "onScroll" but we do
    // it on a render frame in the hopes that we keep things in better sync)

    ScrollWatcher.prototype.onFrame = function () {

        if (!this.useRequestAnimationFrame || (this.useRequestAnimationFrame && this.refreshOnFrame)) {

            var scrollTop = this.$window.scrollTop();

            var i = this.watchers.length;
            while (i--) {

                var w = this.watchers[i];

                w.wasInViewport = w.isInViewport;
                w.wasAboveViewport = w.isAboveViewport;
                w.wasBelowViewport = w.isBelowViewport;

                calculateWatcherProgress(w, scrollTop);

                // scroll 
                if (w.onScroll) {
                    w.onScroll(w);
                }

                // scroll in viewport
                if (w.isInViewport && w.onScrollInViewport) {
                    w.onScrollInViewport(w);
                }

                // enter
                if ((!w.wasInViewport && w.isInViewport) ||
                    (w.wasAboveViewport && !w.isAboveViewport) ||
                    (w.wasBelowViewport && !w.isBelowViewport)) {

                    if (w.onEnterViewport) {
                        w.onEnterViewport(w);
                    }

                    if (w.onEnterOrExitViewport) {
                        w.onEnterOrExitViewport(w);
                    }

                    if (w.wasBelowViewport && !w.isBelowViewport && w.onEnterViewportFromBelow) {
                        w.onEnterViewportFromBelow(w);
                    }

                    if (w.wasAboveViewport && !w.isAboveViewport && w.onEnterViewportFromAbove) {
                        w.onEnterViewportFromAbove(w);
                    }
                }

                // exit
                if (w.wasInViewport && !w.isInViewport) {

                    if (w.onExitViewport) {
                        w.onExitViewport(w);
                    }

                    if (w.onEnterOrExitViewport) {
                        w.onEnterOrExitViewport(w);
                    }

                    if (w.isAboveViewport && w.onExitViewportToAbove) {
                        w.onExitViewportToAbove(w);
                    }

                    if (w.isBelowViewport && w.onExitViewportToBelow) {
                        w.onExitViewportToBelow(w);
                    }

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

                if (w.showMarker) {
                    updateMarker(w);
                }
            }

            this.refreshOnFrame = false;
        }

        if (this.useRequestAnimationFrame) {
            if (!this.onFrameProxy) {
                this.onFrameProxy = $.proxy(this.onFrame, this);
            }
            window.requestAnimationFrame(this.onFrameProxy);
        }
    };

    // Handle resize and scroll events

    ScrollWatcher.prototype.onResize = function () {
        this.recalculate(true);
    };

    ScrollWatcher.prototype.onScroll = function () {
        this.refresh();
    };

    window.ScrollWatcher = ScrollWatcher;

})();
