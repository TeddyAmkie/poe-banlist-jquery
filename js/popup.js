// Code for the popup window when you click the chrome extension button.


// TODO: Turn this into an actual class.

(function (window) {

    let BlockerPopUp = {
        sellersBlocked: [],
        reviewList: {},

        init: function () {
            this.buildBlockedSellersList()
        },
        buildBlockedSellersList: function () {
            let blockedSellerList = $('.blocked-seller-list');
            let self = this;

            chrome.storage.sync.get(['review-list'], function (reviewList) {
                let results = reviewList['review-list'] ? reviewList['review-list'] : {};
                console.log("Popup storage succesfully receieved: ", results);
                self.reviewList = results;

                for (let seller in self.reviewList) {
                    let sellerNumber = 0;

                    // Create table row for seller
                    let item = `
                    <tr>
                    <th scope="row">${sellerNumber}</th>
                    <td>${self.reviewList[seller]['score']}</td>
                    <td>${seller}</td>`
                    //Append all reasons as new columns to that seller
                    for (let reason in self.reviewList[seller]['reason']) {
                        // if it's the first reason, put it on the same row
                        if (reason == 0) {
                            console.log('sup my guy');
                            item += `
                        <td> ${self.reviewList[seller]['reason'][reason]} </td>
                        `
                        }
                        // if it's not, 
                        else {
                            item += `
                            <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td> ${self.reviewList[seller]['reason'][reason]} </td>
                            </tr>`
                        }
                    }

                    // Close the table row block
                    item += `
                    </tr>`
                    // Append to table
                    blockedSellerList.append(item);
                    sellerNumber++;
                }
            });

            // Legacy code
            // chrome.storage.sync.get(['blocked-sellers'], function (blockedSellers) {
            //     let results = blockedSellers['blocked-sellers'] ? blockedSellers['blocked-sellers'] : [];
            //     self.sellersBlocked = results;

            //     $('.no-items').show();
            //     if (self.sellersBlocked.length) {
            //         $('.no-items').hide();
            //     }

            //     _.each(self.sellersBlocked, function (seller) {
            //         let item = "<li data-ign='" + seller + "'><span class='left'>" + seller + "</span><span class='right'><a href='#' class='remove-seller-from-blacklist'>Remove</a></span></li>";

            //         blockedSellerList.append(item);
            //     });
            // });
        },
        removeSellerFromList: function (sellerToRemove) {
            this.sellersBlocked = _.filter(this.sellersBlocked, function (seller) { return seller != sellerToRemove; });
            let jsonObj = {};
            jsonObj['blocked-sellers'] = this.sellersBlocked;
            chrome.storage.sync.set(jsonObj, function (obj) {
                $('.blocked-seller-list').empty();
                BlockerPopUp.buildBlockedSellersList();
            });
        },
        massAddUsersToBlacklist: function (text) {
            let igns = text.split("\n");
            for (let i = 0; i < igns.length; i++) {
                let ign = igns[i].trim();
                this.sellersBlocked.push(ign);
            }
            this.sellersBlocked = _.uniq(this.sellersBlocked);
            let jsonObj = {};
            jsonObj['blocked-sellers'] = this.sellersBlocked;
            chrome.storage.sync.set(jsonObj, function (obj) {
                $('.blocked-seller-list').empty();
                BlockerPopUp.buildBlockedSellersList();
                $('.sellers-to-block-textarea').val('');
            });
        },
        removeAllFromBlacklist: function () {
            this.sellersBlocked = []
            let jsonObj = {};
            jsonObj['blocked-sellers'] = this.sellersBlocked;
            chrome.storage.sync.set(jsonObj, function (obj) {
                $('.blocked-seller-list').empty();
                BlockerPopUp.buildBlockedSellersList();
            });
        }
    };

    // Initalize code
    $(document).ready(function () {

        BlockerPopUp.init();

        // Highlights the row you click on. TODO: Convert from targeting the list to targeting the table.
        $('ul.tabs li').click(function () {
            let tab_id = $(this).attr('data-tab');

            $('ul.tabs li').removeClass('active');
            $('.tab-content').removeClass('active');

            $(this).addClass('active');
            $("#" + tab_id).addClass('active');
        });
    });

    // Click Handlers
    $(document).on('click', '.remove-seller-from-blacklist', function (e) {
        e.preventDefault();
        let ign = $(this).parents('li').data('ign');
        if (confirm('Remove this user from your blacklist?')) {
            BlockerPopUp.removeSellerFromList(ign);
        }
        return false;
    });

    $(document).on('click', '.parse-mass-add-sellers', function (e) {
        e.preventDefault();
        if (confirm('Add these users to your blacklist?')) {
            let text = $('.sellers-to-block-textarea').val();
            BlockerPopUp.massAddUsersToBlacklist(text);
        }
        return false;
    });

    $(document).on('click', '.clear-all-users', function (e) {
        e.preventDefault();
        if (confirm('Remove all users from your blacklist?')) {
            BlockerPopUp.removeAllFromBlacklist();
        }
        return false;
    });

})(window);
