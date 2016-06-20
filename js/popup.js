(function(window){

    var BlockerPopUp = {
        sellersBlocked: [],
        init: function() {
            this.buildBlockedSellersList()
        },
        buildBlockedSellersList: function() {
            var blockedSellerList = $('.blocked-seller-list');
            var self = this;

            chrome.storage.sync.get(['blocked-sellers'], function (blockedSellers) {
                var results = blockedSellers['blocked-sellers'] ? blockedSellers['blocked-sellers'] : []; 
                self.sellersBlocked = results;

                $('.no-items').show();
                if(self.sellersBlocked.length) {
                    $('.no-items').hide();
                }

                _.each(self.sellersBlocked, function(seller){
                    var item = "<li data-ign='"+seller+"'><span class='left'>"+seller+"</span><span class='right'><a href='#' class='remove-seller-from-blacklist'>Remove</a></span></li>";
                    blockedSellerList.append(item);
                });
            });
        },
        removeSellerFromList: function(sellerToRemove) {
            this.sellersBlocked = _.filter(this.sellersBlocked, function(seller){ return seller != sellerToRemove; });
            var jsonObj = {};
            jsonObj['blocked-sellers'] = this.sellersBlocked;
            chrome.storage.sync.set(jsonObj, function(obj){
                $('.blocked-seller-list').empty();
                BlockerPopUp.buildBlockedSellersList();
            });
        },
        massAddUsersToBlacklist: function(text){
            var igns = text.split("\n");
            for(var i = 0; i < igns.length; i++) {
                var ign = igns[i].trim();
                this.sellersBlocked.push(ign);
            }
            this.sellersBlocked = _.uniq(this.sellersBlocked);
            var jsonObj = {};
            jsonObj['blocked-sellers'] = this.sellersBlocked;
            chrome.storage.sync.set(jsonObj, function(obj){
                $('.blocked-seller-list').empty();
                BlockerPopUp.buildBlockedSellersList();
                $('.sellers-to-block-textarea').val('');
            });
        },
        removeAllFromBlacklist: function() {
            this.sellersBlocked = []
            var jsonObj = {};
            jsonObj['blocked-sellers'] = this.sellersBlocked;
            chrome.storage.sync.set(jsonObj, function(obj){
                $('.blocked-seller-list').empty();
                BlockerPopUp.buildBlockedSellersList();
            });
        }
    };

    $(document).ready(function(){

        BlockerPopUp.init();

        $('ul.tabs li').click(function(){
            var tab_id = $(this).attr('data-tab');

            $('ul.tabs li').removeClass('active');
            $('.tab-content').removeClass('active');

            $(this).addClass('active');
            $("#"+tab_id).addClass('active');
        });
    });

    $(document).on('click', '.remove-seller-from-blacklist', function(e){
        e.preventDefault();
        var ign = $(this).parents('li').data('ign');
        if(confirm('Remove this user from your blacklist?')){
            BlockerPopUp.removeSellerFromList(ign);
        }
        return false;
    });

    $(document).on('click', '.parse-mass-add-sellers', function(e){
        e.preventDefault();
        if(confirm('Add these users to your blacklist?')){
            var text = $('.sellers-to-block-textarea').val();
            BlockerPopUp.massAddUsersToBlacklist(text);
        }
        return false;
    });

    $(document).on('click', '.clear-all-users', function(e){
        e.preventDefault();
        if(confirm('Remove all users from your blacklist?')){
            BlockerPopUp.removeAllFromBlacklist();
        }
        return false;
    });

})(window);
