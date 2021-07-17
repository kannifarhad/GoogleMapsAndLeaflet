MapHelper = (function ($) {
   'use strict';
   var settings = {
      center: [0, 0],
      zoom: null,
   };

   var mapId = '';
   var map = null;
   var baseMaps = {};
   var routingControl = null;
   var showAreas = false;
   var showIcons = true;
   var isMobile = document.body.clientWidth < 700;
   var mapType = false;
   var measeuresOptions = {
      position: 'topleft',
      unit: 'metres',
      clearMeasurementsOnStop: true,
      showBearings: false,
      bearingTextIn: 'In',
      tooltipTextFinish: 'Xətti bitirmək üçün iki dəfə klik edin<br>',
      tooltipTextDelete: 'Nöqtəni <b>silmək</b> üçün SHIFT-düyməsini basıb nöqtəyə klik edin',
      tooltipTextMove: 'Nöqtənin <b>yerini dəyişmək</b> üçün üstünə klik edib çəkin<br>',
      tooltipTextResume: '<br>Məsafəni ölçməyi <b>davam etmək</b> üçün CTRL-basıb nöqtəyə klik edin',
      tooltipTextAdd: 'Nöqtə əlavə etmək üçün CTRL-basıb klik edin',
      measureControlTitleOn: 'Məsafə ölçmək funksiyasını yandır',
      measureControlTitleOff: 'Məsafə ölçmək funksiyasını söndür',
      measureControlLabel: '<span class="icon-route leafletroute"></span>',
      clearControlLabel: '<span class="icon-close"></span>',
      measureControlClasses: [],
      showClearControl: true,
      clearControlTitle: 'Ölçüləri sil',
      clearControlClasses: [],
      showUnitControl: false,
      distanceShowSameUnit: false,
      unitControlTitle: {
         text: 'Ölçüləri dəyiş',
         metres: 'metres',
         landmiles: 'land miles',
         nauticalmiles: 'nautical miles'
      },
      unitControlLabel: {
         metres: 'm',
         kilometres: 'km',
         feet: 'ft',
         landmiles: 'mi',
         nauticalmiles: 'nm'
      },
      tempLine: {
         color: '#00f',
         weight: 2
      },
      fixedLine: {
         color: '#006',
         weight: 2
      },
      startCircle: {
         color: '#000',
         weight: 1,
         fillColor: '#0f0',
         fillOpacity: 1,
         radius: 5
      },
      intermedCircle: {
         color: '#000',
         weight: 1,
         fillColor: '#ff0',
         fillOpacity: 1,
         radius: 3
      },
      currentCircle: {
         color: '#000',
         weight: 1,
         fillColor: '#f0f',
         fillOpacity: 1,
         radius: 3
      },
      endCircle: {
         color: '#000',
         weight: 1,
         fillColor: '#f00',
         fillOpacity: 1,
         radius: 5
      },
   };

   var init = function (mapLayerId, options) {
      settings = $.extend(settings, options);
      mapId = mapLayerId;
      initMap();
   };

   var getMap = function () {
      return map;
   };

   var addRoutingControl = function (waypoints) {
      if (routingControl != null)
         removeRoutingControl();
      routingControl = L.Routing.control({
         waypoints: waypoints
      }).addTo(map);
   };

   var removeRoutingControl = function () {
      if (routingControl != null) {
         map.removeControl(routingControl);
         routingControl = null;
      }
   };

   var panMap = function (lat, lng) {
      map.panTo(new L.LatLng(lat, lng));
   }

   var initMap = function () {
      var $this = this;
      map = L.map(mapId, {
         center: settings.center,
         zoom: settings.zoom,
         crs: L.CRS.EPSG3857,
         attributionControl: true,
         contextmenu: true,
         contextmenuWidth: 140
      });

      baseMaps["OSM"] = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
         subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
         renderer: L.canvas(),
         attribution: '&copy; <a href="https://kanni.pro/" target="_blank">Kanni.Pro</a>'
      }).addTo(map);

      L.control.polylineMeasure(measeuresOptions).addTo(map);

      L.easyButton(`icon-journey `, function (btn, map) {
         if (routingControl != null) {
            btn.button.className = btn.button.className.replace("mapButtonActive", "");
            removeRoutingControl();
         } else {
            btn.button.className = btn.button.className = 'mapButtonActive';
            addRoutingControl([L.latLng(39.759822, 46.754188), L.latLng(39.609005, 47.135523)]);
         }
      }, 'İki məntəqə arasında Yolun çəkilməsi').addTo(map);

      L.easyButton(`<img class="mapImgIcon" src="assets/leaflet/img/vector.svg" /> `, function (btn, map) {
         if (mapType) {
            btn.button.className = btn.button.className.replace("mapButtonActive", "");
            changeTile('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}');
         } else {
            btn.button.className = btn.button.className = 'mapButtonActive';
            changeTile('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}');
         }
         mapType = !mapType;
      }, 'Xəritənin növünün dəyişdirilməsi').addTo(map);

      L.easyButton('icon-eye', function (btn, map) {
         if (showIcons) {
            btn.button.className = btn.button.className = 'mapButtonActive';
            map.eachLayer(function (layer) {
               if (layer.options.type == "marker") {
                  layer._icon.className = layer._icon.className + ' hideIcons';
               }
            });
         } else {
            btn.button.className = btn.button.className.replace("mapButtonActive", "");
            map.eachLayer(function (layer) {
               if (layer.options.type == "marker") {
                  layer._icon.className = layer._icon.className.replace(" hideIcons", "");
               }
            });
         }
         showIcons = !showIcons;
      }, 'Markerləri gizlət').addTo(map);

      L.easyButton('icon-image', function () {
         $('.leaflet-left').hide();
         html2canvas($(".mapwrap")[0], {
            allowTaint: true,
            useCORS: true,
            onrendered: function (canvas) {
               document.body.appendChild(canvas);
            }
         }).then(function (canvas) {
            canvas.toBlob(function (blob) {
               saveAs(blob, "screenshot.png");
            });
         });
         $('.leaflet-left').show();
      }, 'Xəritənin screenshotu').addTo(map);

      L.easyButton('icon-information', function (btn, map) {
         if (showAreas) {
            btn.button.className = btn.button.className.replace("mapButtonActive", "");
            map.eachLayer(function (layer) {
               if (layer.options.type == "area") {}
            });
         } else {
            btn.button.className = btn.button.className = 'mapButtonActive';
            map.eachLayer(function (layer) {
               if (layer.options.type == "area") {
                  let calcArea = `<span style="text-align:center;display:block;">${layer.options.name}<br /> <b>Ərazinin təxmini sahəsi: </b> ${CalculatePolygonArea(layer.options.points).km} km<sup>2</sup><span>`;
                  layer.bindPopup(calcArea);
               }
            });
         }
         showAreas = !showAreas;
      }, 'Ərazilərin ölçülərin göstər').addTo(map);

   };

   var loadData = function (date) {
      $.ajax({
         type: 'POST',
         url: `${URI}ajax/getMarks`,
         data: {
            date: date
         }
      }).done(function (response) {
         response.data.forEach(element => {
            addMarker(element);
         });
      }).fail(function (response) {});

      $.ajax({
         type: 'POST',
         url: `${URI}ajax/getFields`,
         data: {
            date: date
         }
      }).done(function (response) {
         drawRegions(response.data);
      }).fail(function (response) {});
   }

   var CalculatePolygonArea = function (coordinates) {
      var area = 0;
      var coordinatesCount = coordinates.length;
      if (coordinatesCount > 2) {
         for (let i = 0; i < coordinatesCount - 1; i++) {
            var p1 = coordinates[i];
            var p2 = coordinates[i + 1];
            var p1Longitude = p1[0];
            var p2Longitude = p2[0];
            var p1Latitude = p1[1];
            var p2Latitude = p2[1];
            area += ConvertToRadian(p2Longitude - p1Longitude) * (2 + Math.sin(ConvertToRadian(p1Latitude)) + Math.sin(ConvertToRadian(p2Latitude)));
         }
         area = area * 6378137 * 7178137 / 2;
      }
      let meters = Math.abs(Math.round(area));
      let km = Math.abs(Math.round(meters / 1000000));
      return {
         km,
         meters
      }
   }

   var ConvertToRadian = function (input) {
      let output = input * 3.1415926535898 / 180;
      return output;
   }

   var drawRegions = function (allPolygons) {
      allPolygons.forEach(c => {
         let f = null;
         switch (c.type) {
            case 'field':
               c.points.forEach(element => {
                  f = L.polygon(element, {
                     'polyId': c.id,
                     type: 'area',
                     name: c.name,
                     points: element
                  });
                  f.setStyle({
                     clickable: !1,
                     fillColor: c.fieldColor,
                     fillOpacity: c.opacity,
                     color: c.strokeColor,
                     weight: 2,
                     opacity: c.opacity
                  });
                  let calcArea = `<span style="text-align:center;display:block;">${c.name}<br /> <b>Ərazinin təxmini sahəsi: </b> ${CalculatePolygonArea(element).km} km<sup>2</sup><span>`;
                  "" !== c.description && "object" !== typeof c.description && f.bindPopup(calcArea);
                  f.addTo(map);
               });
               break;
            case 'line':
               c.points.forEach(element => {
                  f = L.polyline(element, {});
                  f.setStyle({
                     clickable: !1,
                     fillColor: c.fieldColor,
                     fillOpacity: c.opacity,
                     color: c.strokeColor,
                     weight: 2,
                     opacity: c.opacity
                  });
                  "" !== c.description && f.bindPopup(c.description);
                  f.addTo(map);
               });
               break;
         }
      });
   }

   var addMarker = function (marker) {
      marker.points.forEach(point => {
         let mapMark = L.marker([point.lat, point.lng], {
            block_id: marker.id,
            info: marker,
            icon: generateIconMark(marker, false),
            title: marker.name,
            riseOnHover: !0,
            type: 'marker',
            id: marker.id
         });
         mapMark.addTo(map);
         let popUpBlock = `<div class="markerPop viewFullStory" data-id="${marker.id}">${marker.name} <div> Ətraflı üçün klik edin</div></div>`;
         isMobile && mapMark.bindPopup(popUpBlock);
         mapMark.on('click', onMarkClick);
      });
      $('.timeline').append(generateStoryHtml(marker));
   }

   var onMarkClick = function (e) {
      let id = this.options.id;
      let centered = false;
      $(`.story`).removeClass('active');
      var currentStory = $(`.story[data-id="${id}"]`);
      currentStory.addClass('active');
      var topPos = currentStory[0].offsetTop;
      $('.rightBlock').scrollTop(topPos - 80);
      map.eachLayer(function (layer) {
         if (layer.options.type === 'marker') {
            if (layer.options.id == id) {
               if (!centered && !isMobile) {
                  centered = true;
                  map.setView([layer.options.info.lat, layer.options.info.lng]);
               }
               layer.setIcon(generateIconMark(layer.options.info, true));
               layer.setZIndexOffset(1000);
            } else {
               layer.setIcon(generateIconMark(layer.options.info, false));
               layer.setZIndexOffset(99);
            }
         }
      });
   }

   var invalidateMapSize = function () {
      map.invalidateSize();
   }


   var changeTile = function (tile) {
      L.tileLayer(tile, {
         maxZoom: 18,
         subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);
   }

   var onStoryClick = function (id) {
      let centered = false;
      map.eachLayer(function (layer) {
         if (layer.options.type === 'marker') {
            if (layer.options.id == id) {
               if (!centered) {
                  centered = true;
                  map.setView([layer.options.info.lat, layer.options.info.lng], 9);
               }
               layer.setIcon(generateIconMark(layer.options.info, true));
               layer.setZIndexOffset(1000);
            } else {
               layer.setIcon(generateIconMark(layer.options.info, false));
               layer.setZIndexOffset(99);
            }
         }
      });
   }

   return {
      init,
      addRoutingControl,
      removeRoutingControl,
      loadData,
      changeTile,
      onStoryClick,
      panMap,
      invalidateMapSize,
      getMap
   }

}(jQuery));


