let storage, showHiddenAdsButton;

let ad;
let ad_selector = '*[data-cy="l-card"]';

jQuery(window).on('load', async function () {
    //chrome.storage.local.clear()
    let requestObserver = new PerformanceObserver(async function (list) {
        if (list.getEntries()[0].initiatorType === 'fetch') {
            await init_storage();
            await init_buttons();
        }
    });
    requestObserver.observe({type: 'resource'});
});

async function init_storage() {
    if (!storage) {
        storage = new Extension_storage('olx');
        await storage.initStorage();
    }
}

async function init_buttons() {
    let hiddenIds = await storage.getHiddenIds();
    let currentAdId;

    $(ad_selector).map(async function () {
        currentAdId = await getAdId(this);
        let ad = new Ad(this, currentAdId, storage);
        if (hiddenIds.includes(currentAdId)) {
            await ad.hide();
        }
        else {
            await ad.show();
        }
    });

    await addShowHiddenAdsButton();
}

async function getAdId(ad) {
    // */*-IDQQ7Mq.html
    return $(ad)
        .find('a')
        .attr('href')
        .split('.html')[0]
        .split('-')
        .slice(-1)[0];
}

// Показати приховані
async function addShowHiddenAdsButton() {
    if ($('body').find('.showHiddenAdsButton').length) {
        return;
    }
    showHiddenAdsButton = $('<p class=\'showHiddenAdsButton\'>Показати приховані</p>');
    showHiddenAdsButton.on('click', showHiddenAdsHandler);
    $('body').append(
        $('<div class=\'EAMenu\'></div>')
            .append(showHiddenAdsButton)
            .append($('<div class="buttonArrows">&#8644;</div>'))
    );
}

async function showHiddenAdsHandler(event) {
    if ($(event.currentTarget).hasClass('show_hidden_ads_pushed')) {
        let hiddenIds = await storage.getHiddenIds();
        let currentAdId;
        $(ad_selector).map(async function () {
            currentAdId = await getAdId(this);
            let ad = new Ad(this, currentAdId, storage);
            if (hiddenIds.includes(currentAdId)) {
                await ad.hide();
                ad.updateAdsCount();
            }
        });

        $(event.currentTarget).removeClass('show_hidden_ads_pushed');
        $(event.currentTarget).text('Показати приховані');
    }
    else {
        let ad = await new Ad();
        ad.showAllAdds();
        $(event.currentTarget).addClass('show_hidden_ads_pushed');
        $(event.currentTarget).text('Сховати приховані');
    }
}
