$("html").addClass("govuk-template  flexbox no-flexboxtweener");
$("body").addClass("govuk-template__body js-enabled");
$(".tl-breadcrumbs li:first-child a").text("Home");


//Prevents T Levels from wrapping
$(document).ready(function () {
    $('h1, h1 a, h2, h2 a, h3, h3 a:contains("T Level")').contents().each(function () {
        if (this.nodeType == 3) {
            $(this).parent().html(function (_, oldValue) {
                return oldValue.replace(/T Level/g, "<span class='tl-nowrap'>$&</span>")
            })
        }
    });
});

// Article voting show/hide
$(document).ready(function () {
    $(".tl-article--vote--button").click(function () {
        event.preventDefault();
        $(".tl-article--vote--buttons").addClass("tl-hidden");       
        $(".tl-article--vote--question").text("Thank you for your feedback");
    });
});


// Search error messaging

var searchbox = $(".tl-search--container input[type=search]");

function showerror(message) {
    $(".tl-search--error").removeClass("tl-hidden");   
    $(".tl-form-group").addClass("tl-form-group--error");
    $(".tl-search #query").addClass("tl-input--error");
    $(".tl-error--message").text(message);
    $(".tl-input--error:visible:first").focus();
}

$(document).ready(function () {
    $(".tl-search--container").submit(function ()  {
        if ( !searchbox.val() ) {
            event.preventDefault();
            showerror("You must enter a search term");
        }
    });
});


/* Follow/unfollow section subscription */
$(document).ready(function () {
    if($('#follow-btn').length) {
    
        const followButtonText = 'Get news updates';
        const unfollowButtonText = 'Stop getting news updates';

        var getSectionSubscription = function (sectionId, userId, page = 1, itemsPerPage = 50) {
            return $.getJSON(`/api/v2/help_center/${HelpCenter.user.locale}/sections/${sectionId}/subscriptions.json?page=${page}&per_page=${itemsPerPage}`)
                .then(function (subscriptions) {
                    if (subscriptions) {
                        var subscription = subscriptions.subscriptions.find(s => s.user_id == userId);
                        if (subscription) {
                            console.log(`getSectionSubscription: found subscription for user id ${userId} on page ${subscriptions.page} of ${subscriptions.page_count}`);
                            console.log(subscription);
                            return subscription;
                        }
        
                        if (subscriptions.next_page) {
                            return getSectionSubscription(sectionId, userId, page + 1, itemsPerPage);
                        }
                    }
        
                    return undefined;
                });
        }
        
        var getCurrentUserSectionSubscription = function (sectionId) {
            return $.getJSON('/api/v2/users/me.json')
                .then(function (user) {
                    return (user && user.user && user.user.id)
                        ? getSectionSubscription(sectionId, user.user.id)
                        : undefined;
                });
        }        

        function setFollowButtonStatus(sectionId) {
            getCurrentUserSectionSubscription(sectionId)
            .done(function(s){
                $("#follow-btn").html(s ? unfollowButtonText : followButtonText);
                $('#follow-btn').removeClass("tl-hidden");
            })
            .fail(function(r){
                console.log(`Call from setFollowButtonStatus to getCurrentUserSectionSubscription failed. ${r}`);
            });
        }

        function subscribeToSection(sectionId) {
            $.getJSON('/hc/api/internal/csrf_token.json')
            .then(function (csrfResponse) {
                $.ajax({url: `/api/v2/help_center/sections/${sectionId}/subscriptions.json`,
                    type: "POST",
                    data: jQuery.param({
                        "subscription": {
                            "source_locale": `${HelpCenter.user.locale}`, 
                            "include_comments": true
                        }
                    }),
                    dataType: "application/json",
                    headers: {
                        "X-CSRF-Token":  csrfResponse.current_session.csrf_token
                    },
                    complete: function(){
                        console.log(`Subscribed to section ${sectionId}`);
                        $('#follow-btn').html(unfollowButtonText);
                    }
                });
            });
        }

        function unsubscribeFromSection(sectionId) {
            $.getJSON('/hc/api/internal/csrf_token.json')
            .then(function (csrfResponse) {
                getCurrentUserSectionSubscription(sectionId)
                .done(function(s){
                    if(s) {
                        $.ajax({
                            url: `/api/v2/help_center/sections/${sectionId}/subscriptions/${s.id}.json`,
                            type: "DELETE",
                            dataType: "application/json",
                            headers: {
                                    "X-CSRF-Token": csrfResponse.current_session.csrf_token
                                    }
                            })
                            .then(function() {
                                console.log(`Unsubscribed from section ${s.id}`);
                                setFollowButtonStatus(sectionId);
                            });
                        } else
                            console.log("No subscription found to delete for this user");                
                })
                .fail(function(r){
                    console.log(`Call from unsubscribeFromSection to getCurrentUserSectionSubscription failed. ${r}`);
                });
            });
        }

        //Set initial button state on load
        setFollowButtonStatus(section_id_newsletters);
        
        //Click handlers  
        $('#follow-btn').click(function () {
            $('#follow-btn').html() === followButtonText
                ? subscribeToSection(section_id_newsletters)
                : unsubscribeFromSection(section_id_newsletters);
            });
        }
});
/* Follow/unfollow section subscription ends */


/* cookie banner starts */
//to delete cookie banner cookies ...
//document.cookie = "seen_cookie_message_help=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//document.cookie = "AnalyticsConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

