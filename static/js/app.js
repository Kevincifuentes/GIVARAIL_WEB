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
var client;
var conectadoStomp = false;
var suscripcion;
var fuentePosiciones;

function establecerEventos(){
		// Coge el modal
	var modal = document.getElementById('historicoModal');
  var modalLogin = document.getElementById('divLogin');
  modalLogin.style.display = "block";

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

function prepararSuscripcion($scope)
{
  $scope.markers = new Array();
  var onMessage = function (msg) {
    console.log(msg);
         var contenido = JSON.parse(msg.data);
         // HABRÍA QUE OBTENER EL ID DE CADA TREN Y MIRAR SI YA HAY MARCADORES Y SI NO AÑADIR
         if(numeroMarcadoresAhora[contenido.idtren] == undefined ||numeroMarcadoresAhora[contenido.idtren] != numeroMaximoAMostrar)
         {
          if($scope.lineas[contenido.idtren] == undefined){
            console.log("undefined lineas");
            $scope.lineas[contenido.idtren] = {
              type: "polyline",
              latlngs: []
            }
          }
          $scope.lineas[contenido.idtren].latlngs.push({ lat: contenido.latitud, lng: contenido.longitud });

          ultimoActualizadoTrenes[contenido.idtren] = -1;
          marcador = {
            group: contenido.idtren,
                lat: contenido.latitud,
                lng: contenido.longitud,
                focus: false,
                title: "Tren",
                draggable: true,
                message: "El tren está aquí" + numeroMarcadoresAhora[contenido.idtren] +" "+ new Date().toUTCString(),
                icon: {
                  iconUrl: arrayIconos[4],
                    iconSize:     [38, 38], // tamano del icono
                    iconAnchor:   [15, 38], // punto del icono que correponde a la localizacion del marcador
                  popupAnchor:  [2, -38] 
                }
            };
            if(todosMarcadores[contenido.idtren] == undefined){
              todosMarcadores[contenido.idtren] = new Array();
            }
            todosMarcadores[contenido.idtren].push(marcador);
            $scope.markers.push(marcador);
            $scope.$apply();
            if(numeroMarcadoresAhora[contenido.idtren] == undefined)
            {
              numeroMarcadoresAhora[contenido.idtren] =0;
            }
            numeroMarcadoresAhora[contenido.idtren]++;
         }
         else
         {
            $scope.lineas[contenido.idtren].latlngs.push({ lat: contenido.latitud, lng: contenido.longitud });
            todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].group = "actual";
            todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].lat = contenido.latitud;
            todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].lng = contenido.longitud;
            todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].focus = true;
            todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].icon = {
                    iconUrl: arrayIconos[4],
                      iconSize:     [38, 38], // tamano del icono
                      iconAnchor:   [15, 38], // punto del icono que correponde a la localizacion del marcador
                      popupAnchor:  [2, -38] 
              };
            todosMarcadores[contenido.idtren][ultimoActualizadoTrenes[contenido.idtren]+1].message = "El tren está aquí "+ new Date().toUTCString();
            if(primeraVez === true)
            {
              primeraVez = false;
              $scope.center.lat = contenido.latitud;
              $scope.center.lng = contenido.longitud;
            }
            switch(ultimoActualizadoTrenes[contenido.idtren]+1) {
            case 0:
                todosMarcadores[contenido.idtren][4].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][3].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][2].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][1].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][4].focus = false;
                  todosMarcadores[contenido.idtren][3].focus = false;
                  todosMarcadores[contenido.idtren][2].focus = false;
                  todosMarcadores[contenido.idtren][1].focus = false;
                  ultimoActualizadoTrenes[contenido.idtren]++;
                break;
            case 1:
              todosMarcadores[contenido.idtren][4].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][3].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][2].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][0].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][4].focus = false;
                  todosMarcadores[contenido.idtren][3].focus = false;
                  todosMarcadores[contenido.idtren][2].focus = false;
                  todosMarcadores[contenido.idtren][0].focus = false;
                ultimoActualizadoTrenes[contenido.idtren]++;
                break;
            case 2:
              todosMarcadores[contenido.idtren][4].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][3].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][1].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][0].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][4].focus = false;
                  todosMarcadores[contenido.idtren][3].focus = false;
                  todosMarcadores[contenido.idtren][1].focus = false;
                  todosMarcadores[contenido.idtren][0].focus = false;
                ultimoActualizadoTrenes[contenido.idtren]++;
                break;
            case 3:
                todosMarcadores[contenido.idtren][2].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][1].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][0].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][4].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][2].focus = false;
                  todosMarcadores[contenido.idtren][1].focus = false;
                  todosMarcadores[contenido.idtren][0].focus = false;
                  todosMarcadores[contenido.idtren][4].focus = false;
                  ultimoActualizadoTrenes[contenido.idtren]++;
                break;
            case 4:
              todosMarcadores[contenido.idtren][3].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][2].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][1].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][0].icon = $scope.icons.black;
                  todosMarcadores[contenido.idtren][3].focus = false;
                  todosMarcadores[contenido.idtren][2].focus = false;
                  todosMarcadores[contenido.idtren][1].focus = false;
                  todosMarcadores[contenido.idtren][0].focus = false;
                  ultimoActualizadoTrenes[contenido.idtren] = -1;
            }
            $scope.$apply();
        }
    }
  fuentePosiciones = new EventSource('/registrar');
  fuentePosiciones.addEventListener('message', onMessage, false);
  suscrito = true;
}


