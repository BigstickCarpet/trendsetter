$(function () {
  'use strict';

  // Use the public API, unless we're running on localhost
  var apiHost = 'https://api.trendsetter.bigstickcarpet.com';
  if (location.hostname === 'localhost') {
    apiHost = 'http://localhost:8080';
  }

  // Fetch the trends from the server
  $.get(apiHost + '/trends')
    .done(function (data) {
      data.forEach(addTrendToTable);
    })
    .fail(errorHandler);

  // Wire-up the "start a new trend" form
  $('#new-trend')
    .attr('action', apiHost + '/trends')
    .on('submit', function (event) {
      event.preventDefault();
      createTrend({
        name: $('#name').val(),
        type: $('#type').val(),
        from: parseInt($('#from').val()),
        to: parseInt($('#to').val()),
      });
    });

  // Wire-up the "delete" buttons
  $('#trends').on('click', '.btn-danger', function () {
    deleteTrend($(this).data('trend'));
  });

  // Add the given trend to the <table>
  function addTrendToTable (trend) {
    $('#loading').remove();
    $('#trends').append($('<tr>')
      .append($('<td></td>').text(trend.name))
      .append($('<td></td>').text(trend.type))
      .append($('<td></td>').text(trend.from))
      .append($('<td></td>').text(trend.to))
      .append($('<td align="right"></td>')
        .append($('<button type="button" class="btn btn-danger btn-sm">Delete</button>')
          .data('trend', trend)
        )
      )
    );
  }

  // Call the API to create a new trend
  function createTrend (trend) {
    $.post(apiHost + '/trends', trend)
      .done(function () {
        setTimeout(function () {
          location.reload();
        }, 500);
      })
      .fail(errorHandler);
  }

  // Call the API to delete a trend
  function deleteTrend (trend) {
    $.ajax({ type: 'DELETE', url: apiHost + '/trends/' + trend.id })
      .done(function () {
        location.reload();
      })
      .fail(errorHandler);
  }

  // HTTP error handler
  function errorHandler (req) {
    console.log(req);
    var error = req.responseJSON || {};
    var httpStatus = req.status || '';
    var errorCode = error.error || 'unknown error';
    var errorMessage = error.message || req.responseText || req.statusText;

    alert('There was an HTTP ' + httpStatus + ' Error (' + errorCode + '):\n\n' + errorMessage);
  }

});
