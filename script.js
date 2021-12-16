$(document).ready(function() {
	$('#fullpage').fullpage({
		//options here
		autoScrolling:true,
		scrollHorizontally: true,
		sectionsColor: ['#06AED5', '#9BC53D', '#C3423F', '#F18701', '#272727'],
		navigation: true,
		anchors: ['firstPage', 'secondPage', 'thirdPage', 'fourthPage', 'fifthPage'],
		menu: '#myMenu'
	});

	//methods
	$.fn.fullpage.setAllowScrolling(true);

	$("img.change").on('mouseenter mouseleave', function(){
		let src = $(this).attr('src');
		$(this).attr('src', $(this).data('hoverimg'));
		$(this).data('hoverimg', src); 
	});
});

function createClusterDisplay(data, plot_id, topic_id, cloud_id, info_id)  {
	plot = $('#' + plot_id);
	cloud = $('#' + cloud_id);
	topic = $('#' + topic_id);
	info = $('#' + info_id);

	const years = Object.keys(data);
	years.sort((a, b) => a - b);

	plotClusters(data[years[0]], plot, topic, cloud, info);
}

function plotClusters(data, plot, topic, cloud, info) {

	const d3plot = d3.select(plot[0])
		.append("svg")
		.attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", "0 0 1 1");
	
	d3plot.append("circle").style("fill", "red").attr("cx", 0).attr("cy", 0).attr("r", 0.05);
	d3plot.append("circle").style("fill", "black").attr("cx", 0).attr("cy", 1).attr("r", 0.05);
	d3plot.append("circle").style("fill", "yellow").attr("cx", 1).attr("cy", 0).attr("r", 0.05);
	d3plot.append("circle").style("fill", "pink").attr("cx", 1).attr("cy", 1).attr("r", 0.05);

    data.forEach(d => {
    	d3plot
    	.append("circle")
        .style("fill", "#fff")
		.style("opacity", "0.8")
        .style("cursor", "pointer")
        .attr("r", d['r'] * 0.005)
        .attr("cx", d['x'] + 0.5)
        .attr("cy", -d['y'] + 0.5)
        .on("mouseover", function(){
			d3.select(this)
				.style("transform-origin", "center")
				.transition()
				.ease(d3.easeLinear)
				.duration(100)
				.style("transform", "scale(1.1, 1.1)");
		})
        .on("mouseout", function(){
			d3.select(this)
				.style("transform-origin", "center")
				.transition()
				.ease(d3.easeLinear)
				.duration(100)
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
		.style("font-size", "0.04");

		console.log(d['x'] + " " + d['y'] + " " + d['r']);
    });
}

function createWordcloud(words, cloud) {
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
		.fontSize(function(d) { return d.size; })
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
	.style("font-size", function(d) { return d.size + "px"; })
	.style("font-family", "Oswald")
	.attr("text-anchor", "middle")
	.attr("transform", function(d) {
	return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
	})
	.text(function(d) { return d.text; });
}