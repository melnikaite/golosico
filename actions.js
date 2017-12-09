var $projects = $('#projects');

ico.getProjects(function(response) {
	$.each(response, function(index, value) {
		$projects.append('123123');
	});
});