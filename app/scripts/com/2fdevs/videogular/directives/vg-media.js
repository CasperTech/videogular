/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.direcitve:vgMedia
 * @restrict E
 * @description
 * Directive to add a source of videos or audios. This directive will create a &lt;video&gt; tag and usually will be above plugin tags.
 *
 * @param {array} vgSrc Bindable array with a list of media sources. A media source is an object with two properties `src` and `type`. The `src` property must contains a trusful url resource.
 * @param {string} vgType String with "video" or "audio" values to set a <video> or <audio> tag inside <vg-media>.
 * ```js
 * {
 *    src: $sce.trustAsResourceUrl("path/to/video/videogular.mp4"),
 *    type: "video/mp4"
 * }
 * ```
 *
 */
"use strict";
angular.module("com.2fdevs.videogular")
  .directive("vgMedia",
  ["$timeout", "VG_STATES", function ($timeout, VG_STATES) {
    return {
      restrict: "E",
      require: "^videogular",
      templateUrl: function(elem, attrs) {
        var vgType = attrs.vgType || "video";
        return attrs.vgTemplate || "vg-templates/vg-media-" + vgType;
      },
      scope: {
        vgSrc: "=?",
        vgType: "=?"
      },
      link: function (scope, elem, attrs, API) {
        var sources;

        // what type of media do we want? defaults to 'video'
        if (!attrs.vgType || attrs.vgType === "video") {
          attrs.vgType = "video";
        }
        else {
          attrs.vgType = "audio";
        }

        // FUNCTIONS
        scope.onChangeSource = function onChangeSource(newValue, oldValue) {
          if ((!sources || newValue != oldValue) && newValue) {
            sources = newValue;
            API.sources = sources;
            scope.changeSource();
          }
        };

        scope.changeSource = function changeSource() {
          var canPlay = "";

          // It's a cool browser
          if (API.mediaElement[0].canPlayType) {
            for (var i = 0, l = sources.length; i < l; i++) {
              canPlay = API.mediaElement[0].canPlayType(sources[i].type);

              if (canPlay == "maybe" || canPlay == "probably") {
                API.mediaElement.attr("src", sources[i].src);
                API.mediaElement.attr("type", sources[i].type);
                break;
              }
            }
          }
          // It's a crappy browser and it doesn't deserve any respect
          else {
            // Get H264 or the first one
            API.mediaElement.attr("src", sources[0].src);
            API.mediaElement.attr("type", sources[0].type);
          }

          $timeout(function() {
            if (API.autoPlay && !VG_UTILS.isMobileDevice() || API.currentState === VG_STATES.PLAY) API.play();
          });

          if (canPlay == "") {
            API.onVideoError();
          }
        };

        // INIT
        API.mediaElement = elem.find(attrs.vgType);
        API.sources = scope.vgSrc;

        API.addListeners();
        API.onVideoReady();

        scope.$watch("vgSrc", scope.onChangeSource);

        if (API.isConfig) {
          scope.$watch(
            function() {
              return API.config;
            },
            function() {
              if (API.config) {
                scope.vgSrc = API.config.sources;
              }
            }
          );
        }
      }
    }
  }
  ]);