import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { UtilService } from 'src/app/services/utils.service';
import { Howl } from 'howler';
import { MatTabGroup } from '@angular/material/tabs';
import * as Hammer from 'hammerjs';
import { CsvService } from 'src/app/services/csv.service';

interface Chip {
  key: string;
  value: string;
}

@Component({
  selector: 'app-pitara',
  templateUrl: './pitara.component.html',
  styleUrls: ['./pitara.component.scss']
})
export class PitaraComponent implements OnInit {
  saaspitara: any;
  onestpitara: any;
  mypitara: any;
  result: any;
  sound: any;
  selectedTab: Chip;
  selectedTabIndex: number = 0;
  saasArray;
  data;
  storedTabIndex;
  pitaraDataMap: { [id: string]: any } = {};
  isPlayerInit: boolean = false;
  isContentInit: boolean = true;

  allChips: Chip[] = [
    { value: 'Saas Pitaras', key: 'saaspitara' },
    { value: 'Pitaras from open network', key: 'onestpitara' },
    { value: 'My Pitaras', key: 'mypitara' },
  ];
  value: any;
  recents = []
  constructor(public router: Router, public utils: UtilService, private localStorageService: LocalStorageService, private csvService: CsvService) { }

  @ViewChild(MatTabGroup, { static: true }) tabGroup: MatTabGroup;

  ngOnInit() {
    this.utils.updateHeaderClass('pitara');
    this.saaspitara = JSON.parse(this.localStorageService.getItem('saaspitara'));
    this.onestpitara = JSON.parse(this.localStorageService.getItem('onestpitara'));
    this.mypitara = JSON.parse(this.localStorageService.getItem('mypitara'));
    this.localStorageService.removeItem('resultArray')

    this.sound = new Howl({
      src: ['assets/audio/windchime.mp3'],
    });
    this.handlePitaraSelection();
    this.recents = JSON.parse(this.localStorageService.getItem('recents')) || [];

  }

  ngAfterViewInit() {
    // const hammer = new Hammer.Manager(this.tabGroup._elementRef.nativeElement);
    // const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL });
    // hammer.add(pan);
    // hammer.on('panright', (event) => this.handleSwipe(event, 'right'));
    // hammer.on('panleft', (event) => this.handleSwipe(event, 'left'));
  }

  handleSwipe(event, direction?: 'left' | 'right'): void {
    var angle = Math.abs(event.angle);
    if ((angle >= 90 && angle < 150) || (angle > 30 && angle < 90))
      return;
    this.tabGroup.selectedIndex = (direction === 'left')
      ? Math.min(this.tabGroup.selectedIndex + 1, this.tabGroup._tabs.length - 1)
      : Math.max(this.tabGroup.selectedIndex - 1, 0);
  }

  unboxPitara(value) {
    console.log('val', value)
    // this.utils.setTitle(value.name);
    if (!value.provider_id) {
      if (!value.myPitara) {
        this.utils.saasCollectionRead(value.identifier).subscribe((data) => {
          this.result = data.result.content
          // this.localStorageService.setItem(value.identifier, JSON.stringify(this.result.children[0].children))
          this.pitaraDataMap[value.identifier] = data.result.content.children[0].children;

          // this.sound.play();
          // setTimeout(() => {
          //   this.router.navigate(['explore'])
          // }, 1000);
        })
        return;
      }
      this.result = value.children
      // this.localStorageService.setItem(value.identifier, JSON.stringify(this.result))
      this.pitaraDataMap[value.identifier] = this.result

      return;
      // this.sound.play();
      // setTimeout(() => {
      //   this.router.navigate(['explore'])
      // }, 1000);
    }
    else {
      this.utils.onestCollectionRead(value.identifier).subscribe((data) => {
        this.result = data.data.collection[0].collectionContentRelation
        let onestContent = this.result.map((content) => {
          return {
            appIcon: content.contentFlncontentRelation.image,
            description: content.contentFlncontentRelation.description,
            name: content.contentFlncontentRelation.title,
            author: content.contentFlncontentRelation.author,
            identifier: content.contentFlncontentRelation.id,
            artifactUrl: content.contentFlncontentRelation.link,
            primaryCategory: content.contentFlncontentRelation.contentType,
            category: content.contentFlncontentRelation.category,
            mimeType: content.contentFlncontentRelation.mimeType,
            urlType: content.contentFlncontentRelation.urlType,
          }
        })
        // this.localStorageService.setItem(value.identifier, JSON.stringify(onestContent))
        this.pitaraDataMap[value.identifier] = onestContent

        // this.sound.play();
        // setTimeout(() => {
        //   this.router.navigate(['explore'])
        // }, 1000);
      })
    }
  }

