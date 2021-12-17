$(document).ready(function() {
	$('#fullpage').fullpage({
		//options here
		verticalCentered: true,
		bigSectionsDestination: top,
		autoScrolling:true,
		scrollHorizontally: true,
		navigation: true,
		anchors: ['firstPage', 'secondPage', 'thirdPage', 'fourthPage', 'fifthPage'],
		menu: '#myMenu'
	});

	//methods
	$.fn.fullpage.setAllowScrolling(true);
});

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

function createWordcloud2(words, cloud) {
	cloud.empty();
	//cloud.text(JSON.stringify(words));

	words = words.map(function(d) {
		return {text: d, size: 20 + Math.random() * 10};
	});
	var layout = d3.layout.cloud()
		.size([500, 150])
		.words(words)
		.padding(5)
		.rotate(function() { return ~~(Math.random() * 2) * 90; })
		.font("Oswald")
		.fontSize(function(d) { return 10; })
		.on("end", () => drawCloud(words, layout));
		layout.start();
}

function drawCloud(words, layout) {
	d3.select("#cloud_democrates").append("svg")
	.attr("preserveAspectRatio", "xMidYMid meet")
	.attr("viewBox", "0 0 " + layout.size()[0] + " " + layout.size()[1])
	.append("g")
	.attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
	.selectAll("text")
	.data(words)
	.enter().append("text")
	.style("font-size", function(d) { return "10px"; })
	.style("font-family", "Oswald")
	.attr("text-anchor", "middle")
	.attr("transform", function(d) {
	return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
	})
	.text(function(d) { return d.text; });
}