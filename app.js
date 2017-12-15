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
		ico.getBackedAmount('CATSSUPPORT', function(response) {
			console.log(response);
			//response.currentBacked = 0;
			var percent = Math.ceil(response.currentBacked * 100 / response.currentSupply);
			response.currentBacked = response.currentBacked + ' GOLOS';
			$newRow.find('.projects-row-raised, .projects-row-raised-percent').text(response.currentBacked);
			response.currentSupply = response.currentSupply + ' GOLOS';
			$newRow.find('.projects-row-softcap').text(response.currentSupply);
			if (percent < 15) percent = 15;
			$newRow.find('.progress-bar').css({width: percent + '%'});
		});
		$newRow.find('input[name="asset_name"]').val('CATSSUPPORT');
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
  ico.getExchangeRate(asset_name, function (err, res) {
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

var $myAssetsModal = $('#my_assets_modal'),
	$myAssetsTable = $myAssetsModal.find('#my_assets_table'),
	$myAssetsTableTbody = $myAssetsTable.find('tbody');
$('#my_assets_call_btn').on('click', function() {
	$myAssetsModal.modal('show');
});

$myAssetsModal.find('form').on('submit', function() {
	var $form = $(this),
		loginVal = $form.find('input[name="login"]').val();
	$myAssetsTableTbody.html('');
	ico.getMyAssets(loginVal,function(error, response) {
		console.debug(response);
		$myAssetsTable.removeClass('d-none');
		$.each(response, function(index, value) {
			$myAssetsTableTbody.append('<tr><td>' + value + '</td></tr>');
		});
	});
	return false;
});

$createCapaign.find('form').on('submit', function () {
  var $form = $(this),
    rawData = $form.serializeArray(),
    data = {};
  $.each(rawData, function (index, value) {
    data[value.name] = value.value;
  });

  var body = data.description;
  var totalAmountAsset = parseInt(data.softcap);
  var assetAmount = parseFloat(data.asset_amount);
  var golosAmount = parseFloat(data.golos_amount);
  var totalAmountGolos = golosAmount / assetAmount * totalAmountAsset;
  var expirationAsset = new Date(data.end_data);
	
  ico.createPost({
    password: data.password,
    author: data.login,
    maintag: 'golosico',
    permalink: data.asset_name.toLowerCase(),
    title: data.compaign_name,
    body: body,
	meta_data: {
		compaignType: data.compaign_type,
		assetName: data.asset_name,
		amountAsset: totalAmountAsset,
		assetAmount: assetAmount,
		golosAmount: golosAmount,
		amountGolos: totalAmountGolos,
		expiration: expirationAsset
	}
  }, function (err, res) {
	if ( ! err) {
		ico.createAsset({
		  password: data.password,
		  author: data.login,
		  assetName: data.asset_name,
		  supply: totalAmountAsset,
		  golosAmount: golosAmount,
		  assetAmount: assetAmount
		}, function (err, res) {
			if ( ! err) {
			  ico.issueAsset({
				password: data.password,
				issuer: data.login,
				amount: totalAmountAsset,
				assetName: data.asset_name
			  }, function (err, res) {
				ico.sellAssets({
				  password: data.password,
				  issuer: data.login,
				  amountGolos: totalAmountGolos,
				  amountAsset: totalAmountAsset,
				  assetName: data.asset_name,
				  expiration: expirationAsset
				}, function (err, res) {
				  swal({
					title: 'Success!',
					html: `You just created campaign for <b>${totalAmountAsset} ${data.asset_name}</b> equal to <b>${totalAmountGolos}</b> GOLOS!`,
					type: 'success',
					confirmButtonText: 'OK',
					confirmButtonClass: 'btn btn-success btn-lg',
					buttonsStyling: false,
				  });
				});
			  });
			}
			else {
				swal({
					title: 'Error!',
					html: err.message,
					type: 'error',
					showCloseButton: true,
					buttonsStyling: false,
					confirmButtonClass: 'btn btn-danger btn-lg',
					confirmButtonText: 'OK'
				});
			}
		});
  	}
	else {
		swal({
			title: 'Error!',
			html: err.message,
			type: 'error',
			showCloseButton: true,
			buttonsStyling: false,
			confirmButtonClass: 'btn btn-danger btn-lg',
			confirmButtonText: 'OK'
		});
	}
  });

  return false;
});

swal({
	title: 'This is the alpha version and<br>it works in the testnet!',
	type: 'warning',
	showCloseButton: true,
	showCancelButton: true,
	buttonsStyling: false,
	confirmButtonClass: 'btn btn-success btn-lg',
	cancelButtonClass: 'btn btn-danger btn-lg',
	confirmButtonText: 'Understand!',
	cancelButtonText: 'Don\'t understand...'
}).then((result) => {
	if (result.dismiss === 'cancel') {
		swal({
			title: 'Alpha version and testnet!',
			html: 'This is in active development of the platform and all actions are not published in the public blockchain, only in the test blockchain.<br>Assets, GOLOS, not real...',
			type: 'info',
			showCloseButton: true,
			buttonsStyling: false,
			confirmButtonClass: 'btn btn-success btn-lg',
			confirmButtonText: 'OK'
		});
	}
});

$('#about_golosico_call_btn').on('click', function() {
	swal({
		title: 'About this project!',
		html: $('#about_golosico_html').html(),
		type: 'info',
		buttonsStyling: false,
		confirmButtonClass: 'btn btn-success btn-lg',
		confirmButtonText: 'Cool!',
		position: 'top'
	});
});

$('#social-add-btn').on('click', function() {
	var $btn = $(this),
		$row = $btn.parents('.form-row');
	var $newRow = $row.clone();
	$newRow.find('button').removeClass('btn-success').addClass('btn-danger remove').text('Remove');
	$('#socials-add .card-body').append($newRow);
});
$('#socials-add').on('click', '.remove', function() {
	$(this).parents('.form-row').remove();
});

var $assetNamePrice = $('#asset_name_price');
function getAssetName(value) {
	ico.getPriceAssetName(value, function(err, res) {
		$assetNamePrice.text(res);
	});
	return value.toUpperCase().replace(/[^A-Z]/g, '');
}

$('#campaign-name').on('input', function() {
	var value = $(this).val();
	$('#asset_name').val(getAssetName(value));
});

$('#asset_name').on('input', function() {
	var $input = $(this);
	$input.val(getAssetName($input.val()));
});