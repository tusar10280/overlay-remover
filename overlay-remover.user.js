// ==UserScript==
// @name         Smart Overlay Remover
// @namespace    https://tampermonkey.net/
// @version      2.0
// @description  Detect and remove common screen-blocking overlays
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    if (window.top !== window.self) return;

    const button = document.createElement('button');

    button.textContent = '✖ Remove Overlay';

    Object.assign(button.style, {
        position: 'fixed',
        top: '15px',
        right: '15px',
        zIndex: '2147483647',
        padding: '12px 18px',
        background: '#ff3366',
        color: 'white',
        border: '2px solid white',
        borderRadius: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 3px 15px #0008'
    });

    document.body.appendChild(button);

    button.addEventListener('click', () => {
        let removed = 0;

        const elements = [...document.body.querySelectorAll('*')];
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Check the largest elements first.
        elements.sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            return (rb.width * rb.height) - (ra.width * ra.height);
        });

        for (const el of elements) {
            if (!el.isConnected || el === button || el.contains(button)) {
                continue;
            }

            // Don't remove the main page containers.
            if (['HTML', 'BODY', 'MAIN'].includes(el.tagName)) {
                continue;
            }

            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();

            if (
                style.display === 'none' ||
                style.visibility === 'hidden' ||
                Number(style.opacity) === 0
            ) {
                continue;
            }

            const coversScreen =
                rect.width >= width * 0.7 &&
                rect.height >= height * 0.7;

            const overlayPosition =
                ['fixed', 'absolute'].includes(style.position);

            const looksLikeOverlay =
                /overlay|backdrop|modal|popup|lightbox|consent|paywall/i
                    .test(String(el.className) + ' ' + (el.id || ''));

            if (
                overlayPosition &&
                (coversScreen || looksLikeOverlay)
            ) {
                el.remove();
                removed++;
            }
        }

        // Restore scrolling if the overlay locked it.
        document.documentElement.style.setProperty(
            'overflow', 'auto', 'important'
        );

        document.body.style.setProperty(
            'overflow', 'auto', 'important'
        );

        alert('Removed ' + removed + ' possible overlay element(s).');
    });

})();
