import { Component, OnInit } from '@angular/core';
import 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import 'leaflet-routing-machine';
declare let L;
import { mapbox } from 'lrm-mapbox';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})

export class MapPage implements OnInit {

  constructor(private mapService : MapService) {}

  ngOnInit() {

    var object = new Geolocation();

    object.getCurrentPosition().then((resp) => {

      var lat=resp.coords.latitude
      var long=resp.coords.longitude
      var mymap = L.map('mapid').setView([lat, long], 13);
      var testMap = L.map('mapid1').setView([lat, long], 13);
      this.mapService.testMap = testMap;

      mymap.locate({
        watch:true,
      });

      testMap.locate({
        watch:true,
      });

      let watch = object.watchPosition();
      watch.subscribe((data) => {
        var marker = L.marker([lat, long]).addTo(mymap);
      });

      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
   	    maxZoom: 18,
   	    id: 'mapbox.streets',
   	    accessToken: 'pk.eyJ1IjoibHVjYXNib3V2YXJlbCIsImEiOiJjazJycHIwbXQwZGs3M25udmltaGg3eTFlIn0.XGIAxbBH8QGE1ZnmHUztMQ'
      }).addTo(mymap);

      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
   	    maxZoom: 18,
   	    id: 'mapbox.streets',
   	    accessToken: 'pk.eyJ1IjoibHVjYXNib3V2YXJlbCIsImEiOiJjazJycHIwbXQwZGs3M25udmltaGg3eTFlIn0.XGIAxbBH8QGE1ZnmHUztMQ'
      }).addTo(testMap);




      var arrayCoords = this.mapService.zeros([10, 2]);
      arrayCoords[0][0] = lat;
      arrayCoords[0][1] = long;

      /* here create function where we generate point of interest */
      arrayCoords[1][0] = 45.765752;
      arrayCoords[1][1] = 4.841538;
      arrayCoords[2][0] = 45.781612;
      arrayCoords[2][1] = 4.881176;
      arrayCoords[3][0] = 45.780460;
      arrayCoords[3][1] = 4.873430;
      arrayCoords[4][0] = 45.774956;
      arrayCoords[4][1] = 4.877648;
      arrayCoords[5][0] = 45.776370;
      arrayCoords[5][1] = 4.872895;
      arrayCoords[6][0] = 45.780380;
      arrayCoords[6][1] = 4.866248;
      arrayCoords[7][0] = 45.781592;
      arrayCoords[7][1] = 4.886715;
      arrayCoords[8][0] = 45.778572;
      arrayCoords[8][1] = 4.879840;
      arrayCoords[9][0] = 45.763525;
      arrayCoords[9][1] = 4.844971;



      /* calculare tsp path and connect to the python server */

      this.mapService.tsp(arrayCoords).then((res)=>{
        console.log("res");
        console.log(res);

        var order = res[0];

        console.log(order);
        var eliminatedNodes = res[1];
        console.log(eliminatedNodes);


        let options = { profile: 'mapbox/walking' };

        var pointsWay = [];

        var coordConservedNodes = this.mapService.zeros([order.length,2]);

        var i;
        var j;
        var indexNodes = -1;
        for(i=0; i < arrayCoords.length ;i++){
          var bool = 0;
          for(j=0; j < eliminatedNodes.length ;j++){
            if(i == eliminatedNodes[j]){
              bool = 1;
            }
          }
          if(bool == 0){
            indexNodes = indexNodes + 1;
            coordConservedNodes[indexNodes][0] = arrayCoords[i][0]
            coordConservedNodes[indexNodes][1] = arrayCoords[i][1]
          }
        }

        console.log(coordConservedNodes);

        for(i=0; i < coordConservedNodes.length ;i++){
          for(j=0; j < coordConservedNodes.length ;j++){
            if(j == order[i]){
              pointsWay.push(L.latLng(coordConservedNodes[j][0], coordConservedNodes[j][1]))
            }
          }
        }


        console.log(pointsWay)

        var routeControl = L.Routing.control({
          waypoints: pointsWay,

          router: new L.Routing.mapbox('pk.eyJ1IjoiYWRlam9uZ2hlIiwiYSI6ImNrMzl3eTFmeDAydTYzY21nZ3RoY3MwdTEifQ.vnvS6h87mJWeRuwjiWglrg', options),

          routeWhileDragging: true
        }).addTo(mymap);
      });

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

}
