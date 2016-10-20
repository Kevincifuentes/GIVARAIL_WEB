var app = angular.module("giv2railapp", ['leaflet-directive',
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

	window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        modalHistoricoAbierto = false;
    }
}
}

app.controller("giv2railController", [ '$scope', 'leafletData', '$window', function($scope, $window, leafletData) {
	$scope.date1 = new Date();
    $scope.date2 = new Date();
	$scope.marcadoresHistorico = new Array();
	$scope.patron = new RegExp('')
	establecerEventos();
	 $scope.data = {
	    opcionesBusqueda: [
	      "ID tren",
	      "Fecha"
	    ],
	    seleccion: "ID tren",
	    inputBusqueda: "",
	    desde: "",
	    hasta: ""
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
	           	 if(numeroMarcadoresAhora[contenido.idtren] != numeroMaximoAMostrar)
	           	 {
	           	 	ultimoActualizadoTrenes[contenido.idtren] = -1;
	           	 	marcador = {
	           	 		group: contenido.idtren,
		                lat: contenido.latitud,
		                lng: contenido.longitud,
		                focus: true,
                        title: "Tren",
                        draggable: true,
                        label: {
                            message: "El tren está aquí" + numeroMarcadoresAhora[contenido.idtren] +" "+ new Date().toUTCString(),
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
		            todosMarcadores[contenido.idtren].push(marcador);
		            $scope.markers.push(marcador);
		            $scope.$apply();
		            numeroMarcadoresAhora[contenido.idtren]++;
	           	 }
	           	 else
	           	 {
	           	 	todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].lat = contenido.latitud;
	           	 	todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].lng = contenido.longitud;
	           	 	todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].icon.iconUrl = arrayIconos[4];
	           	 	todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].label.message = "El tren está aquí "+ new Date().toUTCString();
	           	 	switch(ultimoActualizadoTrenes[contenido.idtren]+1) {
					    case 0:
					        todosMarcadores[contenido.idtren][4].icon.iconUrl = arrayIconos[3];
		           	 		todosMarcadores[contenido.idtren][3].icon.iconUrl = arrayIconos[2];
		           	 		todosMarcadores[contenido.idtren][2].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores[contenido.idtren][1].icon.iconUrl = arrayIconos[0];
		           	 		ultimoActualizadoTrenes[contenido.idtren]++;
					        break;
					    case 1:
					    	todosMarcadores[contenido.idtren][4].icon.iconUrl = arrayIconos[2];
		           	 		todosMarcadores[contenido.idtren][3].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores[contenido.idtren][2].icon.iconUrl = arrayIconos[0];
		           	 		todosMarcadores[contenido.idtren][0].icon.iconUrl = arrayIconos[3];
					        ultimoActualizadoTrenes[contenido.idtren]++;
					        break;
					    case 2:
					    	todosMarcadores[contenido.idtren][4].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores[contenido.idtren][3].icon.iconUrl = arrayIconos[0];
		           	 		todosMarcadores[contenido.idtren][1].icon.iconUrl = arrayIconos[3];
		           	 		todosMarcadores[contenido.idtren][0].icon.iconUrl = arrayIconos[2];
					        ultimoActualizadoTrenes[contenido.idtren]++;
					        break;
					    case 3:
					        todosMarcadores[contenido.idtren][2].icon.iconUrl = arrayIconos[3];
		           	 		todosMarcadores[contenido.idtren][1].icon.iconUrl = arrayIconos[2];
		           	 		todosMarcadores[contenido.idtren][0].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores[contenido.idtren][4].icon.iconUrl = arrayIconos[0];
		           	 		ultimoActualizadoTrenes[contenido.idtren]++;
					        break;
					    case 4:
					    	todosMarcadores[contenido.idtren][3].icon.iconUrl = arrayIconos[3];
		           	 		todosMarcadores[contenido.idtren][2].icon.iconUrl = arrayIconos[2];
		           	 		todosMarcadores[contenido.idtren][1].icon.iconUrl = arrayIconos[1];
		           	 		todosMarcadores[contenido.idtren][0].icon.iconUrl = arrayIconos[0];
		           	 		ultimoActualizadoTrenes[contenido.idtren] = -1;
					}
	           	 }
	           	 if(primeraVez === true)
	           	 {
	           	 	primeraVez = false;
	           	 	$scope.center.lat = contenido.latitud;
		         	$scope.center.lng = contenido.longitud;
	           	 }
	           	 $scope.$apply();
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

    $scope.comprobarBusqueda = function(){

    	if($scope.data.seleccion == "Fecha")
    	{
    		return new RegExp(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    	}
    	else
    	{
    		return new RegExp('');
    	}

    }

    $scope.buscarHistorico = function(){
    	if($scope.data.seleccion === "ID tren")
    	{
    		$scope.markers = new Array();
    		var id = $scope.data.inputBusqueda;
    		$.ajax({
                    type: "POST",
                    url: "idtren",
                    contentType: "application/json",
                    dataType:'json',
                    data: JSON.stringify({ "idtren" : id}),
                    success: function(data){
                    	console.log(data.noHay);
                    	if(data.noHay == true)
                    	{
                    		alert("No hay posiciones para dicho ID");
                    	}
                    	else
                    	{
	                    	$.each(data, function(i, item) {
	                          console.log(data[i].latitud);
	                          	marcador = {
	                          		group: "queryIDTren",
					                lat: data[i].latitud,
					                lng: data[i].longitud,
					                focus: true,
			                        title: "Tren",
			                        draggable: true,
			                        label: {
			                            message: "El tren está aquí " + new Date().toUTCString(),
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
				            $scope.marcadoresHistorico.push(marcador);
				            $scope.markers.push(marcador);
				            if(i+1 == data.length)
				            {
				            	$scope.center.lat = data[i].latitud;
		         				$scope.center.lng = data[i].longitud;
		         				$scope.center.zoom = 15;
				            }
				            $scope.$apply();
							});
                    	}

                    },
                    beforeSend:function()
                    {
                        
                    },
                    error: function(xhr, status, error) {
                        console.log("Ha ocurrido un error al obtener el tren.");
                        var err = eval("(" + xhr.responseText + ")");
                        alert(error.Message);
                    },
                    async: true
			});
    	}
    	else
    	{
    		//console.log(str($scope.date1));
    		var desde, hasta;
    		desde = $scope.date1;
    		hasta = $scope.date2;
    		if($scope.date1 instanceof Date)
    		{
    			desde = desde.format("yyyy-mm-dd HH:MM:ss");
    			console.log(desde);
    		}
    		if($scope.date2 instanceof Date)
    		{
    			hasta = hasta.format("yyyy-mm-dd HH:MM:ss");
    			console.log(hasta);
    		}

			$.ajax({
                type: "POST",
                url: "trenesFecha",
                contentType: "application/json",
                dataType:'json',
                data: JSON.stringify({ "desde" : desde, "hasta" : hasta}),
                success: function(data){
                    if(data.noHay == true)
                	{
                		alert("No hay posiciones entre esas fechas.");
                	}
                	else
                	{
                    	$.each(data, function(i, item) {
                          console.log(data[i].latitud);
                          	marcador = {
                          		group: "queryFecha",
				                lat: data[i].latitud,
				                lng: data[i].longitud,
				                focus: true,
		                        title: "Tren",
		                        draggable: true,
		                        label: {
		                            message: "El tren está aquí " + new Date().toUTCString(),
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
			            $scope.marcadoresHistorico.push(marcador);
			            $scope.markers.push(marcador);
			            if(i+1 == data.length)
			            {
			            	$scope.center.lat = data[i].latitud;
	         				$scope.center.lng = data[i].longitud;
	         				$scope.center.zoom = 15;
			            }
			            $scope.$apply();
						});
                	}

                },
                beforeSend:function()
                {

                },
                error: function(xhr, status, error) {
                    console.log("Ha ocurrido un error al obtener los trenes en esa fecha.");
                    var err = eval("(" + xhr.responseText + ")");
                    alert(error.Message);
                },
                async: true
			});
    	}
    }
}]).directive('timepicker', [

  function() {
    var link;
    link = function(scope, element, attr, ngModel) {
        //console.log(ngModel);
        element = $(element);
        element.datetimepicker({
        	ignoreReadonly : true,
        	showTodayButton : true,
        	sideBySide: true,
        	locale: 'es',
            format: 'YYYY-MM-DD HH:mm:ss',
          	defaultDate: scope.date,
      	});
        element.on('dp.change', function(event) {
            scope.$apply(function() {
                ngModel.$setViewValue(event.date._d);
            });
        });
    };

    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
      	date: '=ngModel'
      },
      link: link
    };
  }
]);