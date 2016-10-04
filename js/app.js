var app = angular.module("demoapp", ['leaflet-directive'
]);

app.controller("ejemploController", [ '$scope', 'leafletData', function($scope, leafletData) {
	$scope.markers = new Array();
	$scope.markers = {
	            inicial: {
	                lat: 43.046514,
	                lng: -2.207363,
	                label: {
                            message: "El tren está aquí",
                            options: {
                                noHide: true
                            }
                        },
	                focus: true,
	                draggable: false
	            }
	        };
	var client = Stomp.client( "ws://localhost:61614/stomp", "v11.stomp" );
	client.connect( "", "",
	  function() {
	      client.subscribe("jms.topic.test",
	       function( message ) {
	       	   var lineas = message.toString().split("\n");
	       	   var contador = 0;
	       	   while (!lineas[contador].startsWith("type")){contador++;}
	       	   var tipo = lineas[contador].substring(lineas[contador].indexOf(":") + 1, lineas[contador].length);
	       	   while (!lineas[contador].startsWith('{"latitud"')){contador++;}
	           if(tipo === "posicion"){
	           	 var contenido = JSON.parse(lineas[contador]);
	           	 $scope.markers = new Array();
	           	 $scope.markers.push({
                    lat: contenido.latitud,
                    lng: contenido.longitud,
                    label: {
                            message: "El tren está aquí",
                            options: {
                                noHide: true
                            }
                        }
                 });
	           	 $scope.center.lat = contenido.latitud;
		         $scope.center.lng = contenido.longitud;
		         $scope.center.zoom = 16;
	           }
	       }),
	    { priority: 9 }
	    });
    angular.extend($scope, $scope.markers,{
    	center: {
            lat: 43.046514,
            lng: -2.207363,
            zoom: 15
        },
        defaults: {
            scrollWheelZoom: false
        }
    });
}]);