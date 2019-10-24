(function (window) {

    var Blocker = {
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
                    self.upvoteUser(seller);
                });
            });
        },
        allWhispers: function () {
            var self = this;
            var sellers = this.isCurrencyPage ? $('.displayoffer-bottom span.right a') : $('.whisper-btn');

            _.each(sellers, function (seller) {
                self.appendBlockButton(seller);
            });
        },
        appendButtons: function (position) {
            // block button
            let hide = '<span class="block-seller-wrapper"><a class="block-seller" href="#">Hide User</a></span>'

            // upvote button
            let upvote = '<span class="block-seller-wrapper"><a class="block-seller" href="#">Upvote</a></span>'
            
            //downvote button 
            let downvote = '<span class="block-seller-wrapper"><a class="block-seller" href="#">Downvote</a></span>'


            $(position).after(downvote).after(upvote).after(hide);
        },
        blockUser: function (user) {
            this.usersBlocked.push(user);

            var jsonObj = {};
            jsonObj['blocked-sellers'] = this.usersBlocked;

            chrome.storage.sync.set(jsonObj);
            this.upvoteUser(user);
        },
        hideUser: function (user) {
            if (this.isCurrencyPage) {
                $('.displayoffer[data-ign="' + user + '"]').hide()
            } else {
                $('.search-results tbody[data-ign="' + user + '"]').hide()
            }
        },
        upvoteUser: function (user) {
            if (this.isCurrencyPage) {
                $('.displayoffer[data-ign="' + user + '"]').children().css('background-color', 'green');
            } else {
                $('.search-results tbody[data-ign="' + user + '"]').children().css('background-color', 'green');
            }
        },
        downvoteUser: function (user) {
            if (this.isCurrencyPage) {
                $('.displayoffer[data-ign="' + user + '"]').children().css('background-color', 'red');
            } else {
                $('.search-results tbody[data-ign="' + user + '"]').children().css('background-color', 'red');
            }
        }
    }

    $(document).on('click', '.block-seller', function (e) {
        e.preventDefault();
        var ign = Blocker.isCurrencyPage ? $(this).parents('.displayoffer').data('ign') : $(this).parents('tbody').data('ign');

        if (ign) {
            if (confirm('Block this seller?')) {
                Blocker.blockUser(ign);
            }
        }
    });

    $(document).ready(function () {
        Blocker.init()
    });

})(window)