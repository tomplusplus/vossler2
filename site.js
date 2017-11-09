(function(){
    var $body = $('body');
    var $videoContainer = $('.video-player-container');
    var $videoPlayer = $('#videoPlayer');
    var $videoPlayerEmbed = $('#videoPlayerEmbed');
    var $loader = $('.loader .loader-circle');
    var videoPlayer;
    var perc = 0;
    var vimeoTestRegex = /(http(s)?:\/\/)?(\w+\.)?(vimeo\.com)([\S])*\/\d{3,15}/i;
    var vimeoIdRegex = /((http(s)?:)?\/\/)?(\w+\.)?(vimeo\.com)([\S\w])*(?=\/\d{3,15})\//i;
    var youtubeTestRegex = /(http(s)?:\/\/)?(\w+\.)?(youtube\.com\/watch\?v=(\S){11}|youtu\.be\/(\S){11})/i;
    var youtubeIdRegex = /((http(s) ?:)?\/\/)?(\w+\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/i

    // $(document).ready(function () {
    //     $(this).scrollTop(0);
    // });

    // window.onbeforeunload = function () {
    //     window.scrollTo(0, 0);
    // }
    

    $(window).on('scroll',function(){
        perc = (window.scrollY / window.innerHeight) * 100;
        // console.log(window.scrollY, perc);
    });


/**
 * BINDINGS
 */ 

    $('.menu-button').on('click', toggleMenu);

    $('.people-section h5').on('click', showPeopleFull);
    $('.menu-item.people').on('click', showPeopleFull);
    $('.close-people').on('click', hidePeopleFull);

    $('.portfolio-section h5').on('click', showPortfolioFull);
    $('.menu-item.work').on('click', showPortfolioFull);
    $('.close-portfolio').on('click', hidePortfolioFull);


    $('.reel-section').on('click', function () {
        $('.reel-play-container').addClass('show');        
    });

    $('.reel-button').on('click', function(e){
        showVideoPlayer($(this).data().src, $(this).data().embed);  
        $('.reel-play-container').removeClass('show');
        e.stopPropagation();
    });


    $('.video-tile').on('click', _.debounce(function () {
        showVideoPlayer($(this).data().src, $(this).data().embed);
    },300,{leading:true}));

    $('.portfolio-item-wrapper').on('click', function () {
        showVideoPlayer($(this).data().src, $(this).data().embed);
    });

    $('.portfolio-item.back-side').on('click', function () {
        showVideoPlayer($(this).data().src, $(this).data().embed);
    });

    $('.close-video').on('click', stopVideoPlayer);


    function showVideoPlayer(src, embed){
        $body.addClass('no-scroll');
        $loader.addClass('show');
        $videoPlayer.toggle(!embed);
        if(embed){
            // var id = src;
            // if (videoPlayer && false) {
            //     if(vimeoTestRegex.test(src)){
            //         id = src.replace(vimeoIdRegex, '').substring(0, 15);
            //     }else if(youtubeTestRegex.test(src)){
            //         id = src.replace(youtubeIdRegex, '').substring(0, 15);
            //     }
            //     videoPlayer.loadVideo(id);
            // } else {
            if(videoPlayer){
                return hideVideoPlayer();
            }
            $videoPlayerEmbed = $('<div id="videoPlayerEmbed" class="video-player"></div>').prependTo($videoContainer).toggle(embed);
            videoPlayer = new Vimeo.Player('videoPlayerEmbed', {
                id: src,
                autoplay: true,
                portrait: true, 
                byline: false,
                title: true
            });                
            // }
            videoPlayer.on('progress', function (data) {
                $loader.removeClass('show');
                videoPlayer.off('progress');
            })

            videoPlayer.ready().then(function(){
                videoPlayer.isReady = true;
            }).catch(function(){
                $loader.removeClass('show');
            });

            videoPlayer.play().catch(function(){
                $loader.removeClass('show');
            });

            videoPlayer.on('play', function () {
                $loader.removeClass('show');
            });

            videoPlayer.on('error',console.log);


        }else{
            if ($videoPlayer) {
                $videoPlayer[0].src = src;
                $videoPlayer[0].play();
            }
        }
        $videoContainer.addClass('show');
    }

    function stopVideoPlayer() {
        $videoPlayer[0].pause();
        if (videoPlayer && videoPlayer.isReady){
            var vp =videoPlayer.pause().then(function () {
                videoPlayer.unload().then(hideVideoPlayer).catch(dhideVideoPlayer);
            }).catch(hideVideoPlayer);
        }else{
            return hideVideoPlayer();
        }
        setTimeout(function () {
            if (videoPlayer) hideVideoPlayer();
        }, 500)
    }

    function hideVideoPlayer() {
        $('#videoPlayerEmbed').empty().remove();
        videoPlayer = null;
        $videoContainer.removeClass('show');
        $body.removeClass('no-scroll');
    }

    function hidePeopleFull(){
        $body.removeClass('no-scroll');
        $('.fullscreen-people').removeClass('show');
    }

    function showPeopleFull(){
        $body.addClass('no-scroll');
        $('.fullscreen-people').addClass('show');
    }

    function hidePortfolioFull() {
        $body.removeClass('no-scroll');
        $('.fullscreen-portfolio').removeClass('show');
    }

    function showPortfolioFull() {
        $body.addClass('no-scroll');
        $('.fullscreen-portfolio').addClass('show');
    }


    function randomizePeople(){
        var $peopleList = $('.people-section .person');
        $peopleList.removeClass('show');
        for(var i = 0; i < 10; i++){
            var rand = Math.floor(Math.random() * $peopleList.length);
            $($peopleList.splice(rand,1)[0]).addClass('show');
        }
    }



    function toggleMenu(){
        $('.menu').toggleClass('opened');
    }

    var $els = {
        header: $('.header'),
        logo: $('.logo'),
        title: $('.main-title'),
        firstBanner: $('.first-banner'),
        firstContentTop: $('.first-banner .top-content'),
        firstContentBottom: $('.first-banner .bottom-content'),
        reel:$('.reel-section'),
        reelContent:$('.reel-section .content'),
        reelPlay: $('.reel-play-container'),
        reelVideo: $('.reel-video-player'),
        secondBanner: $('.second-banner'),
        secondBannerContent: $('.second-banner .content'),
        portfolio: $('.portfolio-section'),
        portfolioTextWatcher: $('.portfolio-section .content-scroll-watcher'),
        portfolioTiles: $('.portfolio-section .portfolio-tile.front'),
        portfolioContent: $('.portfolio-section .content:not(".white")'),
        portfolioText: $('.portfolio-section .portfolio-text-swap.top'),
        portfolioContentWhite: $('.portfolio-section .content.white'),
        thirdBanner: $('.third-banner'),
        thirdBannerContent: $('.third-banner .content'),
        seemlessVideo: $('.seemless-video-section'),
        seemlessVideoContent: $('.seemless-video-section .content'),
        seemlessVideoLoop: $('.seemless-video-loop'),
        slides: $('.scrolling-text-section'),
        scrollingText: $('.scrolling-text-container'),
        people:$('.people-section'),
        peopleContent:$('.people-section .content'),
        fourthBanner: $('.fourth-banner'),
        fourthBannerContent: $('.fourth-banner .content'),
        footer: $('.footer'),
        footerContent: $('.footer .content')
    }
    var scrollWatcher = new ScrollWatcher();

    function getPerc(p){
        return window.innerHeight * (p/100);
    }

// Logo
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

// Main title
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

// First Banner Content
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
//     scrollWatcher.watch({
//             $el: $els.firstBanner,
//             $tween: $els.reelPlay,
//             viewportTop: -0.5,
//             viewportHeight: 0.5,
//             tweenFrom: {
//                 top: getPerc(100)
//             },
//             tweenTo: {
//                 top: getPerc(0)
//             }
//         });

    scrollWatcher.watch({
            $el: $els.firstBanner,
            viewportTop:-1,
            viewportHeight: 1.8,
            onEnterViewport: function(){
                $els.reelVideo[0].play();
            },
            onExitViewport: function(){
                $els.reelVideo[0].pause();
                $('.reel-play-container').removeClass('show'); 
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

//Poertfolio content
//     scrollWatcher.watch({
//             $el: $els.portfolio,
//             $tween: $els.portfolioText,
//             viewportTop: 3,
//             viewportHeight: 3,
//             tweenFrom: {
//                 top: getPerc(-30)
//             },
//             tweenTo: {
//                 top: getPerc(0)
//             }
//         });
//     scrollWatcher.watch({
//             $el: $els.portfolioTextWatcher,
//             $tween: $els.portfolioContent,
//             viewportTop: -0.5,
//             viewportHeight: -0.5,
//             tweenFrom: {
//                 top: getPerc(23)
//             },
//             tweenTo: {
//                 top: getPerc(5)
//             }
//         });
//     scrollWatcher.watch({
//             $el: $els.portfolio,
//             $tween: $els.portfolioContentWhite,
//             viewportTop: 4,
//             viewportHeight: 4,
//             tweenFrom: {
//                 top: getPerc(-100)
//             },
//             tweenTo: {
//                 top: getPerc(20)
//             }
//     });

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

//Portfolio cross fade
//     scrollWatcher.watch({
//             $el: $els.portfolio,
//             viewportTop: -1.36,
//             viewportHeight: -1.36,
//             onEnterOrExitViewport: function (e) { 
//                 this.$el.toggleClass('cross-fade');
//                 // $t.toggleClass('swap');
//             }
//         });
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
                top: getPerc(11)
            }
        });
// // Seemles Video Section
//     scrollWatcher.watch({
//             $el: $els.seemlessVideo,
//             $tween: $els.seemlessVideoContent,
//             viewportTop: 0,
//             viewportHeight: 1,
//             tweenFrom: {
//                 top: getPerc(8)
//             },
//             tweenTo: {
//                 top: getPerc(30)
//             }
//         });
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
                top: getPerc(38)
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
            top: getPerc(26)
        }
    });

})()
