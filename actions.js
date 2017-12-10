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
			response.currentBacked = 0;
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
  var totalAmountGolos = parseFloat(data.golos_amount) / parseFloat(data.asset_amount) * parseInt(data.softcap);

  ico.createPost({
    password: data.password,
    author: data.login,
    maintag: 'test',
    permalink: data.asset_name.toLowerCase(),
    title: data.compaign_name,
    body: body
  }, function (err, res) {
    ico.createAsset({
      password: data.password,
      author: data.login,
      assetName: data.asset_name,
      supply: parseInt(data.softcap),
      golosAmount: parseFloat(data.golos_amount),
      assetAmount: parseFloat(data.asset_amount)
    }, function (err, res) {
      ico.issueAsset({
        password: data.password,
        issuer: data.login,
        amount: parseInt(data.softcap),
        assetName: data.asset_name
      }, function (err, res) {
        ico.sellAssets({
          password: data.password,
          issuer: data.login,
          amountGolos: totalAmountGolos,
          amountAsset: totalAmountAsset,
          assetName: data.asset_name,
          expiration: new Date(data.end_data)
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
    });
  });

  return false;
});
