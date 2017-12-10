var $projects = $('#projects'),
	$projectsRowTemplate = $('#projects_row_template'),
	$buyAssetsModal = $('#buy_assets_modal'),
	$loginModal = $('#login_modal');

var asset_name;

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
		$newRow.find('input[name="asset_name"]').val('AAAAAAAAE');
		$newRow.find('.buy_assets_call_btn').on('click', function() {
			$buyAssetsModal.modal('show');
			asset_name = $newRow.find('input[name="asset_name"]').val();
		});
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

var auth = {};

$buyAssetsModal.find('form').on('submit', function () {
  var $form = $(this);

  var login = $form.find('input[name="login"]').val();
  var password = $form.find('input[name="password"]').val();
  var golos_amount = parseFloat($form.find('input[name="golos_amount"]').val());
  var asset_name = 'AAAAAAAAE';
  ico.getExchangeRate('', function (err, res) {
    var asset_amount = golos_amount * res.from;
    ico.buyAssets({
      password: password,
      buyer: login,
      amountGolos: golos_amount,
      amountAsset: asset_amount,
      assetName: asset_name,
      expiration: new Date(new Date().getTime() + 60 * 1000)
    }, function (err, res) {
      swal({
        title: 'Success!',
        text: `You just bought ${asset_amount} ${asset_name} for ${golos_amount} GOLOS!`,
        type: 'success',
        confirmButtonText: 'OK',
        confirmButtonClass: 'btn btn-success btn-lg',
        buttonsStyling: false,
        //timer: 1500
      });
    });
  });

  return false;
});

$loginModal.find('form').on('submit', function() {
	var $form = $(this),
		data = $form.serializeArray();
	auth = {
		login: $form.find('input[name="login"]').val(),
		pass: $form.find('input[name="password"]').val()
	};
	$loginModal.modal('hide');
	return false;
});