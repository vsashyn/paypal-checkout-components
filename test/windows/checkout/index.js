/* @flow */

import { createTestContainer, createElement } from '../../tests/common';

let { action, onRender, onInit } = window.xprops.test;

let actions = {
    close() {
        window.close();
    }
};

let hash = window.location.hash ? `&hash=${ window.location.hash.slice(1) }` : '';

let client = window.paypal.client();

if (action === 'checkout') {

    window.xprops.payment().then(orderID => {

        return client.Promise.try(() => {

            if (window.xprops.init) {
                return window.xprops.init({
                    orderID,
                    cancelUrl: `#cancel?token=${ orderID }${ hash }`
                });
            }

        }).then(() => {

            if (window.xprops.onAuth) {
                return window.xprops.onAuth('xxxyyy');
            }

        }).then(() => {

            window.xprops.onAuthorize({
                orderID,
                intent:     'sale',
                payerID:    'YYYYYYYYYYYYY',
                cancelUrl:  `#cancel?token=${ orderID }${ hash }`,
                returnUrl:  `#return?token=${ orderID }&PayerID=YYYYYYYYYYYYY${ hash }`,
                currentUrl: window.location.href
            });
        });
    });

} else if (action === 'cancel') {

    window.xprops.payment().then(orderID => {

        window.xprops.onCancel({
            orderID,
            cancelUrl: `#cancel?token=${ orderID }${ hash }`
        });
    });

} else if (action === 'popout') {

    createTestContainer();

    let testButton = createElement({ tag: 'button', id: 'testButton', container: 'testContainer' });

    testButton.addEventListener('click', () => {
        window.xchild.hide();

        client.Checkout.renderPopupTo(window.xchild.getParentRenderWindow(), {
            payment:          window.xprops.payment,
            onAuthorize:      window.xprops.onAuthorize,
            onCancel:         window.xprops.onCancel,
            onError:          window.xprops.onError
        }, 'body');
    });

    testButton.click();

} else if (action === 'error') {

    window.xprops.payment().then(() => {
        window.xchild.error(new Error('something went wrong'));
    });

} else if (action === 'init') {
    
    window.xprops.payment().then(() => {
        if (onInit) {
            return onInit(actions);
        }
    });
}

if (onRender) {
    onRender(actions);
}
