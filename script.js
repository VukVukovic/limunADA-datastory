function createClusterDisplay(data, radios_id, plot_id, topic_id, cloud_id, info_id)  {
	plot = $('#' + plot_id);
	cloud = $('#' + cloud_id);
	topic = $('#' + topic_id);
	info = $('#' + info_id);
	radios = $('#' + radios_id);

	const years = Object.keys(data);
	years.sort((a, b) => a - b);

	const instanceId = 'inst' + Math.floor(1000*Math.random());

	years.forEach(y => {
		const containg_div = $('<div>', {class: 'form-check form-check-inline'});
		$('<input>', {class: 'form-check-input', type: 'radio', value: y, id: instanceId+y, name: instanceId}).appendTo(containg_div);
		$('<label>', {class: 'form-check-label', for:instanceId+y}).text(y).appendTo(containg_div);
		radios.append(containg_div);
	});

	$('input[type=radio][name='+instanceId+']').on('change', function() {
		console.log('CHANGE' + this.value);
		plotClusters(data[this.value], plot, topic, cloud, info);
	});
	
	$('input[type=radio][name='+instanceId+']').filter('[value="'+years[0]+'"]').attr('checked', true);
	plotClusters(data[years[0]], plot, topic, cloud, info);
}

chartClouds = {}

function plotClusters(data, plot, topic, cloud, info) {
	plot.empty();
	info.html("");
	topic.text("");

	if (cloud in chartClouds) {
		chartClouds[cloud].destroy();
	}
	
	const d3plot = d3.select(plot[0])
		.append("svg")
		.attr("preserveAspectRatio", "xMidYMid meet");

	let minX=1, minY=1, maxX=0, maxY=0;
    data.forEach(d => {
		const x = d['x'] + 0.5;
		const y = -d['y'] + 0.5;
		const r = d['r'] * 0.005;
		minX = Math.min(minX, x-r);
		maxX = Math.max(maxX, x+r);
		minY = Math.min(minY, y-r);
		maxY = Math.max(maxY, y+r);

    	d3plot
    	.append("circle")
        .style("fill", "#FF6663")
		.style("opacity", "0.6")
        .style("cursor", "pointer")
        .attr("r", r)
        .attr("cx", x)
        .attr("cy", y)
        .on("mouseover", function(){
			d3.select(this)
				.style("transform-origin", "center")
				.transition()
				.ease(d3.easeLinear)
				.duration(100)
				.style("opacity", "0.8")
				.style("transform", "scale(1.1, 1.1)");
		})
        .on("mouseout", function(){
			d3.select(this)
				.style("transform-origin", "center")
				.transition()
				.ease(d3.easeLinear)
				.duration(100)
				.style("opacity", "0.6")
				.style("transform", "scale(1.0, 1.0)");
		})
        .on("click", function() {
        	info.html(d['content']);
			topic.text(d['emoji'] + ' ' + d['topic'])
			createWordcloud(d['keywords'], cloud);
        });

		d3plot
		.append("text")
		.text(() => d['emoji'])
		.attr("x", d['x'] + 0.5 - 0.02)
		.attr("y", -d['y'] + 0.5 + 0.015)
		.style("font-size", "0.04")
		.style("pointer-events", "none");
    });
	minX -= 0.01;
	minY -= 0.01;
	maxX += 0.01;
	maxY += 0.01;
	d3plot.attr("viewBox", minX + " " + minY + " " + maxX + " " + maxY);
}

function createWordcloud(words, cloud) {
	if (cloud in chartClouds) {
		chartClouds[cloud].destroy();
	}
	const config = {
		type: 'wordCloud',
		data: {
			labels: words.map(w => w.toUpperCase()),
			datasets: [
			{
				data: words.map(w => Math.random() * 25 + 15),
				color: '#FF6663'
			}],
		},
		options: {
			plugins : {
			tooltip: {
				enabled: false
			},
			legend: {
				display: false,
			}
			}
		}
	};

    chartClouds[cloud] = new Chart(cloud, config);
}

function createPopularityPerYear(data, years_id, chart_id) {
	yearsDiv = $('#' + years_id);
	chart = $('#' + chart_id);
}

var comparisonCharts = {}
function plotComparison(research_data, topics, year, canvas_id) {
	
	const chart_data = {
        labels: topics.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
        datasets: [
          {
            label: 'Republicans',
            data: topics.map(t => research_data['republicans'][year][t]),
            backgroundColor: '#0B3954',
			stack: 'Stack 0'
          },
          {
            label: 'Democrats',
            data: topics.map(t => research_data['democrates'][year][t]),
            backgroundColor: '#E0FF4F',
			stack: 'Stack 1'
          }
        ]
    };

	const config = {
        type: 'bar',
        data: chart_data,
        options: {
          responsive: true,
          interaction: {
            intersect: false,
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true
            }
          }
        }
    };

	if (canvas_id in comparisonCharts) {
		comparisonCharts[canvas_id].data.labels = chart_data['labels'];
		comparisonCharts[canvas_id].data.datasets = chart_data['datasets'];
		comparisonCharts[canvas_id].update();
	} else {
		comparisonCharts[canvas_id] = new Chart($('#' + canvas_id), config);
	}
}

function plotTopicTrends(research_data, topics, trends_id) {
	trends_div = $('#' + trends_id);
	trends_div.empty();

	const years = Object.keys(research_data['democrates']);
	years.sort((a, b) => a - b);

	topics.forEach(t => {
		trends_div.append('<div class="col-6"><div class="text-center h5 font-raleway color-subtlered">'+(t.charAt(0).toUpperCase() + t.slice(1))+'</div><canvas id="'+t.replaceAll(' ', '_')+'"></canvas></div>');
	});

	topics.forEach(t => {
		id = t.replaceAll(' ', '_');
		const labels = years;
		const data = {
		labels: labels,
			datasets: [ 
			{
				label: 'Republicans',
				data: years.map(y => research_data['republicans'][y][t]),
				fill: false,
				borderColor: '#0B3954',
				tension: 0.1
			},
			{
				label: 'Democrats',
				data: years.map(y => research_data['democrates'][y][t]),
				fill: false,
				borderColor: '#E0FF4F',
				tension: 0.1
			}]
		};
		const config = {
			type: 'line',
			data: data,
		};

		new Chart($('#'+id), config);
	});
}


var barChartPlot = null;
function plotBarChart(data_total, year, barchart_id) {
	let topics = Object.keys(data_total[year]);
	topics.sort((a, b) => -(data_total[year][a] - data_total[year][b]))
	topics = topics.slice(0, 10);

	const labels = topics.map(t => t.charAt(0).toUpperCase() + t.slice(1));

	const data = {
		labels: labels,
		datasets: [
			{
			label: 'Total',
			data: topics.map(t => data_total[year][t]),
			borderColor: '#FF6663',
			backgroundColor: '#FF6663',
			}
		]
	};

	const config = {
		type: 'bar',
		data: data,
		options: {
		  indexAxis: 'y',
		  elements: {
			bar: {
			  borderWidth: 2,
			}
		  },
		  responsive: true,
		  plugins: {
			legend: {
			  display: false,
			}
		  }
		},
	};

	if (barChartPlot) {
		barChartPlot.data.labels = data['labels'];
		barChartPlot.data.datasets = data['datasets'];
		barChartPlot.update();
	} else {
		barChartPlot = new Chart($('#'+barchart_id), config);
	}
}