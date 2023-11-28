import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { playerConfig } from './playerConfig';
import * as _ from 'lodash-es';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UtilService } from 'src/app/services/utils.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';

@Component({
  selector: 'lib-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @Input() playerData: any
  @ViewChild('preview') previewElement: ElementRef;

  enableSBPlayer: boolean = false;
  enablePlayBtn: boolean = true;
  showPlayIcon = true;
  mobileViewDisplay = 'block';
  isMobileOrTab: boolean;
  playerConfiguration: any;
  isEmbed: boolean = false
  isIOS: boolean = false;

  @Output() closePlayerscreen = new EventEmitter();
  @HostListener('window:orientationchange', ['$event'])
  existingRecents = JSON.parse(this.localStorageService.getItem('recents')) || [];

  public handleOrientationChange() {
    const screenType = _.get(screen, 'orientation.type');
    if (screenType === 'portrait-primary' || screenType === 'portrait-secondary') {
      this.closeFullscreen();
      if (this.isMobileOrTab) {
        this.closePlayerscreen.emit('closed')
      }
    }
  }
  constructor(private deviceDetectorService: DeviceDetectorService, public utils: UtilService, private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.isMobileOrTab = this.deviceDetectorService.isMobile() || this.deviceDetectorService.isTablet();
    this.checkIfIOS();

    console.log('device is ', this.isMobileOrTab)
    this.setContentData();

    //Setting data for recents section
    this.existingRecents.unshift(this.playerData);
    const uniqueIds = new Set();

    // Use filter to create an array of unique objects based on id
    const uniqueArray = this.existingRecents.filter(obj => {
      if (!uniqueIds.has(obj.identifier)) {
        uniqueIds.add(obj.identifier);
        return true;
      }
      return false;
    });


    this.localStorageService.setItem('recents', JSON.stringify(uniqueArray));
  }

  ngAfterViewInit() {
    this.loadPlayer();
    //if (this.isMobileOrTab) {
    this.rotatePlayer();
    // }
  }

  loadPlayer() {
    if (!this.isEmbed) {
      const src = this.previewElement.nativeElement.src;
      this.previewElement.nativeElement.src = '';
      this.previewElement.nativeElement.src = src;
    } else {
      this.previewElement.nativeElement.src = this.playerConfiguration.metadata.artifactUrl;
    }
    this.previewElement.nativeElement.onload = () => {
      setTimeout(() => {
        // this.adjustPlayerHeight();
        this.previewElement.nativeElement.contentWindow.initializePreview(this.playerConfiguration);
      }, 1000);
    };

    this.previewElement.nativeElement.onload = () => {
      //  this.adjustPlayerHeight();
      this.previewElement.nativeElement.contentWindow.initializePreview(this.playerConfiguration);
    };
  }

  setContentData() {
    this.playerConfiguration = {
      context: playerConfig.context,
      config: playerConfig.config,
      metadata: {},
      data: {}
    };

    if (!this.playerData.urlType) {
      this.playerConfiguration.metadata.artifactUrl = this.playerData.artifactUrl
      this.playerConfiguration.metadata.mimeType = this.playerData.mimeType
      this.playerConfiguration.metadata.streamingUrl = this.playerData.streamingUrl
      this.playerConfiguration.metadata.identifier = this.playerData.identifier

      if (this.playerConfiguration.metadata.mimeType === ('application/vnd.ekstep.ecml-archive')) {
        this.utils.contentRead(this.playerConfiguration.metadata.streamingUrl + '/index.json').subscribe((data) => {
          this.playerConfiguration.data = data
        }
        )
      }
      else if (this.playerConfiguration.metadata.mimeType === 'video/x-youtube') {
        this.isEmbed = true
        this.playerConfiguration.metadata.artifactUrl = this.getEmbedUrl(this.playerConfiguration.metadata.artifactUrl);
      } else if (this.playerConfiguration.metadata.mimeType === ('application/vnd.ekstep.html-archive')) {
        this.isEmbed = true
        this.playerConfiguration.metadata.artifactUrl = this.playerConfiguration.metadata.streamingUrl + '/index.html'
      }
      console.log('playerConfig', this.playerConfiguration)
    } else if (this.playerData.urlType === "Embed") {
      this.playerConfiguration.metadata.artifactUrl = this.playerData.artifactUrl
      this.isEmbed = true

      this.playerConfiguration.metadata.artifactUrl = this.getEmbedUrl(this.playerConfiguration.metadata.artifactUrl);
    } else if (this.playerData.urlType === "Page") {
      window.open(this.playerData.artifactUrl, '_blank', "fullscreen=yes,toolbar=no,location=no");
      this.closePlayerscreen.emit('closed')
    } else if (this.playerData.urlType === "Asset") {
      this.playerConfiguration.metadata.mimeType = 'application/vnd.ekstep.ecml-archive'
      this.playerConfiguration.metadata.artifactUrl = this.playerData.artifactUrl
      this.utils.contentRead(this.playerConfiguration.metadata.artifactUrl + '/index.json').subscribe((data) => {
        this.playerConfiguration.data = data
      }
      )
      console.log('playerConfig', this.playerConfiguration)
    }
  }

  getEmbedUrl(url) {
    // Extract video ID from the URL
    if ( url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    ) {
      var videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)[1];
      // Construct the embed URL
      var embedUrl = "https://www.youtube.com/embed/" + videoId + '?enablejsapi=1';
      return embedUrl;
    } 
    else if (url.match(/storyweaver\.org/)) {
      const regex = /\/stories\/(.+)/;
      const match = url.match(regex);
      if (match && match[1]) {
        var embedUrl = "https://storyweaver.org.in/stories/show-in-iframe/" + match[1] + '?iframe=true';
        return embedUrl;
      }
    }
    else return url;
  }

  /** when user clicks on close button
  * this method will let the player to exit from fullscreen mode and
  * 1. video thumbnail will be shown for single content
  * 2. content-details page will be shown ( for multi-result dial-code search flow)
  */
  closeFullscreen() {
    /** to exit the fullscreen mode */
    if (document.fullscreenElement && document['exitFullscreen']) {
      document['exitFullscreen']();
    } else if (document['mozCancelFullScreen']) { /* Firefox */
      document['mozCancelFullScreen']();
    } else if (document['webkitExitFullscreen']) { /* Chrome, Safari and Opera */
      document['webkitExitFullscreen']();
    } else if (document['msExitFullscreen']) { /* IE/Edge */
      document['msExitFullscreen']();
    }

    /** to change the view of the content-details page */
    this.showPlayIcon = true;
    // this.closePlayerEvent.emit();
    this.closePlayerscreen.emit('closed');
  }


  /** this method checks for the browser capability to be fullscreen via if-else ladder
   * if match found, it will turn the player along will be close button into fullscreen and then
   * rotate it to landscape mode
   */
  rotatePlayer() {
    setTimeout(() => {
      const playVideo: any = document.querySelector('#playerFullscreen');
      try {
        if (playVideo.requestFullscreen) {
          playVideo.requestFullscreen();
        } else if (playVideo.mozRequestFullScreen) { /* Firefox */
          playVideo.mozRequestFullScreen();
        } else if (playVideo.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
          playVideo.webkitRequestFullscreen();
        } else if (playVideo.msRequestFullscreen) { /* IE/Edge */
          playVideo.msRequestFullscreen();
        }
        screen.orientation.lock('landscape-primary');
      } catch (error) { }
    });
  }
  /**
  * Adjust player height after load
  */
  // adjustPlayerHeight() {
  //   const playerWidth = $('#contentPlayer').width();
  //   if (playerWidth) {
  //     let height = playerWidth * (9 / 16);
  //     let width = playerWidth * (16 / 9);

  //     if (_.get(screen, 'orientation.type') === 'landscape-primary' && this.isMobileOrTab) {
  //       height = window.innerHeight;
  //       width = window.innerWidth
  //     }
  //     $('#contentPlayer').css('height', height + 'px');
  //     $('#contentPlayer').css('width', width + 'px');
  //   }
  // }
  checkIfIOS() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isIOS = /iphone|ipad|ipod/.test(userAgent);
  }
}
