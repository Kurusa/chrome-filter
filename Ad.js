class Ad {
    hidden_class = 'hidden_ad';
    hideAdIcon = '✖️';
    showAdIcon = '👁️';
    ad_selector = '*[data-cy="l-card"]';

    constructor(
        ad_dom_object = null,
        ad_id = null,
        storage = null
    ) {
        this.ad_dom_object = ad_dom_object;
        this.ad_id = ad_id;
        this.storage = storage;
    }

    async hide() {
        await this.storage.addHiddenId(this.ad_id);
        this.is_ad_hidden = true;

        this.prependButton();
        $(this.ad_dom_object)
            .addClass(this.hidden_class)
            .find('.css-qfzx1y').addClass('hidden_background');

        if ($(this.ad_dom_object).find('.hide_button').length) {
            $(this.ad_dom_object).find('.hide_button').remove();
        }
    }

    async show() {
        await this.storage.removeHiddenId(this.ad_id);
        this.is_ad_hidden = false;

        this.prependButton();
        $(this.ad_dom_object)
            .removeClass(this.hidden_class)
            .find('.css-qfzx1y').removeClass('hidden_background');

        if ($(this.ad_dom_object).find('.show_button').length) {
            $(this.ad_dom_object).find('.show_button').remove();
        }
    }

    prependButton() {
        let button;
        if (this.is_ad_hidden === true) {
            if ($(this.ad_dom_object).find('.show_button').length) {
                return;
            }
            this.updateAdsCount();
            button = $('<span data-ad-id="' + this.ad_id + '">' + this.showAdIcon + '</span>');
            button.addClass('olx_EAButton show_button').on('click', {'ad': this}, async function (event) {
                event.preventDefault();
                event.stopPropagation();

                await event.data.ad.show();
                event.data.ad.updateAdsCount();
            });
        }
        if (this.is_ad_hidden === false) {
            if ($(this.ad_dom_object).find('.hide_button').length) {
                return;
            }
            button = $('<span data-ad-id="' + this.ad_id + '">' + this.hideAdIcon + '</span>');
            button.addClass('olx_EAButton hide_button').on('click', {'ad': this}, async function (event) {
                event.preventDefault();
                event.stopPropagation();

                await event.data.ad.hide();
            });
        }

        $(this.ad_dom_object).find('*[data-testid="ad-price"]').prepend(button);
    }

    updateAdsCount(addCount = null) {
        // Показуються усі оголошення, тож кількість вже максимальна
        if ($('.show_hidden_ads_pushed').length) {
            return
        }
        let ads_count_block = $('*[data-testid="total-count"]');
        // Понад 1000 оголошень
        if (ads_count_block.find('span').length) {
            return;
        }

        let count = parseInt(ads_count_block.text().match(/\d/g).join(''));
        if (addCount) {
            count += addCount;
        }
        else {
            if (this.is_ad_hidden === true) {
                count--;
            }
            else {
                count++;
            }
        }

        ads_count_block.text('Ми знайшли ' + count + ' оголошень');
    }

    showAllAdds() {
        this.updateAdsCount($('.' + this.hidden_class).length);
        $(this.ad_selector).removeClass(this.hidden_class);
    }
}
