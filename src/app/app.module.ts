import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule, } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExploreComponent } from './components/explore/explore.component';
import { PitaraComponent } from './components/pitara/pitara.component';
import { HeaderbarComponent } from './components/headerbar/headerbar.component';
import { BackbarComponent } from './components/backbar/backbar.component';
import { UtilService } from './services/utils.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SafePipe } from './pipes/safe.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { LocalStorageService } from './services/localStorage.service';
import { PlayerComponent } from './components/player/player.component';
import { FooterComponent } from './components/footer/footer.component';
import { InstallService } from './services/install.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CreatePitaraComponent } from './components/create-pitara/create-pitara.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QrScannerComponent } from './components/qr-scanner/qr-scanner.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { CsvService } from './services/csv.service';

// Create a loader for translations
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ExploreComponent,
    PitaraComponent,
    HeaderbarComponent,
    BackbarComponent,
    SafePipe,
    PlayerComponent,
    FooterComponent,
    CreatePitaraComponent,
    QrScannerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatListModule,
    MatSelectModule,
    FormsModule, ReactiveFormsModule,
    HttpClientModule,
    MatChipsModule,
    MatDialogModule,
    DragDropModule,
    ZXingScannerModule ,
    FormsModule, ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [UtilService, LocalStorageService, InstallService,CsvService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {
    constructor(private installService: InstallService) {
      this.installService.initInstallPrompt();
    }
}