function writeCookie(key, value, days) {
    var date = new Date();
    days = days || 365;// Default at 365 days
    date.setTime(+ date + (days * 86400000)); //24 * 60 * 60 * 1000
    window.document.cookie = key + "=" + value + "; expires=" + date.toGMTString() + "; path=/";
    return value;
}
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

var $cookieBanner = $('#global-cookie-message-help');
var cookieHelp = readCookie('seen_cookie_message_help');

if (cookieHelp == null) {//cookie does not exist
    var href = $cookieBanner.find('.gem-c-cookie-banner__button-settings').find('.gem-c-button').attr('href');
    var url = window.location.href;
}

if (href == url) {
    $cookieBanner.find('.gem-c-cookie-banner__wrapper').hide();
} else if (cookieHelp == null) {//cookie doesn't exist
    $cookieBanner.find('.gem-c-cookie-banner__wrapper').show();
}

$cookieBanner.find('button.gem-c-button').click(function () {
    writeCookie('seen_cookie_message_help', 'cookie_policy', 365);
    writeCookie('AnalyticsConsent', 'true', 365);

    $cookieBanner.find('.gem-c-cookie-banner__wrapper').hide();
    var $cookieConfirm = $cookieBanner.find('.gem-c-cookie-banner__confirmation');

    $cookieConfirm.show().find('.gem-c-cookie-banner__hide-button').click(function () {
        $cookieConfirm.hide();
    });
});
/* cookie banner ends */


/* Cookie Article, with consent starts */
var cookieConsent = $('#select-measure-analytics');

if (cookieConsent.length) {
    $('#select-measure-analytics-btn').append('<button id="saveCookieChanges" class="govuk-button" data-module="govuk-button">Save changes</button>');

    cookieConsent.append('<h3>Do you want us to measure your website use with Google Analytics?</h3><div class="govuk-form-group"><fieldset class="govuk-fieldset"><div class="govuk-radios"><div class="govuk-radios__item"><input class="govuk-radios__input" id="cookie-consent-Yes" name="allow-analytics" type="radio"><label class="govuk-label govuk-radios__label" for="cookie-consent-Yes">Yes</label></div><div class="govuk-radios__item"><input class="govuk-radios__input" id="cookie-consent-No" name="allow-analytics" type="radio"><label class="govuk-label govuk-radios__label" for="cookie-consent-No">No</label></div></div></fieldset></div>');

    var cookieGoogle = readCookie('AnalyticsConsent');

    if ((cookieGoogle == 'false') || (cookieGoogle == null)) {
        $('#cookie-consent-Yes').prop("checked", false);
        $('#cookie-consent-No').prop("checked", true);
    } else {//not false (unset or true)
        $('#cookie-consent-Yes').prop("checked", true);
        $('#cookie-consent-No').prop("checked", false);
    }

    $('#saveCookieChanges').on('click', function () {
        if ($('#cookie-consent-Yes').is(':checked')) {
            writeCookie('AnalyticsConsent', 'true', 365);
            writeCookie('seen_cookie_message_help', 'cookie_policy', 365); //also turn off cookie banner
        }
        if ($('#cookie-consent-No').is(':checked')) {
            writeCookie('AnalyticsConsent', 'false', 365); //document.cookie = "AnalyticsConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; //delete cookie
            writeCookie('seen_cookie_message_help', 'cookie_policy', 365); //also turn off cookie banner
        }
    });

    /*$('#cookie-consent-Yes').change(function() { writeCookie('AnalyticsConsent','true',365); writeCookie('seen_cookie_message_help','cookie_policy',365); });
    $('#cookie-consent-No').change(function() {writeCookie('AnalyticsConsent','false',365); writeCookie('seen_cookie_message_help','cookie_policy',365); });*/
}
/* Cookie Article, with consent ends */


/* APPROVED USER CHECK */

function isApprovedUser() {
    if (HelpCenter.user.role != "anonymous" && HelpCenter.user.organizations.length > 0) {
        for (var idx in HelpCenter.user.organizations) {
            if (HelpCenter.user.role != "end_user" || HelpCenter.user.organizations[idx].tags.includes('tlevels_approved')) {
                return true;
            }
        }
    }
    return false;
};


/* Agent USER CHECK */
function isAgent() {
    if (HelpCenter.user.role == "agent" || HelpCenter.user.role == "manager") {
        return true;
    }
    return false;
};

/* Logged in USER CHECK */
function isLoggedIn() {
    if (HelpCenter.user.role != "anonymous") {
        return true;
    }
    return false;
};


// ***************Function stringToHslColor*****************t**
// To convert the initials to a hash string. these functions take the parameters as the name initials 
// convert the string into a hash string to give a unique colour to each name initial with also putting in control over the brightness and contrast as parameters
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function convertNameToInitials(name) {
    if (!name) return '';
    const cleanName = name.replace(/[`~!@@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    const parts = cleanName.split(' ');
    var initials = parts.length > 0 ? parts[0][0] : '';
    if (parts.length > 1) initials += parts[parts.length - 1][0];
    return initials.toUpperCase();
};

function stringToHslColorLog(str, s, l) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var h = hash % 360;
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}


//  Function to convert the intials to a hash string.
function stringToHslColor(str, s, l) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var h = hash % 360;
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}

$(function () {
    $('html').addClass("govuk-template");
    $('body').addClass("govuk-template__body");
});






