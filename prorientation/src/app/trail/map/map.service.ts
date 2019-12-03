import { Injectable } from '@angular/core';
import 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import 'leaflet-routing-machine';
declare let L;
import { mapbox } from 'lrm-mapbox';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  public testMap;

  constructor() {
  }

  zeros(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
      array.push(dimensions.length == 1 ? 0 : this.zeros(dimensions.slice(1)));
    }

    return array;
  }

  getDistance(routeControl){
    return new Promise( function(resolve,reject){
      routeControl.addEventListener('routesfound', function(e) {
        var routes = e.routes;
        var summary = routes[0].summary;
        var dist = summary.totalDistance;

        if(dist >= 0){
          //console.log("get distance sucess");
          resolve(dist);
        }else{
          //console.log("get distance failed");
          reject("erreur");
        }
      })
    });
  }

  public getRouteControl = (w,x,y,z) => {
    return new Promise( (resolve,reject) => {
      let options = { profile: 'mapbox/walking' };

      var routeControl = L.Routing.control({
        waypoints: [
          L.latLng(w, x),
          L.latLng(y, z)
        ],
        router: new L.Routing.mapbox('pk.eyJ1IjoiYWRlam9uZ2hlIiwiYSI6ImNrMzl3eTFmeDAydTYzY21nZ3RoY3MwdTEifQ.vnvS6h87mJWeRuwjiWglrg', options),
        routeWhileDragging: true

      }).addTo(this.testMap);

      if(routeControl === undefined){
        //console.log("routing failed");
        reject("erreur");
      }else{
        //console.log("routing sucess");
        resolve(routeControl);
      }
    });
  }

  getConnection() {
    return new Promise(async function (resolve, reject) {

      var url = 'http://127.0.0.1:8080/'
      var reqConnection = new XMLHttpRequest();
      var connection_port;

      reqConnection.responseType = "json";
      reqConnection.open('POST',url,true);
      reqConnection.send();

      reqConnection.addEventListener('readystatechange', function () {

        if(reqConnection.readyState == XMLHttpRequest.DONE) {
          reqConnection.onload = function () {
            connection_port = reqConnection.response;
            connection_port = parseInt(connection_port);
          }
        }
      });

      if(connection_port == undefined) {
        reject("erreur, le serveur n'a pas répondu");
      }else {
        resolve(connection_port);
      }

    });
  }

  public getDistanceMatrix = (arrayCoords) => {
    return new Promise(async (resolve,reject) => {

      var i;
      var j;
      var arrayDistances = [];

      for (i = 0; i < arrayCoords.length; i++) {
        for (j = 0; j < arrayCoords.length; j++) {

          var routeControl = await this.getRouteControl(arrayCoords[i][0], arrayCoords[i][1], arrayCoords[j][0], arrayCoords[j][1]);
          await this.getDistance(routeControl).then((res)=>{
            arrayDistances.push(res);
          });
        }
      }
      if(arrayDistances === undefined){
        //console.log("distance matrix failed");
        reject("erreur");
      }else{
        //console.log("distance matrix sucess");
        resolve(arrayDistances);
      }
    });
  }

  public getPathTsp =  (port_connection,distances) => {
    return new Promise (async function (reject, resolve) {
    /* when connection finished, go this step to get path */
      var distancesResponse;
      var target = 6000;

      // var urlDistances = 'http://51.91.111.135:'+port_connection+'/';
      var urlDistances = 'http://127.0.0.1:8080/';
      var formData = new FormData();

      formData.append('dist', distances.toString());
      formData.append('distTarget', target.toString());

      var reqDistances = new XMLHttpRequest();
      reqDistances.responseType = "json";
      reqDistances.open('POST', urlDistances, true);
      reqDistances.send(formData);

      reqDistances.addEventListener('readystatechange', function() {
        if(reqDistances.readyState === XMLHttpRequest.DONE) {
          reqDistances.onload = function () {

            var distancesResponse = reqDistances.response.orders;
            var eliminatedResponse = reqDistances.response.eliminated;

            console.log('distancesResponse : ',distancesResponse)

            var intDistances = []
            var j;
            for(j=0;j < distancesResponse.length ; j++){
              var integer = parseInt(distancesResponse[j], 10);
              intDistances.push(integer)
            }

            var intEliminated = []
            for(j=0;j < eliminatedResponse.length ; j++){
              var integer = parseInt(eliminatedResponse[j], 10);
              intEliminated.push(integer)
            }
            if(intDistances === undefined){
              reject("erreur");
            }else{
              console.log('intDistances : ', intDistances);
              resolve([intDistances,intEliminated]);
              console.log('resolve sucess');
            }
          }
        }
     });
    });
  }

  public tsp = (arrayCoords) => {
    return new Promise(async (resolve,reject) => {

      var distances;

      var matrixD = await this.getDistanceMatrix(arrayCoords).then((res)=>{

        distances = this.zeros([arrayCoords.length, arrayCoords.length]);

        var k;
        var l;
        var index = 0;

        for (k = 0; k < arrayCoords.length; k++) {
          for (l = 0; l < arrayCoords.length; l++) {
            distances[k][l] = res[index];
            index = index +1;
          }
        }
      });

      console.log(distances);

      var distancesResponse;
      var target = 6000;

      var urlDistances = 'http://127.0.0.1:8080/';
      var formData = new FormData();
      formData.append('dist', distances.toString());
      formData.append('distTarget', target.toString());
      var reqDistances = new XMLHttpRequest();
      reqDistances.responseType = "json";
      reqDistances.open('POST', urlDistances, true);
      reqDistances.send(formData);

      reqDistances.addEventListener('readystatechange', function() {
        if(reqDistances.readyState === XMLHttpRequest.DONE) {
          reqDistances.onload = function () {
            var distancesResponse = reqDistances.response.orders;
            var eliminatedResponse = reqDistances.response.eliminated;

            var intDistances = []
            var j;
            for(j=0;j < distancesResponse.length ; j++){
              var integer = parseInt(distancesResponse[j], 10);
              intDistances.push(integer)
            }

            var intEliminated = []
            for(j=0;j < eliminatedResponse.length ; j++){
              var integer = parseInt(eliminatedResponse[j], 10);
              intEliminated.push(integer)
            }

            if(distancesResponse === undefined){
              reject("erreur");
            }else{
              resolve([intDistances,intEliminated]);
            }
          }
        }
      });
    });
  }
}
