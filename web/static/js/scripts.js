$(document).ready(function(){
	$('.datetimepicker').datepicker({
		dateFormat: "yy/mm/dd"
	});
	
	$("#site_agreed_amount").on("change", function(event){
		var agreedAmount = $(this).val();
		var estimatedBudget = 50/100 * agreedAmount;
		
		$("#site_estimated_budget").val(estimatedBudget);
	});
	
	$(".closeSubMilestone").on("click", function(event){
		var clickElem = $(this)
		var siteSubMilestoneId = clickElem.data('id');
		var confirmClose = confirm("Are you sure?");
		
		if (confirmClose) {
			$.ajax({
				url: "/close/" + siteSubMilestoneId,
				type: "GET",
				dataType: "JSON",
				success: function (data) {
					var data = $.parseJSON(data);
					var progressDiv = $(".progress").find(".progress-bar")
				
					progressDiv.css("width", data.progress + "%");
					progressDiv.html("<span>" + data.progress + "% Complete</span>");
					clickElem.hide();
					clickElem.prev().hide();
				}
			});
		}
	});
	
	$("#labour_control_labour_id").on("change", function(event){
		var labourId = $(this).val();
		var days = $("#labour_control_no_of_workers").val();
		days = days === "" ? 1 : days;
		
		calculateLabourCost(labourId, days);
	});
	
	$("#labour_control_no_of_workers").on("change", function(event){
		var days = $(this).val() === "" ? 1 : $(this).val();
		var labourId = $("#labour_control_labour_id").val();
		
		calculateLabourCost(labourId, days);
	});

	$("#labour_control_specified_rate").on("change", function(event){
		if ($(this).val() !== "") {
			var totalCost = $(this).val() * $("#labour_control_no_of_workers").val();
			$("#labour_control_total_cost").val(totalCost);
		}
	});

	$("#material_control_specified_rate").on("change", function(event){
		if ($(this).val() !== "") {
			var totalCost = $(this).val() * $("#material_control_amount").val();
			$("#material_control_total_cost").val(totalCost);
		}
	});
	
	function calculateLabourCost (labourId, days) {
		$.ajax({
			url: "/labours/" + labourId,
			type: "GET",
			dataType: "JSON",
			success: function (data) {
				var data = $.parseJSON(data);
				var totalCost = 0;
				
				totalCost = parseFloat(data.cost) * days;
				$("#labour_control_total_cost").val(totalCost);
			}
		});
	}
	
	$("#material_control_material_id").on("change", function(event){
		var materialId = $(this).val();
		var amount = $("#material_control_amount").val();
		amount = amount === "" ? 1 : amount;
		
		calculateMaterialCost(materialId, amount);
	});
	
	$("#material_control_amount").on("change", function(event){
		var amount = $(this).val() === "" ? 1 : $(this).val();
		var materialId = $("#material_control_material_id").val();
		
		calculateMaterialCost(materialId, amount);
	});
	
	function calculateMaterialCost (materialId, amount) {
		$.ajax({
			url: "/materials/" + materialId,
			type: "GET",
			dataType: "JSON",
			success: function (data) {
				var data = $.parseJSON(data);
				var totalCost = 0;
				
				totalCost = parseFloat(data.cost) * amount;
				$("#material_control_total_cost").val(totalCost);
			}
		});
	}
	
	$(".editSubMilestone").on("click", function(event){
 		var subMilestone = $(this).data("milestone");
    var updateHtml = '<input name="_method" type="hidden" value="put">';
    var editForm = $('#editSubMilestone').find("form");
    var action = "/site_sub_milestones/" + subMilestone.id;
    	
    // Replace form action
    editForm.attr("action", action);
    editForm.prepend(updateHtml);
    	
    // Insert form values
    editForm.find("#site_sub_milestone_notes").val(subMilestone.notes);
    editForm.find("#site_sub_milestone_cost").val(subMilestone.cost);
    	
    if (subMilestone.is_completed) {
    	editForm.find("#site_sub_milestone_is_completed").prop("checked", true);
    } else {
    	editForm.find("#site_sub_milestone_is_completed").prop("checked", false);
    }
    // Open modal
    $('#editSubMilestone').modal();
	});
	
	$("#site_internal_walls_measurement").on("change", function(event){
		getTotalSquareMetres(this);
		event.preventDefault();
	});
	
	$("#site_ceilings_measurement").on("change", function(event){
		getTotalSquareMetres(this);
		event.preventDefault();
	});
	
	$("#site_woodwork_measurement").on("change", function(event){
		getTotalSquareMetres(this);
		event.preventDefault();
	});
	
	$("#site_metalwork_measurement").on("change", function(event){
		getTotalSquareMetres(this);
		event.preventDefault();
	});
	
	$("#site_externalworks_measurement").on("change", function(event){
		getTotalSquareMetres(this)
		event.preventDefault();
	});
	
	function getTotalSquareMetres (self) {
		var uniqueId = $(self).attr('id');
		var measurement = $(self).val();
		sumMeasurements(measurement, uniqueId);
	}
	
	function changeStyle () {
		console.log("something");
		console.log($(self));
	}
	
	function sumMeasurements (measurement, uniqueId) {
		var totalMeasurement = 0.0;
		var internalWalls = $("#site_internal_walls_measurement").val();
		internalWalls = internalWalls === "" ? 0.0 : internalWalls;
		
		var ceilings = $("#site_ceilings_measurement").val();
		ceilings = ceilings === "" ? 0.0 : ceilings;
		
		var woodWork = $("#site_woodwork_measurement").val();
		woodWork = woodWork === "" ? 0.0 : woodWork;
		
		var metalWork = $("#site_metalwork_measurement").val();
		metalWork = metalWork === "" ? 0.0 : metalWork;
		
		var externalWorks = $("#site_externalworks_measurement").val();
		externalWorks = externalWorks === "" ? 0.0 : externalWorks;
		
		switch (uniqueId) {
			case "site_internal_walls_measurement":
				internalWalls = measurement;
				totalMeasurement = (parseInt(internalWalls) + parseInt(ceilings) + 
					parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks));
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			case "site_ceilings_measurement":
				ceilings = measurement;
				totalMeasurement = (parseInt(internalWalls) + parseInt(ceilings) + 
					parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks));
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			case "site_woodwork_measurement":
				woodWork = measurement;
				totalMeasurement = (parseInt(internalWalls) + parseInt(ceilings) + 
					parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks));
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			case "site_metalwork_measurement":
				metalWork = measurement;
				totalMeasurement = (parseInt(internalWalls) + parseInt(ceilings) + 
					parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks));
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			case "site_externalworks_measurement":
				externalWorks = measurement;
				totalMeasurement = (parseInt(internalWalls) + parseInt(ceilings) + 
					parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks));
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			default:
				$("#site_total_square_meters").val(totalMeasurement);
		}
	}
});

