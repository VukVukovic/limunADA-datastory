function createClusterDisplay(data, radios_id, plot_id, topic_id, cloud_id, info_id, manual_id)  {
	const plot = $('#' + plot_id);
	const cloud = $('#' + cloud_id);
	const topic = $('#' + topic_id);
	const info = $('#' + info_id);
	const radios = $('#' + radios_id);
	const manual = $('#' + manual_id);

	const years = Object.keys(data);
	years.sort((a, b) => a - b);

	const instanceId = 'inst' + Math.floor(10000*Math.random());

	years.forEach(y => {
		const containg_div = $('<div>', {class: 'form-check form-check-inline'});
		$('<input>', {class: 'form-check-input', type: 'radio', value: y, id: instanceId+y, name: instanceId}).appendTo(containg_div);
		$('<label>', {class: 'form-check-label', for:instanceId+y}).text(y).appendTo(containg_div);
		radios.append(containg_div);
	});

	$('input[type=radio][name='+instanceId+']').on('change', function() {
		plotClusters(data[this.value], plot, topic, cloud, info, manual);
	});
	
	$('input[type=radio][name='+instanceId+']').filter('[value="'+years[0]+'"]').attr('checked', true);
	plotClusters(data[years[0]], plot, topic, cloud, info, manual);
}

var chartClouds = {}

function plotClusters(data, plot, topic, cloud, info, manual) {
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
			manual.hide();
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
				data: words.map(w => Math.random() * 20 + 10),
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
              stacked: true,
			  title: {
				display: true,
				text: '% of all quotations'
			  }
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
		trends_div.append('<div class="col-12 col-md-6"><div class="text-center h5 font-raleway color-subtlered">'+(t.charAt(0).toUpperCase() + t.slice(1))+'</div><canvas id="'+t.replaceAll(' ', '_')+'"></canvas></div>');
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
			options: {
				scales: {
					yAxis: {
						title: {
							display: true,
							text: '% of all quotations'
						}
					}
				}
			}
		};

		new Chart($('#'+id), config);
	});
}

function calculateSum(data_total, year, topic) {
	return data_total['republicans'][year][topic] + data_total['democrates'][year][topic];
}

