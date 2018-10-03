function displayComments() {
  // Empty any results currently on the page
  $('#results').empty();
  // Grab all of the current articles
  $.getJSON('/articles', function(data) {
    // For each note...
    for (var i = 0; i < data.length; i++) {
      if (data[i].comment) {
        $('.comments').prepend(`<div class="card-footer">
                                <small class="text-muted">
                                  <div>
                                    ${data[i].name} <span class="timestamp">${
          data[i].submitted
        }</span>
                                  </div>
                                  <div>${data[i].comment}</div>
                                </small>
                              </div>`);
      }
    }
  });
}

displayComments();

//Update comment to article
$(document).on('click', '.add-comment', function() {
  // Save the selected element
  let selected = $(this)
    .parents('.card')
    .attr('data-id');

  let Username = prompt("What's your fullname?");
  // Make an AJAX POST request
  // This uses the data-id of the update button,
  // which is linked to the specific card
  // that the user clicked before

  $.ajax({
    type: 'POST',
    url: '/submit',
    dataType: 'json',
    data: {
      _id: selected,
      comment: $('.comment').val(),
      name: Username,
      submitted_on: Date.now()
    },
    // On successful call
    success: function(data) {
      // Clear the inputs
      $('.comment').val('');
      // Grab the results from the db again, to populate the DOM
      displayComments();
    }
  }).then(function(data) {
    console.log(data);
  });
});

