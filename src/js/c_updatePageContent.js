// =============================== *** File c_updatePageContent ***  ===============================
/**
 * Feedback Page
 */
//Controls each onglet (nav bar menus)'s behavior


var feedbackNavs = document.getElementsByClassName("feedbackNav");
for (var i = 0; i < feedbackNavs.length; i++) {
    feedbackNavs[i].addEventListener('click', updateFeedbackFromNavs);
}

function updateFeedbackFromNavs() {
    $('.navigation').removeClass('active');
    $('.navigation').addClass('hidden');
    var nav = this.value;


    $('#' + nav).removeClass('hidden');
    $(this).toggleClass('active');

} //updateFeedbackFromNavs

//Click event handler for nav-items
$('.navFeedback').on('click', function() {
    $('.navFeedback').removeClass('active');
    $('.navigation').addClass('hidden');


    //Add active class to the clicked item
    $(this).addClass('active');

    var nav = $('a', this).attr('value');

    $('#' + nav).removeClass('hidden');
});

/**
 * End   Feedback Page
 */
// =============================== *** End File c_updatePageContent ***  ===============================