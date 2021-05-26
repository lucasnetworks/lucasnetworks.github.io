(function ($) {
    $.fn.smartyAddressTypeahead = function (_params) {
        var _inputAddressE1 = $(this);
        var _cityE1 = $(`${_params.cityInputE1}`);
        var _stateE1 = $(`${_params.stateInputE1}`);
        var _countryE1 = $(`${_params.countryInputE1}`);
        var _zipCodeE1 = $(`${_params.zipInputE1}`);
        var _authId = _params.authId;

        var clearAddressData = function () {
            _cityE1.val('');
            _stateE1.val('');
            _countryE1.val('');
            _zipCodeE1.val('');
        }
        var displayData = function (data) {
            _inputAddressE1.val(data && data.street_line ? data.street_line : '');
            _cityE1.val(data && data.city ? data.city : '');
            _stateE1.val(data && data.state ? data.state : '');
            _countryE1.val(data && data.country ? data.country : '');
            _zipCodeE1.val(data && data.zip_code ? data.zip_code : '');
        }
        var initTypeahead = function () {
            var jsonData = [{ "addressIndex": "-1", "addressName": "" }];

            var dataSourceForAddress = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('addressName', 'addressIndex'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: jsonData
            });
            dataSourceForAddress.initialize();
            //init typeahead for ***product***
            var getSuggestions = function (search, selected) {

                $.ajax({
                    url: "https://us-autocomplete-pro.api.smartystreets.com/lookup?",
                    data: {
                        // Don't forget to replace the auth-id value with your own Website Key
                        "auth-id": _authId,
                        "search": search,
                        "selected": (selected ? selected : "")
                    },
                    dataType: "jsonp",
                    success: function (data) {
                        if (data.suggestions) {
                            var _data = [];
                            for (var d in data.suggestions) {
                                var dd = data.suggestions[d];
                                _data.push({
                                    addressIndex: d,
                                    addressName: `${dd.street_line ? dd.street_line : ''} ${dd.secondary ? dd.secondary : ''} ${dd.city ? dd.city : ''}, ${dd.zip_code ? dd.zip_code : ''}`,
                                    city: dd.city ? dd.city : '',
                                    street_line: dd.street_line ? dd.street_line : '',
                                    zip_code: dd.zipcode ? dd.zipcode : '',
                                    country: dd.country ? dd.country : '',
                                    state: dd.state ? dd.state : ''
                                })
                            }
                            dataSourceForAddress.clear();
                            dataSourceForAddress.local = _data;
                            dataSourceForAddress.initialize(true);
                        } else {

                        }
                    },
                    error: function (error) {
                        return error;
                    }
                });
            }
            _inputAddressE1.typeahead({
                minLength: 0,
                highlight: true
            }, {
                name: 'address',
                limit: 50,
                display: function (item) {
                    return item.addressName
                },
                source: dataSourceForAddress.ttAdapter(),
                suggestion: function (data) {
                    return '<div>' + data.addressName + '–' + data.addressIndex + '</div>'
                }
            })
            _inputAddressE1.keyup(function (event) {
                if (_inputAddressE1.val().length > 0 || _inputAddressE1.val() === "") clearAddressData();
                if (event.key === "ArrowDown") {

                } else {
                    var textInput = _inputAddressE1.val();
                    if (textInput) {
                        getSuggestions(textInput);
                    } else {
                    }
                }
            });
            _inputAddressE1.on('typeahead:selected', function (e, datum) {
                displayData(datum);
            });
        }
        initTypeahead();

    }
}(jQuery));