import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { UtilService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-create-pitara',
  templateUrl: './create-pitara.component.html',
  styleUrls: ['./create-pitara.component.scss']
})
export class CreatePitaraComponent implements OnInit {
  data: any;
  targetItems = [];
  pitaraName = '';
  showModal = false
  showQr = false
  fiveDigitNumber
  contents;
  information: any;

  constructor(public utils: UtilService, public router: Router, private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.utils.setTitle('createYourPitara');
    this.utils.searchSaas().subscribe(data => {
      this.contents = data.result.content.filter((content: any) => content.mimeType !== 'application/vnd.ekstep.content-collection')
      this.localStorageService.setItem('contents', JSON.stringify(this.contents))
      this.data = this.contents
    })
  }

  onDrop(event: any) {
    this.utils.drop(event);
    console.log(this.targetItems, '--')
    // this.data.splice(event.previousIndex, 1);
  }

  createPitara() {
    var sUnique = (performance.now() + '').replace('.', '');
    var fiveDigitNumber = parseInt(sUnique.slice(0, 5), 10);

    let myPitaras = this.localStorageService.getItem('mypitara');
    const existingPitara = myPitaras ? JSON.parse(myPitaras) : [];
    const newPitara =
    {
      name: this.pitaraName,
      identifier: fiveDigitNumber,
      myPitara: true,
      children: [
        ...this.targetItems
      ]
    }
    this.utils.setPreviousUrl('create-pitara')
    existingPitara.push(newPitara);
    this.localStorageService.setItem('mypitara', JSON.stringify(existingPitara))
    this.router.navigate(['pitara'])
    console.log(newPitara)
  }

  moveToTarget(item) {
    const sourceIndex = this.data.indexOf(item);
    const targetIndex = this.targetItems.indexOf(item);
    if (sourceIndex == -1 && targetIndex == -1) {
      this.targetItems.push(item);
      this.showQr = !this.showQr
    } else if (sourceIndex !== -1) {
      // Move from source to target
      this.data.splice(sourceIndex, 1);
      this.targetItems.push(item);
    } else if (targetIndex !== -1) {
      // Move from target to source
      this.targetItems.splice(targetIndex, 1);
      this.data.push(item);
    }
  }

  clearAll() {
    this.data = JSON.parse(this.localStorageService.getItem('contents'));
    this.targetItems = []
  }
  scanQr() {
    this.showQr = !this.showQr
  }

  public scanSuccessHandler($event: any) {
    this.information = $event;
    var sUnique = (performance.now() + '').replace('.', '');
    this.fiveDigitNumber = parseInt(sUnique.slice(0, 5), 10);
    if (this.getVideoIdFromUrl(this.information)) {
      this.getVideoDetails(this.getVideoIdFromUrl(this.information))
    } else {
      const newQrContent =
      {
        name: 'QR Item',
        identifier: this.fiveDigitNumber,
        artifactUrl: this.information,
        urlType: 'Page'
      }
      this.moveToTarget(newQrContent)
    }
  }

  getVideoIdFromUrl(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  }

  getVideoDetails(videoId) {
    const apiUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const newQrContent =
        {
          name: data.title,
          author: data.author_name,
          identifier: this.fiveDigitNumber,
          artifactUrl: this.information,
          urlType: 'Embed'
        }
        this.moveToTarget(newQrContent)
      })
      .catch(error => console.error('Error fetching video details:', error));
  }
}