app.controller("giv2railController", [ '$scope', 'leafletData', '$window', function($scope, $window, leafletData) {
	$scope.token = "";
  $.ajaxSetup({
      beforeSend: function(xhr) {
          xhr.setRequestHeader('x-access-token', $scope.token);
      }
  });
  $scope.csv = true;
  $scope.loading = false;
  $scope.usuariologin = "";
  $scope.passwordlogin = "";
  $scope.errorLogin = "";
  $scope.icons = {
                blue: {
                    type: 'div',
                    iconSize: [10, 10],
                    className: 'blue',
                    iconAnchor:  [5, 5]
                },
                red: {
                    type: 'div',
                    iconSize: [10, 10],
                    className: 'red',
                    iconAnchor:  [5, 5]
                },
                black: {
                    type: 'div',
                    iconSize: [10, 10],
                    className: 'black',
                    iconAnchor:  [5, 5]
                }
            }
    $scope.lineas = {
	   
	}
	$scope.date1 = new Date();
    $scope.date2 = new Date();
	$scope.marcadoresHistorico = new Array();
	$scope.patron = new RegExp('');
	
	establecerEventos();
	 $scope.data = {
	    opcionesBusqueda: [
	      "ID tren",
	      "Fecha", 
        "ID tren y Fecha"
	    ],
	    seleccion: "ID tren",
	    inputBusqueda: "",
	    desde: "",
	    hasta: ""
    };
	$scope.markers = new Array();
	marcador = {
	                lat: 43.270537,
	                lng: -2.939933,
	                focus: false,
                    title: "Tren",
                    draggable: true,
                    message: "El tren está aquí",
                    icon: $scope.icons.black
	            };
	numeroMarcadoresAhora["tren1"] = 1;
	ultimoActualizadoTrenes["tren1"] = -1;
	todosMarcadores["tren1"] = new Array();
	todosMarcadores["tren1"].push(marcador);
	$scope.markers.push(marcador);
  prepararSuscripcion($scope);

    angular.extend($scope, $scope.markers,{
    	center: {
            lat: 43.270537,
            lng: -2.939933,
            zoom: 15
        },
        defaults: {
        	zoomControlPosition: "bottomleft",
            scrollWheelZoom: true
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
    $scope.activarTiempoReal = function(){
    	$scope.markers = new Array();
    	if(suscrito == false)
    	{
    		prepararSuscripcion($scope);
    		primeraVez = true;
    		numeroMarcadoresAhora = [];
    	}
    	else{
    		alert("Ya está funcionando el modo tiempo real");
    	}
    }

    $scope.descargarCSV = function(){
      $scope.buscarHistoricoCSV();
    }

    $scope.buscarHistorico = function(){
    	fuentePosiciones.close();
    	suscrito = false;
      $scope.loading = true;
    	if($scope.data.seleccion === "ID tren")
    	{
    		$scope.markers = new Array();
    		$scope.lineas = {};
    		var id = $scope.data.inputBusqueda;
    		$.ajax({
                    type: "GET",
                    url: "idtren",
                    contentType: "application/json",
                    dataType:'json',
                    data: JSON.stringify({ "idtren" : id}),
                    success: function(data){
                    	//console.log(data.noHay);
                    	if(data.noHay == true)
                    	{
                        $scope.loading = false;
                        $scope.$apply();
                    		alert("No hay posiciones para dicho ID");
                    	}
                    	else
                    	{
	                    	$.each(data, function(i, item) {
	                          //console.log(data[i].latitud);
	                          	marcador = {
	                          	group: "queryIDTren",
      				                lat: data[i].latitud,
      				                lng: data[i].longitud,
      				                focus: true,
			                        title: "Tren",
			                        draggable: true,
			                        message: "El tren está aquí " + item.momento+ "",
			                        icon: {
			                        	iconUrl: arrayIconos[4],
					                    iconSize:     [38, 38], // tamano del icono
					                    iconAnchor:   [15, 38], // punto del icono que correponde a la localizacion del marcador
					                    popupAnchor:  [2, -38] // punto relativo a donde el popup debería abrirse
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
        							   });
                         $scope.loading = false;
                         $scope.$apply();
                         
                    	}
                    },
                    error: function(xhr, status, error) {
                        if (xhr.status == 403) {
                          alert("La autorización enviada es erronea. Conectese de nuevo al sistema.");
                          $scope.loading = false;
                          $scope.$apply();
                          var modalLogin = document.getElementById('divLogin');
                          modalLogin.style.display = "block";
                        }else if(xhr.status == 401){
                          alert("No se ha autentificado en el sistema. Debe conectarse primero.");
                          $scope.loading = false;
                          $scope.$apply();
                          var modal = document.getElementById('historicoModal');
                          modal.style.display = "none";
                          var modalLogin = document.getElementById('divLogin');
                          modalLogin.style.display = "block";
                        }else{
                          alert("Ha ocurrido un error al obtener los trenes, pruebe de nuevo más tarde o contacte con el administrador.");
                          $scope.loading = false;
                          $scope.$apply();
                        }
                    },
                    async: true
			});
    	}
    	else
    	{
        if($scope.data.seleccion === "ID tren y Fecha"){
            //console.log(str($scope.date1));
          var desde, hasta;
          var id = $scope.data.inputBusqueda;
          desde = $scope.date1;
          hasta = $scope.date2;
          if($scope.date1 instanceof Date)
          {
            desde = desde.format("yyyy-mm-dd HH:MM:ss");
            //console.log(desde);
          }
          if($scope.date2 instanceof Date)
          {
            hasta = hasta.format("yyyy-mm-dd HH:MM:ss");
            //console.log(hasta);
          }
          $scope.markers = new Array();
          $scope.lineas = {};
          console.log(id+" "+desde+" "+hasta);
          $.ajax({
                  type: "GET",
                  url: "trenesIDFecha",
                  contentType: "application/json",
                  dataType:'json',
                  data: JSON.stringify({"id": id, "desde" : desde, "hasta" : hasta}),
                  success: function(data){
                      if(data.noHay == true)
                    {
                      $scope.loading = false;
                      $scope.$apply();
                      alert("No hay posiciones entre esas fechas para ese ID de tren.");
                    }
                    else
                    {

                        $.each(data, function(i, item) {
                            //console.log(data[i].latitud);
                            if($scope.lineas[item.idtrenasoc] == undefined){
                              console.log("undefined lineas");
                              $scope.lineas[item.idtrenasoc] = {
                                type: "polyline",
                                latlngs: []
                              }
                            }
                            $scope.lineas[item.idtrenasoc].latlngs.push({ lat: item.latitud, lng: item.longitud });
                            marcador = {
                                lat: data[i].latitud,
                                lng: data[i].longitud,
                                focus: true,
                                title: "Tren",
                                draggable: true,
                                message: "El tren está aquí " + item.momento,
                                icon: $scope.icons.black
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
                        $scope.loading = false;
                        
                        
                    }

                  },
                  error: function(xhr, status, error) {
                      alert("Ha ocurrido un error al realizar la búsqueda. Pruebe de nuevo más tarde");
                      console.log("Ha ocurrido un error al obtener los trenes en esa fecha.");
                      var err = eval("(" + xhr.responseText + ")");
                      $scope.loading = false;
                      $scope.$apply();
                  },
                  async: true
             });

        }
        else{
            //console.log(str($scope.date1));
          var desde, hasta;
          desde = $scope.date1;
          hasta = $scope.date2;
          if($scope.date1 instanceof Date)
          {
            desde = desde.format("yyyy-mm-dd HH:MM:ss");
            //console.log(desde);
          }
          if($scope.date2 instanceof Date)
          {
            hasta = hasta.format("yyyy-mm-dd HH:MM:ss");
            //console.log(hasta);
          }
          $scope.markers = new Array();
          $scope.lineas = {};
          $.ajax({
                  type: "GET",
                  url: "trenesFecha",
                  contentType: "application/json",
                  dataType:'json',
                  data: JSON.stringify({ "desde" : desde, "hasta" : hasta}),
                  success: function(data){
                      if(data.noHay == true)
                    {
                      $scope.loading = false;
                      $scope.$apply();
                      alert("No hay posiciones entre esas fechas.");
                      
                    }
                    else
                    {
                        $.each(data, function(i, item) {
                            //console.log(data[i].latitud);
                              marcador = {
                                group: "queryFecha",
                          lat: data[i].latitud,
                          lng: data[i].longitud,
                          focus: true,
                              title: "Tren",
                              draggable: true,
                              message: "El tren está aquí " + item.momento,
                              icon: {
                                iconUrl: arrayIconos[4],
                              iconSize:     [38, 38], // tamano del icono
                              iconAnchor:   [15, 38], // punto del icono que correponde a la localizacion del marcador
                              popupAnchor:  [2, -38] // punto relativo a donde el popup debería abrirse
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
                    });
                        $scope.loading = false;
                        $scope.$apply();
                        
                    }

                  },
                  error: function(xhr, status, error) {
                      alert("Ha ocurrido un error al realizar la búsqueda. Pruebe de nuevo más tarde");
                      console.log("Ha ocurrido un error al obtener los trenes en esa fecha.");
                      var err = eval("(" + xhr.responseText + ")");
                      $scope.loading = false;
                      $scope.$apply();
                  },
                  async: true
             });
        }
    		
    	}
    }

    $scope.logearse = function(){
      var modalLogin = document.getElementById('divLogin');
      var modalCargando = document.getElementById('barraCargando');
      modalCargando.style.display = "block";
      $.ajax({
                  type: "POST",
                  url: "login",
                  contentType: "application/json",
                  dataType:'json',
                  data: JSON.stringify({"usuario": $scope.usuariologin, "password" : $scope.passwordlogin}),
                  success: function(data){
                    modalCargando.style.display = "none";
                    modalLogin.style.display = "none";
                    $scope.errorLogin = "none";
                    $scope.token = data.token;
                    $.ajaxSetup({
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader('x-access-token', data.token);
                        }
                    });
                    $scope.$apply();
                    prepararSuscripcion($scope);
                  },
                  error: function(xhr, status, error) {
                      //alert("Ha ocurrido un error al realizar la búsqueda. Pruebe de nuevo más tarde");
                      if (xhr.status == 404) {
                        modalCargando.style.display = "none";
                        document.getElementById('formLogin').style.height = "300px";
                        console.log("No existe");
                        $scope.errorLogin = "todo";
                        $scope.$apply();
                      }
                      else if (xhr.status == 403){
                        document.getElementById('formLogin').style.height = "300px";
                        modalCargando.style.display = "none";
                        $scope.errorLogin = "password";
                        $scope.$apply();
                      }
                      else{
                        console.log(error);
                        var err = eval("(" + xhr.responseText + ")");
                        modalCargando.style.display = "none";
                        document.getElementById('formLogin').style.height = "300px";
                        $scope.errorLogin = "login";
                        $scope.$apply();
                      }
                  },
                  async: true
             });
    }

    $scope.buscarHistoricoCSV = function(){
      fuentePosiciones.close();
      suscrito = false;
      $scope.loading = true;
      if($scope.data.seleccion === "ID tren")
      {
        var id = $scope.data.inputBusqueda;
        $.ajax({
            url: 'idtrenCSV',
            method: "GET",
            data: JSON.stringify({ "idtren" : id}),
            processData: false,
            responseType:'arraybuffer',
            success: function(data){
              var blob = new Blob([data], {type: "text/csv"});
              nombreDocumento = id+"_"+new Date().toUTCString();
              nombreDocumento = nombreDocumento.replace(/\s+/g, '');
              saveAs(blob, nombreDocumento + '.csv');
              $scope.loading = false;
              $scope.$apply();
            },
            error: function(xhr, status, error) {
                      //alert("Ha ocurrido un error al realizar la búsqueda. Pruebe de nuevo más tarde");
              if (xhr.status == 403) {
                alert("La autorización enviada es erronea. Conectese de nuevo al sistema.");
                $scope.loading = false;
                $scope.$apply();
                var modalLogin = document.getElementById('divLogin');
                modalLogin.style.display = "block";
              }else if(xhr.status == 401){
                alert("No se ha autentificado en el sistema. Debe conectarse primero.");
                $scope.loading = false;
                $scope.$apply();
                var modal = document.getElementById('historicoModal');
                modal.style.display = "none";
                var modalLogin = document.getElementById('divLogin');
                modalLogin.style.display = "block";
              }else{
                console.log(error);
                alert("Ha ocurrido un error al obtener los trenes, pruebe de nuevo más tarde o contacte con el administrador.");
                $scope.loading = false;
                $scope.$apply();
              }
            },
            async : true
        });
        /*$.fileDownload("idtrenCSV", {
          successCallback: function (url) {
            $scope.loading = false;
            $scope.$apply();
          },
          failCallback: function (responseHtml, url) {
            $scope.loading = false;
            $scope.$apply();
          },
          preparingMessageHtml: "Estamos preparando el fichero. Por favor, espere...",
          failMessageHtml: "Ocurrió un problema al intentar descargar el fichero. Pruebe de nuevo más tarde.",
          httpMethod: "GET",
          data: JSON.stringify({ "idtren" : id})
        });*/
      }
      else
      {
        if($scope.data.seleccion === "ID tren y Fecha"){
            //console.log(str($scope.date1));
          var desde, hasta;
          var id = $scope.data.inputBusqueda;
          desde = $scope.date1;
          hasta = $scope.date2;
          if($scope.date1 instanceof Date)
          {
            desde = desde.format("yyyy-mm-dd HH:MM:ss");
            //console.log(desde);
          }
          if($scope.date2 instanceof Date)
          {
            hasta = hasta.format("yyyy-mm-dd HH:MM:ss");
            //console.log(hasta);
          }
          console.log(id+" "+desde+" "+hasta);
          $.ajax({
            url: 'trenesIDFechaCSV',
            method: "GET",
            data: JSON.stringify({"id": id, "desde" : desde, "hasta" : hasta}),
            processData: false,
            responseType:'arraybuffer',
            success: function(data){
              var blob = new Blob([data], {type: "text/csv"});
              nombreDocumento = id+"_from_"+desde+"_desde_"+hasta;
              nombreDocumento = nombreDocumento.replace(/\s+/g, '');
              saveAs(blob, nombreDocumento + '.csv');
              $scope.loading = false;
              $scope.$apply();
            },
            error: function(xhr, status, error) {
                      //alert("Ha ocurrido un error al realizar la búsqueda. Pruebe de nuevo más tarde");
              if (xhr.status == 403) {
                alert("La autorización enviada es erronea. Conectese de nuevo al sistema.");
                $scope.loading = false;
                $scope.$apply();
                var modalLogin = document.getElementById('divLogin');
                modalLogin.style.display = "block";
              }else if(xhr.status == 401){
                alert("No se ha autentificado en el sistema. Debe conectarse primero.");
                $scope.loading = false;
                $scope.$apply();
                var modal = document.getElementById('historicoModal');
                modal.style.display = "none";
                var modalLogin = document.getElementById('divLogin');
                modalLogin.style.display = "block";
              }else{
                alert("Ha ocurrido un error al obtener los trenes, pruebe de nuevo más tarde o contacte con el administrador.");
                $scope.loading = false;
                $scope.$apply();
              }
            },
            async : true
        });
          /*$.fileDownload("trenesIDFechaCSV", {
            successCallback: function (url) {
              $scope.loading = false;
              $scope.$apply();
            },
            failCallback: function (responseHtml, url) {
              $scope.loading = false;
              $scope.$apply();
            },
            preparingMessageHtml: "Estamos preparando el fichero. Por favor, espere...",
            failMessageHtml: "Ocurrió un problema al intentar descargar el fichero. ¿Está conectado? Pruebe de nuevo más tarde.",
            httpMethod: "GET",
            data: JSON.stringify({"id": id, "desde" : desde, "hasta" : hasta})
          });*/


        }
        else{
            //console.log(str($scope.date1));
          var desde, hasta;
          desde = $scope.date1;
          hasta = $scope.date2;
          if($scope.date1 instanceof Date)
          {
            desde = desde.format("yyyy-mm-dd HH:MM:ss");
            //console.log(desde);
          }
          if($scope.date2 instanceof Date)
          {
            hasta = hasta.format("yyyy-mm-dd HH:MM:ss");
            //console.log(hasta);
          }

          $.ajax({
            url: 'trenesFechaCSV',
            method: "GET",
            data: JSON.stringify({ "desde" : desde, "hasta" : hasta}),
            processData: false,
            responseType:'arraybuffer',
            success: function(data){
              var blob = new Blob([data], {type: "text/csv"});
              nombreDocumento = "from_"+desde+"_desde_"+hasta;
              nombreDocumento = nombreDocumento.replace(/\s+/g, '');
              saveAs(blob, nombreDocumento + '.csv');
              $scope.loading = false;
              $scope.$apply();
            },
            error: function(xhr, status, error) {
                      //alert("Ha ocurrido un error al realizar la búsqueda. Pruebe de nuevo más tarde");
              if (xhr.status == 403) {
                alert("La autorización enviada es erronea. Conectese de nuevo al sistema.");
                $scope.loading = false;
                $scope.$apply();
                var modalLogin = document.getElementById('divLogin');
                modalLogin.style.display = "block";
              }else if(xhr.status == 401){
                alert("No se ha autentificado en el sistema. Debe conectarse primero.");
                $scope.loading = false;
                $scope.$apply();
                var modal = document.getElementById('historicoModal');
                modal.style.display = "none";
                var modalLogin = document.getElementById('divLogin');
                modalLogin.style.display = "block";
              }else{
                alert("Ha ocurrido un error al obtener los trenes, pruebe de nuevo más tarde o contacte con el administrador.");
                $scope.loading = false;
                $scope.$apply();
              }
            },
            async : true
            });
          /*$.fileDownload("trenesFechaCSV", {
            successCallback: function (url) {
              $scope.loading = false;
              $scope.$apply();
            },
            failCallback: function (responseHtml, url) {
              $scope.loading = false;
              $scope.$apply();
            },
            preparingMessageHtml: "Estamos preparando el fichero. Por favor, espere...",
            failMessageHtml: "Ocurrió un problema al intentar descargar el fichero. Pruebe de nuevo más tarde.",
            httpMethod: "GET",
            data: JSON.stringify({ "desde" : desde, "hasta" : hasta})
          });*/
        }
        
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
])
.directive('loading', function () {
      return {
        restrict: 'E',
        replace:true,
        template: '<label>Cargando... <img height="80" width="80" src="img/loading.gif"/></label>',
        link: function (scope, element, attr) {
              scope.$watch('loading', function (val) {
                  if (val)
                      $(element).show();
                  else
                      $(element).hide();
              });
        }
      }
  });