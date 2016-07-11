$(document).ready(function () {
	$(".measurement-select").on("change", function (event) {
		var currentSelect = $(this);
		var currentSelectId = $(this).attr('id');
		var currentSelectVal = $(this).val();

		$(".measurement-select").each(function (index) {
			var selectId = $(this).attr('id');

			$("#" + selectId + " option").each(function (idex) {
				if (selectId != currentSelectId && $(this).val() == currentSelectVal) {
					$(this).remove();
				}
			});
		});
		event.preventDefault();
	});

	$(".price_per_metre").on("change", function (event) {
		var pricePerMetre = $(this).val() == "" ? 0.00 : parseFloat($(this).val());
		var totalSqMetres = $(this).parent().prev().find("input[type='number']").val();
		totalSqMetres = totalSqMetres == "" ? 0.00 : parseFloat(totalSqMetres);
		var totalPrice = pricePerMetre * totalSqMetres
		var estimatedBudget = $("#site_estimated_budget").val() == "" ? 0.00 : parseFloat($("#site_estimated_budget").val());
		estimatedBudget += totalPrice;

		console.log("SQUARE METRES: " + totalSqMetres + 
			", PRICE PER METER: " + pricePerMetre + 
			", TOTAL PRICE: " + totalPrice);
		$("#site_estimated_budget").val(estimatedBudget)
	});

	$(".square_metres").on("change", function (event) {
		var totalSqMetres = $("#site_total_square_meters").val();
		totalSqMetres = totalSqMetres === "" ? 0.00 : parseFloat(totalSqMetres);
		totalSqMetres += $(this).val() === "" ? 0.00 : parseFloat($(this).val());

		$("#site_total_square_meters").val(totalSqMetres);
	});
});