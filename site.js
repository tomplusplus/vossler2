(function(){

    var videoPlayer;
    var vimeoTestRegex = /(http(s)?:\/\/)?(\w+\.)?(vimeo\.com)([\S])*\/\d{3,15}/i;
    var vimeoIdRegex = /((http(s)?:)?\/\/)?(\w+\.)?(vimeo\.com)([\S\w])*(?=\/\d{3,15})\//i;

    /**
     * ELEMENTS
     */
    var $els = {
    // GENERAL
        html: $('html'),
        body: $('body'),
    // SCROLL WATCHER
        header: $('.header'),
        headerImages: $('.header .background-image'),
        logo: $('.logo'),
        title: $('.main-title'),
        firstBanner: $('.first-banner'),
        firstContentTop: $('.first-banner .top-content'),
        firstContentBottom: $('.first-banner .bottom-content'),
        reel: $('.reel-section'),
        reelPlay: $('.reel-play-container'),
        reelVideo: $('.reel-video-player'),
        reelButton: $('.reel-button'),
        secondBanner: $('.second-banner'),
        secondBannerContent: $('.second-banner .content'),
        portfolio: $('.portfolio-section'),
        portfolioTiles: $('.portfolio-section .portfolio-tile.front'),
        thirdBanner: $('.third-banner'),
        thirdBannerContent: $('.third-banner .content'),
        seemlessVideo: $('.seemless-video-section'),
        seemlessVideoLoop: $('.seemless-video-loop'),
        slides: $('.scrolling-text-section'),
        scrollingText: $('.scrolling-text-container'),
        people: $('.people-section'),
        peopleContent: $('.people-section .content'),
        peopleList: $('.people-section .person'),
        fourthBanner: $('.fourth-banner'),
        fourthBannerContent: $('.fourth-banner .content'),
        footer: $('.footer'),
        footerContent: $('.footer .content'),
    // VIDEO CONTROLS
        videoContainer: $('.video-player-container'),
        videoPlayer: $('#videoPlayer'),
        videoPlayerEmbed: $('#videoPlayerEmbed'),
        loader: $('.loader .loader-circle'),
        closeVideo: $('.close-video'),
    // MENU ELEMENTS
        menuButton: $('.menu-button'),
        menuPeople: $('.menu-item.people'),
        menuWork: $('.menu-item.work'),
        menuContact: $('.menu-item.contact'),
    // PORTFOLIO TOGGLE
        portfolioFullscreen: $('.fullscreen-portfolio'),
        portfolioShow: $('.portfolio-section h5'),
        portfolioHide: $('.close-portfolio'),
        portfolioTile: $('.video-tile, .portfolio-item-wrapper, .portfolio-item.back-side'),

    // PEOPLE TOGGLE
        peopleFullscreen: $('.fullscreen-people'),
        peopleShow: $('.people-section h5'),
        peopleHide: $('.close-people')
        
    }

    // $(document).ready(function () {
    //     $(this).scrollTop(0);
    // });

    // window.onbeforeunload = function () {
    //     window.scrollTo(0, 0);
    // }

    randomizeHeader();
    

    $els.videoPlayer.on('canplay',function(){
        $els.loader.removeClass('show');
    })


/*******************************************************************************************
 * BINDINGS
 ******************************************************************************************/

    $els.menuButton.on('click', toggleMenu);
    $els.menuPeople.on('click', showPeopleFull);
    $els.menuWork.on('click', showPortfolioFull);
    $els.menuContact.on('click', scrollToBottom);

    $els.peopleShow.on('click', showPeopleFull);
    $els.peopleHide.on('click', hidePeopleFull);

    $els.portfolioShow.on('click', showPortfolioFull);
    $els.portfolioHide.on('click', hidePortfolioFull);

    $els.closeVideo.on('click', stopVideoPlayer);

    $els.reel.on('click', function () {
        $els.reelPlay.addClass('show');        
    });

    $els.reelButton.on('click', function(e){
        showVideoPlayer($(this).data().src, $(this).data().embed);  
        $els.reelPlay.removeClass('show');
        e.stopPropagation();
    });


    $els.portfolioTile.on('click', _.debounce(function () {
        showVideoPlayer($(this).data().src, $(this).data().embed);
    },300,{leading:true}));




/*******************************************************************************************
 * SCROLL WATCHER
 *******************************************************************************************/

    var scrollWatcher = new ScrollWatcher();


// HEADER BACKGROUND SWAP
    scrollWatcher.watch({
            $el: $els.header,
            viewportTop: -0.5,
            viewportHeight: 1.5,
            onExitViewport: randomizeHeader
        });


// LOGO
    scrollWatcher.watch({
            $el: $els.header,
            $tween: $els.logo,
            viewportTop: 0,
            viewportHeight: 0,
            tweenFrom: {
                top: getPerc(30),
                scale: 1,
                opacity: 0.7
            },
            tweenTo: {
                top: getPerc(78),
                scale: 0.9,
                opacity: -0.7
            }
        });

// MAIN TITLE
    scrollWatcher.watch({
            $el: $els.header,
            $tween: $els.title,
            viewportTop: 0,
            viewportHeight: 0,
            tweenFrom: {
                top: getPerc(110)
            },
            tweenTo: {
                top: getPerc(36)
            }
        });

// FIRST BANNER CONTENT
    scrollWatcher.watch({
            $el: $els.firstBanner,
            $tween: $els.firstContentTop,
            viewportTop: 0,
            viewportHeight: 1,
            tweenFrom: {
                top: getPerc(36)
            },
            tweenTo: {
                top: getPerc(14)
            }
        });

    scrollWatcher.watch({
            $el: $els.firstBanner,
            $tween: $els.firstContentBottom,
            viewportTop: 0,
            viewportHeight: 1,
            tweenFrom: {
                top: getPerc(38)
            },
            tweenTo: {
                top: getPerc(46)
            }
        });

//REEL
    scrollWatcher.watch({
            $el: $els.firstBanner,
            viewportTop:-1,
            viewportHeight: 1.8,
            onEnterViewport: function(){
                $els.reelVideo[0].play();
            },
            onExitViewport: function(){
                $els.reelVideo[0].pause();
                $els.reelPlay.removeClass('show'); 
            }
        });

//Second Banner
    scrollWatcher.watch({
            $el: $els.secondBanner,
            $tween: $els.secondBannerContent,
            viewportTop: 0,
            viewportHeight: 1.1,
            tweenFrom: {
                top: -80
                // top: getPerc(-8)
            },
            tweenTo: {
                top: 220    
                // top: getPerc(22)
            }
        });

//Portfolio snap in
    scrollWatcher.watch({
            $el: $els.portfolio,
            viewportTop: 0,
            viewportHeight: 0,
            onEnterOrExitViewport: function (e) {
                if (e.progress < 0.5) {
                 this.$el.toggleClass('is-fixed', e.isInViewport);
                }   
            },
        });

//Portfolio snap ut
    scrollWatcher.watch({
            $el: $els.portfolio,
            viewportTop: 1.12,
            viewportHeight: 0,
            onEnterOrExitViewport: function (e) {
                if (e.progress > 0.5) {
                this.$el.toggleClass('is-fixed', e.isInViewport);
                this.$el.toggleClass('is-fixed-bottom', !e.isInViewport);
                }
            },
        });

//Portfolio reveal
    scrollWatcher.watch({
            $el: $els.portfolio,
            $tween: $els.portfolioTiles,
            viewportTop: -0.38,
            viewportHeight: 0,
            tweenFrom: {
                height: getPerc(90)
            },
            tweenTo: {
                height: getPerc(-190)
            }
    });

// Seemles Third Banner
    scrollWatcher.watch({
            $el: $els.thirdBanner,
            $tween: $els.thirdBannerContent,
            viewportTop: 0,
            viewportHeight: 1,
            tweenFrom: {
                top: getPerc(-8)
            },  
            tweenTo: {
                top: getPerc(9)
            }
        });
 // Seemles Video Section
    scrollWatcher.watch({
            $el: $els.seemlessVideo,
            viewportTop:-0.18,
            viewportHeight: 1.18,
            onEnterViewport: function(){
                $els.seemlessVideoLoop[0].play();
            },
            onExitViewport: function(){
                $els.seemlessVideoLoop[0].pause();
            }
        });

// People section Content
    scrollWatcher.watch({
            $el: $els.people,
            $tween: $els.peopleContent,
            tweenFrom: {
                top: getPerc(2)
            },
            tweenTo: {
                top: getPerc(30)
            }
        });
// People randomized
    scrollWatcher.watch({
            $el: $els.people,
            viewportTop: -0.6,
            viewportHeight: 1.8,
            onEnterViewport: randomizePeople,
        });

// Fourth Banner
    scrollWatcher.watch({
            $el: $els.fourthBanner,
            $tween: $els.fourthBannerContent,
            tweenFrom: {
                top: getPerc(14)
            },
            tweenTo: {
                top: getPerc(36)
            }
        });
// Scrolling Text Section
    scrollWatcher.watch({
            $el: $els.slides,
            viewportTop: 0,
            viewportHeight: 1.2,
            onEnterOrExitViewport: function (e) {
                $els.scrollingText.toggleClass('animate-me');
            },
        });
// Footer Content
    scrollWatcher.watch({
        $el: $els.footer,
        $tween: $els.footerContent,
        viewportTop: 0,
        viewportHeight: 1,
        tweenFrom: {
            top: getPerc(1)
        },
        tweenTo: {
            top: getPerc(32)
        }
    });


/*******************************************************************************************
 * METHODS 
 ******************************************************************************************/

    function showVideoPlayer(src, embed) {
        $els.body.addClass('no-scroll');
        $els.loader.addClass('show');
        $els.videoPlayer.toggle(!embed);
        if (embed) {
            // var id = src;
            // if (videoPlayer && false) {
            //     if(vimeoTestRegex.test(src)){
            //         id = src.replace(vimeoIdRegex, '').substring(0, 15);
            //     }else if(youtubeTestRegex.test(src)){
            //         id = src.replace(youtubeIdRegex, '').substring(0, 15);
            //     }
            //     videoPlayer.loadVideo(id);
            // } else {
            if (videoPlayer) {
                return hideVideoPlayer();
            }
            $els.videoPlayerEmbed = $('<div id="videoPlayerEmbed" class="video-player"></div>').prependTo($els.videoContainer).toggle(embed);
            videoPlayer = new Vimeo.Player('videoPlayerEmbed', {
                id: src,
                autoplay: true,
                portrait: true,
                byline: false,
                title: true
            });
            // }
            videoPlayer.on('progress', function (data) {
                $els.loader.removeClass('show');
                videoPlayer.off('progress');
            })

            videoPlayer.ready().then(function () {
                videoPlayer.isReady = true;
            }).catch(function () {
                $els.loader.removeClass('show');
            });

            videoPlayer.play().catch(function () {
                $els.loader.removeClass('show');
            });

            videoPlayer.on('play', function () {
                $els.loader.removeClass('show');
            });

            videoPlayer.on('error', console.log);


        } else {
            if ($els.videoPlayer) {
                $els.videoPlayer[0].src = src;
                $els.videoPlayer[0].play();
            }
        }
        $els.videoContainer.addClass('show');
    }

    function stopVideoPlayer() {
        $els.videoPlayer[0].pause();
        if (videoPlayer && videoPlayer.isReady) {
            videoPlayer.pause().then(function () {
                videoPlayer.unload().then(hideVideoPlayer).catch(dhideVideoPlayer);
            }).catch(hideVideoPlayer);
        } else {
            return hideVideoPlayer();
        }
        setTimeout(function () {
            if (videoPlayer) hideVideoPlayer();
        }, 500)
    }

    function hideVideoPlayer() {
        videoPlayer = null;
        $els.videoPlayerEmbed.empty().remove();
        $els.videoContainer.removeClass('show');
        $els.body.removeClass('no-scroll');
    }

    function hidePeopleFull() {
        $els.body.removeClass('no-scroll');
        $els.peopleFullscreen.removeClass('show');
    }

    function showPeopleFull() {
        $els.body.addClass('no-scroll');
        $els.peopleFullscreen.addClass('show');
    }

    function hidePortfolioFull() {
        $els.body.removeClass('no-scroll');
        $els.peopleFullscreen.removeClass('show');
    }

    function showPortfolioFull() {
        $els.body.addClass('no-scroll');
        $els.peopleFullscreen.addClass('show');
    }


    function randomizePeople() {
        $els.peopleList = $('.people-section .person');
        $els.peopleList.removeClass('show');
        for (var i = 0; i < 10; i++) {
            var rand = Math.floor(Math.random() * $els.peopleList.length);
            $($els.peopleList.splice(rand, 1)[0]).addClass('show');
        }
    }

    function randomizeHeader() {
        $els.headerImages.removeClass('show')
        var rand = Math.floor(Math.random() * $els.headerImages.length);
        $els.headerImages.eq(rand).addClass('show');
    }

    function toggleMenu() {
        $('.menu').toggleClass('opened');
    }

    function scrollToBottom() {
        $els.html[0].scrollTop = $els.body.height();
        // $els.html.animate({ scrollTop: $body.height() }, 100);
    }

    function getPerc(p) {
        return window.innerHeight * (p / 100);
    }

})()
