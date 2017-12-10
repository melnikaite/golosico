var $projects = $('#projects'),
	$projectsRowTemplate = $('#projects_row_template');

ico.getProjects(function(response) {
	console.log(response);
	$.each(response, function(index, value) {
		$newRow = $projectsRowTemplate.clone();
		$newRow.removeClass('d-none');
		$newRow.removeAttr('id');
		$newRow.find('.projects-row-image').attr('src', 'https://dummyimage.com/600x400/000/fff.jpg&text=' + value.title);
		$newRow.find('.projects-row-title').text(value.title);
		$newRow.find('.projects-row-short-description').text(value.body);
		value.author = '@' + value.author;
		$newRow.find('.projects-row-author').text(value.author);
		$newRow.find('.projects-row-author').attr('href', 'https://golos.io/' + value.author);
		$newRow.find('.projects-row-raised-percent').text('6865 GOLOS');
		$newRow.find('.projects-row-raised').text('6865 GOLOS');
		$newRow.find('.projects-row-backers').text('14');
		$newRow.find('.projects-row-softcap').text('10000 GOLOS');
		$projects.append($newRow);
	});
});

var $createCapaign = $('#create_campaign');
$('#create_campaign_call_btn').on('click', function() {
	$createCapaign.removeClass('d-none');
	$projects.addClass('d-none');
});

$('#projects_call_btn').on('click', function() {
	$projects.removeClass('d-none');
	$createCapaign.addClass('d-none');
});