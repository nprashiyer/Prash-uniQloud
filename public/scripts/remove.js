$(".destroy").click(function() {
  var $row = $(this).closest("tr");    // Find the row
  var $text = $row.find(".srvname").text(); // Find the text
  // var r = confirm("Delete " + $text);
  $("button.delserver").attr("value",$text);
  $("p.modal-delete").html("Are you sure you want to delete <b> " + $text + "</b> ?") ;
});
