class Extension_storage {

    constructor(siteName) {
        this.storageInitialised = false;
        this.siteName = siteName;
        this.EAStorage = null;
        this.writed = true;
    }

    async initStorage() {
        if (this.storageInitialised) {
            return;
        }

        let result = await this.getDataFromStorage();
        if (result === undefined) {
            await this.setDataToStorage({
                'EAStorage': {
                    'olx': {
                        'hiddenIds': [],
                    },
                }
            });

        }
        else if (result.olx === undefined) {
            await this.initOlx(result);
        }

        this.storageInitialised = true;

    }

    async initOlx(result) {
        result.olx = {
            'hiddenIds': [],
        };

        await this.setDataToStorage({
            'EAStorage': result
        });

    }

    getDataFromStorage(key1 = null, key2 = null) {
        let that = this;

        if (this.writed) {
            return new Promise(resolve => {
                chrome.storage.local.get('EAStorage', function (result) {
                    that.EAStorage = result.EAStorage;
                    let value = result.EAStorage;

                    if (key1) {
                        value = value[key1];
                    }
                    if (key2) {
                        value = value[key2];
                    }

                    that.writed = false;

                    resolve(value);

                });

            });
        }
        else {
            let value = this.EAStorage;

            if (key1) {
                value = value[key1];
            }
            if (key2) {
                value = value[key2];
            }

            return value;
        }
    }

    setDataToStorage(data) {
        let that = this;

        return new Promise((resolve) => {
            that.writed = true;

            chrome.storage.local.set(data, resolve);
        });
    }

    async getHiddenIds() {
        return this.getDataFromStorage(this.siteName, 'hiddenIds');
    }

    async addHiddenId(id) {
        let hiddenIds = await this.getHiddenIds();
        if (hiddenIds.includes(id)) {
            return;
        }
        hiddenIds.push(id);
        this.EAStorage[this.siteName].hiddenIds = hiddenIds;

        await this.setDataToStorage({
            'EAStorage': this.EAStorage
        });
    }

    async removeHiddenId(id) {
        let hiddenIds = await this.getHiddenIds();
        if (!hiddenIds.includes(id)) {
            return;
        }
        hiddenIds = hiddenIds.filter(function (item) {
            return item !== id;
        });
        this.EAStorage[this.siteName].hiddenIds = hiddenIds;

        await this.setDataToStorage({
            'EAStorage': this.EAStorage
        });
    }
}