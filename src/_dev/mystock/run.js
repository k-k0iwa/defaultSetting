'use strict';

const $win = window;
const $body = window.document.body;
const currentClass = 'is-current';
const hiddenClass = 'is-hidden';
const mqlTab = window.matchMedia('(min-width:768px)');
const ua = navigator.userAgent;
const uaLowerCase = ua.toLowerCase();
const iphone = ua.indexOf('iPhone') !== -1;
const android = ua.indexOf('Android') !== -1 && ua.indexOf('Mobile') !== -1;
const mobile = iphone || android;
const tablet = ua.indexOf('iPad') > -1 || ua.indexOf('Android') > -1;

// Smooth Scroll
(() => {
    document.querySelectorAll('[href^="#anc-"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();

            let href = e.target.getAttribute('href');

            if(href === "#anc-top") {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }

            return false;
        });
    });
})();

// Tab
/*
<div class="c-tab js-tab">
  <ul class="c-tab__nav js-tab__nav">
    <li class="c-tab__nav__item is-current">
      <a href="#tab-sample01" class="c-tab__nav__item__inner">Section1-1</a>
    </li>
    <li class="c-tab__nav__item">
      <a href="#tab-sample02" class="c-tab__nav__item__inner">Section1-2</a>
    </li>
  </ul>
  <div class="c-tab__body">
    <div id="tab-sample01" class="c-tab__body__item is-current">
      <p>Section1-1</p>
    </div>
    <div id="tab-sample02" class="c-tab__body__item">
      <p>Section1-2</p>
    </div>
  </div>
</div>
*/
(() => {
    const $tabs = document.querySelectorAll('.js-tab');

    if ($tabs.length <= 0) {
        return;
    }

    Array.prototype.forEach.call($tabs, tab => {
        const $tabNavItems = tab.querySelectorAll('.js-tab__nav > li');

        Array.prototype.forEach.call($tabNavItems, tabNavItem => {
            tabNavItem.addEventListener('click', e => {
                const $currentLink = e.currentTarget.firstElementChild;
                const currentId = $currentLink.hash.slice(1);
                const $currentTargetElem = document.getElementById(currentId);
                const $currentLinkParent = $currentLink.parentNode;
                const activeItems = $currentLinkParent.parentNode.parentNode.querySelectorAll('.is-current');

                Array.prototype.forEach.call(activeItems, activeItem => {
                    activeItem.classList.remove(currentClass);
                });

                $currentLinkParent.classList.add(currentClass);
                $currentTargetElem.classList.add(currentClass);

                e.preventDefault();
            });
        });
    });
})();

// Accordion
/*
<dl class="c-acc">
  <div class="c-acc__item">
    <dt class="c-acc__item__hdg">
      <button class="c-acc-trigger js-acc-trigger" type="button">見出し01</button>
    </dt>
    <dd id="acc-sample01" class="c-acc__item__body">
      <p>コンテンツ01</p>
    </dd>
  </div>
  <div class="c-acc__item">
    <dt class="c-acc__item__hdg">
      <button class="c-acc-trigger js-acc-trigger" type="button">見出し02</button>
    </dt>
    <dd id="acc-sample02" class="c-acc__item__body">
      <p>コンテンツ02</p>
    </dd>
  </div>
</dl>
*/
(() => {
    const $triggers = document.querySelectorAll('.js-acc-trigger');

    if ($triggers.length <= 0) {
        return;
    }

    Array.prototype.forEach.call($triggers, trigger => {
        const controls = trigger.parentNode.nextElementSibling.id;
        const $panel = document.getElementById(controls);
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', controls);

        trigger.addEventListener('click', (e) => {
            const target = e.currentTarget;

            if (target.ariaExpanded === 'true') {
                target.setAttribute('aria-expanded', 'false');
                $panel.style.height = 0;
            } else {
                target.setAttribute('aria-expanded', 'true');
                $panel.style.height = 'auto';
            }

            $panel.classList.toggle(currentClass);
        });
    });
})();

