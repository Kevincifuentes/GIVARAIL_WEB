var app = angular.module("giv2railapp", ['leaflet-directive'
]);

app.config(function($logProvider){
  $logProvider.debugEnabled(false);
});
var numeroMarcadores = []; //cuando haya más de un tren
var todosMarcadores =[];
var numeroMarcadoresAhora = [];
var ultimoActualizadoTrenes = [];
var primeraVez = true;

app.controller("giv2railController", [ '$scope', 'leafletData', function($scope, leafletData) {
	$scope.markers = new Array();
	marcador = {
	                lat: 43.046514,
	                lng: -2.207363,
	                focus: true,
                        
                        title: "Tren",
                        draggable: true,
                        label: {
                            message: "El tren está aquí",
                            options: {
                                noHide: true
                            }
                        },
                        icon: {
                        	iconUrl: 'img/icontrain.png',
		                    iconSize:     [38, 38], // tamano del icono
		                    iconAnchor:   [15, 38], // punto del icono que correponde a la localizacion del marcador
		                    popupAnchor:  [-3, -76] // punto relativo a donde el popup debería abrirse
                        }
	            };
	numeroMarcadoresAhora["tren1"] = 1;
	ultimoActualizadoTrenes["tren1"] = -1;
	todosMarcadores["tren1"] = new Array();
	todosMarcadores["tren1"].push(marcador);
	$scope.markers.push(marcador);
	var client = Stomp.client( "ws://dev.mobility.deustotech.eu:61614", "v11.stomp" );
	client.connect( "", "",
	  function() {
	      client.subscribe("/topic/jms.topic.test",
	       function( message ) {
	       	   var lineas = message.toString().split("\n");
	       	   var contador = 0;
	       	   while (!lineas[contador].startsWith("type")){contador++;}
	       	   var tipo = lineas[contador].substring(lineas[contador].indexOf(":") + 1, lineas[contador].length);
	       	   while (!lineas[contador].startsWith('{"latitud"')){contador++;}
	           if(tipo === "posicion"){
	           	 var contenido = JSON.parse(lineas[contador]);
	           	 //	HABRÍA QUE OBTENER EL ID DE CADA TREN Y MIRAR SI YA HAY MARCADORES Y SI NO AÑADIR
	           	 if(numeroMarcadoresAhora["tren1"] != 5)
	           	 {
	           	 	ultimoActualizadoTrenes["tren1"] = -1;
	           	 	marcador = {
		                lat: contenido.latitud,
		                lng: contenido.longitud,
		                focus: true,
                        title: "Tren",
                        draggable: true,
                        label: {
                            message: "El tren está aquí" + numeroMarcadoresAhora["tren1"] ,
                            options: {
                                noHide: true
                            }
                        },
                        icon: {
                        	iconUrl: 'img/icontrain.png',
		                    iconSize:     [38, 38], // tamano del icono
		                    iconAnchor:   [15, 38], // punto del icono que correponde a la localizacion del marcador
		                    popupAnchor:  [-3, -76] // punto relativo a donde el popup debería abrirse
                        }
		            };
		            todosMarcadores["tren1"].push(marcador);
		            $scope.markers.push(marcador);
		            numeroMarcadoresAhora["tren1"]++;
	           	 }
	           	 else
	           	 {
	           	 	todosMarcadores["tren1"][ultimoActualizadoTrenes["tren1"]+1].lat = contenido.latitud;
	           	 	todosMarcadores["tren1"][ultimoActualizadoTrenes["tren1"]+1].lng = contenido.longitud;
	           	 	if(ultimoActualizadoTrenes["tren1"] === 3)
	           	 	{
	           	 		ultimoActualizadoTrenes["tren1"] = -1;
	           	 	}
	           	 	else
	           	 	{
	           	 		ultimoActualizadoTrenes["tren1"]++;
	           	 	}
	           	 }
	           	 if(primeraVez === true)
	           	 {
	           	 	primeraVez = false;
	           	 	$scope.center.lat = contenido.latitud;
		         	$scope.center.lng = contenido.longitud;
	           	 }
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