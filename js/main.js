// Code for the functionality on the page. 
// We're going to create a (class) and populate it with methods of all the page functionality.

// TODO: Turn this into an actual class.
(function (window) {

    let Blocker = {
        // Initalizers
        isCurrencyPage: false,
        usersBlocked: [],
        reviewList: {},
        init: function () {
            this.checkPage()
            this.getChromeStorage();
            this.allWhispers();
        },
        checkPage: function () {
            let host = window.location.host;
            this.isCurrencyPage = host.indexOf('currency') > -1
        },
        // Get data from chrome storage and update page accordingly.
        getChromeStorage: function () {
            // We want to store the Blocker class as this so we don't end up calling methods on the window.
            let self = this;
            // Get data from chrome storage
            chrome.storage.sync.get(['review-list'], function (reviewList) {
                let results = reviewList['review-list'] ? reviewList['review-list'] : {};
                // console.log("Storage succesfully receieved: ", results);
                self.reviewList = results;

                // Modify page based on storage data
                for (let user in self.reviewList) {
                    if (self.reviewList[user].score > 0) {
                        self.upvoteUserUI(user);
                    }
                    if (self.reviewList[user].score < 0) {
                        self.downvoteUser(user);
                    }
                    if (self.reviewList[user].hidden) {
                        self.hideUser(user);
                    }
                }
            });


            // chrome.storage.sync.get(['blocked-sellers'], function (blockedSellers) {
            //     let results = blockedSellers['blocked-sellers'] ? blockedSellers['blocked-sellers'] : [];
            //     self.usersBlocked = results;

            //     _.each(self.usersBlocked, function (seller) {
            //         self.hideUser(seller);
            //     });
            // });
        },

        // Set-up buttons:
        allWhispers: function () {
            let self = this;
            let sellers = this.isCurrencyPage ? $('.displayoffer-bottom span.right a') : $('.whisper-btn');

            _.each(sellers, function (seller) {
                self.appendButtons(seller);
            });
        },
        appendButtons: function (position) {
            // block button
            let hide = '<span class="block-seller-wrapper"><a class="hide-seller" href="#">Hide User</a></span>'

            // upvote button
            let upvote = '<span class="block-seller-wrapper"><a class="upvote-seller" href="#">Upvote</a></span>'

            //downvote button 
            let downvote = '<span class="block-seller-wrapper"><a class="downvote-seller" href="#">Downvote</a></span>'


            $(position).after(downvote).after(upvote).after(hide);
        },

        // Button click handler actions
        hideUser: function (user) {
            this.usersBlocked.push(user);
            if (this.reviewList[user]) {
                this.reviewList[user].hidden = true;
                // console.log(this.reviewList);
            }
            else {
                this.reviewList[user] = {
                    score: 0,
                    hidden: true
                }
            }

            let object = {};
            // object['blocked-sellers'] = this.usersBlocked;
            object['review-list'] = this.reviewList;
            chrome.storage.sync.set(object);
            this.hideUserUI(user);
        },

        upvoteUser: function (user, reason) {

            // Add score + reason 
            if (this.reviewList[user]) {
                let seller = this.reviewList[user];
                seller.score += 1;
                if (seller.reason !== undefined || seller.reason !== null) {
                    seller.reason.push(reason);
                }
            }
            // If user didn't exist yet, add them
            else {
                this.reviewList[user] = {
                    score: 1,
                    hidden: false
                }
                let seller = this.reviewList[user];
                seller.reason = [];
                seller.reason.push(reason);
            }
            if (this.reviewList[user].score > 0) {
                this.upvoteUserUI(user);
            }
            // Chrome extension puts in the value. Create an object to properly format
            let object = {};
            object['review-list'] = this.reviewList;
            chrome.storage.sync.set(object);
        },

        downvoteUser: function (user, reason) {

            // Add score + reason 
            if (this.reviewList[user]) {
                let seller = this.reviewList[user];
                seller.score -= 1;
                if (seller.reason !== undefined || seller.reason !== null) {
                    seller.reason.push(reason);
                }
            }
            // If user didn't exist yet, add them
            else {
                this.reviewList[user] = {
                    score: -1,
                    hidden: false
                }
                let seller = this.reviewList[user];
                seller.reason = [];
                seller.reason.push(reason);
            }
            if (this.reviewList[user].score < 0) {
                this.downvoteUserUI(user);
            }
            // Chrome extension puts in the value. Create an object to properly format
            let object = {};
            object['review-list'] = this.reviewList;
            chrome.storage.sync.set(object);
        },

        // UI methods
        hideUserUI: function (user) {
            if (this.isCurrencyPage) {
                $('.displayoffer[data-ign="' + user + '"]').hide()
            } else {
                $('.search-results tbody[data-ign="' + user + '"]').hide()
            }
        },
        upvoteUserUI: function (user) {
            // console.log("we made it here bud!");
            if (this.isCurrencyPage) {
                $('.displayoffer[data-ign="' + user + '"]').children().css('background-color', 'green');
            } else {
                $('.search-results tbody[data-ign="' + user + '"]').children().css('background-color', 'green');
            }
        },
        downvoteUserUI: function (user) {
            if (this.isCurrencyPage) {
                $('.displayoffer[data-ign="' + user + '"]').children().css('background-color', 'red');
            } else {
                $('.search-results tbody[data-ign="' + user + '"]').children().css('background-color', '#8D021F');
            }
        }
    }

    // Hide user click handler
    $(document).on('click', '.hide-seller', function (e) {
        e.preventDefault();
        let ign = Blocker.isCurrencyPage ? $(this).parents('.displayoffer').data('ign') : $(this).parents('tbody').data('ign');

        if (ign) {
            if (confirm('Block this seller?')) {
                Blocker.hideUser(ign);
            }
        }
    });

    // Upvote user click handler
    $(document).on('click', '.upvote-seller', function (e) {
        e.preventDefault();
        let ign = Blocker.isCurrencyPage ? $(this).parents('.displayoffer').data('ign') : $(this).parents('tbody').data('ign');

        if (ign) {
            let reason = prompt('Want to leave a reason why you enjoyed trading with this user?')
            Blocker.upvoteUser(ign, reason);
        }
    });

    // downvote user click handler
    $(document).on('click', '.downvote-seller', function (e) {
        e.preventDefault();
        let ign = Blocker.isCurrencyPage ? $(this).parents('.displayoffer').data('ign') : $(this).parents('tbody').data('ign');

        if (ign) {
            let reason = prompt("What'd they do wrong this time");
            Blocker.downvoteUser(ign, reason);
        }
    });

    $(document).ready(function () {
        Blocker.init()
    });

})(window)