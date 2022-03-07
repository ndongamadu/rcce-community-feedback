// =============================== *** File d_update ***  ===============================

//Click event handler for nav-items
$('.navSite').on('click', function() {
    $('.navSite').removeClass('active');
    $('.navPage').addClass('hidden');

    console.log("Changing page")

    //Add active class to the clicked item
    $(this).addClass('active');

    var nav = $('a', this).attr('value');

    $('#' + nav + "-page").removeClass('hidden');
});

// =============================== *** End File d_update ***  ===============================