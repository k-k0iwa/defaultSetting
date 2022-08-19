'use strict';

const currentClass = 'is-current';

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
