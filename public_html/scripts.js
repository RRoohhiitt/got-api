//GETTING LIST
$('.dvGetList a').click(function (event) {
    event.preventDefault();
    let ajax = {
        url: '/list',
        settings: {
            method: 'GET'
        }
    }
    _makeAjaxRequest(ajax)
        .then(
            (response) => {
                if (response.status == 'success' && response.data.length > 0) {
                    $('#searchQuery').empty();
                    $('#includedContent').empty();
                    $('#includedContent').append('<h4>List of places where battles took place</h4>')
                    for (let i = 0; i < response.data.length; i++) {
                        $('#includedContent').append('<p>' + response.data[i] + '</p>')
                    }
                }
            })
        .catch((e) => alert(e.err.responseText));
});

$('.dvCreateList a').click(function (event) {
    event.preventDefault();
    $('#includedContent').empty();
    $('#searchQuery').empty();
    let ajax = {
        url: '/createlist',
        settings: {
            method: 'GET'
        }
    }
    _makeAjaxRequest(ajax)
        .then(
            (response) => {
                console.log(response);

            })
        .catch((e) => alert(e.err.responseText));
});
$('.dvStats a').click(function () {
    event.preventDefault();
    $('#searchQuery').empty();
    $('#includedContent').empty();
    let ajax = {
        url: '/stats',
        settings: {
            method: 'GET'
        }
    }
    _makeAjaxRequest(ajax)
        .then(
            (response) => {
                $('#includedContent').append('<h3>Stats<h3>');
                $('#includedContent').append('<p>' + response.data + '</p>');
            })
        .catch((e) => alert(e.err.responseText));
})

$('.dvGetCount a').click(function (event) {
    event.preventDefault();
    $('#searchQuery').empty();
    $('#includedContent').empty();
    let ajax = {
        url: '/getcount',
        settings: {
            method: 'GET'
        }
    }
    _makeAjaxRequest(ajax)
        .then(
            (response) => {
                $('#includedContent').append('<h4>Total Battles Occured : ' + JSON.parse(response.data).count + '</h4>', )
            })
        .catch((e) => alert(e.err.responseText));
});
$('.dvSearch a').click(function (event) {
    event.preventDefault();
    $('#includedContent').empty();
    $('#searchQuery').empty();
    $('#searchQuery').append('<form name="search-form" id="querySubmit"><div class="col-md-8"> <input type="text" value="/search?king=Robb Stark&battle_type=ambush&region=The Riverlands&major_death=1" class="form-control" id="searchterm"></div><div class="col-sm-2"><input type="submit" onclick="searchQuery()" class=" btn btn-primary"></div></form>');
});

function searchQuery() {
    event.preventDefault();
    $('#includedContent').empty();
    searchparams = $('#searchterm').val();
    searchparams = searchparams.split('?').pop();
    let ajax = {
        url: '/search?' + searchparams,

        settings: {
            method: 'GET'
        }
    }
    _makeAjaxRequest(ajax)
        .then(
            (response) => {
                $('#includedContent').empty();
                $('#includedContent').html('<code>' + response.data + '</code>');
            })
        .catch((e) => console.warn(e.err.responseText));
}

function _makeAjaxRequest(ajaxData) {
    return new Promise((rs, rj) => {
        $.ajax(ajaxData)
            .then(
                function (data, status, response) {
                    //success
                    rs({
                        data: data,
                        status: status,
                        response: response
                    })
                }
            )
            .catch(
                function (err, status, response) {
                    //error
                    rj({
                        err: err,
                        status: status,
                        response: response
                    })
                }
            );
    })
}