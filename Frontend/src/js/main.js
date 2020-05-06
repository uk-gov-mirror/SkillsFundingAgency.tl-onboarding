$("html").addClass("govuk-template  flexbox no-flexboxtweener");
$("body").addClass("govuk-template__body");


window.GOVUKFrontend.initAll()

$('.tl-search--category--identifier').each(function () {
    var category = this.textContent.replace(/\s/g, '').toLowerCase()
    $(this).addClass("tl-search--category--" + category); 
});