import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilService } from '../../services/utils.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  result: any;
  selectedLanguage;

  constructor(public router: Router, public utils: UtilService, private localStorageService: LocalStorageService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.translate.setDefaultLang('en');
    this.selectedLanguage = this.utils.getLanguage()

    this.utils.searchSaas().pipe(
      mergeMap(data1 => {
        // Process result1 or return an observable for another service call
        if (data1 !== null) {
          let data = data1.result.content.filter((content: any) => content.mimeType === 'application/vnd.ekstep.content-collection' && content.keywords.includes('djp_master'))
          this.localStorageService.setItem('saaspitara', JSON.stringify(data))
        }
        return this.utils.searchOnest();
      }),
      catchError(error => {
        // Handle the error here if \searchSaas() fails
        console.error('An error occurred in searchSaas():', error);
        // Continue execution by returning an observable with a default value or an empty result
        return of(null);
      }),
      mergeMap(data2 => {
        // Process data2 or return an observable for further processing
        if (data2 !== null) {
          let onestResult = data2.data.collection;
          let onestCollection = onestResult.map((collection) => {
            return {
              appIcon: collection.icon,
              description: collection.description,
              name: collection.title,
              publisher: collection.publisher,
              identifier: collection.id,
              provider_id: collection.provider_id
            }
          })
          this.localStorageService.setItem('onestpitara', JSON.stringify(onestCollection))
        }
        // Continue processing or return another observable if needed
        return of(null);
      }),
      catchError(error => {
        // Handle the error here if searchOnest() fails
        console.error('An error occurred in searchOnest():', error);
        // Continue execution by returning an observable with a default value or an empty result
        return of(null);
      })).subscribe(finalResult => {
        // This block will be executed after both service calls and their error handling
        console.log('Final Result:', finalResult);
      });
  }

  onLanguageChange() {
    this.utils.setLanguage(this.selectedLanguage)
    this.translate.use(this.utils.getLanguage());
  }
}