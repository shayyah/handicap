function initMap() { 
    var geocoder = new google.maps.Geocoder;
    var Origin = { lat: 33.51381914356076, lng: 36.276532603746304 }; 

             
    $('#Longitude').val(Origin.lng);
    $('#Latitude').val(Origin.lat);  
    $('#Address').val("Syria");


    // Initialize first Map
    var originMap = new google.maps.Map(document.getElementById('mapSource'),
    {
        zoom: 8,
        center: Origin,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false
    });
     
    ////////////////////////////////////////////////////////////// 

    // Add center flag To first Map
    $('<div />').addClass('centerMarkerSource').appendTo(originMap.getDiv())
        .click(function () {
            var that = $(this);
            that.data('win').open(originMap);
        });
        var originInfowindow = new google.maps.InfoWindow({
        content: ''
    });
     

    // Add Listner when center start changed
    originMap.addListener('dragstart',
        function () {
        originInfowindow.close();
 
        $('#Address').val(''); 
        $('#Address').prop('disabled', true); 
             
    });

    // Add Listner when center first Map changed
    originMap.addListener('dragend',
            function () {
        window.setTimeout(function () {
            var mylng = originMap.getCenter().lng();
            var mylat = originMap.getCenter().lat(); 
            $('#Longitude').val(mylng);
            $('#Latitude').val(mylat);

            geocodeLatLng(true, mylat, mylng);
        }, 500);
    });
     


    function geocodeLatLng(source, latitiude, longtitude) {
        var latlng = {lat: latitiude, lng: longtitude };
        geocoder.geocode({'location': latlng },
            function (results, status) {
                if (status === 'OK') {
                    if (results[0]) {

                        var country, city, street;
                        for (var i = 0; i < results[0].address_components.length; i++) {

                            if (results[0].address_components[i].types[0] == "country") {
                                //this is the object you are looking for
                                country = results[0].address_components[i].long_name;
                            }

                            if (results[0].address_components[i].types[0] == "administrative_area_level_1") {
                                //this is the object you are looking for
                                city = results[0].address_components[i].short_name;
                            }

                                                        }
                        if (country == null || (typeof country == 'undefined') || country == "") {
                            showInfoWindow(source, latitiude, longtitude, 'Location not found');
                        }
                        else
                        {
                            var address = results[0].formatted_address;
                                                                         
                            $('#OriginCountry').val(country); 
                            $('#OriginCity').val(city);
                            $('#Address').val(address);



                            $("#sourceDetailedInfo").css("background-color", "#fff");
                            $('.sourceItems').removeClass("OnloadAddress");

                            $("#loadinSourcegMapInfo").hide();
                            $('#Address').prop('disabled', false);
                            $('#OriginCity').prop('disabled', false);
                            $('#OriginCountry').prop('disabled', false); 
                                     
                        }

                    }
                    else
                    {
                        showInfoWindow(source, latitiude, longtitude, 'Location not found');
                    }
                }
                else
                {
                    if (status === 'ZERO_RESULTS')
                    {
                        showInfoWindow(source, latitiude, longtitude, 'Non existent address');
                    }
                    else if (status === 'OVER_QUERY_LIMIT')
                    {
                        showInfoWindow(source, latitiude, longtitude, 'Service over limit, please try later');
                    }
                    else
                    {
                        showInfoWindow(source, latitiude, longtitude, 'Failed due to: ' + status);
                    }
                }
            });
    }

    function showInfoWindow(source, latitiude, longtitude, errorMessage) {
        var latlng = {lat: latitiude, lng: longtitude };

                 
        $('#Address').val(''); 
         

        originInfowindow.setContent(
            errorMessage
        );
        originInfowindow.setPosition(latlng);
        originInfowindow.open(originMap);

               
    }

} 