  // Define a single method to handle both favoriting and sharing
  handleClick(event: Event, action: string) {
    const clickedElement = event.currentTarget as HTMLElement;
    event.stopPropagation();
    if (clickedElement.tagName === 'BUTTON') {
      if (action === 'favorite') {
        if (!clickedElement.classList.contains('favorite')) {
          clickedElement.classList.add('favorite');
        } else {
          clickedElement.classList.remove('favorite');
        }
      }
    }
  }

  handlePitaraSelection(event?: any) {
    this.storedTabIndex = this.localStorageService.getTabIndex('pitaraIndex');
    if (this.utils.getPreviousUrl() === 'create-pitara') {
      this.utils.setPreviousUrl('pitara')
      this.selectedTab = this.allChips[2];
      this.selectedTabIndex = 2;
      this.data = this.mypitara
      if (this.data !== null && this.data.length > 0)
        this.data.forEach(pitara => this.unboxPitara(pitara));
      console.log('map', this.pitaraDataMap)
    } else {
      if (this.storedTabIndex !== null && !event) {
        this.selectedTabIndex = this.storedTabIndex;
        this.selectedTab = this.allChips[this.selectedTabIndex];

      } else if (this.storedTabIndex === null && !event) {
        this.saasArray = this.saaspitara;
        this.selectedTab = this.allChips[0];
      }
      else {
        this.selectedTab = this.allChips[event.index];
        this.localStorageService.setTabIndex(event.index, 'pitaraIndex');
      }
      if (this.selectedTab.key === 'saaspitara') {
        this.saasArray = this.saaspitara;
      } else if (this.selectedTab.key === 'onestpitara') {
        this.saasArray = this.onestpitara;
      } else if (this.selectedTab.key === 'mypitara') {
        this.saasArray = this.mypitara;
      }
      this.data = this.saasArray
      if (this.data !== null && this.data.length > 0)
        this.data.forEach(pitara => this.unboxPitara(pitara));
      console.log('map', this.pitaraDataMap)
    }
  }

  openPlayer(content: any) {
    this.value = content;
    console.log(this.value, 'test');
    this.isPlayerInit = true;
    this.isContentInit = false;
  }

  handleClose(data) {
    this.isPlayerInit = false;
    this.isContentInit = true;
    this.ngOnInit();

  }

  scanQr() {
    const dataToSend = { state: 'pitara-page' };
    const navigationExtras: NavigationExtras = {
      queryParams: dataToSend
    };
    this.router.navigate(['qr'], navigationExtras);
  }

  downloadCsv(): void {
    console.log(this.mypitara)
    // Download CSV
    this.csvService.exportToCsv(this.mypitara, 'myPitara.csv');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const csvData = e.target.result;
        let parsedData = this.csvService.unflattenObject(csvData);
        const jsonObject = JSON.parse(JSON.stringify(parsedData).replace(/\\/g, "").replace(/"\[/g, '[').replace(/]"/g, ']'));

        // Remove double quotes from specified keys
        jsonObject.forEach(item => {
          item.identifier = +item.identifier;
          item.myPitara = JSON.parse(item.myPitara);
        });

        console.log('--', jsonObject)
        this.localStorageService.setItem('mypitara', JSON.stringify(jsonObject))
        this.ngOnInit()
      };
      reader.readAsText(file);
    }
  }
}

