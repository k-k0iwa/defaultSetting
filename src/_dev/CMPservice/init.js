(function (win, doc) {
    'use strict';

    let docElement = doc.documentElement;

    if (docElement && docElement.nodeType === 1) {
        docElement.setAttribute('data-script-enabled', 'true');
    }
    docElement = null;

    const ua = navigator.userAgent;

    if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') > -1) {
        doc.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no');
    }
}(window, window.document));
