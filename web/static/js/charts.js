$(document).ready(function () {
  var labels = [];
  var labourData = [];
  var materialData = [];
  var data = {}

  $(".dayOfWeek").each(function (index) {
    labels.push($(this).text());
  });

  $(".labourData").each(function (index) {
    if ($(this).text() == "") {
      labourData.push(0.00);  
    } else {
      labourData.push(parseFloat($(this).text().replace(/\,/g, '')));  
    }
  });

  $(".materialData").each(function (index) {
    if ($(this).text() == "") {
      materialData.push(0.00);  
    } else {
      materialData.push(parseFloat($(this).text().replace(/\,/g, '')));  
    }
  });

  data.labourData = labourData;
  data.materialData = materialData

  if (labels.length !== 0) {
    renderBarChart(data, labels);  
  }

  $(".changeGraphType").on("change", function (event) {
    var type = $(this).val();
    $(".graphArea").empty();
    $(".graphArea").html("<canvas id='myChart' width='400' height='200'></canvas>");
    changeGraphType(type, data, labels)
    event.preventDefault();
  });

  function changeGraphType(type, data, labels) {
    switch (type) {
      case "bar":
        renderBarChart(data, labels);
        break;
      case "line":
        renderLineChart(data, labels);
        break;
    }
  }

  function renderBarChart(data, labels) {
    var ctx = $("#myChart")
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { 
            label: 'Labour', 
            data: data.labourData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255,99,132,1)', 
            borderWidth: 1 }, 
          { 
            label: 'Material', 
            data: data.materialData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',  
            borderWidth: 1 }]
      }, options: {
        scales: { yAxes: [
          { ticks: { beginAtZero:true } }]
        }
      }
    });
  }

  function renderLineChart(data, labels) {
    var ctx = $("#myChart")
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: "Labour",
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: data.labourData,
        }, {
          label: "Material",
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: data.materialData,
        }]
      }, options: {
        scales: { yAxes: [
          { ticks: { beginAtZero:true } }]
        }
      }
    });
  }
});