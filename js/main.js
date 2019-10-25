(function (window) {

    var Blocker = {
        // Initalizers
        isCurrencyPage: false,
        usersBlocked: [],
        reviewList: {},
        init: function () {
            this.checkPage()
            this.hideBlockedUsers();
            this.allWhispers();
        },
        checkPage: function () {
            var host = window.location.host;
            this.isCurrencyPage = host.indexOf('currency') > -1
        },
        hideBlockedUsers: function () {
            var self = this;

            chrome.storage.sync.get(['blocked-sellers'], function (blockedSellers) {
                var results = blockedSellers['blocked-sellers'] ? blockedSellers['blocked-sellers'] : [];
                self.usersBlocked = results;

                _.each(self.usersBlocked, function (seller) {
                    self.hideUser(seller);
                });
            });
        },

        // Set-up buttons:
        allWhispers: function () {
            var self = this;
            var sellers = this.isCurrencyPage ? $('.displayoffer-bottom span.right a') : $('.whisper-btn');

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

            var jsonObj = {};
            jsonObj['blocked-sellers'] = this.usersBlocked;

            chrome.storage.sync.set(jsonObj);
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
                }
                let seller = this.reviewList[user];
                seller.reason = [];
                seller.reason.push(reason);
            }
            console.log("review list is: ", this.reviewList)
            chrome.storage.sync.set(this.reviewList);
            this.upvoteUserUI(user);
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
                }
                let seller = this.reviewList[user];
                seller.reason = [];
                seller.reason.push(reason);
            }
            this.downvoteUserUI(user);
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
        var ign = Blocker.isCurrencyPage ? $(this).parents('.displayoffer').data('ign') : $(this).parents('tbody').data('ign');

        if (ign) {
            if (confirm('Block this seller?')) {
                Blocker.hideUser(ign);
            }
        }
    });

    // Upvote user click handler
    $(document).on('click', '.upvote-seller', function (e) {
        e.preventDefault();
        var ign = Blocker.isCurrencyPage ? $(this).parents('.displayoffer').data('ign') : $(this).parents('tbody').data('ign');

        if (ign) {
            let reason = prompt('Want to leave a reason why you enjoyed trading with this user?')
            Blocker.upvoteUser(ign, reason);
        }
    });

    // downvote user click handler
    $(document).on('click', '.downvote-seller', function (e) {
        e.preventDefault();
        var ign = Blocker.isCurrencyPage ? $(this).parents('.displayoffer').data('ign') : $(this).parents('tbody').data('ign');

        if (ign) {
            let reason = prompt("What'd they do wrong this time");
            Blocker.downvoteUser(ign, reason);
        }
    });

    $(document).ready(function () {
        Blocker.init()
    });

})(window)