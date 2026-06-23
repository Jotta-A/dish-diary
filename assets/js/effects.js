/**
 * DishDiary — jQuery Visual Effects & Micro-Animations
 * 
 * Premium finishing touches powered by jQuery 4:
 *  - Scroll-reveal entrance animations
 *  - Animated stat counters
 *  - Navbar scroll behavior (shrink + shadow)
 *  - Parallax hero image
 *  - Toast notifications
 *  - Smooth hover interactions
 *  - Page-load entrance choreography
 */

$(function () {
    'use strict';

    // =====================================================================
    // 1. PAGE ENTRANCE CHOREOGRAPHY
    //    Elements fade+slide in with staggered timing on page load
    // =====================================================================

    var $revealElements = $(
        '.card-custom, .card-favorite, section, ' +
        '.small-card, .list-card, .activity-item, ' +
        '.log-container, article, .mood-card'
    );

    $revealElements.each(function (i) {
        var $el = $(this);
        $el.css({
            opacity: 0,
            transform: 'translateY(30px)'
        });

        setTimeout(function () {
            $el.css({
                transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                opacity: 1,
                transform: 'translateY(0)'
            });
        }, 80 + (i * 60));
    });


    // =====================================================================
    // 2. SCROLL-REVEAL ANIMATIONS
    //    Elements animate in as they enter the viewport
    // =====================================================================

    var scrollRevealTargets = '.card-custom, .card-favorite, .small-card, .list-card, article, .mood-card, .log-container, .newsletter-card, .bg-grad-secondary';

    function revealOnScroll() {
        $(scrollRevealTargets).each(function () {
            var $el = $(this);
            if ($el.data('revealed')) return;

            var elTop = $el.offset().top;
            var viewBottom = $(window).scrollTop() + $(window).height();

            if (elTop < viewBottom - 60) {
                $el.data('revealed', true);
                $el.css({
                    transition: 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                    opacity: 1,
                    transform: 'translateY(0)'
                });
            }
        });
    }

    $(window).on('scroll', $.throttle ? $.throttle(100, revealOnScroll) : function () {
        // Simple throttle fallback
        if (!this._scrollTimer) {
            var self = this;
            this._scrollTimer = setTimeout(function () {
                revealOnScroll();
                self._scrollTimer = null;
            }, 80);
        }
    });

    // Initial check
    setTimeout(revealOnScroll, 200);


    // =====================================================================
    // 3. NAVBAR SCROLL BEHAVIOR
    //    Shrinks, adds shadow, becomes more opaque on scroll
    // =====================================================================

    var $navbar = $('.navbar, .top-nav, nav.fixed-top, nav.sticky-top').first();

    if ($navbar.length) {
        var navOrigPadding = $navbar.css('padding-top');

        $(window).on('scroll', function () {
            var scrollY = $(window).scrollTop();
            if (scrollY > 30) {
                $navbar.css({
                    'padding-top': '0.5rem',
                    'padding-bottom': '0.5rem',
                    'box-shadow': '0 4px 30px rgba(76, 33, 44, 0.08)',
                    'background-color': 'rgba(255, 244, 244, 0.95)',
                    'transition': 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
                });
            } else {
                $navbar.css({
                    'padding-top': navOrigPadding,
                    'padding-bottom': navOrigPadding,
                    'box-shadow': 'none',
                    'background-color': 'rgba(255, 244, 244, 0.9)',
                    'transition': 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
                });
            }
        });
    }


    // =====================================================================
    // 4. ANIMATED STAT COUNTERS
    //    Numbers count up when scrolled into view (dish-detail & profile)
    // =====================================================================

    function animateCounter($el, target, suffix) {
        suffix = suffix || '';
        var duration = 1200;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(eased * target);

            if (target >= 1000) {
                $el.text((current / 1000).toFixed(1) + 'k' + suffix);
            } else if (target % 1 !== 0) {
                $el.text(current.toFixed ? (eased * target).toFixed(1) + suffix : current + suffix);
            } else {
                $el.text(current + suffix);
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // Find and animate stat numbers
    var statSelectors = '.bg-surface-container-low .font-headline.fw-black, .font-headline.fs-4.fw-bold';
    $(statSelectors).each(function () {
        var $el = $(this);
        var text = $el.text().trim();
        var match;

        // Parse "4.8", "1.2k", "3.4k", "14.2k", "842", "128"
        if ((match = text.match(/^([\d.]+)(k?)$/i))) {
            var num = parseFloat(match[1]);
            var isK = match[2].toLowerCase() === 'k';
            var finalVal = isK ? num * 1000 : num;

            $el.data('targetVal', finalVal);
            $el.data('originalText', text);
            $el.data('animated', false);
        }
    });

    function checkCounters() {
        $(statSelectors).each(function () {
            var $el = $(this);
            if ($el.data('animated') || !$el.data('targetVal')) return;

            var elTop = $el.offset().top;
            var viewBottom = $(window).scrollTop() + $(window).height();

            if (elTop < viewBottom - 30) {
                $el.data('animated', true);
                var target = $el.data('targetVal');
                var original = $el.data('originalText');

                // Temporarily show 0
                $el.text('0');

                setTimeout(function () {
                    // Simple approach: just animate to final text
                    $el.css({ transition: 'none' });
                    animateCounterText($el, original);
                }, 100);
            }
        });
    }

    function animateCounterText($el, finalText) {
        var duration = 1000;
        var match = finalText.match(/^([\d.]+)(.*)/);
        if (!match) return;

        var target = parseFloat(match[1]);
        var suffix = match[2] || '';
        var startTime = null;
        var hasDecimal = match[1].indexOf('.') !== -1;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = eased * target;

            $el.text((hasDecimal ? current.toFixed(1) : Math.floor(current)) + suffix);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                $el.text(finalText);
            }
        }

        requestAnimationFrame(step);
    }

    $(window).on('scroll', checkCounters);
    setTimeout(checkCounters, 500);


    // =====================================================================
    // 5. TOAST NOTIFICATION SYSTEM
    //    Elegant slide-in toasts for user actions
    // =====================================================================

    window.DishDiaryToast = {
        show: function (message, type) {
            type = type || 'info';

            var bgColors = {
                success: 'linear-gradient(135deg, #00675d, #00897b)',
                error: 'linear-gradient(135deg, #b02500, #d84315)',
                info: 'linear-gradient(135deg, #4c212c, #814c58)',
                favorite: 'linear-gradient(135deg, #b71029, #ff7576)'
            };

            var icons = {
                success: 'bi-check-circle-fill',
                error: 'bi-exclamation-circle-fill',
                info: 'bi-info-circle-fill',
                favorite: 'bi-heart-fill'
            };

            var $toast = $('<div/>')
                .css({
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(120px)',
                    background: bgColors[type] || bgColors.info,
                    color: '#ffffff',
                    padding: '0.875rem 1.5rem',
                    borderRadius: '50rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    letterSpacing: '0.03em',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    backdropFilter: 'blur(10px)',
                    opacity: 0,
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    whiteSpace: 'nowrap'
                })
                .html('<i class="bi ' + (icons[type] || icons.info) + '"></i> ' + message)
                .appendTo('body');

            // Animate in
            setTimeout(function () {
                $toast.css({
                    transform: 'translateX(-50%) translateY(0)',
                    opacity: 1
                });
            }, 50);

            // Animate out
            setTimeout(function () {
                $toast.css({
                    transform: 'translateX(-50%) translateY(120px)',
                    opacity: 0
                });
                setTimeout(function () { $toast.remove(); }, 500);
            }, 3000);
        }
    };


    // =====================================================================
    // 6. FAVORITE HEART BUTTON ANIMATION
    //    Bounce + particle burst on favorite toggle
    // =====================================================================

    $(document).on('click', '.btn-fav', function () {
        var $btn = $(this);
        var $icon = $btn.find('i');
        var isFilled = $icon.hasClass('bi-heart-fill');

        // Bounce animation
        $btn.css({
            transform: 'scale(0.6)',
            transition: 'transform 0.15s ease-in'
        });

        setTimeout(function () {
            $btn.css({
                transform: 'scale(1.3)',
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            });
        }, 150);

        setTimeout(function () {
            $btn.css({
                transform: 'scale(1)',
                transition: 'transform 0.15s ease-out'
            });
        }, 350);

        // Particle burst on favorite
        if (!isFilled) {
            createHeartBurst($btn);
            DishDiaryToast.show('Added to favorites', 'favorite');
        } else {
            DishDiaryToast.show('Removed from favorites', 'info');
        }
    });

    function createHeartBurst($btn) {
        var colors = ['#ff7576', '#b71029', '#ff595f', '#ffd1d9', '#a30021'];

        for (var i = 0; i < 8; i++) {
            var angle = (i / 8) * Math.PI * 2;
            var distance = 25 + Math.random() * 20;
            var size = 4 + Math.random() * 4;

            var $particle = $('<div/>')
                .css({
                    position: 'absolute',
                    width: size + 'px',
                    height: size + 'px',
                    borderRadius: '50%',
                    backgroundColor: colors[i % colors.length],
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) scale(0)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
                })
                .appendTo($btn);

            (function ($p, a, d) {
                setTimeout(function () {
                    $p.css({
                        transform: 'translate(calc(-50% + ' + Math.cos(a) * d + 'px), calc(-50% + ' + Math.sin(a) * d + 'px)) scale(1)',
                        opacity: 0
                    });
                }, 10);
                setTimeout(function () { $p.remove(); }, 600);
            })($particle, angle, distance);
        }
    }


    // =====================================================================
    // 7. CARD TILT EFFECT
    //    Subtle 3D perspective tilt on card hover
    // =====================================================================

    $(document).on('mousemove', '.card-custom', function (e) {
        var $card = $(this);
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var midX = rect.width / 2;
        var midY = rect.height / 2;

        var rotateX = ((y - midY) / midY) * -3;
        var rotateY = ((x - midX) / midX) * 3;

        $card.css({
            transform: 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)',
            transition: 'transform 0.1s ease-out'
        });
    });

    $(document).on('mouseleave', '.card-custom', function () {
        $(this).css({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
        });
    });


    // =====================================================================
    // 8. HERO IMAGE PARALLAX
    //    Subtle parallax movement on the dish-detail hero
    // =====================================================================

    var $heroImg = $('.position-relative.w-100.overflow-hidden img').first();

    if ($heroImg.length) {
        $(window).on('scroll', function () {
            var scrollY = $(window).scrollTop();
            var offset = scrollY * 0.3;
            $heroImg.css('transform', 'translateX(-50%) translateY(' + offset + 'px)');
        });
    }


    // =====================================================================
    // 9. STAR RATING SHIMMER
    //    Stars shimmer with a golden glow when hovered
    // =====================================================================

    $(document).on('mouseenter', '.text-primary .bi-star-fill', function () {
        $(this).css({
            filter: 'drop-shadow(0 0 6px rgba(255, 117, 118, 0.6))',
            transition: 'filter 0.2s ease'
        });
    });

    $(document).on('mouseleave', '.text-primary .bi-star-fill', function () {
        $(this).css({
            filter: 'none',
            transition: 'filter 0.3s ease'
        });
    });


    // =====================================================================
    // 10. SMOOTH PROGRESS BAR ANIMATIONS
    //     Rating progress bars animate from 0 to their target width
    // =====================================================================

    $('.progress-bar').each(function () {
        var $bar = $(this);
        var targetWidth = $bar.css('width');
        var targetPercent = $bar.attr('style').match(/width:\s*([\d.]+%)/);

        if (targetPercent) {
            $bar.css('width', '0%');

            setTimeout(function () {
                $bar.css({
                    width: targetPercent[1],
                    transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
                });
            }, 600);
        }
    });


    // =====================================================================
    // 11. SEARCH INPUT FOCUS ANIMATION
    //     Search bar expands smoothly on focus
    // =====================================================================

    var $searchContainer = $('.search-container, .search-bar');

    $searchContainer.find('input').on('focus', function () {
        $(this).closest('.search-container, .search-bar').css({
            boxShadow: '0 0 0 3px rgba(183, 16, 41, 0.12)',
            transform: 'scale(1.02)',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        });
    });

    $searchContainer.find('input').on('blur', function () {
        $(this).closest('.search-container, .search-bar').css({
            boxShadow: 'none',
            transform: 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        });
    });


    // =====================================================================
    // 12. IMAGE REVEAL ON LOAD
    //     Images fade in gracefully when loaded
    // =====================================================================

    $('img[loading="lazy"]').each(function () {
        var $img = $(this);
        $img.css({ opacity: 0, transition: 'opacity 0.5s ease' });

        if (this.complete) {
            $img.css('opacity', 1);
        } else {
            $img.on('load', function () {
                $(this).css('opacity', 1);
            });
        }
    });


    // =====================================================================
    // 13. BUTTON RIPPLE EFFECT
    //     Material-style ripple on gradient buttons
    // =====================================================================

    $(document).on('click', '.btn-gradient-primary, .btn-gradient, .gradient-primary, .btn-grad-primary, .btn-log', function (e) {
        var $btn = $(this);
        $btn.css({ position: 'relative', overflow: 'hidden' });

        var rect = this.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 2;
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        var $ripple = $('<span/>')
            .css({
                position: 'absolute',
                width: size + 'px',
                height: size + 'px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                top: y + 'px',
                left: x + 'px',
                transform: 'scale(0)',
                transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
                pointerEvents: 'none',
                zIndex: 1
            })
            .appendTo($btn);

        setTimeout(function () {
            $ripple.css({ transform: 'scale(1)', opacity: 0 });
        }, 10);

        setTimeout(function () { $ripple.remove(); }, 600);
    });


    // =====================================================================
    // 14. PROFILE PAGE — STAGGERED FAVORITE CARDS
    //     Cards fly in one by one on the profile page
    // =====================================================================

    $('.card-favorite').each(function (i) {
        var $card = $(this);
        $card.css({
            opacity: 0,
            transform: 'translateY(40px) scale(0.95)'
        });

        setTimeout(function () {
            $card.css({
                transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                opacity: 1,
                transform: 'translateY(0) scale(1)'
            });
        }, 300 + (i * 120));
    });


    // =====================================================================
    // 15. LOG MEAL — FORM FIELD ANIMATION
    //     Fields glow and expand subtly on focus
    // =====================================================================

    $(document).on('focus', '.input-dish, .input-custom, #review-body', function () {
        $(this).css({
            transform: 'scale(1.01)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        });
    });

    $(document).on('blur', '.input-dish, .input-custom, #review-body', function () {
        $(this).css({
            transform: 'scale(1)',
            transition: 'transform 0.2s ease'
        });
    });


    // =====================================================================
    // 16. PUBLISH BUTTON — SUCCESS ANIMATION
    //     The Publish button shows a checkmark animation on click
    // =====================================================================

    $(document).on('click', '.bg-primary-custom', function () {
        var $btn = $(this);
        var originalText = $btn.text();
        $btn.html('<i class="bi bi-check-lg me-2"></i>Published!');
        $btn.css({
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease'
        });

        setTimeout(function () {
            $btn.css('transform', 'scale(1)');
        }, 200);
    });

});