var barChartPlot = null;
function plotBarChart(data_total, year, barchart_id) {
	let topics = Object.keys(data_total['republicans'][year]);
	topics.sort((a, b) => -(calculateSum(data_total, year, a) - calculateSum(data_total, year, b)))
	topics = topics.slice(0, 10);

	const labels = topics.map(t => t.charAt(0).toUpperCase() + t.slice(1));

	const data = {
		labels: labels,
		datasets: [
			{
			label: 'Total',
			data: topics.map(t => calculateSum(data_total, year, t)),
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
		  },
		  scales: {
			xAxis: {
				title: {
					display:true,
					text:'Total number of quotations on the topic by Democrats and Republicans'
				}
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

$(document).ready(function() {
	createClusterDisplay(data_topics_democrates, 'radios_democrates', 'clusters_democrates', 'topic_democrates', 'cloud_democrates', 'info_democrates', 'manual_democrates');
	createClusterDisplay(data_topics_republicans, 'radios_republicans', 'clusters_republicans', 'topic_republicans', 'cloud_republicans', 'info_republicans', 'manual_republicans');

	const topicTrends = [
	{"topic":"Politics", "data_topics": ["politics"], "text": "Elections in the US were held in 2016, which causes a huge peak of political quotations in that same year, after which we can notice an immediate, steep decay. During the following three years we see an almost linear increase in interest in politics, which might imply that parties started their pre-election campaign. So, in 2020, when another election was held, there must have been a huge peak again! However, we see a decrease in the percentages of quotes related to politics. Why is that? Before you think that there is some mistake here, we remind you that these are percentages of quotes that are related to politics. So, in 2020, there must have been some topic that was so important, even more, important than elections in the US. Unfortunately, we all know what that is. The year 2020 will always be known as the year of COVID-19 outbreak."},
	{"topic": "Healthcare", "data_topics": ["health", "affordability of healthcare", "china"], "text":"A huge COVID-19 epidemic breakout happened in 2020, which explains this sharp increase in 2020. The virus was firstly located in China, and that explains why there is also an increase in the percentage of quotes related to China in 2020, especially when it comes to the republican party. Indeed, Donald Trump was not embarrassed to refer to this virus as a \"Chinese virus\". But, except for this big change in 2020, we also see a peak in 2017. What happened then? The program Affordable Care Act (ACA), also known as Obamacare was formed in 2010 but was facing strong political opposition by the republican party. During his presidency, Donal Trump rescinded the federal tax penalty for violating the individual mandate through the Tax Cuts and Jobs Act of 2017. This raised many questions about whether the ACA was still constitutional, which clearly explains this peak."},
	{"topic":"Foreign relations", "data_topics":["korea", "russia", "china"], "text" : "Here, we analyze the relationship between the US and some of the most important countries in the far East, when it comes to the foreign policy of the US. Let us start with the US-Russia relationship. In 2016, US presidential elections took place and there was an accusation that Russian officials interfered with the elections, trying to harm the campaign of Hillary Clinton, ultimately boosting Donald Trump's chances of winning. This was later investigated from 2017 to 2019 by special prosecutor Robert Mueller, who finally managed to prove this. This was also known as a <a href=\"https://en.wikipedia.org/wiki/Mueller_report\" target=\"_blank\">Mueller report</a>. As a result, we see a relatively high presence of Russia-related quotations in the media during 2017, 2018, and 2019.<br /> North Korea is another example of a country with complicated relations with the US. In 2017 President Donald Trump stated: \"There will be fire and fury if the isolated nation makes more threats against the United States\". Tensions between North Korea and the US are getting bigger and bigger. In 2018 Trump met with North Korean President Kim Jong-un for the first time. All these events made a huge impact when it comes to media. Tensions were reduced when a Peace treaty between North Korea and the US was signed. However, media usually prefers to report about crisis rather than peace.<br />US-China relations were indeed complicated for the previous several years. In January 2018, US President Donald Trump began setting tariffs and other trade barriers on China, which explains the increase in interest in China. Moreover, this interest explodes in 2019 and 2020 when the COVID-19 breakout happened. "},
	{"topic":"Sexism", "data_topics":["sexism"], "text":"Different political parties addressed this issue almost in the same amounts during 2015 and 2016, but we see that afterward, democrats were in huge favor of this topic. What was so different between 2015 and 2016 in comparison to other years when it comes to sexism? We believe - elections. Remember that in the elections in 2016, Donald Trump and Hillary Clinton were running for president. It makes sense to assume that republicans did not want Hillary to gain political points because she was a woman, so they had a strong campaign when it came to women's rights. However, after playing their cards right during the campaign, they went back to their original beliefs and started addressing this problem far, far less, as opposed to the Democrats."},
	{"topic":"Terrorism", "data_topics":["terrorism"], "text": "ISIS carried out numerous terrorist attacks all around the world in 2015 and 2016 (e.g. London, Paris, Brussels). Fortunately, after the actions and interventions of the world's leading forces, they lost  most of their territory by the end of 2017. Therefore, the frequency of quotations on the topic of terrorism has been decreasing after the initial peak."},
	{"topic":"Climate change", "data_topics":["climate change"], "text":"Except that we see that climate change and the environment is a bigger issue for democrats than republicans, we also see something that might have happened in the year 2019. In June 2019, Donald Trump formally withdraws from Paris Agreement on climate change mitigation. This decision was strongly criticized by Democrats. For this reason, there is a peak in 2019."},
	{"topic":"Racism", "data_topics":["racism"], "text":"Except for the fact that democrats pay more attention to this particular topic, we also see two peaks - one in 2016 and one in 2019. Why is this? Our guess is the following: Black Lives Matters is a well-known movement against racially motivated violence against black people. Its' activists became involved in elections in 2016, which explains the first peak. Whereas public opinion on Black Lives Matter was net negative in 2018, it grew increasingly popular through 2019 and 2020 (according to <a href=\"https://en.wikipedia.org/wiki/Black_Lives_Matter\" target=\"_blank\">Wikipedia</a>) which explains the other peak."}
	]
	
	topicTrends.forEach((tt, i) => 
	  $('#popularity-change-select').append(
	  $('<option>', {value : i}).text(tt['topic']))
	);

	$('select#popularity-change-select').on('change', function() {
	  plotTopicTrends(research_data, topicTrends[parseInt(this.value)]['data_topics'], 'popularity-trends');
	  $('#popularity-trends').append('<div class="col-12 col-lg-6 my-auto text-justify">'+topicTrends[parseInt(this.value)]['text']+'</div>');
	});

	plotTopicTrends(research_data, topicTrends[0]['data_topics'], 'popularity-trends');
	$('#popularity-trends').append('<div class="col-12 col-lg-6 my-auto text-justify">'+topicTrends[0]['text']+'</div>');

	//createPopularityPerYear(research_data, 'year-popularity-years', 'year-popularity-chart');
	const topics = Object.keys(research_data['republicans']['2015']);

	plotComparison(research_data, 
	  ['climate change', 'economic inequality', 'racism', 'sexism', 'job opportunities', 'affordability of healthcare'], 
	  2019, 'popularity-comparison-dem');
	
	plotComparison(research_data, 
	  ['drug addiction', 'economy', 'terrorism', 'illegal immigration'], 
	  2019, 'popularity-comparison-rep');

	
	$('input[type=radio][name=radio-barchart]').on('change', function() {
	  plotBarChart(data_total_number_of_quotes, this.value, 'popularity-barchart');
	});

	$('input[type=radio][name=radio-barchart]').filter('[value="2019"]').attr('checked', true);
	plotBarChart(data_total_number_of_quotes, '2019', 'popularity-barchart');
  });