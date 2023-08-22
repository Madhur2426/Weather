import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../service/weather.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Weather } from '../interface/weather';
import { Forecast } from '../interface/forecast';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  invalidCity: boolean = false;
  weather: Weather = {} as Weather;
  nextDaysData: Forecast[] = [];
  search: FormGroup;

  constructor(private atmosphere: WeatherService) {
    this.search = new FormGroup({
      searchBox: new FormControl('', [Validators.required, Validators.minLength(2)]),
    });
  }

  ngOnInit() {
    this.getWeather("Faridabad");
    this.getForecastData("Faridabad");
  }
  /**
   * Method to get weather data for a specific city.
   * @param cityName The name of the city for which weather data is requested.
   * @returns An observable of type 'any' representing the weather data for the specified city.
   */
  getWeather(cityName: string): void {
    // Call the method to get weather data for the entered city
    this.atmosphere.getWeatherData(cityName).subscribe(
      (data) => {
        if (data.cod === '404' || data.message === 'city not found') {
          this.invalidCity = true;// error message
        } else {
          this.invalidCity = false; // Reset to false when the data is valid
          // Extract weather data for the current day
          this.weather.city = data.city.name;
          this.weather.temperature = data.list[0].main?.temp;
          this.weather.maxTemp = data.list[0].main?.temp_max;
          this.weather.minTemp = data.list[0].main?.temp_min;
          this.weather.humidity = data.list[0].main?.humidity;
          this.weather.main = data.list[0].weather[0].main;
        }
      },
      (error: HttpErrorResponse) => {
        // Handle HTTP error
        this.invalidCity = true;
      }
    );
  }

  /**
   * Method to get the current date in the desired format.
   * @returns string representing the current date in the desired format.
   */
  getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toDateString();
  }

  /**
   * Method to fetch weather data for the next 5 days for a specific city.
   * @param cityName The name of the city for which weather data is to be fetched.
   * @returns An observable of type 'Next[]' representing the weather data for the next 5 days.
   */
  getForecastData(cityName: string) {
    // Fetch weather data for the next 5 days
    this.atmosphere.getWeatherData(cityName).subscribe(
      (data) => {
        if (data.cod === '404' || data.message === 'city not found') {
          this.invalidCity = true;
        } else {
          this.invalidCity = false;
          this.nextDaysData = this.groupWeatherDataByDay(data.list);
        }
      },
      (error: HttpErrorResponse) => {
        // Handle HTTP error
        this.invalidCity = true;
      }
    );
  }
/**
   * Method to search the entered city weather
   * @param cityName city name
   */
  onSearchClick(cityName: string): void {
    this.getWeather(cityName);
    this.getForecastData(cityName);
  }

  /**
   * Method to group weather data by day, considering morning (9 AM) as the starting point.
   * @param weatherList The list of weather data to be grouped.
   * @returns An array of 'Next' objects representing weather data for each day.
   */
  groupWeatherDataByDay(weatherList: any): Forecast[] {
    // Group weather data by day for the next 5 days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const nextDaysData: Forecast[] = [];

    let currentDay: Forecast | null = null;
    for (const item of weatherList) {
      const date = moment(item.dt_txt).utcOffset(item.timezone / 60); // Convert to the correct time zone

      // Start a new day when hour is 9 (morning)
      if (date.hours() === 9) {
        currentDay = {
          date: item.dt,
          day: days[date.day()],
          temperature: item.main.temp,
        };
        nextDaysData.push(currentDay);
      } else if (currentDay) {
        // Update the temperature of the current day for each 3-hour interval until 21 (evening)
        if (date.hours() >= 12 && date.hours() <= 21) {
          currentDay.temperature = item.main.temp;
        } else if (date.hours() > 21) {
          // Stop updating the temperature after 21 (evening)
          currentDay = null;
        }
      }
    }
    return nextDaysData;
  }
}