// Modal  ※エンターキーで開くとバグる
/*
モーダルターゲットにつける名前「js-modalItem」は固定
<a href="#js-modalItemSample01" data-modal="js-modalItemSample01">モーダルターゲット1</a>
<a href="#js-modalItemSample02" data-modal="js-modalItemSample02">モーダルターゲット2</a>

以下mainの外に配置
<!-- ▼▼▼ Modal Contents Area ▼▼▼ -->
<div id="js-modalContentsArea" class="c-modalContentsArea">
  <div id="js-modalItemSample01" class="c-modal is-hidden">
    <div class="c-modal__inner">
      <p>中身1</p>
    </div>
  </div>

  <div id="js-modalItemSample02" class="c-modal is-hidden">
    <div class="c-modal__inner">
      <p>中身2</p>
    </div>
  </div>
</div>
<!-- ▲▲▲ Modal Contents Area ▲▲▲ -->
*/
(() => {
    const $modalItems = document.querySelectorAll('[id^=js-modalItem]');

    if ($modalItems.length <= 0) {
        return;
    }

    const modalOpenClass = 'is-modalOpen';
    const $btnTriggers = document.querySelectorAll('[data-modal^=js-modalItem]');
    const $btnCloses = document.querySelectorAll('.js-btn-modalClose');
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
    let $currTargetBtn;

    const  focusableElem = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [contenteditable], [tabindex]:not([tabindex^="-"])';
    let firstFocusableElem;
    let focusableContent;
    let lastFocusableElem;

    const modalOpen = ($btnTrigger) => {
        $dataModal = $btnTrigger.dataset.modal;
        $dataModalName = "'" + '#' + $dataModal + "'";
        $targetModalItem = document.getElementById($dataModal);
        $targetModalItemInner = $targetModalItem.getElementsByClassName('c-modal__inner')[0];
        clientWidth = $body.clientWidth;

        $targetModalItemInner.setAttribute('tabindex', 0);

        $targetModalItem.classList.remove(hiddenClass);
        $targetModalItem.parentNode.insertBefore($modalOverlay, $targetModalItem);
        $modalOverlay.appendChild($targetModalItem);
        $body.classList.add(modalOpenClass);

        // フォーカス管理 & Key
        firstFocusableElem = $targetModalItem.querySelectorAll(focusableElem)[0];
        focusableContent = $targetModalItem.querySelectorAll(focusableElem);
        lastFocusableElem = focusableContent[focusableContent.length - 1];
        firstFocusableElem.focus();

        document.addEventListener('keydown', function(e) {
            let isTabPressed = e.key === 'Tab' || e.key === 'Escape';

            if (!isTabPressed) {
                return;
            }

            if (e.key === 'Escape') { // Escape key
                modalClose();
            } else if (e.key === 'Shift') { // shift + tab key
                if (document.activeElement === firstFocusableElem) {
                    lastFocusableElem.focus();
                    e.preventDefault();
                }
            } else { // tab key
                if (document.activeElement === lastFocusableElem) {
                    firstFocusableElem.focus();
                    e.preventDefault();
                }
            }
        });

        // 中身が多い時スクロールできるように
        winHeight = $win.outerHeight;
        targetHeight = $targetModalItem.offsetHeight;
        if(targetHeight > winHeight*.8) {
            $targetModalItem.classList.add('is-contentsOver');
        }

        // スクロールバーのズレ対策
        if(!mobile && !tablet) {
            noScrollbarWidth = $body.clientWidth;
            difference = noScrollbarWidth - clientWidth;
            if (difference > 0) {
                $body.style.paddingRight = difference + 'px';

                if(!mqlTab.matches) {
                    $header.style.paddingRight = difference + 'px';
                }
            }
        }

        return false;
    }

    const modalClose = () => {
        $modalOverlay = document.getElementById('js-modalOverlay');
        $targetModalItem = $modalOverlay.firstChild;
        $targetModalItemInner = $targetModalItem.getElementsByClassName('c-modal__inner')[0];
        $modalId = $targetModalItem.getAttribute('id');

        $targetModalItemInner.setAttribute('tabindex', -1);
        $targetModalItem.classList.add(hiddenClass);

        // オーバーレイ（親）のみ削除
        while ($modalOverlay.firstChild) {
            $modalOverlay.parentNode.insertBefore($modalOverlay.firstChild, $modalOverlay);
        }
        $modalOverlay.parentNode.removeChild($modalOverlay);

        $body.classList.remove(modalOpenClass);

        // フォーカス管理
        $btnTriggers.forEach($btnTrigger => {
            $dataModal = $btnTrigger.dataset.modal;
            if($dataModal === $modalId) {
                $btnTrigger.focus();
            }
        });

        // スクロールバーのズレ対策
        if(!mobile && !tablet) {
            $body.style.paddingRight = '';

            if(!mqlTab.matches) {
                $header.style.paddingRight = '';
            }
        }
    }

    $modalItems.forEach($modalItem => {
        $modalItem.setAttribute('role', 'dialog');
        $modalItem.setAttribute('aria-modal', 'true');
    });

    $modalOverlay = document.createElement('div');
    $modalOverlay.setAttribute('id', 'js-modalOverlay');
    $modalOverlay.setAttribute('class', 'c-modalOverlay');

    $btnTriggers.forEach($btnTrigger => {
        $btnTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            $currTargetBtn = e.currentTarget;
            modalOpen($currTargetBtn);
        });
    });

    $btnCloses.forEach($btnClose => {
        $btnClose.addEventListener('click', () => {
            modalClose();
        });
    });

    $modalOverlay.addEventListener('click', () => {
        modalClose();
    });
})();

// Slider
(() => {
})();

// Hamburger
(() => {
})();

// Mega menu
(() => {
})();

// Loading
(() => {
})();
