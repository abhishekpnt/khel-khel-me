import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

interface Chip {
  key: string;
  value: string;
  icon: any;
}
@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})

export class ExploreComponent implements OnInit{
  filteredArray;
  playerSource: any;
  isPlayerInit: boolean = false;
  isContentInit: boolean = true;
  value: any;
  localStorageSubscription: Subscription;
  selectedTab: Chip;
  selectedTabIndex: number = 0;

  data: any = JSON.parse(localStorage.getItem('resultArray'));
  allChips: Chip[] = [
    { value: 'All', key: 'all', icon: 'https://cdn-icons-png.flaticon.com/512/7787/7787487.png' },
    { value: 'Toys and puppets', key: 'djp_category_toys', icon: 'https://cdn-icons-png.flaticon.com/512/7082/7082148.png' },
    { value: 'Puzzles and games', key: 'djp_category_games', icon: 'https://cdn-icons-png.flaticon.com/512/10203/10203507.png' },
    { value: 'Stories and poems', key: 'djp_category_stories', icon: 'https://cdn-icons-png.flaticon.com/512/3500/3500690.png' },
    { value: 'Flashcards and sequence cards', key: 'djp_category_flashc', icon: 'https://cdn-icons-png.flaticon.com/512/3813/3813681.png' },
    { value: 'Activity Sheets', key: 'djp_category_activitys', icon: 'https://cdn-icons-png.flaticon.com/512/1668/1668531.png' },
    { value: 'Manuals and Guidebooks', key: 'djp_category_manuals', icon: 'https://cdn-icons-png.flaticon.com/512/6348/6348248.png' }
  ];

  constructor(private localStorageService: LocalStorageService, public route: ActivatedRoute, private translate: TranslateService) {
  }
  ngOnInit(): void {
    // Translate keys in the array
    this.allChips.map(chip => ({
      value: this.translate.get(chip.value).subscribe((translation: string) => {
        return translation;
      })
    }));
    this.route.queryParams.subscribe(params => {
      this.data= [];
      let qrDataString = params['qrData'];
      // this.data = JSON.stringify(localStorage.setItem('resultArray',qrDataString));
      this.data = JSON.parse(qrDataString)
      console.log('Received QR Data:', this.data);
    });
  }

  
  handleChipSelection(event: any) {
    this.data = JSON.parse(localStorage.getItem('resultArray'));
    this.selectedTab = this.allChips[event.index];
    this.localStorageService.setTabIndex(event.index,'selectedTabIndex');
    if (this.selectedTab.key === 'all') {
      this.filteredArray = this.data;
    } else {
      this.filteredArray = this.data.filter((content: any) => {
        return content.keywords ? content.keywords.includes(this.selectedTab.key) : false
      })
    }
     this.data = this.filteredArray
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
    const storedTabIndex = this.localStorageService.getTabIndex('selectedTabIndex');
    if (storedTabIndex !== null) {
      this.selectedTabIndex = storedTabIndex;
    }
  }
}