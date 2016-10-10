var app = angular.module("giv2railapp", ['leaflet-directive'
]);

app.config(function($logProvider){
  $logProvider.debugEnabled(false);
});

var modalHistoricoAbierto = false;

var numeroMarcadores = []; //cuando haya más de un tren
var todosMarcadores =[];
var numeroMarcadoresAhora = [];
var ultimoActualizadoTrenes = [];
var primeraVez = true;
var numeroMaximoAMostrar = 5;
var arrayIconos = ["img/icontrainb0.png", "img/icontrainb25.png", "img/icontrainb50.png", "img/icontrainb75.png", "img/icontrain.png"]

function establecerEventos(){
		// Coge el modal
	var modal = document.getElementById('historicoModal');

	// coje el boton de historico
	var btn = document.getElementById("historico");

	// coje el span del modal
	var span = document.getElementsByClassName("close")[0];

	// Cuando se pulsa al historico se muestra el modal o se cierra si estaba abierto
	btn.onclick = function(event) {
		if(modalHistoricoAbierto === false)
		{
			modalHistoricoAbierto = true;
			modal.style.display = "block";
		}
		else
		{
			modalHistoricoAbierto = false;
			modal.style.display = "none";
		}
	    
	}

	//Cuando se pulse la x se cierra el modal
	span.onclick = function() {
	    modal.style.display = "none";
	    modalHistoricoAbierto = false;
	}
}

app.controller("giv2railController", [ '$scope', 'leafletData', function($scope, leafletData) {
	establecerEventos();
	 $scope.data = {
	    opcionesBusqueda: [
	      "ID tren",
	      "Fecha"
	    ],
	    seleccion: "ID tren",
	    inputBusqueda: ""
    };
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
                                noHide: false
                            }
                        },
                        icon: {
                        	iconUrl: arrayIconos[4],
		                    iconSize:     [38, 38], // tamano del icono
		                    iconAnchor:   [15, 38], // punto del icono que correponde a la localizacion del marcador
		                    popupAnchor:  [-3, -76], // punto relativo a donde el popup debería abrirse
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
	           	 if(numeroMarcadoresAhora["tren1"] != numeroMaximoAMostrar)
	           	 {
	           	 	ultimoActualizadoTrenes["tren1"] = -1;
	           	 	marcador = {
		                lat: contenido.latitud,
		                lng: contenido.longitud,
		                focus: true,
                        title: "Tren",
                        draggable: true,
                        label: {
                            message: "El tren está aquí" + numeroMarcadoresAhora["tren1"] +" "+ new Date().toUTCString(),
                            options: {
                                noHide: false
                            }
                        },
                        icon: {
                        	iconUrl: arrayIconos[4],
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
	           	 	todosMarcadores["tren1"][ultimoActualizadoTrenes["tren1"]+1].icon.iconUrl = arrayIconos[4];
	           	 	todosMarcadores["tren1"][ultimoActualizadoTrenes["tren1"]+1].label.message = "El tren está aquí "+ new Date().toUTCString();
	           	 	switch(ultimoActualizadoTrenes["tren1"]+1) {
					    case 0:
					        todosMarcadores["tren1"][4].icon.iconUrl = arrayIconos[3];
		           	 		todosMarcadores["tren1"][3].icon.iconUrl = arrayIconos[2];
		           	 		todosMarcadores["tren1"][2].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores["tren1"][1].icon.iconUrl = arrayIconos[0];
		           	 		ultimoActualizadoTrenes["tren1"]++;
					        break;
					    case 1:
					    	todosMarcadores["tren1"][4].icon.iconUrl = arrayIconos[2];
		           	 		todosMarcadores["tren1"][3].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores["tren1"][2].icon.iconUrl = arrayIconos[0];
		           	 		todosMarcadores["tren1"][0].icon.iconUrl = arrayIconos[3];
					        ultimoActualizadoTrenes["tren1"]++;
					        break;
					    case 2:
					    	todosMarcadores["tren1"][4].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores["tren1"][3].icon.iconUrl = arrayIconos[0];
		           	 		todosMarcadores["tren1"][1].icon.iconUrl = arrayIconos[3];
		           	 		todosMarcadores["tren1"][0].icon.iconUrl = arrayIconos[2];
					        ultimoActualizadoTrenes["tren1"]++;
					        break;
					    case 3:
					        todosMarcadores["tren1"][2].icon.iconUrl = arrayIconos[3];
		           	 		todosMarcadores["tren1"][1].icon.iconUrl = arrayIconos[2];
		           	 		todosMarcadores["tren1"][0].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores["tren1"][4].icon.iconUrl = arrayIconos[0];
		           	 		ultimoActualizadoTrenes["tren1"]++;
					        break;
					    case 4:
					    	todosMarcadores["tren1"][3].icon.iconUrl = arrayIconos[3];
		           	 		todosMarcadores["tren1"][2].icon.iconUrl = arrayIconos[2];
		           	 		todosMarcadores["tren1"][1].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores["tren1"][0].icon.iconUrl = arrayIconos[0];
		           	 		ultimoActualizadoTrenes["tren1"] = -1;
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

    $scope.buscarHistorico = function(){
    	console.log("Llego");
    	console.log($scope.data.seleccion);
    }
}]);