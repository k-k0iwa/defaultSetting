(function (win, doc, $) {
    'use strict';

    if (!$) {
        return;
    }

    const $win = $(win);
    const $doc = $(doc);
    const $rootElm = $(doc.documentElement);
    const $body = $('body');
    const $header = $('.l-header');
    const $container = $('.l-container');
    const $main = $('.l-main');
    const $footer = $('.l-footer');
    const mqlPc = window.matchMedia('(min-width:960px)');
    const mqlTab = window.matchMedia('(min-width:720px)');
    const ua = navigator.userAgent;
    const uaLowerCase = ua.toLowerCase();
    const ie = uaLowerCase.indexOf('msie') != -1 || uaLowerCase.indexOf('trident') != -1;
    const edge = uaLowerCase.indexOf('edge') != -1;
    const iphone = ua.indexOf('iPhone') !== -1;
    const android = ua.indexOf('Android') !== -1 && ua.indexOf('Mobile') !== -1;
    const mobile = iphone || android;
    const tablet = ua.indexOf('iPad') > -1 || ua.indexOf('Android') > -1;
    const hiddenClass = 'is-hidden';
    let $this;
    let angle;
    let isPortrait;

    // svgのuse要素,picture要素対策(in lib.js)
    if(ie) {
        svg4everybody();
        picturefill();
    }

    // Terminal Orientation
    function getOrientation() {
        angle = screen && screen.orientation && screen.orientation.angle;

        if (angle === undefined) {
            angle = window.orientation; // iOS
        }

        isPortrait = (angle === 0);

        return({
            value: angle, // 角度
            isPortrait: isPortrait, // 縦
            isLandscape: !isPortrait, // 横
        });
    }

    // Focus Loop, Tab & Shift+Tab Key
    const focusFirstClass = 'is-focusFirst';
    const focusLastClass = 'is-focusLast';
    $.fn.focusLoop = function(options) {
        const focusableSelectors = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];
        const focusableElements = focusableSelectors.join();
        let option = $.extend({
            'area' : 'body',
        }, options);
        let $focus = $();

        this.find(focusableElements).eq(0).addClass(focusFirstClass);
        this.find(focusableElements).eq(-1).addClass(focusLastClass);

        return this.each(function () {
            $(option.area).on('keydown', function (e) {
                $focus = $(':focus');

                if(pushKeyIsTab(e)) {
                    if($focus.hasClass(focusLastClass)) {
                        lastToFirst();
                    };
                };

                if(pushKeyIsTabAndShift(e)){
                    if($focus.hasClass(focusFirstClass)) {
                        firstToLast();
                    };
                };
            });

            const pushKeyIsTab = function (e) {
                return e.keyCode === 9 && !e.shiftKey;
            };

            const pushKeyIsTabAndShift = function (e) {
                return e.keyCode === 9 && e.shiftKey;
            };

            const lastToFirst = function () {
                event.preventDefault();
                $('.' + focusFirstClass, this).focus();
            };

            const firstToLast = function () {
                event.preventDefault();
                $('.' + focusLastClass, this).focus();
            };
        });
    };
    function resetFocusLoop() {
        $('.' + focusFirstClass).removeClass(focusFirstClass);
        $('.' + focusLastClass).removeClass(focusLastClass);
    }

    // 間引き
    $.fn.throttle = function(callback, options) {
        let time = Date.now();
        let lag;
        let debounceTimer;
        let debounceDelay = 16;

        options = $.extend({
            interval: 128
        }, options);

        return function() {
            lag = time + options.interval - Date.now();

            if (lag < 0) {
                callback();
                time = Date.now();
            } else {
                clearTimeout(debounceTimer);

                debounceTimer = setTimeout(function() {
                    callback();
                }, (options.interval - lag + debounceDelay));
            }
        }
    };

    /**
     * SP Menu（Hamburger）
    **/
    (function () {
        const $gNav = $('#aria-spmenu');

        if ($gNav.length <= 0) {
            return;
        }

        const $spMenuBtn = $('#js-spMenuBtn');
        const $tglBtn = $('\<button\>');
        const activeClass = 'is-active';
        const menuOpenClass = 'is-spMenuOpen';
        const $menuAnc = $gNav.find('a');
        let $txt = null;
        let txt = {};

        txt.opened = '\u30E1\u30CB\u30E5\u30FC\u3092\u958B\u304F'; //メニューを開く
        txt.closed = '\u30E1\u30CB\u30E5\u30FC\u3092\u9589\u3058\u308B'; //メニューを閉じる

        $tglBtn.attr({
            type: 'button',
            'class': 'l-spMenuBtn__inner',
            'aria-expanded': 'false',
            'aria-controls': 'aria-spmenu'
        })
        .html('\<span\>' + txt.opened + '\</span\>');
        $txt = $tglBtn.find('span').attr('class', 'u-visuallyHidden');

        function mediaChange(mqlPc) {
            if (mqlPc.matches) {
                $spMenuBtn.removeClass(activeClass).empty();
                closeAction();
                $menuAnc.attr('tabindex', '');
            } else {
                $menuAnc.attr('tabindex', -1);

                $tglBtn.on('click', function () {
                    $spMenuBtn.toggleClass(activeClass);
                    $body.toggleClass(menuOpenClass);

                    if ($tglBtn.attr('aria-expanded') === 'true') {
                        closeAction();
                        resetFocusLoop();
                    } else {
                        $tglBtn.attr('aria-expanded', 'true');
                        $txt.text(txt.closed);
                        $gNav.attr({
                            'aria-expanded': 'true',
                            'aria-hidden': 'false'
                        });
                        $menuAnc.attr('tabindex', 0);
                        $("#aria-spmenu, #js-spMenuBtn").focusLoop();
                    }

                    return false;
                });
                $spMenuBtn.append($tglBtn);

                $gNav.on('click', function () {
                    $spMenuBtn.removeClass(activeClass);
                    $body.removeClass(menuOpenClass);
                    closeAction();

                    return false;
                });

                $('#js-globalNav').on('click', function (e) {
                    e.stopPropagation();
                });
            }
        }
        mediaChange(mqlPc);
        mqlPc.addListener(mediaChange);

        $win.on('update', function () {
            closeAction();
            if (mqlPc.matches) {
                $menuAnc.attr('tabindex', '');
            }
        });

        function closeAction() {
            $tglBtn.attr('aria-expanded', 'false');
            $txt.text(txt.opened);

            $gNav.attr({
                'aria-expanded': 'false',
                'aria-hidden': 'true'
            });
            $menuAnc.attr('tabindex', -1);
        }
    }());

    /**
     * PC Menu（Side）
    **/
    (function () {
        let winHeight;
        let headerHeight;
        let footerHeight;
        let containerHeight;
        let containerInnerHeight;
        let result;
        let startPos = 0;
        let winScrollTop = 0;

        const monitorEle = document.getElementsByClassName('l-contents__inner')[0];
        const observer = new ResizeObserver(function(entries) {
            headerCheck();
        });
        const observation = function() {
            winScrollTop = $win.scrollTop();
            headerCheck();
        };
        const fixedClass = 'is-fixed';
        const ieClass = 'is-ie';

        function getHeight() {
            winHeight = $win.outerHeight();
            headerHeight = $header.outerHeight();
            footerHeight = $footer.outerHeight(true);
            containerHeight = $container.outerHeight();
            containerInnerHeight = $('.l-contents__inner').outerHeight();
        }

        function headerCheck() {
            getHeight();

            if (headerHeight > winHeight) {
                if ((containerHeight > winHeight) && (containerHeight > headerHeight) || (containerHeight <= containerInnerHeight)) {
                    $main.css('height', '');
                    result = headerHeight - winHeight;

                    if (winScrollTop >= startPos) {
                        //scroll down
                        if (winScrollTop >= result) {
                            $header.addClass(fixedClass);
                        }
                    } else {
                        //scroll up
                        if (winScrollTop < result) {
                            $header.removeClass(fixedClass);
                        }
                    }
                    startPos = winScrollTop;
                } else {
                    result = headerHeight - (containerHeight + footerHeight);
                    $main.css('height', containerHeight + result);
                    $header.removeClass(fixedClass);
                }

            } else {
                $header.addClass(fixedClass);
                $main.css('height', '');
            }

            // CSS adjustment when content is small
            if (ie && (containerHeight <= winHeight)) {
                $rootElm.addClass(ieClass);
            } else {
                $rootElm.removeClass(ieClass);
            }
        }

        function mediaChange(mqlPc) {
            if (mqlPc.matches) {
                $win.on('scroll', $.fn.throttle(observation));
                observer.observe(monitorEle);

                winScrollTop = $win.scrollTop();
                if (winScrollTop < 100) {
                    $header.removeClass(fixedClass);
                }
            } else {
                $win.off('scroll');
                observer.unobserve(monitorEle);
                $main.css('height', '');
            }
        }
        mediaChange(mqlPc);
        mqlPc.addListener(mediaChange);

        $win.on('update', function () {
            getHeight();
        });
    }());

    /**
     * Global Nav Current
    **/
    // (function () {
    //     const $gNav = $('#js-globalNav');

    //     if ($gNav.length <= 0) {
    //         return;
    //     }

    //     const $targetLink = $('.js-navItem').find('a[href]');
    //     const targetHref = location.href;

    //     $targetLink.each(function() {
    //         if (targetHref.indexOf(this.href) !== -1) {
    //             $(this).attr('aria-describedby', 'current');

    //             return false;
    //         }
    //     });
    // }());

    /**
     * Footer List Clone
    **/
    (function () {
        const $target = $('#js-footerList');

        if ($target.length <= 0) {
            return;
        }

        const $targetClone = $target.clone();

        function mediaChange(mqlPc) {
            $target.remove();

            if (mqlPc.matches) {
                $targetClone.insertAfter('#aria-spmenu');
            } else {
                $targetClone.insertBefore('.l-txtCopy');
            }
        }
        mediaChange(mqlPc);
        mqlPc.addListener(mediaChange);
    }());

    /**
     * Modal Dialog
     *
     * ・トリガーの「href」「data-modal」とモーダルの親コンテンツid値は統一する
     * ・「aria-labelledby」と「aria-describedby」は必要に応じて付与する
     * <p><a href="#js-modalItem01" data-modal="js-modalItem01">モーダルを開く1</a></p>
     * <p><a href="#js-modalItem02" data-modal="js-modalItem02">モーダルを開く2</a></p>
     *
     * ※下記main要素外、footerの下に記述
     * <div id="js-modalContentsArea" class="c-modalContentsArea">
     *   <div id="js-modalItem01" class="c-modal is-hidden">
     *     <div class="c-modal__inner">
     *       <h2>見出し</h2>
     *       <p>テキスト</p>
     *     <!-- /.c-modal__inner --></div>
     *   <!-- /#js-modal01 --></div>

     *   <div id="js-modalItem02" class="c-modal is-hidden" aria-labelledby="aria-modal02--label" aria-describedby="aria-modal02--desc">
     *     <div class="c-modal__inner">
     *       <h2 id="aria-modal02--label">見出し</h2>
     *       <p id="aria-modal02--desc">このモーダルダイアログの説明テキスト</p>
     *       <p>テキスト</p>
     *     <!-- /.c-modal__inner --></div>
     *   <!-- /#js-modal02 --></div>
     * <!-- /.c-modalContentsArea --></div>
    **/
    (function () {
        let $modalItem = $('[id^=js-modalItem]');
        let $modalItemLength = $modalItem.length;

        // check
        if ($modalItemLength <= 0) {
            return;
        }

        const modalOpenClass = 'is-modalOpen';
        let $btnTrigger = $('[data-modal^=js-modalItem]');
        let $dataModal;
        let $dataModalName;
        let $targetModalItem;
        let $targetModalItemInner;
        let $modalOverlay;
        let $modalId;
        let winHeight;
        let targetHeight;
        let clientWidth;
        let noScrollbarWidth;
        let difference;


        $modalItem.each(function () {
            $(this)
            .attr({
                'role': 'dialog',
                'aria-modal': 'true'
            });
        });

        $modalOverlay = $('\<div\>').attr({
            'id': 'js-modalOverlay',
            'class': 'c-modalOverlay'
        });

        $btnTrigger.on('click', function () {
            $dataModal = $(this).data('modal');
            $dataModalName = '#' + $dataModal;
            $targetModalItem = $($dataModalName);
            $targetModalItemInner = $targetModalItem.find('.c-modal__inner');
            clientWidth = $body[0].clientWidth;

            $targetModalItemInner.attr('tabindex', 0);
            $targetModalItem.removeClass(hiddenClass).focusLoop().wrap($modalOverlay);
            $('.is-focusFirst').focus();
            $body.addClass(modalOpenClass);

            // 中身が多い時スクロールできるように
            winHeight = $win.height();
            targetHeight = $targetModalItem.outerHeight();
            if(targetHeight > winHeight*.8) {
                $targetModalItem.addClass('is-contentsOver');
            }

            // スクロールバーのズレ対策
            if(!mobile && !tablet) {
                noScrollbarWidth = $body[0].clientWidth;
                difference = noScrollbarWidth - clientWidth;
                if (difference > 0) {
                    $body.css('padding-right', difference + 'px');

                    if(!mqlPc.matches) {
                        $header.css('padding-right', difference + 'px');
                    }
                }
            }

            return false;
        });

        // close
        $doc.on('click', '#js-modalOverlay, .js-btn-modalClose', function() {
            closeModal();
        });

        $doc.on('click', '#js-modalContentsArea, [id^=js-modal]', function(e) {
            e.stopPropagation();
        });

        function closeModal() {
            $modalOverlay = $('#js-modalOverlay');
            $targetModalItem = $modalOverlay.find($modalItem);
            $targetModalItemInner = $targetModalItem.find('.c-modal__inner');
            $modalId = $targetModalItem.attr('id');

            $targetModalItemInner.attr('tabindex', -1);
            $targetModalItem.addClass(hiddenClass).unwrap($modalOverlay);
            $body.removeClass(modalOpenClass);
            $btnTrigger.each(function () {
                $this = $(this);
                $dataModal = $this.data('modal');
                if($dataModal === $modalId) {
                    $this.focus();
                }
            });
            resetFocusLoop();

            // スクロールバーのズレ対策
            if(!mobile && !tablet) {
                $body.css('padding-right', '');

                if(!mqlPc.matches) {
                    $header.css('padding-right', '');
                }
            }
        }

        // Key
        $doc.on('keydown', function (e) {
            //27:Esc
            if(($body.hasClass(modalOpenClass)) && (e.keyCode === 27)) {
                closeModal();
            }
        });
    }());

    /**
     * Tab
     *
     * <div class="js-tab c-tab">
     *   <ul class="c-tabList">
     *     <li class="c-tabList__item"><a href="#tab-01">Tab 01</a></li>
     *     <li class="c-tabList__item"><a href="#tab-02">Tab 02</a></li>
     *   </ul>
     *
     *   <div class="c-tabContent" id="tab-01">
     *     <p>Tab 01</p>
     *   <!-- /.c-tabContent --></div>
     *   <div class="c-tabContent" id="tab-02">
     *     <p>Tab 02</p>
     *   <!-- /.c-tabContent --></div>
     * <!-- /.c-tab --></div>
    **/
    (function () {
        let $tab = $('.js-tab');
        let $tabLength = $tab.length;

        // check
        if ($tabLength <= 0) {
            return;
        }

        const currentClass = 'is-current';
        let $tabList = $tab.children('.c-tabList');
        let $tabItem = $tabList.children('.c-tabList__item');
        let $tabItemLength = $tabItem.length;
        let $defaltTabItemCurrent;
        let $tabItemAnchor = $tabItem.children('a');
        let $tabContents = $tab.children('.c-tabContent');
        let $defaltTabContentsCurrent;
        let index;
        let i;
        let identifier;
        let key;
        let keyEventTarget;
        let keyTarget;
        let keyTargetList;

        $tabList.attr('role', 'tablist');
        $tabItem.attr({
            role: 'tab',
            tabindex: -1,
            'aria-selected': false,
            'aria-expanded': false
        });
        $tabItemAnchor.attr({
            role: 'presentation',
            tabindex: -1
        });
        $tabContents.attr('role', 'tabpanel');

        for (i = 0; i < $tabItem.length; i++) {
            identifier = $tabItem.eq(i).children('a').attr('href').slice(1);
            $tabItem.eq(i).attr({
                'aria-controls': identifier,
                'aria-labelledby': 'ui-id-' + identifier
            });
        }

        for (i = 0; i < $tabContents.length; i++) {
            identifier = $tabContents.eq(i).attr('id');
            $tabContents.eq(i).attr('aria-labelledby', 'ui-id-' + identifier);
        }

        $tabList.each(function () {
            $defaltTabItemCurrent = $(this).children('.c-tabList__item').eq(0);
            $defaltTabItemCurrent.addClass(currentClass).attr({
                'tabindex': '0',
                'aria-selected': true,
                'aria-expanded': true
            });
        });

        $tab.each(function () {
            $defaltTabContentsCurrent = $(this).children('.c-tabContent').eq(0);
            $defaltTabContentsCurrent.addClass(currentClass).attr('aria-hidden', 'false');
        });

        $tabItem.on('click', function (e) {
            $tabItem = $(this).closest('.c-tabList').children('.c-tabList__item.is-current');
            $tabItemAnchor = $tabItem.children('a');
            identifier = $tabItemAnchor.attr('href');
            $(identifier).removeClass(currentClass).attr('aria-hidden', 'true');
            $tabItem.removeClass(currentClass).attr({
                tabindex: -1,
                'aria-selected': false,
                'aria-expanded': false
            });

            $tabItemAnchor = $(this).children('a');
            identifier = $tabItemAnchor.attr('href');
            $(identifier).addClass(currentClass).attr('aria-hidden', 'false');

            for (i = 0; i < $tabItem.length; i++) {
                $(this).eq(i).addClass(currentClass).attr({
                    tabindex: 0,
                    'aria-selected': true,
                    'aria-expanded': true
                });
            }

            e.preventDefault();
        });

        //Key
        $tabItem.on('keydown', function (e) {
            $tabItem = $(this).closest('.c-tabList').children('.c-tabList__item');
            $tabItemLength = $tabItem.length;

            key = e.keyCode;
            keyEventTarget = e.target;
            keyTargetList = keyEventTarget.parentNode.children;
            index = Array.prototype.indexOf.call(keyTargetList, keyEventTarget);

            //37:←, 39:→
            if (key === 37) {
                index--;
            } else if (key === 39) {
                index++;
            }

            if (index < 0) {
                index = $tabItemLength - 1;
            } else if (index >= $tabItemLength) {
                index = 0;
            }

            keyTarget = keyTargetList[index];
            keyTarget.click();
            keyTarget.focus();

            // 9:Tab
            if (key === 9) {
                index = 0;
            }
        });
    }());

    /**
     * Anchor Link
     * トップへ戻るリンク、ページ内リンク、ページ外からのアンカーリンクをスムーススクロール
    **/
    (function () {
        const $linkAnchorTop = $('#js-linkAnchorTop');
        const reachDownClass = 'is-reachDown';
        const urlHash = location.hash;
        let ancHref;
        let $ancScrollTarget;
        let ancScrollposition;
        let headerHeight;
        let pageY = window.pageYOffset;
        let winScrollTop = 0;

        $win.on('anchorLinkHash', function () {
            if(urlHash) {
                $ancScrollTarget = $(urlHash);
                ancScrollposition = $ancScrollTarget.offset().top - 20;
                scrollAnker();
            }
        });

        $('[href^="#"].js-scroll').click(function () {
            ancHref = $(this).attr('href');
            $ancScrollTarget = $(ancHref === '#top' ? 'html' : ancHref);
            headerHeight = $header.height() - 20;

            if(ancHref === '#top') {
                ancScrollposition = $ancScrollTarget.offset().top;
            } else {
                ancScrollposition = $ancScrollTarget.offset().top - 20;
            }

            scrollAnker();
            this.blur();
            return false;
        });

        function scrollAnker() {
            $('html, body').animate({
                'scrollTop':ancScrollposition
            }, 400);
        }

        //Page top
        if (pageY > 100) {
            $linkAnchorTop.addClass('is-scrollActive');
        }

        $doc.on('scroll', $.fn.throttle(pageTopAction));

        function pageTopAction() {
            winScrollTop = $win.scrollTop();

            if (winScrollTop > 100) {
                $linkAnchorTop.fadeIn('fast');
            } else {
                $linkAnchorTop.fadeOut('fast');
            }
        }

        //Page top positioon
        const resizeTarget = document.querySelector('.l-main');
        const resizeObserver = new ResizeObserver(function(entries) {
            let winWidth = document.documentElement.offsetWidth;
            let rectTarget = document.querySelector('.l-contents__inner').getBoundingClientRect();
            let result = winWidth - rectTarget.right;

            $linkAnchorTop.css('right', result + 50);
        });

        function mediaChange(mqlPc) {
            if (mqlPc.matches) {
                resizeObserver.observe(resizeTarget);
            } else {
                $linkAnchorTop.css('right', '');
                resizeObserver.unobserve(resizeTarget);
            }
        }

        mediaChange(mqlPc);
        mqlPc.addListener(mediaChange);

        //Page top display control
        const targetFooter = document.querySelector('.l-footer');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0
        };
        const reach = new IntersectionObserver(reachDown, options);

        function reachDown(entries) {
            entries.forEach(function (entry) {
                window.addEventListener('orientationchange', function() {
                    setTimeout(function() {
                        reach();
                    }, 100);
                });

                function reach() {
                    if (entry.isIntersecting) {
                        reachDownAction();
                    } else {
                        deviceOrientation();
                    }
                }
                reach();
            });
        };
        reach.observe(targetFooter);

        function deviceOrientation() {
            angle = getOrientation();

            if(angle.isLandscape && !ie && !edge) {
                reachDownAction();
            } else {
                $linkAnchorTop.removeClass(reachDownClass);
                $main.css('position', '');
            }
        }

        function reachDownAction() {
            $linkAnchorTop.addClass(reachDownClass);
            $main.css('position', 'relative');
        }
    }());

    /**
     * Another Window Link
     *
     * <a href="#" class="js-linkBlank" target="_blank" rel="noopener">別窓で開く</a>
    **/
    (function () {
        const $target = $('.js-linkBlank');

        if ($target.length <= 0) {
            return;
        }

        let $icon;

        function mediaChange(mqlTab) {
            if (mqlTab.matches) {
                $icon = $('\<svg viewBox="-25 0 48 23" preserveAspectRatio="xMaxYMid slice"\>\<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/common/images/icon_blank.svg#blankpc"\>');
            } else {
                $icon = $('\<svg viewBox="25 0 48 23" preserveAspectRatio="xMinYMin slice"\>\<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/common/images/icon_blank.svg#blanksp"\>');
            }

            $icon.attr({
                'class': 'c-iconBlank',
                'aria-label': '\u5225\u30A6\u30A3\u30F3\u30C9\u30A6\u3067\u958B\u304F', //別ウィンドウで開く
                'role': 'img'
            });

            $target.each(function () {
                $(this).children().remove();
                $(this).append($icon.clone(true));
            });

            $icon = null;
        }
        mediaChange(mqlTab);
        mqlTab.addListener(mediaChange);
    }());

    /**
     * Accordion
     *
     * <dl class="c-accordion">
     *   <div class="c-accordionWrap">
     *     <dt class="js-accordionParent c-accordionParent">
     *       <button type="button" class="js-btnAccordion c-btnAccordion">open</button>
     *     </dt>
     *     <dd class="js-accordionDesc c-accordionDesc is-hidden">
     *       <p>description</p>
     *     </dd>
     *   <!-- /.c-accordionWrap --></div>
     * </dl>
     *
     * 何らかの理由でbutton要素を使用できない場合は下記を代用すること
     * <div role="button" class="js-btnAccordion c-btnAccordion">open</div>
     *
     * いくつでも開ける仕様。1つのみ開けるようにしたいなら要追記
     * KEY「Tab」:フォーカスをボタンに移動、「space / Enter」:開閉操作
    **/
    (function () {
        const $openBtn = $('.js-btnAccordion');

        if ($openBtn.length <= 0) {
            return;
        }

        let $targetElement;

        $openBtn
        .each(function (i) {
            i = i + 1;
            $this = $(this);

            $this
            .attr({
                'aria-expanded': 'false',
                'aria-controls': 'accord-' + i
            })
            .closest('.js-accordionParent').next('.js-accordionDesc').attr('id', 'accord-' + i);

            // button要素使えない場合
            if ($this.is('[role=button]')) {
                $this.attr('tabindex', 0).addClass('is-keyboardOperationMark');
            }
        })
        .on('click', function () {
            $this = $(this);
            accordionAction();

            return false;
        });

        function accordionAction() {
            $targetElement = $this.closest('.js-accordionParent').next('.js-accordionDesc');
            $targetElement.slideToggle(200).toggleClass(hiddenClass);

            if($targetElement.hasClass(hiddenClass)) {
                $this.attr('aria-expanded', 'false');
            } else {
                $this.attr('aria-expanded', 'true');
            }
        }

        //Key
        if ($openBtn.hasClass('is-keyboardOperationMark')) {
            $openBtn.on('keydown', function (e) {
                $this = $(this);
                //13:Enter, 32:Space
                if((e.keyCode === 13) || (e.keyCode === 32)) {
                    // Spaceキーでスクロールさせない
                    e.preventDefault();
                    accordionAction();
                }
            });
        }
    }());

    /**
     * Load More
    **/
    (function () {
        const $targetShowMore = $('.js-loadMore');

        if ($targetShowMore.length <= 0) {
            return;
        }

        const loadlNum = 10; //追加件数 *初期表示件数はCSSにて制御
        const itemClass = '.c-loadMore__Item';
        let $targetBtn = $('.js-loadMoreBtn');
        let $targetShowMoreItem;
        let targetShowMoreItemLen;
        let $accordionBtn;
        let $linkElem;
        let arraymaxNum = [];

        $targetShowMore.each(function (i) {
            targetShowMoreItemLen = $(this).children(itemClass).length;
            arraymaxNum.push(targetShowMoreItemLen);

            if(arraymaxNum[i] <= loadlNum) {
                $targetShowMore.eq(i).next($targetBtn).hide();
            } else {
                $targetShowMore.eq(i).next($targetBtn).css('visibility', 'visible');
            }
        });

        $targetBtn.click(function () {
            $this = $(this);
            $targetShowMoreItem = $this.prev($targetShowMore).children(itemClass).filter(':hidden');
            $targetShowMoreItem.slice(0, loadlNum).slideDown(200);

            if($targetShowMoreItem.length <= loadlNum) {
                $this.hide();
            }

            // Accordion key measures, a11y：読み込んだ先頭の要素にフォーカスさせる
            $accordionBtn = $targetShowMoreItem.eq(0).find('[role=button]');
            $linkElem = $targetShowMoreItem.eq(0).children('a[href]');

            if($accordionBtn.length > 0) {
                $accordionBtn.focus();
            } else if ($linkElem.length > 0) {
                $linkElem.focus();
            } else {
                $targetShowMoreItem.eq(0).prevAll(itemClass).removeAttr('tabindex');
                $targetShowMoreItem.eq(0).attr('tabindex', -1).focus();
            }

            return false;
        });
    }());

    /**
     * Reduce Display
    **/
    (function () {
        let $reduceDisplay = $('.js-reduceDisplay');

        if ($reduceDisplay.length <= 0) {
            return;
        }

        const $openBtn = $reduceDisplay.find('.js-btn-details');
        let $targetElement = $reduceDisplay.find('.c-reduceDisplay__wrap');
        let $target;
        let arrayOpened = [];
        let arrayClosed = [];
        let index;

        $openBtn
        .each(function (i) {
            $target = $openBtn.eq(i);
            arrayOpened.push($target.text());
            arrayClosed.push($target.data('closetext'));

            // true：初期非表示
            if ($target.data('state') === 'close') {
                $target
                .text(arrayOpened[i])
                .attr('aria-expanded', 'false')
                .closest('.c-btn-details').prev('.c-reduceDisplay__wrap').css('display', 'none');
            } else {
                $target.text(arrayClosed[i]).attr('aria-expanded', 'true');
            }

            i = i + 1;

            $(this)
            .attr('aria-controls', 'reducedisplay-' + i)
            .closest('.c-btn-details').prev('.c-reduceDisplay__wrap').attr('id', 'reducedisplay-' + i);
        })
        .on('click', function () {
            index = $openBtn.index(this);
            $this = $(this);
            $targetElement = $this.closest('.c-btn-details').prev('.c-reduceDisplay__wrap');
            $targetElement.slideToggle(200);

            if($this.is('[aria-expanded=true]')) {
                $this.attr('aria-expanded', 'false').text(arrayOpened[index]);
            } else {
                $this.attr('aria-expanded', 'true').text(arrayClosed[index]);
            }

            return false;
        });
    }());

    /**
     * Show All
    **/
    (function () {
        let $showArea = $('.c-area-showAll');

        if ($showArea.length <= 0) {
            return;
        }

        const $showBtn = $('.js-btn-showAll');
        const showAllClass = '._showAll';

        $showBtn
        .each(function (i) {
            i = i + 1;

            $(this)
            .attr({
                'aria-expanded': 'false',
                'aria-controls': 'showarea-' + i
            })
            .closest(showAllClass).prev($showArea).attr('id', 'showarea-' + i);
        })
        .on('click', function () {
            $this = $(this);
            $showArea = $this.closest(showAllClass).prev($showArea);
            $showArea.slideDown(200);
            $this
            .attr('aria-expanded', 'true')
            .closest(showAllClass).hide();

            return false;
        });
    }());

    /**
     * Clear Button
    **/
    (function () {
        let $targetClearBtn = $('.js-clearBtn');

        if ($targetClearBtn.length <= 0) {
            return;
        }

        const $targetInput = $targetClearBtn.prevAll('[type="search"]');

        $targetClearBtn.prop('disabled', true);

        $targetInput.on('input', function () {
            $this = $(this);
            $targetClearBtn = $this.nextAll($targetClearBtn);

            if ($this.val() === '') {
                $targetClearBtn.prop('disabled', true);
            } else {
                $targetClearBtn.prop('disabled', false);
            }
        });

        $targetClearBtn.on('click', function () {
            $(this)
            .prop('disabled', true)
            .prevAll('[type="search"]').val('');

            return false;
        });
    }());

    /**
     * Add Search Condition
    **/
    (function () {
        const $targetBtn = $('.js-addCondition');

        if ($targetBtn.length <= 0) {
            return;
        }

        const targetBtnWrapClass = '.c-searchForm';
        const targetAreaClass = '.c-conditionForm';
        const $closeBtn = $('\<button\>');
        const $closeBtnInner = $('\<span\>');
        let $targetArea = $targetBtn.parents(targetBtnWrapClass).next(targetAreaClass);

        $closeBtnInner
        .attr('class', 'c-btn-line__inner')
        .html('\u9589\u3058\u308B');//閉じる

        $closeBtn.attr({
            type: 'button',
            'class': 'c-btn-line _close'
        })
        .html($closeBtnInner);
        $targetArea.prepend($closeBtn);

        $targetBtn.on('click', function () {
            $this = $(this);
            $targetArea = $this.parents(targetBtnWrapClass).next(targetAreaClass);
            $this.prop('disabled', true);
            $targetArea.slideDown(400);
            $targetArea.find('._close').focus();

            return false;
        });

        $doc.on('click', '.c-btn-line._close', function () {
            $targetArea = $(this).parents(targetAreaClass);
            $targetArea.slideUp(400);
            $targetArea.prev(targetBtnWrapClass).find('.js-addCondition').prop('disabled', false).focus();

            return false;
        });
    }());

    /**
     * Switch Check(Popup Alert)
    **/
    (function () {
        const $targetSwitch = $('.js-switchCheck');

        if ($targetSwitch.length <= 0) {
            return;
        }

        const $popupContentsArea = $('#js-popupContentsArea');
        const popupHiddenClass = 'is-popup-hidden';
        let targetDisplay;
        let timerId = null;

        $('[id^=js-popuplItem]').each(function () {
            $(this).attr('role', 'alert');
        });

        $targetSwitch.on('change', function () {
            targetDisplay = '#' + $(this).data('popup');
            $popupContentsArea.fadeIn();
            $(targetDisplay).removeClass(popupHiddenClass);

            clearTimeout(timerId);
            startTimer();
        });

        function startTimer() {
            timerId = setTimeout(function() {
                $(targetDisplay).addClass(popupHiddenClass);
                $popupContentsArea.fadeOut();
            }, 3000);
        }
    }());

    /**
     * Consent Check
    **/
    (function () {
        const $targetCheckWrap = $('#js-areaConsentCheck');

        if ($targetCheckWrap.length <= 0) {
            return;
        }

        const $targetCheck = $targetCheckWrap.children('.js-consentCheck');
        const $targetBtn = $('#js-areaAccountBtn').children('.js-accountBtn');
        const $targetArea = $('#js-areaAccount');

        $targetCheck.on('change', function () {
            if($(this).prop('checked')) {
              $targetBtn.prop('disabled', false);
            } else {
              $targetBtn.prop('disabled', true);
              $targetArea.slideUp();
            }
        });

        $targetArea.css('display', 'none');
        $targetBtn.on('click', function () {
            $targetArea.slideDown();
        });
    }());

    /**
     * Calendar(flatpickr)
    **/
    (function () {
        const $targetCalendar = $('.js-flatpickr');

        if ($targetCalendar.length <= 0) {
            return;
        }

        $targetCalendar.flatpickr({
            locale: "ja",
            dateFormat: "Y/m/d"
        });
    }());

    /*
     * 読み込み後実施する動作
     */
    $win.on('load', function () {
        let key = null;

        $win.trigger('update');

        key = setTimeout(function () {
            $win.trigger('anchorLinkHash');
            clearTimeout(key);
        }, 200);
    });
}(window, window.document, window.jQuery));