function generateStoryHtml(marker) {
   return `<div class="story ${marker.color}" data-id="${marker.id}">
               <div class="leftInfo">
                  <div class="icon ${marker.icon}"></div>
               </div>

               <div class="textWrap">
                  <div class="title">
                     <h3>${marker.name}</h3>
                     <div class="time"><b>Zaman:</b>${marker.time}</div>
                  </div>

                  <div class="buttonBlock">
                     ${marker.source?`<a href="${marker.source}" target="_blank" class="btn">Mənbəyə keç</a>`:''}
                     <a href="#" class="btn viewFullStory" data-id="${marker.id}">Ətraflı oxu</a>
                  </div>
               </div>
            
            </div>`;
}

function generateIconMark(info, active) {
   return L.divIcon({
      iconSize: [35, 35],
      className: `${info.icon} ${info.color} simpleIcon ${active?'avtiveIcon':'clickIcon'}`,
      shadowSize: [68, 68],
      shadowAnchor: [22, 22]
   });
}

function generateFullstoryHtml(info) {
   let media = '';
   let images = '';
   if (Array.isArray(info.images)) {
      info.images.forEach(element => {
         images += `<img src="${element}" />`;
      });
   }
   if (Array.isArray(info.media)) {
      info.media.forEach(element => {
         media += `<div class="videoItem">
                     <iframe type="text/html" src="${element}" width="100%" height="468" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
                  </div>`;
      });
   }
   return `<div class="popUpTop">

                  <div class="head">

                     <div class="info">
                           <div class="icon ${info.color} simpleIcon ${info.icon}"></div>
                           <div class="time">${info.time}</div>
                     </div>
                     <div class="close simpleIcon"><span class="icon-close"></span></div>
                     </div>
               
                  <div class="title">${info.name}</div>

               </div>
               

               <div class="content">
                  <div class="fullstory">
                     <div class="fullstoryContent">${info.fullstory}</div>
                     <div class="imagesContainer">${images}</div>
                     <div class="videsContainer">${media}</div>
                  </div>
               </div>
            `;
}

$('.mapViewChange li').on('click', function (e) {
   var type = $(this).data('type');
   switch (type) {
      case 'topogrpahic':
         MapHelper.changeTile('https://b.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38');
         break;
      case 'simple':
         MapHelper.changeTile('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
         break;
      default:
         MapHelper.changeTile('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
         break;
   }
});

$('.timeline').on('click', '.story', function (e) {
   var markerId = $(this).data('id');
   if (!$(this).hasClass('active')) {
      $('.story').removeClass('active');
      MapHelper.onStoryClick(markerId);
      $(this).addClass('active');
   }
});

$('body').on('click', '.viewFullStory', function (e) {
   var markerId = $(this).data('id');
   $.ajax({
      type: 'POST',
      url: `${URI}ajax/getMarkInfo`,
      data: {
         id: markerId
      }
   }).done(function (response) {
      $('.popUp').fadeIn(300);
      $('.popUp .popupContainer').html(generateFullstoryHtml(response.data));
   }).fail(function (response) {});
});

