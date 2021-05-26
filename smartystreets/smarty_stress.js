(function ($) {
    $.fn.smartyAddressTypeahead = function (_params) {

        var _authId = _params.authId;
        var _menuE1 = _params.menuE1;
        var _streetInputE1 = _params.streetInputE1;
        var _cityE1 = _params.cityInputE1;
        var _zipE1 = _params.zipInputE1;
        var _countryE1 = _params.countryInputE1;
        var _stateE1 = _params.stateInputE1;
        var menu = $(`${_menuE1}`);
        var input = $(`${_streetInputE1}`);
        console.log("p", _params)
        function getSuggestions(search, selected) {
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
                        buildMenu(data.suggestions);
                    } else {
                        noSuggestions();
                    }
                },
                error: function (error) {
                    return error;
                }
            });
        }

        function getSingleAddressData(address) {
            $.ajax({
                url: "https://us-street.api.smartystreets.com/street-address?",
                data: {
                    // Don't forget to replace the auth-id value with your own Website Key
                    "auth-id": _authId,
                    "street": address[0],
                    "city": address[1],
                    "state": address[2]
                },
                dataType: "jsonp",
                success: function (data) {
                    $(`${_zipE1}`).val(data[0].components.zipcode);
                    $(`${_countryE1}`).html(data[0].metadata.county_name);
                },
                error: function (error) {
                    return error;
                }
            });
        }

        function clearAddressData() {
            $(`${_cityE1}`).val("");
            $(`${_stateE1}`).val("");
            $(`${_zipE1}`).val("");
            $(`${_countryE1}`).empty();
        }

        function noSuggestions() {
            var menu = $(`${_menuE1}`);
            menu.empty();
            menu.append("<li class='ui-state-disabled'><div>No Suggestions Found</div></li>");
            menu.menu("refresh");
        }

        function buildAddress(suggestion) {
            var whiteSpace = "";
            if (suggestion.secondary || suggestion.entries > 1) {
                if (suggestion.entries > 1) {
                    suggestion.secondary += " (" + suggestion.entries + " more entries)";
                }
                whiteSpace = " ";
            }
            var address = suggestion.street_line + whiteSpace + suggestion.secondary + " " + suggestion.city + ", " + suggestion.state;
            var inputAddress = $(`${_streetInputE1}`).val();
            for (var i = 0; i < address.length; i++) {
                var theLettersMatch = typeof inputAddress[i] == "undefined" || address[i].toLowerCase() !== inputAddress[i].toLowerCase();
                if (theLettersMatch) {
                    address = [address.slice(0, i), "<b>", address.slice(i)].join("");
                    break;
                }
            }
            return address;
        }

        function buildMenu(suggestions) {
            var menu = $(`${_menuE1}`);
            menu.empty();
            suggestions.map(function (suggestion) {
                var caret = (suggestion.entries > 1 ? "<span class=\"ui-menu-icon ui-icon ui-icon-caret-1-e\"></span>" : "");
                menu.append("<li><div data-address='" +
                    suggestion.street_line + (suggestion.secondary ? " " + suggestion.secondary : "") + ";" +
                    suggestion.city + ";" +
                    suggestion.state + "'>" +
                    caret +
                    buildAddress(suggestion) + "</b></div></li>");
            });
            menu.menu("refresh");
        }

        $(`${_menuE1}`).menu({
            select: function (event, ui) {
                var text = ui.item[0].innerText;
                var address = ui.item[0].childNodes[0].dataset.address.split(";");
                var searchForMoreEntriesText = new RegExp(/(?:\ more\ entries\))/);
                input.val(address[0]);
                $(`${_cityE1}`).val(address[1]);
                $(`${_stateE1}`).val(address[2]);

                if (text.search(searchForMoreEntriesText) == "-1") {
                    $(`${_menuE1}`).hide();
                    getSingleAddressData(address);
                } else {
                    $(`${_streetInputE1}`).val(address[0] + " ");
                    var selected = text.replace(" more entries", "");
                    selected = selected.replace(",", "");
                    getSuggestions(address[0], selected);
                }
            }
        });

        $(`${_streetInputE1}`).keyup(function (event) {
            console.log("keyup")
            if (input.val().length > 0 || input.val() === "") clearAddressData();
            if (event.key === "ArrowDown") {
                menu.focus();
                menu.menu("focus", null, menu.menu().find(".ui-menu-item"));
            } else {
                var textInput = input.val();
                if (textInput) {
                    menu.show();
                    getSuggestions(textInput);
                } else {
                    menu.hide();
                }
            }
        });

        $(`${_menuE1}`).css("width", ($(`${_streetInputE1}`).width() + 24) + "px")
    }



}(jQuery));
