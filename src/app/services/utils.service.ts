import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LocalStorageService } from './localStorage.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private titleChange = new Subject<string>();
   languageChange;

  addClassToHeaderSubject = new BehaviorSubject<string>('');
  // currentBodyComponent$: Observable<string> = this.addClassToHeaderSubject.asObservable();

  
  constructor(private http: HttpClient,private localStorageService:LocalStorageService) { }

  updateHeaderClass(headerClass: string) {
    this.addClassToHeaderSubject.next(headerClass);
  }

  searchSaas(): Observable<any> {
    const url = `https://sunbirdsaas.com//api/content/v1/search?field=publisher`;
    let body = {
      "request": {
        "filters": {
          "objectType": "Content",
          "channel": "013812745304276992183",
          "keywords": [
            "djp_master"
          ],
          "status": ["Live"]
        },
        "fields": [
          "name",
          "description",
          "keywords",
          "mimeType",
          "primaryCategory",
          "status",
          "artifactUrl",
          "author",
          "streamingUrl",
          "identifier"
          
        ]
      }
    }
    return this.http.post(url, body)
  }
  
  searchOnest():Observable<any>{
    const url=`https://onest-bap.tekdinext.com/seeker/collection/`
    return this.http.get(url)
  }

  saasCollectionRead(doId): Observable<any> {
    const url = `https://sunbirdsaas.com/action/content/v3/hierarchy/${doId}`
    return this.http.get(url)
  }

  onestCollectionRead(doId): Observable<any> {
    const url = `https://onest-bap.tekdinext.com/seeker/collection/${doId}`
    return this.http.get(url)
  }

  dikshaCollectionRead(doId): Observable<any> {
    const url = `https://diksha.gov.in/action/content/v3/hierarchy/${doId}`
    // https://diksha.gov.in/api/course/v1/hierarchy/do_31255360309049753614214
    return this.http.get(url)
  }
  searchDikshaContent(Query): Observable<any> {
    let url = "https://diksha.gov.in/api/content/v1/search"
    let body = {

      "request": {
        "filters": {
          "channel": "01246375399411712074",
          "primaryCategory": [
            "Collection",
            "Resource",
            "Content Playlist",
            "Course",
            "Course Assessment",
            "Digital Textbook",
            "eTextbook",
            "Explanation Content",
            "Learning Resource",
            "Practice Question Set",
            "Teacher Resource",
            "Textbook Unit",
            "LessonPlan",
            "FocusSpot",
            "Learning Outcome Definition",
            "Curiosity Questions",
            "MarkingSchemeRubric",
            "ExplanationResource",
            "ExperientialResource",
            "Practice Resource",
            "TVLesson",
            "Question paper"
          ],
          "visibility": [
            "Default",
            "Parent"
          ]
        },
        "limit": 100,
        "query": Query ? Query : "H2H2D7",
        "sort_by": {
          "lastPublishedOn": "desc"
        },
        "fields": [
          "name",
          "appIcon",
          "mimeType",
          "gradeLevel",
          "identifier",
          "medium",
          "pkgVersion",
          "board",
          "subject",
          "resourceType",
          "primaryCategory",
          "contentType",
          "channel",
          "organisation",
          "trackable"
        ],
        "softConstraints": {
          "badgeAssertions": 98,
          "channel": 100
        },
        "mode": "soft",
        "facets": [
          "se_boards",
          "se_gradeLevels",
          "se_subjects",
          "se_mediums",
          "primaryCategory"
        ],
        "offset": 0
      }
    }

  return this.http.post(url, body)
  }

  contentRead(url): Observable<any> {
    return this.http.get(url)
  }

  getTitle() {
    return this.titleChange;
  }
  setTitle(title) {
    this.titleChange.next(title)
  }

  getLanguage() {
    return this.localStorageService.getItem('language')
  }
  setLanguage(language) {
    this.localStorageService.setItem('language', language)
  }
  public drop(event: CdkDragDrop<string[]>) {
    transferArrayItem(event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex);
  }

  private previousUrl: string = '';

  setPreviousUrl(url: string): void {
    this.previousUrl = url;
  }

  getPreviousUrl(): string {
    return this.previousUrl;
  }
}
