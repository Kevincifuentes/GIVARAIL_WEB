var app = angular.module("demoapp", ['leaflet-directive'
]);

app.config(function($logProvider){
  $logProvider.debugEnabled(false);
});

app.controller("ejemploController", [ '$scope', 'leafletData', function($scope, leafletData) {
	$scope.markers = new Array();
	$scope.markers = {
	            tren: {
	                lat: 43.046514,
	                lng: -2.207363,
	                focus: true,
                        //message: "Hey, drag me if you want",
                        title: "Marker",
                        draggable: true,
                        label: {
                            message: "El tren está aquí",
                            options: {
                                noHide: true
                            }
                        }
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
	           	 $scope.markers.tren.lat = contenido.latitud;
	           	 $scope.markers.tren.lng = contenido.longitud;
	           	 $scope.center.lat = contenido.latitud;
		         $scope.center.lng = contenido.longitud;
		         $scope.center.zoom = 15;
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