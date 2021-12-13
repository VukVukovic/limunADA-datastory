$(document).ready(function() {
	$('#fullpage').fullpage({
		//options here
		autoScrolling:true,
		scrollHorizontally: true,
		sectionsColor: ['#06AED5', '#9BC53D', '#C3423F', '#F18701', '#272727'],
		navigation: true,
		anchors: ['firstPage', 'secondPage', 'thirdPage', 'fourthPage', 'lastPage'],
		menu: '#myMenu'
	});

	//methods
	$.fn.fullpage.setAllowScrolling(true);
});