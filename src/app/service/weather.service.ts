import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  /** 
   * Method to fetch weather data for a specific city
   * @param cityName
   * @Returns an observable of type 'any' representing the weather data*/
  getWeatherData(cityName: string): Observable<any> {
    // Construct the API URL using the environment variables
    const apiUrl = `${environment.apiUrl}${cityName}&units=metric${environment.apiRemaining}${environment.apiKey}`;

    // Perform an HTTP GET request to the API URL and return the observable
    return this.http.get<any>(apiUrl);
  }
}
