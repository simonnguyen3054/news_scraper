function displayComments() {
  // Empty any results currently on the page
  $('.submitted-comment').empty();

  // Grab all of the current articles
  $.getJSON('/articles', function(data) {
    // For each note...
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i].comments != 'undefined') {
        let element = $(`[data-id=${data[i]._id}]`).find('.submitted-comment');
        let commentsArr = data[i].comments;

        for (let j = 0; j < commentsArr.length; j++) {
          let commentObj = commentsArr[j];

          element.prepend(`<div class="card-footer">
                                <small class="text-muted">
                                  <div>
                                    ${
                                      commentObj.name
                                    } <span class="timestamp">${
            commentObj.submitted
          }</span>
                                  </div>
                                  <div>${commentObj.comment}</div>
                                </small>
                              </div>`);
        }
      }
    }
  });
}

function formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

displayComments();

// Update comment to article
$(document).on('click', '.add-comment', function() {
  // Save the selected element
  let selected = $(this).parents('.card').attr('data-id');
  let comment = $(this).parent().find('.comment').val();
  let Username = prompt("What's your fullname?");

  console.log(comment);
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
      comment: comment,
      name: Username,
      submitted_on: formatDate(new Date())
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
