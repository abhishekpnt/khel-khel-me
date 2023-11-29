import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { UtilService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})

export class QrScannerComponent {
  information: any;
  receivedData: any;
  QrData = []
  constructor(private route: ActivatedRoute, public router: Router, public utilService: UtilService) { }
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.receivedData = this.route.snapshot?.data?.['qrData'];
      console.log('Received QR Data:', params);
    });
  }
  public scanSuccessHandler($event: any) {
    this.QrData =[];
    let resData = $event;
    const urlParts = resData.split('/'); // Split the URL by '/'
    this.information = urlParts[urlParts.length - 1]; // Get the last part of the URL

    console.log(this.information)
    this.utilService.searchDikshaContent(this.information).subscribe(resData => {
      this.utilService.dikshaCollectionRead(resData.result.content[0].identifier).subscribe(QRData => {
        let contentData = QRData?.result?.content.children;
        if (QRData?.result?.content.mimeType === "application/vnd.ekstep.content-collection" && contentData) {
          contentData?.map((contentData: any) => {
            contentData?.children?.map(childData => {
              if (childData?.mimeType === "application/vnd.ekstep.ecml-archive")
                this.QrData.push(childData)

            })
          })
        }
        else {
          this.QrData.push(QRData?.result?.content)
        }
        if (this.information) {
          const dataToSend = JSON.stringify(this.QrData);
          console.log('dataTOsendfromQR', dataToSend);
          const navigationExtras: NavigationExtras = {
            queryParams: { qrData: dataToSend }
          };
          this.router.navigate(['explore'], navigationExtras);
        }
      })
    })

  }
}

