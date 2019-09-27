$("button.azure-btn").click(function() {
  $("h5.modal-title").text("Order Azure VM");
  $("input.platform").attr("value","Azure");
})

$("button.aws-btn").click(function() {
  $("h5.modal-title").text("Order AWS VM");
  $("input.platform").attr("value","AWS");
})

$("button.gcp-btn").click(function() {
  $("h5.modal-title").text("Order GCP VM");
  $("input.platform").attr("value","GCP");
})
